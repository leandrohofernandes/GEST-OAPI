import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthName, formatShortMonthName } from '../../utils/calculations';

interface DateSelectorProps {
  currentYear: number;
  currentMonth: number;
  onSelectPeriod: (year: number, month: number) => void;
  availableMonthKeys: string[]; // e.g. ["2026-08", "2026-09", "2026-10"]
  onOpenNewMonthModal: () => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  currentYear,
  currentMonth,
  onSelectPeriod,
  availableMonthKeys,
  onOpenNewMonthModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(currentYear);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view year with current year when selection changes
  useEffect(() => {
    setViewYear(currentYear);
  }, [currentYear]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const now = new Date();
  const realCurrentYear = now.getFullYear();
  const realCurrentMonth = now.getMonth() + 1; // 1-12

  // Shortcut handlers
  const handleSelectCurrentMonth = () => {
    onSelectPeriod(realCurrentYear, realCurrentMonth);
    setIsOpen(false);
  };

  const handleSelectPrevMonth = () => {
    let prevM = currentMonth - 1;
    let prevY = currentYear;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    onSelectPeriod(prevY, prevM);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Primary Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0e1526] border border-[#1c263d] hover:border-blue-500/50 hover:bg-[#131d33] text-[#f1f5f9] transition-all text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <Calendar className="w-4 h-4 text-blue-400" />
        <span>
          {formatMonthName(currentMonth)} {currentYear}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#94a3b8] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 rounded-xl bg-[#0e1526] border border-[#1c263d] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Shortcuts */}
          <div className="mb-3.5 pb-3 border-b border-[#1c263d]">
            <div className="text-[11px] font-medium text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-400" />
              Atalhos Rápidos
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleSelectCurrentMonth}
                className="text-left px-2.5 py-1.5 rounded-md hover:bg-[#131d33] text-[#f1f5f9] hover:text-blue-400 transition-colors"
              >
                Mês atual ({formatShortMonthName(realCurrentMonth)} {realCurrentYear})
              </button>
              <button
                type="button"
                onClick={handleSelectPrevMonth}
                className="text-left px-2.5 py-1.5 rounded-md hover:bg-[#131d33] text-[#f1f5f9] hover:text-blue-400 transition-colors"
              >
                Mês anterior
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectPeriod(currentYear, Math.max(1, currentMonth - 2));
                  setIsOpen(false);
                }}
                className="text-left px-2.5 py-1.5 rounded-md hover:bg-[#131d33] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                Há 2 meses
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectPeriod(currentYear, 1);
                  setIsOpen(false);
                }}
                className="text-left px-2.5 py-1.5 rounded-md hover:bg-[#131d33] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                Início do ano (Jan)
              </button>
            </div>
          </div>

          {/* Year Navigator */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-[#f1f5f9]">Selecionar Período</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewYear(viewYear - 1)}
                className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131d33] rounded transition-colors"
                title="Ano anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-sm font-semibold text-blue-400 px-2">
                {viewYear}
              </span>
              <button
                type="button"
                onClick={() => setViewYear(viewYear + 1)}
                className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131d33] rounded transition-colors"
                title="Próximo ano"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-4 gap-1.5 mb-3.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isSelected = viewYear === currentYear && m === currentMonth;
              const monthKey = `${viewYear}-${m.toString().padStart(2, '0')}`;
              const hasData = availableMonthKeys.includes(monthKey);

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onSelectPeriod(viewYear, m);
                    setIsOpen(false);
                  }}
                  className={`relative py-2 px-1 text-center rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : hasData
                      ? 'bg-[#131d33] text-[#f1f5f9] hover:bg-[#1e2d4d] border border-[#1c263d]'
                      : 'text-[#64748b] hover:bg-[#131d33] hover:text-[#94a3b8]'
                  }`}
                >
                  <span>{formatShortMonthName(m)}</span>
                  {hasData && !isSelected && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer: + Novo Mês */}
          <div className="pt-2 border-t border-[#1c263d] flex justify-between items-center">
            <span className="text-[11px] text-[#64748b]">
              {availableMonthKeys.length} meses registrados
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNewMonthModal();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              + Novo mês
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
