import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface RiskSummaryProps {
  summary: string;
  keyTakeaways: string[];
  riskCounts: {
    danger: number;
    warning: number;
    safe: number;
    [key: string]: number;
  };
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({
  summary,
  keyTakeaways,
  riskCounts,
}) => {
  return (
    <div className="glass-card rounded-xl p-4 border border-dark-600 space-y-3">
      {/* Risk Type Pills Bar */}
      <div className="flex items-center space-x-2 pb-2 border-b border-dark-600/80">
        <span className="text-xs font-semibold text-slate-400">Risk Breakdown:</span>

        <div className="flex items-center space-x-1.5 ml-auto text-xs font-mono">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-3 h-3 text-rose-500" />
            <span>{riskCounts.danger || 0} Danger</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>{riskCounts.warning || 0} Warning</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{riskCounts.safe || 0} Safe</span>
          </span>
        </div>
      </div>

      {/* Executive Summary Text */}
      <p className="text-xs text-slate-300 leading-relaxed font-sans">
        {summary}
      </p>

      {/* Key Takeaways Bullet List */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Executive Key Takeaways
          </span>
          <ul className="space-y-1">
            {keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-300 flex items-start space-x-1.5 bg-dark-950/60 p-2 rounded-lg border border-dark-600/50"
              >
                <ChevronRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
