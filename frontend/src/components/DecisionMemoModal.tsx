import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Download, Scale, ArrowRight, FileText, ShieldAlert } from 'lucide-react';
import { Verdict, MessageTurn } from '../lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DecisionMemoModalProps {
  verdict: Verdict;
  topic: string;
  mode?: string;
  turns?: MessageTurn[];
  onClose: () => void;
}

interface AgentScore {
  logical_rigor: number;
  evidence_grounding: number;
  rebuttal_directness: number;
  total: number;
}

function extractScore(scorecard: any, targetKey: 'agent_a' | 'agent_b'): AgentScore {
  if (!scorecard || typeof scorecard !== 'object') {
    return { logical_rigor: 0, evidence_grounding: 0, rebuttal_directness: 0, total: 0 };
  }

  let raw: any = null;
  const isA = targetKey === 'agent_a';
  for (const k of Object.keys(scorecard)) {
    const lk = k.toLowerCase().replace(/[\s_-]/g, '');
    if (isA && (lk === 'agenta' || lk === 'advocate' || lk === 'strategist')) {
      raw = scorecard[k];
      break;
    }
    if (!isA && (lk === 'agentb' || lk === 'skeptic' || lk === 'reviewer')) {
      raw = scorecard[k];
      break;
    }
  }

  if (!raw && scorecard[targetKey]) {
    raw = scorecard[targetKey];
  }

  if (!raw) {
    const keys = Object.keys(scorecard);
    if (isA && keys.length > 0) raw = scorecard[keys[0]];
    if (!isA && keys.length > 1) raw = scorecard[keys[1]];
  }

  const lr = typeof raw?.logical_rigor === 'number' ? raw.logical_rigor : parseFloat(raw?.logical_rigor) || 0;
  const eg = typeof raw?.evidence_grounding === 'number' ? raw.evidence_grounding : parseFloat(raw?.evidence_grounding) || 0;
  const rd = typeof raw?.rebuttal_directness === 'number' ? raw.rebuttal_directness : parseFloat(raw?.rebuttal_directness) || 0;
  const total = typeof raw?.total === 'number' ? raw.total : (lr > 0 || eg > 0 || rd > 0 ? Math.round(((lr + eg + rd) / 3) * 10) / 10 : 0);

  return {
    logical_rigor: Math.round(lr * 10) / 10,
    evidence_grounding: Math.round(eg * 10) / 10,
    rebuttal_directness: Math.round(rd * 10) / 10,
    total: Math.round(total * 10) / 10
  };
}

// Clean emojis and non-ASCII chars for jsPDF Helvetica font
function cleanPdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/⚠️|🛡️|🚨|⚖️|💡|✅|❌|🎯|📌|👉|•/gu, '')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
    .replace(/ +/g, ' ')
    .trim();
}

export interface TurnSummary {
  speakerId: string;
  senderName: string;
  roleTitle: string;
  roundNumber: number;
  aspect: string;
  isModerator: boolean;
  bulletPoints: string[];
}

