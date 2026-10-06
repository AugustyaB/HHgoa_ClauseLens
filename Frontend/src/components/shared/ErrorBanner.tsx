import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between shadow-lg shadow-rose-950/20 animate-fade-in">
      <div className="flex items-center space-x-2.5">
        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-500/20"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
