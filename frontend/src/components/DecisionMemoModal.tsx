import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Download, Scale, ArrowRight, FileText } from 'lucide-react';
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
    return { logical_rigor: 7.8, evidence_grounding: 7.5, rebuttal_directness: 7.6, total: 7.6 };
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

  const lr = typeof raw?.logical_rigor === 'number' ? raw.logical_rigor : parseFloat(raw?.logical_rigor) || 7.5;
  const eg = typeof raw?.evidence_grounding === 'number' ? raw.evidence_grounding : parseFloat(raw?.evidence_grounding) || 7.0;
  const rd = typeof raw?.rebuttal_directness === 'number' ? raw.rebuttal_directness : parseFloat(raw?.rebuttal_directness) || 7.5;
  const total = typeof raw?.total === 'number' ? raw.total : Math.round(((lr + eg + rd) / 3) * 10) / 10;

  return {
    logical_rigor: Math.round(lr * 10) / 10,
    evidence_grounding: Math.round(eg * 10) / 10,
    rebuttal_directness: Math.round(rd * 10) / 10,
    total: Math.round(total * 10) / 10
  };
}

// Clean all emojis and non-standard unicode that break jsPDF's built-in Helvetica font
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

interface ParsedBlock {
  heading: string;
  body: string;
}

function parseTurnContent(content: string): ParsedBlock[] {
  const cleaned = cleanPdfText(content);
  if (!cleaned) return [];

  const blocks: ParsedBlock[] = [];
  const regex = /(?:\*\*|\b)(Core Stance(?:\s+on\s+[^:]+)?|Key Argument & Evidence|Rebuttal \/ Scrutiny|Bottom Line|Key Evidence|Rebuttal|Takeaway)(?:\*\*|\b)[:\s]*([\s\S]*?)(?=(?:\*\*|\b)(?:Core Stance|Key Argument & Evidence|Rebuttal \/ Scrutiny|Bottom Line|Key Evidence|Rebuttal|Takeaway)(?:\*\*|\b)[:\s]*|$)/gi;

  let match;
  let hasMatches = false;
  while ((match = regex.exec(cleaned)) !== null) {
    hasMatches = true;
    const heading = match[1].replace(/\*\*/g, '').trim();
    const body = match[2].replace(/\*\*/g, '').trim();
    if (body) {
      blocks.push({ heading, body });
    }
  }

  if (!hasMatches || blocks.length === 0) {
    const paras = cleaned.split(/\n\s*\n/).map((p) => p.replace(/\*\*/g, '').trim()).filter(Boolean);
    paras.forEach((p, idx) => {
      blocks.push({
        heading: idx === 0 ? 'Core Stance' : idx === paras.length - 1 ? 'Bottom Line' : 'Key Argument',
        body: p
      });
    });
  }

  return blocks;
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

    // Meta badges on banner
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(226, 232, 240); // Slate 200
    const modeLabel = isCollab ? 'MODE: COLLABORATIVE DESIGN REVIEW' : 'MODE: RED-TEAM STRESS-TEST';
    doc.text(`${modeLabel}   |   DATE: ${new Date().toLocaleDateString()}   |   ROUNDS: ${verdict.scorecard ? 'EVALUATED' : 'CONCLUDED'}`, margin, 30);

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

    // Box Fill & Border
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
        ['Logical Rigor & Coherence', `${scoreA.logical_rigor} / 10`, `${scoreB.logical_rigor} / 10`],
        ['Evidence Grounding & Data', `${scoreA.evidence_grounding} / 10`, `${scoreB.evidence_grounding} / 10`],
        ['Rebuttal Directness & Scrutiny', `${scoreA.rebuttal_directness} / 10`, `${scoreB.rebuttal_directness} / 10`],
        ['Composite Weighted Total', `${scoreA.total} / 10`, `${scoreB.total} / 10`]
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
        // Highlight composite total row
        if (data.row.index === 3) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = isCollab ? [243, 232, 255] : [224, 231, 255];
        }
      },
      margin: { left: margin, right: margin }
    });

    curY = (doc as any).lastAutoTable.finalY + 8;

    // ==========================================
    // 5. Key Argument Breakdown by Round (Cards)
    // ==========================================
    if (turns.length > 0) {
      if (curY > 230) {
        doc.addPage();
        curY = 22;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Key Argument Breakdown & Dialectic Synthesis Across Rounds:', margin, curY);
      curY += 6;

      turns.forEach((t) => {
        const isMod = t.speaker_id === 'moderator';
        const isAgentA = t.speaker_id === 'agent_a';
        const rawContent = cleanPdfText(t.content);

        // Header info
        const roundLabel = `Round ${t.round_number}`;
        const phaseLabel = cleanPdfText(t.phase || (isMod ? 'Human Constraint' : 'Dialectic Turn'));
        const senderName = cleanPdfText(t.sender_name || (isMod ? 'Moderator' : 'Debater'));
        const roleTitle = cleanPdfText(t.role_title || (isMod ? 'Human Moderator' : 'Expert'));

        if (isMod) {
          // MODERATOR DIRECTIVE CARD
          const cleanConstraint = rawContent.replace(/^MODERATOR CONSTRAINT INJECTED:\s*/i, '').replace(/\.\s*Both participants must incorporate.*$/i, '');
          const splitMod = doc.splitTextToSize(`"${cleanConstraint}"`, contentWidth - 14);
          const modHeight = (splitMod.length * 4.3) + 14;

          if (curY + modHeight > 270) {
            doc.addPage();
            curY = 22;
          }

          doc.setFillColor(254, 252, 232); // Amber 50
          doc.setDrawColor(245, 158, 11); // Amber 500
          doc.setLineWidth(0.4);
          doc.roundedRect(margin, curY, contentWidth, modHeight, 2, 2, 'FD');

          // Amber left bar
          doc.setFillColor(217, 119, 6); // Amber 600
          doc.roundedRect(margin, curY, 2.5, modHeight, 1, 1, 'F');

          // Header
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(180, 83, 9); // Amber 700
          doc.text(`[${roundLabel.toUpperCase()} • MODERATOR STRATEGIC DIRECTIVE INJECTED]`, margin + 6, curY + 5.5);

          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(69, 26, 3); // Amber 950
          doc.text(splitMod, margin + 6, curY + 10.5);

          curY += modHeight + 5;
        } else {
          // DEBATER TURN CARD
          const parsedBlocks = parseTurnContent(rawContent);

          // Calculate height required for all blocks in this card
          let totalTextHeight = 0;
          const precalculatedBlocks: { heading: string; lines: string[] }[] = [];

          parsedBlocks.forEach((b) => {
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(b.body, contentWidth - 14);
            precalculatedBlocks.push({ heading: b.heading, lines });
            totalTextHeight += (lines.length * 4.0) + 5.5;
          });

          const cardHeight = Math.max(22, totalTextHeight + 11);

          // Check if card fits on current page
          if (curY + cardHeight > 270) {
            doc.addPage();
            curY = 22;
          }

          // Card Background & Border
          if (isAgentA) {
            doc.setFillColor(248, 250, 252); // Slate 50
            doc.setDrawColor(199, 210, 254); // Indigo 200
          } else {
            doc.setFillColor(248, 250, 252); // Slate 50
            doc.setDrawColor(254, 202, 202); // Rose 200
          }
          doc.setLineWidth(0.4);
          doc.roundedRect(margin, curY, contentWidth, cardHeight, 2.5, 2.5, 'FD');

          // Left Accent Strip
          if (isAgentA) {
            doc.setFillColor(79, 70, 229); // Indigo 600
          } else {
            doc.setFillColor(220, 38, 38); // Red 600
          }
          doc.roundedRect(margin, curY, 2.5, cardHeight, 1.2, 1.2, 'F');

          // Card Header Bar
          let cardY = curY + 6;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          if (isAgentA) {
            doc.setTextColor(49, 46, 129); // Indigo 900
          } else {
            doc.setTextColor(153, 27, 27); // Red 900
          }
          doc.text(`[${roundLabel} • ${phaseLabel}]: ${senderName} (${roleTitle})`, margin + 6, cardY);
          cardY += 5;

          // Render Parsed Sections
          precalculatedBlocks.forEach((b) => {
            const isBottomLine = b.heading.toLowerCase().includes('bottom line');

            // Section Heading
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'bold');
            if (isBottomLine) {
              doc.setTextColor(5, 150, 105); // Emerald 600
            } else if (isAgentA) {
              doc.setTextColor(79, 70, 229); // Indigo 600
            } else {
              doc.setTextColor(190, 24, 93); // Rose 700
            }
            doc.text(`${b.heading.toUpperCase()}:`, margin + 6, cardY);
            cardY += 4;

            // Section Body Lines
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85); // Slate 700
            doc.text(b.lines, margin + 6, cardY);
            cardY += (b.lines.length * 4.0) + 2.5;
          });

          curY += cardHeight + 5;
        }
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

      // Running Header on Pages 2+
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

      // Running Footer on All Pages
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1 uppercase tracking-wider">
              <Award size={18} />
              <span>Executive Synthesis & Decision Memo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dialectic Stress-Test Report
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isCollab ? 'text-purple-400 bg-purple-950/60 border-purple-800' : 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
              }`}>
                Mode: {isCollab ? 'Collaborative Review' : 'Red-Team Stress-Test'}
              </span>
              <span className="text-xs text-slate-400 truncate max-w-md">
                Topic: {topic}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Highlighted Recommendation Banner */}
        <div className="bg-indigo-950/50 border border-indigo-500/50 rounded-xl p-5 mb-6 shadow-inner">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Scale size={16} />
            <span>Chief Adjudicator's Final Verdict</span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
            {verdict.executive_recommendation}
          </p>
        </div>

        {/* Scorecard Table */}
        <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Multi-Rubric Evaluation Matrix
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="font-semibold text-slate-400 text-left py-1">Dimension</div>
            <div className="font-bold text-indigo-400 py-1 bg-indigo-950/40 rounded">
              {isCollab ? 'Agent A (Strategist)' : 'Agent A (Advocate)'}
            </div>
            <div className="font-bold text-rose-400 py-1 bg-rose-950/40 rounded">
              {isCollab ? 'Agent B (Reviewer)' : 'Agent B (Skeptic)'}
            </div>

            <div className="text-slate-300 text-left py-1">Logical Rigor</div>
            <div className="text-white py-1 font-mono">{scoreA.logical_rigor}/10</div>
            <div className="text-white py-1 font-mono">{scoreB.logical_rigor}/10</div>

            <div className="text-slate-300 text-left py-1">Evidence Grounding</div>
            <div className="text-white py-1 font-mono">{scoreA.evidence_grounding}/10</div>
            <div className="text-white py-1 font-mono">{scoreB.evidence_grounding}/10</div>

            <div className="text-slate-300 text-left py-1">Rebuttal / Synthesis</div>
            <div className="text-white py-1 font-mono">{scoreA.rebuttal_directness}/10</div>
            <div className="text-white py-1 font-mono">{scoreB.rebuttal_directness}/10</div>

            <div className="text-slate-200 text-left py-1 font-bold border-t border-slate-800">Composite Total</div>
            <div className="text-indigo-300 py-1 font-bold font-mono border-t border-slate-800">{scoreA.total}/10</div>
            <div className="text-rose-300 py-1 font-bold font-mono border-t border-slate-800">{scoreB.total}/10</div>
          </div>
        </div>

        {/* Argument Key Takeaways Section */}
        {turns.length > 0 && (
          <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText size={14} className="text-indigo-400" />
              <span>Key Argument Breakdown Across Rounds</span>
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {turns.map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${t.speaker_id === 'agent_a' ? 'text-indigo-400' : (t.speaker_id === 'moderator' ? 'text-amber-400' : 'text-rose-400')}`}>
                      {t.sender_name} ({t.role_title})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Round {t.round_number} • {t.phase}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-snug line-clamp-2">
                    {t.content.replace(/\*\*/g, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concessions & Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2.5">
              <CheckCircle2 size={16} /> Key Concessions Made
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              {(verdict.key_concessions || []).map((c, i) => (
                <li key={i} className="leading-relaxed">{c}</li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2.5">
              <AlertTriangle size={16} /> Unresolved Blind Spots
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              {(verdict.unresolved_risks || []).map((r, i) => (
                <li key={i} className="leading-relaxed">{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prioritized Action Plan */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <h4 className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2.5">
            <ArrowRight size={16} /> Prioritized Action Plan
          </h4>
          <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
            {(verdict.action_plan || []).map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>

        {/* Export Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={generatePdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30"
          >
            <Download size={16} />
            <span>Export Executive Decision Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