// Extract exactly 2 to 3 important executive points per turn
export function extractKeyTakeaways(turn: MessageTurn): TurnSummary {
  const isMod = turn.speaker_id === 'moderator';
  const raw = cleanPdfText(turn.content);

  if (isMod) {
    let cleanConstraint = raw;
    const match = raw.match(/MODERATOR CONSTRAINT INJECTED:\s*"([^"]+)"/i);
    if (match) {
      cleanConstraint = match[1];
    } else {
      cleanConstraint = cleanConstraint
        .replace(/^[⚠️\s]*MODERATOR CONSTRAINT INJECTED:\s*/i, '')
        .replace(/\.?\s*Both participants must incorporate this requirement immediately\.?/i, '')
        .replace(/^"|"$/g, '')
        .trim();
    }
    return {
      speakerId: turn.speaker_id,
      senderName: turn.sender_name || 'Moderator',
      roleTitle: turn.role_title || 'Human Moderator',
      roundNumber: turn.round_number,
      aspect: cleanPdfText(turn.phase || 'Human Directive'),
      isModerator: true,
      bulletPoints: [`Steering Constraint: "${cleanConstraint}"`]
    };
  }

  // Parse structured blocks: Core Stance, Key Argument, Rebuttal, Bottom Line
  const regex = /(?:\*\*|\b)(Core Stance(?:\s+on\s+[^:]+)?|Key Argument & Evidence|Rebuttal \/ Scrutiny|Bottom Line|Key Evidence|Rebuttal|Takeaway)(?:\*\*|\b)[:\s]*([\s\S]*?)(?=(?:\*\*|\b)(?:Core Stance|Key Argument & Evidence|Rebuttal \/ Scrutiny|Bottom Line|Key Evidence|Rebuttal|Takeaway)(?:\*\*|\b)[:\s]*|$)/gi;

  const extracted: { label: string; text: string }[] = [];
  let m;
  while ((m = regex.exec(raw)) !== null) {
    const label = m[1].replace(/\*\*/g, '').trim();
    const text = m[2].replace(/\*\*/g, '').trim();
    if (text) {
      extracted.push({ label, text });
    }
  }

  const bullets: string[] = [];

  const cleanFirstSentence = (text: string, maxLen: number = 145): string => {
    if (!text) return '';
    const firstSent = text.split(/(?<=[.!?])\s+/)[0] || text;
    const trimmed = firstSent.replace(/\s+/g, ' ').trim();
    return trimmed.length > maxLen ? trimmed.slice(0, maxLen - 3).trim() + '...' : trimmed;
  };

  if (extracted.length > 0) {
    // 1. Core Stance (Position)
    const stance = extracted.find((e) => /stance/i.test(e.label));
    if (stance) {
      bullets.push(`Core Stance: ${cleanFirstSentence(stance.text, 140)}`);
    }

    // 2. Key Argument & Evidence (Data/Reasoning)
    const evidence = extracted.find((e) => /argument|evidence/i.test(e.label));
    if (evidence) {
      bullets.push(`Evidence & Scrutiny: ${cleanFirstSentence(evidence.text, 150)}`);
    }

    // 3. Bottom Line (Takeaway)
    const bottomLine = extracted.find((e) => /bottom line|takeaway|rebuttal/i.test(e.label));
    if (bottomLine) {
      bullets.push(`Strategic Takeaway: ${cleanFirstSentence(bottomLine.text, 140)}`);
    }
  }

  // Fallback if unstructured
  if (bullets.length === 0) {
    const paras = raw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paras.slice(0, 3).forEach((p, i) => {
      const label = i === 0 ? 'Core Thesis' : (i === 1 ? 'Evidence Point' : 'Takeaway');
      bullets.push(`${label}: ${cleanFirstSentence(p, 145)}`);
    });
  }

  return {
    speakerId: turn.speaker_id,
    senderName: turn.sender_name || 'Debater',
    roleTitle: turn.role_title || 'Expert',
    roundNumber: turn.round_number,
    aspect: cleanPdfText(turn.phase || 'General'),
    isModerator: false,
    bulletPoints: bullets.slice(0, 3) // strictly max 2-3 points!
  };
}

