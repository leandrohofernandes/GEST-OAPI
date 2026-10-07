import React, { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import { Product, AppSettings, MonthData } from '../../types';
import { createEmptyMonthData } from '../../data/initialData';
import { formatMonthName } from '../../utils/calculations';

interface NewMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMonthKeys: string[];
  products: Product[];
  settings: AppSettings;
  onMonthCreated: (newMonth: MonthData) => void;
}

export const NewMonthModal: React.FC<NewMonthModalProps> = ({
  isOpen,
  onClose,
  existingMonthKeys,
  products,
  settings,
  onMonthCreated,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    if (existingMonthKeys.includes(monthKey)) {
      setError(`O período ${formatMonthName(month)}/${year} já existe. Você pode acessá-lo diretamente pelo seletor.`);
      return;
    }

    const newMonth = createEmptyMonthData(year, month, products, settings.defaultGoals);
    onMonthCreated(newMonth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#0e1526] border border-[#1c263d] rounded-2xl shadow-2xl shadow-blue-950/40 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1c263d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Adicionar Novo Mês</h2>
              <p className="text-xs text-slate-400">Criar período de acompanhamento zerado</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#131d33] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Mês
              </label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setError(null);
                }}
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m} className="bg-[#0e1526] text-slate-100">
                    {m.toString().padStart(2, '0')} - {formatMonthName(m)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Ano
              </label>
              <input
                type="number"
                min={2020}
                max={2035}
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setError(null);
                }}
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#131d33] rounded-xl border border-[#1c263d] text-xs text-slate-400 space-y-1.5">
            <div className="font-medium text-slate-200">Regras de Novo Período:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>O novo mês iniciará com métricas zeradas</li>
              <li>Histórico de meses anteriores permanece 100% intacto</li>
              <li>Metas mensais serão pré-configuradas com os padrões atuais</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-[#131d33] rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Período
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
