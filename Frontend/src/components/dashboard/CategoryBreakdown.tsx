import React from 'react';

interface CategoryBreakdownProps {
  categoryScores: {
    [category: string]: number;
  };
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categoryScores,
}) => {
  const categories = Object.entries(categoryScores);

  if (categories.length === 0) return null;

  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-2.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
        Category Risk Breakdown
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map(([category, score]) => (
          <div key={category} className="space-y-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300 truncate max-w-[150px]" title={category}>
                {category}
              </span>
              <span className="font-mono text-slate-400 font-semibold">{score}/100</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(score)} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