export const DecisionMemoModal: React.FC<DecisionMemoModalProps> = ({
  verdict,
  topic,
  mode = 'DEBATE',
  turns = [],
  onClose
}) => {
  const isCollab = mode === 'COLLABORATIVE';
  const scoreA = extractScore(verdict.scorecard, 'agent_a');
  const scoreB = extractScore(verdict.scorecard, 'agent_b');

  const summarizedTurns = turns.map((t) => extractKeyTakeaways(t));

  const generatePdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);

    // ==========================================
    // 1. Executive Top Header Banner (Page 1)
    // ==========================================
    doc.setFillColor(15, 23, 42); // Deep Navy Slate 900
    doc.rect(0, 0, pageWidth, 36, 'F');

    // Accent Stripe
    if (isCollab) {
      doc.setFillColor(147, 51, 234); // Purple 600
    } else {
      doc.setFillColor(79, 70, 229); // Indigo 600
    }
    doc.rect(0, 0, pageWidth, 3.5, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('POLYARGUMINDS EXECUTIVE REPORT', margin, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('AUTONOMOUS DIALECTIC STRESS-TEST & EXECUTIVE DECISION ARBITRATION', margin, 23);

    // Meta chips on banner
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(226, 232, 240); // Slate 200
    const modeLabel = isCollab ? 'MODE: COLLABORATIVE DESIGN REVIEW' : 'MODE: RED-TEAM STRESS-TEST';
    doc.text(`${modeLabel}   |   DATE: ${new Date().toLocaleDateString()}   |   SYNTHESIS: COMPLETED`, margin, 30);

    let curY = 44;

    // ==========================================
    // 2. Assessed Topic Box
    // ==========================================
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.4);

    const cleanTopic = cleanPdfText(topic);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    const splitTopic = doc.splitTextToSize(cleanTopic, contentWidth - 10);
    const topicBoxHeight = (splitTopic.length * 4.8) + 12;

    doc.roundedRect(margin, curY, contentWidth, topicBoxHeight, 2.5, 2.5, 'FD');

    // Topic Label
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('STRATEGIC PROPOSAL ASSESSED:', margin + 5, curY + 6);

    // Topic Content
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(splitTopic, margin + 5, curY + 12);

    curY += topicBoxHeight + 6;

    // ==========================================
    // 3. Chief Adjudicator's Final Verdict Box
    // ==========================================
    const cleanRec = cleanPdfText(verdict.executive_recommendation);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitRec = doc.splitTextToSize(cleanRec, contentWidth - 14);
    const recBoxHeight = (splitRec.length * 4.5) + 14;

    if (isCollab) {
      doc.setFillColor(250, 245, 255); // Purple 50
      doc.setDrawColor(216, 180, 254); // Purple 300
    } else {
      doc.setFillColor(238, 242, 255); // Indigo 50
      doc.setDrawColor(199, 210, 254); // Indigo 200
    }
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, curY, contentWidth, recBoxHeight, 2.5, 2.5, 'FD');

    // Left thick accent bar
    if (isCollab) {
      doc.setFillColor(147, 51, 234); // Purple 600
    } else {
      doc.setFillColor(79, 70, 229); // Indigo 600
    }
    doc.roundedRect(margin, curY, 3, recBoxHeight, 1.5, 1.5, 'F');

    // Verdict Label
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    if (isCollab) {
      doc.setTextColor(107, 33, 168); // Purple 800
    } else {
      doc.setTextColor(49, 46, 129); // Indigo 900
    }
    doc.text('CHIEF ARBITER STRATEGIC VERDICT & EXECUTIVE RECOMMENDATION:', margin + 7, curY + 6.5);

    // Recommendation Text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(splitRec, margin + 7, curY + 12.5);

    curY += recBoxHeight + 8;

    // ==========================================
    // 4. Multi-Rubric Scorecard Table
    // ==========================================
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Dialectic Evaluation Matrix & Rigor Scoring:', margin, curY);
    curY += 3.5;

    autoTable(doc, {
      startY: curY,
      head: [
        [
          'Evaluation Dimension',
          isCollab ? 'Agent A (Lead Strategist)' : 'Agent A (Lead Advocate)',
          isCollab ? 'Agent B (Principal Reviewer)' : 'Agent B (Chief Skeptic)'
        ]
      ],
      body: [
        ['Logical Rigor & Coherence', scoreA.logical_rigor > 0 ? `${scoreA.logical_rigor} / 10` : 'Pending', scoreB.logical_rigor > 0 ? `${scoreB.logical_rigor} / 10` : 'Pending'],
        ['Evidence Grounding & Data', scoreA.evidence_grounding > 0 ? `${scoreA.evidence_grounding} / 10` : 'Pending', scoreB.evidence_grounding > 0 ? `${scoreB.evidence_grounding} / 10` : 'Pending'],
        ['Rebuttal Directness & Scrutiny', scoreA.rebuttal_directness > 0 ? `${scoreA.rebuttal_directness} / 10` : 'Pending', scoreB.rebuttal_directness > 0 ? `${scoreB.rebuttal_directness} / 10` : 'Pending'],
        ['Composite Weighted Total', scoreA.total > 0 ? `${scoreA.total} / 10` : 'Pending', scoreB.total > 0 ? `${scoreB.total} / 10` : 'Pending']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: isCollab ? [126, 34, 206] : [49, 46, 129],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didParseCell: (data) => {
        if (data.row.index === 3) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = isCollab ? [243, 232, 255] : [224, 231, 255];
        }
      },
      margin: { left: margin, right: margin }
    });

    curY = (doc as any).lastAutoTable.finalY + 8;

    // ==========================================
    // 5. Key Argument Takeaways (2-3 Points per Turn)
    // ==========================================
    if (summarizedTurns.length > 0) {
      if (curY > 235) {
        doc.addPage();
        curY = 22;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Key Argument Takeaways Across Rounds (2-3 Core Points Each):', margin, curY);
      curY += 5.5;

      summarizedTurns.forEach((st) => {
        const isAgentA = st.speakerId === 'agent_a';
        const isMod = st.isModerator;

        // Calculate card height dynamically based on the 2-3 points
        let bulletLinesCount = 0;
        const precalculatedBullets: string[][] = [];

        st.bulletPoints.forEach((pt) => {
          doc.setFontSize(8.5);
          const lines = doc.splitTextToSize(`•  ${pt}`, contentWidth - 14);
          precalculatedBullets.push(lines);
          bulletLinesCount += lines.length;
        });

        const cardHeight = Math.max(16, (bulletLinesCount * 4.2) + 12);

        // Page break if card doesn't fit
        if (curY + cardHeight > 275) {
          doc.addPage();
          curY = 22;
        }

        // Card styling
        if (isMod) {
          doc.setFillColor(254, 252, 232); // Amber 50
          doc.setDrawColor(245, 158, 11); // Amber 500
        } else if (isAgentA) {
          doc.setFillColor(248, 250, 252); // Slate 50
          doc.setDrawColor(199, 210, 254); // Indigo 200
        } else {
          doc.setFillColor(248, 250, 252); // Slate 50
          doc.setDrawColor(254, 202, 202); // Rose 200
        }

        doc.setLineWidth(0.4);
        doc.roundedRect(margin, curY, contentWidth, cardHeight, 2, 2, 'FD');

        // Left accent bar
        if (isMod) {
          doc.setFillColor(217, 119, 6); // Amber 600
        } else if (isAgentA) {
          doc.setFillColor(79, 70, 229); // Indigo 600
        } else {
          doc.setFillColor(220, 38, 38); // Red 600
        }
        doc.roundedRect(margin, curY, 2.5, cardHeight, 1, 1, 'F');

        // Header Title
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        if (isMod) {
          doc.setTextColor(180, 83, 9); // Amber 700
          doc.text(`[Round ${st.roundNumber} • Human Steering Directive]: ${st.senderName}`, margin + 6, curY + 5.5);
        } else if (isAgentA) {
          doc.setTextColor(49, 46, 129); // Indigo 900
          doc.text(`[Round ${st.roundNumber} • ${st.aspect}]: ${st.senderName} (${st.roleTitle})`, margin + 6, curY + 5.5);
        } else {
          doc.setTextColor(153, 27, 27); // Red 900
          doc.text(`[Round ${st.roundNumber} • ${st.aspect}]: ${st.senderName} (${st.roleTitle})`, margin + 6, curY + 5.5);
        }

        // Render the 2-3 bullet points
        let bulletY = curY + 10;
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85); // Slate 700

        precalculatedBullets.forEach((lines) => {
          doc.text(lines, margin + 6, bulletY);
          bulletY += (lines.length * 4.2) + 1;
        });

        curY += cardHeight + 4;
      });
    }

    // ==========================================
    // 6. Concessions & Unresolved Blind Spots
    // ==========================================
    if (curY > 215) {
      doc.addPage();
      curY = 22;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Concessions & Unresolved Vulnerabilities:', margin, curY);
    curY += 5;

    // Concessions Box
    const concessions = (verdict.key_concessions || []).map((c) => cleanPdfText(c));
    let cHeight = 10;
    const splitCList: string[][] = [];
    concessions.forEach((c) => {
      doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(`[v]  ${c}`, contentWidth - 12);
      splitCList.push(lines);
      cHeight += (lines.length * 4.2) + 2;
    });

    if (curY + cHeight > 270) {
      doc.addPage();
      curY = 22;
    }

    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, curY, contentWidth, Math.max(16, cHeight), 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text('VALIDATED CONCESSIONS & COMMON GROUND:', margin + 6, curY + 6);

    let cY = curY + 11;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    splitCList.forEach((lines) => {
      doc.text(lines, margin + 6, cY);
      cY += (lines.length * 4.2) + 2;
    });

    curY += Math.max(16, cHeight) + 6;

    // Blind Spots Box
    const risks = (verdict.unresolved_risks || []).map((r) => cleanPdfText(r));
    let rHeight = 10;
    const splitRList: string[][] = [];
    risks.forEach((r) => {
      doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(`[!]  ${r}`, contentWidth - 12);
      splitRList.push(lines);
      rHeight += (lines.length * 4.2) + 2;
    });

    if (curY + rHeight > 270) {
      doc.addPage();
      curY = 22;
    }

    doc.setFillColor(254, 252, 232); // Amber 50
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, curY, contentWidth, Math.max(16, rHeight), 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.text('CRITICAL UNRESOLVED RISKS & BLIND SPOTS:', margin + 6, curY + 6);

    let rY = curY + 11;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    splitRList.forEach((lines) => {
      doc.text(lines, margin + 6, rY);
      rY += (lines.length * 4.2) + 2;
    });

    curY += Math.max(16, rHeight) + 6;

    // ==========================================
    // 7. Prioritized Action Plan
    // ==========================================
    const actions = (verdict.action_plan || []).map((a) => cleanPdfText(a));
    let aHeight = 10;
    const splitAList: string[][] = [];
    actions.forEach((a, idx) => {
      doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(`${idx + 1}.  ${a}`, contentWidth - 12);
      splitAList.push(lines);
      aHeight += (lines.length * 4.2) + 2;
    });

    if (curY + aHeight > 270) {
      doc.addPage();
      curY = 22;
    }

    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.setDrawColor(199, 210, 254); // Indigo 200
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, curY, contentWidth, Math.max(16, aHeight), 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.text('PRIORITIZED EXECUTIVE ACTION PLAN:', margin + 6, curY + 6);

    let aY = curY + 11;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    splitAList.forEach((lines) => {
      doc.text(lines, margin + 6, aY);
      aY += (lines.length * 4.2) + 2;
    });

    // ==========================================
    // 8. Two-Pass Running Headers & Footers
    // ==========================================
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);

      if (p > 1) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text('POLYARGUMINDS EXECUTIVE REPORT', margin, 11);
        const shortTopic = cleanTopic.length > 55 ? cleanTopic.slice(0, 52) + '...' : cleanTopic;
        doc.text(shortTopic, pageWidth - margin, 11, { align: 'right' });

        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.setLineWidth(0.3);
        doc.line(margin, 13, pageWidth - margin, 13);
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL • GENERATED BY POLYARGUMINDS AUTONOMOUS ENGINE', margin, pageHeight - 7);
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    doc.save(`Executive_Decision_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1 uppercase tracking-wider">
              <Award size={18} />
              <span>Executive Synthesis & Decision Memo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dialectic Stress-Test Report
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isCollab
                  ? 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/60 dark:border-purple-800'
                  : 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800'
              }`}>
                Mode: {isCollab ? 'Collaborative Review' : 'Red-Team Stress-Test'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Topic: {topic}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Highlighted Recommendation Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/50 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Scale size={16} />
            <span>Chief Adjudicator's Final Verdict</span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {verdict.executive_recommendation}
          </p>
        </div>

        {/* Scorecard Table */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Multi-Rubric Evaluation Matrix
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="font-semibold text-slate-500 dark:text-slate-400 text-left py-1">Dimension</div>
            <div className="font-bold text-indigo-700 dark:text-indigo-400 py-1 bg-indigo-100/60 dark:bg-indigo-950/40 rounded border border-indigo-200/60 dark:border-indigo-800/60">
              {isCollab ? 'Agent A (Strategist)' : 'Agent A (Advocate)'}
            </div>
            <div className="font-bold text-rose-700 dark:text-rose-400 py-1 bg-rose-100/60 dark:bg-rose-950/40 rounded border border-rose-200/60 dark:border-rose-800/60">
              {isCollab ? 'Agent B (Reviewer)' : 'Agent B (Skeptic)'}
            </div>

            <div className="text-slate-600 dark:text-slate-300 text-left py-1 font-medium">Logical Rigor</div>
            <div className="text-slate-900 dark:text-white py-1 font-mono font-semibold">{scoreA.logical_rigor > 0 ? `${scoreA.logical_rigor}/10` : 'N/A'}</div>
            <div className="text-slate-900 dark:text-white py-1 font-mono font-semibold">{scoreB.logical_rigor > 0 ? `${scoreB.logical_rigor}/10` : 'N/A'}</div>

            <div className="text-slate-600 dark:text-slate-300 text-left py-1 font-medium">Evidence Grounding</div>
            <div className="text-slate-900 dark:text-white py-1 font-mono font-semibold">{scoreA.evidence_grounding > 0 ? `${scoreA.evidence_grounding}/10` : 'N/A'}</div>
            <div className="text-slate-900 dark:text-white py-1 font-mono font-semibold">{scoreB.evidence_grounding > 0 ? `${scoreB.evidence_grounding}/10` : 'N/A'}</div>

            <div className="text-slate-600 dark:text-slate-300 text-left py-1 font-medium">Rebuttal / Synthesis</div>
            <div className="text-slate-900 dark:text-white py-1 font-mono font-semibold">{scoreA.rebuttal_directness > 0 ? `${scoreA.rebuttal_directness}/10` : 'N/A'}</div>
            <div className="text-slate-900 dark:text-white py-1 font-mono font-semibold">{scoreB.rebuttal_directness > 0 ? `${scoreB.rebuttal_directness}/10` : 'N/A'}</div>

            <div className="text-slate-900 dark:text-slate-100 text-left py-1.5 font-bold border-t border-slate-200 dark:border-slate-800">Composite Total</div>
            <div className="text-indigo-700 dark:text-indigo-300 py-1.5 font-bold font-mono border-t border-slate-200 dark:border-slate-800">{scoreA.total > 0 ? `${scoreA.total}/10` : 'N/A'}</div>
            <div className="text-rose-700 dark:text-rose-300 py-1.5 font-bold font-mono border-t border-slate-200 dark:border-slate-800">{scoreB.total > 0 ? `${scoreB.total}/10` : 'N/A'}</div>
          </div>
        </div>

        {/* Argument Key Takeaways Section (Concise 2-3 Bullet Points) */}
        {summarizedTurns.length > 0 && (
          <div className="mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>Executive Key Argument Takeaways Across Rounds</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {summarizedTurns.length} turns evaluated
              </span>
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {summarizedTurns.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs shadow-sm ${
                    st.isModerator
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-600/30'
                      : st.speakerId === 'agent_a'
                      ? 'bg-white dark:bg-slate-900/60 border-indigo-200/80 dark:border-indigo-900/40'
                      : 'bg-white dark:bg-slate-900/60 border-rose-200/80 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span
                      className={`font-semibold ${
                        st.isModerator
                          ? 'text-amber-800 dark:text-amber-400'
                          : st.speakerId === 'agent_a'
                          ? 'text-indigo-700 dark:text-indigo-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {st.senderName} ({st.roleTitle})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Round {st.roundNumber} • {st.aspect}
                    </span>
                  </div>

                  {/* 2-3 Clean Bullet Points */}
                  <ul className="space-y-1">
                    {st.bulletPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-[11.5px]">
                        <span
                          className={`font-bold shrink-0 mt-0.5 ${
                            st.isModerator
                              ? 'text-amber-600 dark:text-amber-400'
                              : st.speakerId === 'agent_a'
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          •
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concessions & Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50/60 dark:bg-slate-950 p-4 rounded-xl border border-emerald-200/80 dark:border-slate-800 shadow-sm">
            <h4 className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2.5">
              <CheckCircle2 size={16} /> Key Concessions Made
            </h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
              {(verdict.key_concessions || []).map((c, i) => (
                <li key={i} className="leading-relaxed">{c}</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50/60 dark:bg-slate-950 p-4 rounded-xl border border-amber-200/80 dark:border-slate-800 shadow-sm">
            <h4 className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2.5">
              <AlertTriangle size={16} /> Unresolved Blind Spots
            </h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
              {(verdict.unresolved_risks || []).map((r, i) => (
                <li key={i} className="leading-relaxed">{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prioritized Action Plan */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
          <h4 className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2.5">
            <ArrowRight size={16} /> Prioritized Action Plan
          </h4>
          <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
            {(verdict.action_plan || []).map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>

        {/* Export Button */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={generatePdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
          >
            <Download size={16} />
            <span>Export Executive Decision Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
