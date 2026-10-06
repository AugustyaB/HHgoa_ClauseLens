import React from 'react';
import { Search, X } from 'lucide-react';
import { RiskType } from '../../types';

interface ClauseFilterBarProps {
  filterType: 'all' | RiskType;
  onFilterChange: (type: 'all' | RiskType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  clauseCounts: {
    all: number;
    danger: number;
    warning: number;
    safe: number;
  };
}

export const ClauseFilterBar: React.FC<ClauseFilterBarProps> = ({
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
  clauseCounts,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      {/* Filter Type Pills */}
      <div className="flex items-center space-x-1.5 bg-dark-950/80 p-1 rounded-xl border border-dark-600/60">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({clauseCounts.all})
        </button>

        <button
          onClick={() => onFilterChange('danger')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filterType === 'danger'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-400 hover:text-rose-300'
          }`}
        >
          Danger ({clauseCounts.danger})
        </button>

        <button
          onClick={() => onFilterChange('warning')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filterType === 'warning'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          Warning ({clauseCounts.warning})
        </button>

        <button
          onClick={() => onFilterChange('safe')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filterType === 'safe'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-400 hover:text-emerald-300'
          }`}
        >
          Safe ({clauseCounts.safe})
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter clauses by keyword..."
          className="w-full bg-dark-950/90 border border-dark-600/80 rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
