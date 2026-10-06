import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { ContractToolbar } from './ContractToolbar';
import { HighlightedText } from './HighlightedText';
import { ContractEditor } from './ContractEditor';
import { AlertCircle } from 'lucide-react';

export const ContractViewer: React.FC = () => {
  const {
    contractText,
    analysis,
    activeClauseId,
    viewMode,
    setContractText,
    setActiveClause,
    setViewMode,
    clearAll,
  } = useAnalysis();

  // Track initial analyzed text to detect user modifications
  const [analyzedText, setAnalyzedText] = useState<string | null>(null);
  const [isModified, setIsModified] = useState<boolean>(false);

  useEffect(() => {
    if (analysis && contractText) {
      setAnalyzedText(contractText);
      setIsModified(false);
    }
  }, [analysis]);

  useEffect(() => {
    if (analyzedText && contractText !== analyzedText) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [contractText, analyzedText]);

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col h-full space-y-4">
      {/* Top Toolbar */}
      <ContractToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        contractText={contractText}
        onTextChange={setContractText}
        onClear={clearAll}
        hasAnalysis={!!analysis}
      />

      {/* Stale Analysis Warning Banner */}
      {isModified && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Contract text was modified. Highlights may be out of sync. Click <strong>Audit Contract</strong> to refresh highlights.
          </span>
        </div>
      )}

      {/* Main View Area (Reader vs Editor Mode) */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {viewMode === 'reader' ? (
          <HighlightedText
            contractText={contractText}
            clauses={analysis?.clauses || []}
            activeClauseId={activeClauseId}
            onClauseClick={setActiveClause}
          />
        ) : (
          <ContractEditor
            value={contractText}
            onChange={setContractText}
          />
        )}
      </div>
    </div>
  );
};
