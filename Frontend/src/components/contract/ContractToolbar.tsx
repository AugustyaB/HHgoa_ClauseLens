import React, { useRef, useState } from 'react';
import { BookOpen, Edit3, Upload, Copy, Check, Trash2 } from 'lucide-react';

interface ContractToolbarProps {
  viewMode: 'reader' | 'editor';
  onViewModeChange: (mode: 'reader' | 'editor') => void;
  contractText: string;
  onTextChange: (text: string) => void;
  onClear: () => void;
  hasAnalysis: boolean;
}

export const ContractToolbar: React.FC<ContractToolbarProps> = ({
  viewMode,
  onViewModeChange,
  contractText,
  onTextChange,
  onClear,
  hasAnalysis,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // Compute word and character counts
  const charCount = contractText.length;
  const wordCount = contractText.trim()
    ? contractText.trim().split(/\s+/).length
    : 0;

  const handleCopyText = async () => {
    if (!contractText) return;
    try {
      await navigator.clipboard.writeText(contractText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onTextChange(content);
        onViewModeChange('editor');
      }
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dark-600/80">
      {/* View Mode Toggle Pills */}
      <div className="flex items-center bg-dark-950/90 p-1 rounded-xl border border-dark-600/60">
        <button
          onClick={() => onViewModeChange('reader')}
          disabled={!hasAnalysis && !contractText}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'reader'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Reader View</span>
        </button>

        <button
          onClick={() => onViewModeChange('editor')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'editor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor Mode</span>
        </button>
      </div>

      {/* Toolbar Actions & Metrics */}
      <div className="flex items-center space-x-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.text"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* File Import Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import contract text file (.txt, .md)"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-700/60 rounded-lg transition-colors text-xs flex items-center space-x-1 border border-dark-600/60"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Copy Full Text Button */}
        <button
          onClick={handleCopyText}
          disabled={!contractText}
          title="Copy contract text to clipboard"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-700/60 rounded-lg transition-colors text-xs flex items-center space-x-1 border border-dark-600/60 disabled:opacity-40"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>

        {/* Clear Button */}
        {contractText && (
          <button
            onClick={onClear}
            title="Clear text"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-xs flex items-center space-x-1 border border-dark-600/60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {/* Word & Character Count Badge */}
        <div className="text-[11px] font-mono text-slate-400 bg-dark-950/80 px-2.5 py-1 rounded-lg border border-dark-600/60">
          <span>{wordCount} words</span>
          <span className="mx-1 text-slate-600">•</span>
          <span>{charCount} chars</span>
        </div>
      </div>
    </div>
  );
};
