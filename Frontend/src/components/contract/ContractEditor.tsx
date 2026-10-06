import React from 'react';

interface ContractEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ContractEditor: React.FC<ContractEditorProps> = ({
  value,
  onChange,
  placeholder = 'Paste everyday contract text here (lease, freelance agreement, terms of service, NDA)...',
}) => {
  return (
    <div className="flex-1 flex flex-col space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="flex-1 w-full bg-dark-950/80 border border-dark-600/80 focus:border-blue-500/80 rounded-xl p-4 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none leading-relaxed"
      />
    </div>
  );
};
