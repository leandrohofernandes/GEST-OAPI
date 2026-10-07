import React from 'react';
import { History, ArrowUpRight, ArrowDownRight, Minus, Eye, Plus } from 'lucide-react';
import { MonthData, AppSettings } from '../types';
import {
  calculateMetrics,
  computeDelta,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatMonthName,
  formatShortMonthName,
} from '../utils/calculations';

interface HistoryPageProps {
  allMonths: Record<string, MonthData>;
  currentMonthId: string;
  settings: AppSettings;
  onSelectPeriod: (year: number, month: number) => void;
  onOpenNewMonthModal: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  allMonths,
  currentMonthId,
  settings,
  onSelectPeriod,
  onOpenNewMonthModal,
}) => {
  const sortedKeys = Object.keys(allMonths).sort().reverse(); // Most recent first

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Linha Temporal e Histórico</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Consolidado histórico de todos os meses registrados. Clique em um mês para abrir o dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewMonthModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Novo Período
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1c263d] bg-[#131d33] text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Período</th>
                <th className="py-3 px-4 text-right">Faturamento</th>
                <th className="py-3 px-4 text-right">Crescimento</th>
                <th className="py-3 px-4 text-right">Vendas</th>
                <th className="py-3 px-4 text-right">Clientes</th>
                <th className="py-3 px-4 text-right">Ticket Médio</th>
                <th className="py-3 px-4 text-right">CAC</th>
                <th className="py-3 px-4 text-right">LTV</th>
                <th className="py-3 px-4 text-right">Margem</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c263d] font-mono text-xs">
              {sortedKeys.map((key, idx) => {
                const month = allMonths[key];
                const metrics = calculateMetrics(month, settings);
                const isSelected = month.id === currentMonthId;

                // Previous chronologically is next in reverse array
                const prevKey = sortedKeys[idx + 1];
                const prevMonth = prevKey ? allMonths[prevKey] : null;
                const prevMetrics = prevMonth ? calculateMetrics(prevMonth, settings) : null;
                const growthDelta = computeDelta(metrics.faturamento, prevMetrics?.faturamento ?? null, false);

                return (
                  <tr
                    key={key}
                    onClick={() => onSelectPeriod(month.year, month.month)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/15 hover:bg-blue-600/20'
                        : 'hover:bg-[#131d33]/50'
                    }`}
                  >
                    <td className="py-3.5 px-5 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#f1f5f9]">
                          {formatShortMonthName(month.month)}/{month.year}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                            Ativo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#f1f5f9]">
                      {formatCurrency(metrics.faturamento)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {growthDelta.percent !== null ? (
                        <div
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            growthDelta.isPositive ? 'text-blue-400' : 'text-rose-400'
                          }`}
                        >
                          {growthDelta.isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {growthDelta.percent > 0 ? '+' : ''}
                            {formatPercent(growthDelta.percent)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#64748b]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[#94a3b8]">
                      {formatNumber(metrics.vendas)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[#94a3b8]">
                      {formatNumber(metrics.novosClientes)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[#f1f5f9]">
                      {formatCurrency(metrics.ticketMedio)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-rose-400">
                      {formatCurrency(metrics.cac)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-blue-400">
                      {formatCurrency(metrics.ltv)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-blue-300 font-bold">
                      {formatPercent(metrics.margemContribuicao)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPeriod(month.year, month.month);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium text-blue-400 hover:bg-blue-600/20 rounded-md transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Ver Painel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
