import React from 'react';
import { Award, CheckCircle2, AlertTriangle, Download, X, ListOrdered, Scale, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Verdict, MessageTurn } from '../lib/types';

interface MemoModalProps {
  verdict: Verdict;
  topic: string;
  mode?: string;
  turns?: MessageTurn[];
  onClose: () => void;
}

export const DecisionMemoModal: React.FC<MemoModalProps> = ({
  verdict,
  topic,
  mode = 'DEBATE',
  turns = [],
  onClose
}) => {
  const isCollab = mode === 'COLLABORATIVE';

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Title Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EXECUTIVE DECISION & DIALECTIC REPORT', 14, 18);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`POLYARGUMINDS AUTONOMOUS ENGINE • MODE: ${mode.toUpperCase()} • DATE: ${new Date().toLocaleDateString()}`, 14, 28);

    // 2. Topic & Executive Verdict
    let curY = 48;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Topic Assessed:', 14, curY);
    curY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitTopic = doc.splitTextToSize(topic, pageWidth - 28);
    doc.text(splitTopic, 14, curY);
    curY += (splitTopic.length * 5) + 6;

    // Highlighted Verdict Box
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(99, 102, 241); // indigo-500
    doc.setLineWidth(0.5);
    
    const splitRec = doc.splitTextToSize(verdict.executive_recommendation, pageWidth - 36);
    const boxHeight = (splitRec.length * 5) + 14;
    doc.roundedRect(14, curY, pageWidth - 28, boxHeight, 3, 3, 'FD');
    
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('EXECUTIVE VERDICT & RECOMMENDATION:', 18, curY + 7);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(splitRec, 18, curY + 14);
    curY += boxHeight + 8;

    // 3. Multi-Rubric Scorecard Table
    const sc = verdict.scorecard || {
      agent_a: { logical_rigor: 8, evidence_grounding: 8, rebuttal_directness: 8, total: 8 },
      agent_b: { logical_rigor: 8, evidence_grounding: 8, rebuttal_directness: 8, total: 8 }
    };

    autoTable(doc, {
      startY: curY,
      head: [['Evaluation Dimension', isCollab ? 'Agent A (Strategist)' : 'Agent A (Advocate)', isCollab ? 'Agent B (Reviewer)' : 'Agent B (Skeptic)']],
      body: [
        ['Logical Rigor & Coherence', `${sc.agent_a.logical_rigor}/10`, `${sc.agent_b.logical_rigor}/10`],
        ['Evidence Grounding & Data', `${sc.agent_a.evidence_grounding}/10`, `${sc.agent_b.evidence_grounding}/10`],
        ['Rebuttal / Synthesis', `${sc.agent_a.rebuttal_directness}/10`, `${sc.agent_b.rebuttal_directness}/10`],
        ['Composite Weighted Total', `${sc.agent_a.total}/10`, `${sc.agent_b.total}/10`],
      ],
      theme: 'grid',
      headStyles: { fillColor: isCollab ? [147, 51, 234] : [79, 70, 229] },
      styles: { fontSize: 9 },
    });

    curY = (doc as any).lastAutoTable.finalY + 10;

    // 4. Key Argument Breakdown by Turn
    if (turns.length > 0) {
      if (curY > 230) {
        doc.addPage();
        curY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Key Argument Breakdown & Dialectic Synthesis:', 14, curY);
      curY += 7;

      turns.slice(0, 6).forEach((t) => {
        if (curY > 250) {
          doc.addPage();
          curY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(t.speaker_id === 'agent_a' ? 79 : 190, t.speaker_id === 'agent_a' ? 70 : 24, t.speaker_id === 'agent_a' ? 229 : 93);
        doc.text(`[Round ${t.round_number}] ${t.sender_name} (${t.role_title}):`, 14, curY);
        curY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        // Extract first 200 chars or first paragraph as key summary
        const summarySnippet = t.content.split('\n')[0].replace(/\*\*/g, '').slice(0, 220);
        const splitSnippet = doc.splitTextToSize(summarySnippet + (summarySnippet.length >= 220 ? '...' : ''), pageWidth - 32);
        doc.text(splitSnippet, 16, curY);
        curY += (splitSnippet.length * 4.5) + 4;
      });
    }

    // 5. Concessions & Blind Spots
    if (curY > 220) {
      doc.addPage();
      curY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Key Concessions & Critical Unresolved Risks:', 14, curY);
    curY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('Key Concessions:', 14, curY);
    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    (verdict.key_concessions || []).forEach((c) => {
      const splitC = doc.splitTextToSize(`• ${c}`, pageWidth - 32);
      doc.text(splitC, 16, curY);
      curY += (splitC.length * 4.5) + 2;
    });

    curY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text('Unresolved Blind Spots & Failure Modes:', 14, curY);
    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    (verdict.unresolved_risks || []).forEach((r) => {
      const splitR = doc.splitTextToSize(`• ${r}`, pageWidth - 32);
      doc.text(splitR, 16, curY);
      curY += (splitR.length * 4.5) + 2;
    });

    // 6. Action Plan
    curY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('Prioritized Action Plan:', 14, curY);
    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    (verdict.action_plan || []).forEach((step, idx) => {
      const splitStep = doc.splitTextToSize(`${idx + 1}. ${step}`, pageWidth - 32);
      doc.text(splitStep, 16, curY);
      curY += (splitStep.length * 4.5) + 2;
    });

    doc.save(`Executive_Decision_Report_${Date.now()}.pdf`);
  };

  const sc = verdict.scorecard || {
    agent_a: { logical_rigor: 8.5, evidence_grounding: 8.5, rebuttal_directness: 8.0, total: 8.3 },
    agent_b: { logical_rigor: 8.0, evidence_grounding: 8.0, rebuttal_directness: 8.5, total: 8.2 }
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
            <div className="text-white py-1 font-mono">{sc.agent_a?.logical_rigor}/10</div>
            <div className="text-white py-1 font-mono">{sc.agent_b?.logical_rigor}/10</div>

            <div className="text-slate-300 text-left py-1">Evidence Grounding</div>
            <div className="text-white py-1 font-mono">{sc.agent_a?.evidence_grounding}/10</div>
            <div className="text-white py-1 font-mono">{sc.agent_b?.evidence_grounding}/10</div>

            <div className="text-slate-300 text-left py-1">Rebuttal / Synthesis</div>
            <div className="text-white py-1 font-mono">{sc.agent_a?.rebuttal_directness}/10</div>
            <div className="text-white py-1 font-mono">{sc.agent_b?.rebuttal_directness}/10</div>

            <div className="text-slate-200 text-left py-1 font-bold border-t border-slate-800">Composite Total</div>
            <div className="text-indigo-300 py-1 font-bold font-mono border-t border-slate-800">{sc.agent_a?.total}/10</div>
            <div className="text-rose-300 py-1 font-bold font-mono border-t border-slate-800">{sc.agent_b?.total}/10</div>
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
                    <span className={`font-semibold ${t.speaker_id === 'agent_a' ? 'text-indigo-400' : 'text-rose-400'}`}>
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

        {/* Action Plan */}
        {verdict.action_plan && verdict.action_plan.length > 0 && (
          <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2.5">
              <ListOrdered size={16} /> Prioritized Action Roadmap
            </h4>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
              {verdict.action_plan.map((step, idx) => (
                <li key={idx} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* PDF Export Button */}
        <button
          onClick={exportPDF}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 text-sm"
        >
          <Download size={18} />
          <span>Export Formal Decision Report (PDF)</span>
        </button>
      </div>
    </div>
  );
};
