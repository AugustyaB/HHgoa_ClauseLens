import React, { useState } from 'react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useSamples } from '../../hooks/useSamples';
import { ApiKeyModal } from '../shared/ApiKeyModal';
import { downloadMarkdownReport } from '../../utils/export';
import { ShieldCheck, Key, Sparkles, Trash2, BookOpen, Download } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { samples, loading: samplesLoading } = useSamples();
  const {
    contractText,
    analysis,
    isAnalyzing,
    apiKey,
    triggerAnalysis,
    loadSample,
    setApiKey,
    clearAll,
  } = useAnalysis();

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const handleDownloadReport = () => {
    if (!analysis || !contractText) return;
    downloadMarkdownReport(analysis, contractText);
  };

  return (
    <>
      <header className="h-16 border-b border-dark-600/80 bg-dark-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 p-[1px] shadow-lg shadow-blue-600/20">
            <div className="w-full h-full bg-dark-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
              ClauseLens
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Legal Tech v1.0
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sample Contracts Selector */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-dark-800/80 p-1 rounded-xl border border-dark-600/70 shadow-sm">
            <span className="text-xs text-slate-400 pl-2 pr-1 hidden sm:flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Samples:</span>
            </span>
            {samples.map((sample) => {
              const isSelected = contractText === sample.text;
              const label =
                sample.id === 'apartment_lease'
                  ? 'Residential Lease'
                  : sample.id === 'freelance_dev'
                  ? 'Freelance Dev'
                  : sample.id === 'saas_tos'
                  ? 'SaaS Terms'
                  : sample.title;

              return (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample.id)}
                  title={`Load ${sample.title}`}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-150 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/30 font-semibold'
                      : 'bg-dark-700/60 hover:bg-blue-600/25 hover:text-blue-100 text-slate-300 border-dark-600/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Export Report Button */}
          {analysis && (
            <button
              onClick={handleDownloadReport}
              title="Download Full Markdown Audit Report"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-700 hover:bg-dark-600 text-slate-200 border border-dark-600 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}

          {/* API Key Modal Button */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              apiKey
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-dark-800/80 text-slate-400 hover:text-slate-200 border-dark-600/60'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {apiKey ? 'API Key Set' : 'Gemini Key'}
            </span>
          </button>

          {/* Clear Button */}
          {contractText && (
            <button
              onClick={clearAll}
              title="Clear contract text & analysis"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-dark-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Main Audit Action Button */}
          <button
            onClick={triggerAnalysis}
            disabled={isAnalyzing || !contractText.trim()}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/25 text-white flex items-center space-x-1.5"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audit Contract</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* API Key Modal Overlay */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
      />
    </>
  );
};
