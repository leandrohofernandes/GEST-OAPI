import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <button
          type="button"
          aria-label="Mais informações"
          className="text-[#6b7180] hover:text-[#a6abb8] transition-colors p-0.5 focus:outline-none"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {isVisible && (
        <div 
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2.5 py-1.5 text-xs text-slate-200 bg-[#0e1526] border border-[#1c263d] rounded-md shadow-xl shadow-black/50 whitespace-normal max-w-xs pointer-events-none"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1c263d]" />
        </div>
      )}
    </div>
  );
};
