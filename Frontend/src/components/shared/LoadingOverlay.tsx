import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Auditing contract with AI engine...',
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-30 bg-dark-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Pulsing Outer Glow */}
        <div className="absolute inset-0 rounded-2xl bg-blue-600/30 animate-ping"></div>
        
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-emerald-400 p-[1px] shadow-xl shadow-blue-500/30">
          <div className="w-full h-full bg-dark-950 rounded-[15px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-sm font-semibold text-slate-100">
          {message}
        </h4>
        <p className="text-xs text-slate-400">
          Extracting clause text, calculating risk scores, and generating counterclauses...
        </p>
      </div>
    </div>
  );
};
