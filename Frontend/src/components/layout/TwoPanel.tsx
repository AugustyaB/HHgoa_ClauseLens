import React from 'react';
import { ContractViewer } from '../contract/ContractViewer';
import { Dashboard } from '../dashboard/Dashboard';
import { LoadingOverlay } from '../shared/LoadingOverlay';
import { ErrorBanner } from '../shared/ErrorBanner';
import { useAnalysis } from '../../hooks/useAnalysis';

export const TwoPanel: React.FC = () => {
  const { isAnalyzing, analysisError, clearAll } = useAnalysis();

  return (
    <div className="flex-1 flex flex-col space-y-4 max-w-[1800px] w-full mx-auto p-6 min-h-0 relative">
      {/* Error Banner Notification */}
      {analysisError && (
        <ErrorBanner message={analysisError} onDismiss={clearAll} />
      )}

      {/* Two-Panel Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[680px] overflow-hidden relative">
        {/* Loading Overlay */}
        <LoadingOverlay isVisible={isAnalyzing} />

        {/* Left Panel: Contract Viewer */}
        <div className="h-full overflow-hidden">
          <ContractViewer />
        </div>

        {/* Right Panel: Audit Dashboard */}
        <div className="h-full overflow-hidden">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};
