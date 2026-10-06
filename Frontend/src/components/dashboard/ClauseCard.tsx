import React, { useState } from 'react';
import { Clause } from '../../types';
import { CopyButton } from '../shared/CopyButton';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Quote,
  RefreshCw,
  Check,
  Sparkles,
} from 'lucide-react';

interface ClauseCardProps {
  clause: Clause;
  isActive: boolean;
  onSelect: (clauseId: string) => void;
  onReplace: (originalText: string, replacementText: string) => void;
  contractText: string;
}

export const ClauseCard: React.FC<ClauseCardProps> = ({
  clause,
  isActive,
  onSelect,
  onReplace,
  contractText,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Check if counterclause has already been applied in contract text
  const isApplied: boolean = Boolean(
    clause.counterclause &&
      clause.counterclause !== 'Standard clause; no change necessary.' &&
      contractText.includes(clause.counterclause) &&
      !contractText.includes(clause.text)
  );

  const getRiskMeta = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertOctagon,
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          borderClass: isActive
            ? 'border-rose-500/80 shadow-rose-500/10 shadow-lg ring-1 ring-rose-500/30'
            : 'border-dark-600/60 hover:border-rose-500/40',
          label: 'Danger',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          borderClass: isActive
            ? 'border-amber-500/80 shadow-amber-500/10 shadow-lg ring-1 ring-amber-500/30'
            : 'border-dark-600/60 hover:border-amber-500/40',
          label: 'Warning',
        };
      default:
        return {
          icon: CheckCircle2,
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          borderClass: isActive
            ? 'border-emerald-500/80 shadow-emerald-500/10 shadow-lg ring-1 ring-emerald-500/30'
            : 'border-dark-600/60 hover:border-emerald-500/40',
          label: 'Safe',
        };
    }
  };

  const meta = getRiskMeta(clause.type);
  const Icon = meta.icon;

  const handleCardClick = () => {
    onSelect(clause.id);
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!clause.counterclause || isApplied) return;
    onReplace(clause.text, clause.counterclause);
  };

  return (
    <div
      id={`dashboard-clause-${clause.id}`}
      onClick={handleCardClick}
      className={`glass-panel rounded-xl p-4 border transition-all cursor-pointer space-y-3 ${meta.borderClass}`}
    >
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${meta.badgeBg}`}>
                {meta.label}
              </span>
              <span className="text-[11px] font-medium text-slate-400 bg-dark-950/60 px-2 py-0.5 rounded-md border border-dark-600/60">
                {clause.category}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-100 leading-snug">
              {clause.title}
            </h4>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-dark-700/50"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="space-y-3 pt-1 border-t border-dark-600/60">
          {/* Quoted Verbatim Snippet */}
          <div className="p-3 rounded-lg bg-dark-950/80 border border-dark-600/60 space-y-1">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Quote className="w-3 h-3 text-slate-400" />
              <span>Original Contract Snippet</span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed italic select-all">
              "{clause.text}"
            </p>
          </div>

          {/* AI Risk Explanation */}
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 space-y-1">
            <div className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Why This Clause Is Risky</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {clause.explanation}
            </p>
          </div>

          {/* Suggested Counterclause & Action Bar */}
          {clause.counterclause && clause.counterclause !== 'Standard clause; no change necessary.' ? (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Suggested Fair Counterclause
                </span>
                {isApplied && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Applied to Contract</span>
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-emerald-200/90 leading-relaxed bg-dark-950/70 p-2.5 rounded-md border border-emerald-500/10 select-all">
                {clause.counterclause}
              </p>

              {/* Counterclause Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-1">
                <CopyButton
                  textToCopy={clause.counterclause}
                  label="Copy Counterclause"
                />

                <button
                  onClick={handleReplaceClick}
                  disabled={isApplied}
                  type="button"
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isApplied
                      ? 'bg-dark-700 text-slate-500 cursor-not-allowed border border-dark-600'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-500" />
                      <span>Applied ✓</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace in Contract</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic px-1">
              Standard commercial terms; no counterclause replacement required.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
