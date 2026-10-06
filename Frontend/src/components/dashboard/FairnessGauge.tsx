import React from 'react';
import { ShieldAlert, ShieldCheck, Shield, Zap } from 'lucide-react';

interface FairnessGaugeProps {
  score: number;
  engine: string;
  durationMs?: number | null;
}

export const FairnessGauge: React.FC<FairnessGaugeProps> = ({
  score,
  engine,
  durationMs,
}) => {
  const validScore = Math.max(0, Math.min(100, Math.round(score)));

  const getScoreBand = (s: number) => {
    if (s >= 75) {
      return {
        label: 'Fair & Protective',
        colorClass: 'text-emerald-400',
        strokeColor: '#10b981',
        bgGlow: 'shadow-emerald-500/10 border-emerald-500/20 bg-emerald-500/5',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Icon: ShieldCheck,
      };
    }
    if (s >= 50) {
      return {
        label: 'Moderate Risk',
        colorClass: 'text-amber-400',
        strokeColor: '#f59e0b',
        bgGlow: 'shadow-amber-500/10 border-amber-500/20 bg-amber-500/5',
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        Icon: Shield,
      };
    }
    if (s >= 25) {
      return {
        label: 'High Risk',
        colorClass: 'text-orange-400',
        strokeColor: '#f97316',
        bgGlow: 'shadow-orange-500/10 border-orange-500/20 bg-orange-500/5',
        badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        Icon: ShieldAlert,
      };
    }
    return {
      label: 'Predatory Terms',
      colorClass: 'text-rose-500',
      strokeColor: '#ef4444',
      bgGlow: 'shadow-rose-500/10 border-rose-500/20 bg-rose-500/5',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      Icon: ShieldAlert,
    };
  };

  const band = getScoreBand(validScore);
  const StatusIcon = band.Icon;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  return (
    <div className={`rounded-2xl p-5 border ${band.bgGlow} transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6`}>
      {/* SVG Radial Meter */}
      <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-dark-600"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={band.strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold tracking-tight ${band.colorClass}`}>
            {validScore}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Out of 100
          </span>
        </div>
      </div>

      {/* Audit Meta & Status */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${band.badgeBg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{band.label}</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-dark-700 text-slate-300 border border-dark-600">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="capitalize">{engine} engine</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {validScore >= 75
            ? 'This contract contains standard, balanced terms with low financial or legal risk exposure.'
            : validScore >= 50
            ? 'This contract contains several ambiguous or concerning terms. Review highlighted clauses carefully.'
            : 'Warning: This contract is heavily one-sided with predatory clauses. Negotiation or legal advice is recommended before signing.'}
        </p>

        {durationMs !== undefined && durationMs !== null && (
          <div className="text-[10px] font-mono text-slate-400">
            Audit completed in {durationMs}ms
          </div>
        )}
      </div>
    </div>
  );
};
