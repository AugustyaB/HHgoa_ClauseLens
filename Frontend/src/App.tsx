import React from 'react';
import { AnalysisProvider } from './context/AnalysisContext';
import { Navbar } from './components/layout/Navbar';
import { TwoPanel } from './components/layout/TwoPanel';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TwoPanel />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AnalysisProvider>
      <AppContent />
    </AnalysisProvider>
  );
};

export default App;
