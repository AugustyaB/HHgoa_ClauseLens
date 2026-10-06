import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { FairnessGauge } from './FairnessGauge';
import { RiskSummary } from './RiskSummary';
import { CategoryBreakdown } from './CategoryBreakdown';
import { ClauseFilterBar } from './ClauseFilterBar';
import { ClauseCard } from './ClauseCard';
import { RiskType } from '../../types';
import { SearchX, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    contractText,
    analysis,
    activeClauseId,
    setActiveClause,
    replaceClause,
  } = useAnalysis();

  const [filterType, setFilterType] = useState<'all' | RiskType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const cardListRef = useRef<HTMLDivElement>(null);

  // Compute clause counts
  const clauseCounts = useMemo(() => {
    if (!analysis) return { all: 0, danger: 0, warning: 0, safe: 0 };
    return {
      all: analysis.clauses.length,
      danger: analysis.clauses.filter((c) => c.type === 'danger').length,
      warning: analysis.clauses.filter((c) => c.type === 'warning').length,
      safe: analysis.clauses.filter((c) => c.type === 'safe').length,
    };
  }, [analysis]);

  // Filter clauses by type and search keyword query
  const filteredClauses = useMemo(() => {
    if (!analysis) return [];

    return analysis.clauses.filter((clause) => {
      // Type filter
      if (filterType !== 'all' && clause.type !== filterType) {
        return false;
      }

      // Keyword search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = clause.title.toLowerCase().includes(query);
        const matchCategory = clause.category.toLowerCase().includes(query);
        const matchExplanation = clause.explanation.toLowerCase().includes(query);
        const matchText = clause.text.toLowerCase().includes(query);
        return matchTitle || matchCategory || matchExplanation || matchText;
      }

      return true;
    });
  }, [analysis, filterType, searchQuery]);

  // Smooth scroll active card into view when selected from left panel highlight
  useEffect(() => {
    if (!activeClauseId || !cardListRef.current) return;

    const cardElement = cardListRef.current.querySelector(
      `#dashboard-clause-${activeClauseId}`
    );

    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeClauseId]);

  if (!analysis) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-base font-semibold text-slate-200">
            Awaiting Contract Analysis
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select a sample contract above or paste a contract text in the editor and click <strong>Audit Contract</strong> to generate your fairness score and flagged clause dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full space-y-4 overflow-hidden">
      {/* Scrollable Dashboard Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {/* SVG Radial Fairness Meter */}
        <FairnessGauge
          score={analysis.overall_score}
          engine={analysis.analysis_engine}
          durationMs={analysis.analysis_duration_ms}
        />

        {/* Executive Risk Summary */}
        <RiskSummary
          summary={analysis.summary}
          keyTakeaways={analysis.key_takeaways}
          riskCounts={analysis.risk_counts}
        />

        {/* Category Risk Breakdown Bars */}
        <CategoryBreakdown categoryScores={analysis.category_scores} />

        {/* Filter Bar */}
        <ClauseFilterBar
          filterType={filterType}
          onFilterChange={setFilterType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          clauseCounts={clauseCounts}
        />

        {/* Expandable Clause Cards List */}
        <div ref={cardListRef} className="space-y-3 pt-2">
          {filteredClauses.length > 0 ? (
            filteredClauses.map((clause) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                isActive={activeClauseId === clause.id}
                onSelect={setActiveClause}
                onReplace={replaceClause}
                contractText={contractText}
              />
            ))
          ) : (
            <div className="p-8 rounded-xl glass-card border border-slate-800 text-center flex flex-col items-center justify-center space-y-2">
              <SearchX className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-400 font-medium">
                No flagged clauses match your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
