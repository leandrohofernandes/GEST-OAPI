import React, { useState } from 'react';
import { X, ArrowRight, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { MonthData, AppSettings } from '../../types';
import {
  calculateMetrics,
  computeDelta,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatMonthName,
} from '../../utils/calculations';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  months: Record<string, MonthData>;
  defaultMonthAId: string;
  defaultMonthBId: string;
  settings: AppSettings;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  months,
  defaultMonthAId,
  defaultMonthBId,
  settings,
}) => {
  const monthKeys = Object.keys(months).sort();

  const [monthAKey, setMonthAKey] = useState<string>(
    months[defaultMonthAId] ? defaultMonthAId : (monthKeys[monthKeys.length - 2] || monthKeys[0])
  );
  const [monthBKey, setMonthBKey] = useState<string>(
    months[defaultMonthBId] ? defaultMonthBId : (monthKeys[monthKeys.length - 1] || monthKeys[0])
  );

  if (!isOpen) return null;

  const dataA = months[monthAKey];
  const dataB = months[monthBKey];

  const metricsA = dataA ? calculateMetrics(dataA, settings) : null;
  const metricsB = dataB ? calculateMetrics(dataB, settings) : null;

  const renderRow = (
    label: string,
    valA: number | null | undefined,
    valB: number | null | undefined,
    formatter: (v: number | null | undefined) => string,
    lowerIsBetter = false
  ) => {
    const delta = computeDelta(valB ?? null, valA ?? null, lowerIsBetter);

    const isZero = delta.diff === 0 || (delta.percent !== null && Math.abs(delta.percent) < 0.05);
    let deltaColor = 'text-[#a6abb8]';
    let DeltaIcon = Minus;

    if (!isZero && delta.isPositive !== null) {
      if (delta.isPositive) {
        deltaColor = 'text-[#34d399]';
        DeltaIcon = ArrowUpRight;
      } else {
        deltaColor = 'text-[#fb7185]';
        DeltaIcon = ArrowDownRight;
      }
    }

    const sign = delta.percent !== null && delta.percent > 0 ? '+' : '';
    const diffSign = delta.diff !== null && delta.diff > 0 ? '+' : '';

    return (
      <tr className="border-b border-[#1c263d]/60 hover:bg-[#131d33]/50 transition-colors">
        <td className="py-2.5 px-4 text-xs font-medium text-slate-200">{label}</td>
        <td className="py-2.5 px-4 text-xs font-mono tabular-nums text-slate-400 text-right">
          {formatter(valA)}
        </td>
        <td className="py-2.5 px-4 text-xs font-mono tabular-nums text-slate-100 font-semibold text-right">
          {formatter(valB)}
        </td>
        <td className="py-2.5 px-4 text-xs font-mono tabular-nums text-right text-slate-400">
          {delta.diff !== null ? `${diffSign}${formatter(delta.diff).replace('R$', '').trim()}` : '—'}
        </td>
        <td className={`py-2.5 px-4 text-xs font-mono tabular-nums text-right font-semibold ${deltaColor}`}>
          <div className="inline-flex items-center justify-end gap-1">
            {!isZero && <DeltaIcon className="w-3.5 h-3.5 shrink-0" />}
            <span>{delta.percent !== null ? `${sign}${formatPercent(delta.percent)}` : '—'}</span>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0e1526] border border-[#1c263d] rounded-2xl shadow-2xl shadow-blue-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c263d]">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Comparativo de Desempenho</h2>
            <p className="text-xs text-slate-400">
              Análise lado a lado de métricas entre dois períodos operacionais
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#131d33] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selectors Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-[#0a0f1d] border-b border-[#1c263d]">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Período Base (Mês A)
              </label>
              <select
                value={monthAKey}
                onChange={(e) => setMonthAKey(e.target.value)}
                className="bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              >
                {monthKeys.map((key) => {
                  const m = months[key];
                  return (
                    <option key={key} value={key} className="bg-[#0e1526] text-slate-100">
                      {formatMonthName(m.month)} {m.year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center justify-center pt-4 text-blue-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Período Comparado (Mês B)
              </label>
              <select
                value={monthBKey}
                onChange={(e) => setMonthBKey(e.target.value)}
                className="bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              >
                {monthKeys.map((key) => {
                  const m = months[key];
                  return (
                    <option key={key} value={key} className="bg-[#0e1526] text-slate-100">
                      {formatMonthName(m.month)} {m.year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            Comparando: <span className="text-blue-400 font-mono font-medium">{monthAKey}</span> com{' '}
            <span className="text-blue-400 font-mono font-medium">{monthBKey}</span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1c263d] text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2 px-4">Métrica</th>
                  <th className="py-2 px-4 text-right">
                    {dataA ? `${formatMonthName(dataA.month)} ${dataA.year}` : 'Mês A'}
                  </th>
                  <th className="py-2 px-4 text-right">
                    {dataB ? `${formatMonthName(dataB.month)} ${dataB.year}` : 'Mês B'}
                  </th>
                  <th className="py-2 px-4 text-right">Variação Absoluta</th>
                  <th className="py-2 px-4 text-right">Variação %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c263d]/40">
                {/* Financeiro & Receita */}
                <tr className="bg-[#131d33]/60">
                  <td colSpan={5} className="py-1.5 px-4 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Faturamento & Resultados
                  </td>
                </tr>
                {renderRow('Faturamento Bruto', metricsA?.faturamento, metricsB?.faturamento, formatCurrency, false)}
                {renderRow('Total de Vendas', metricsA?.vendas, metricsB?.vendas, formatNumber, false)}
                {renderRow('Novos Clientes', metricsA?.novosClientes, metricsB?.novosClientes, formatNumber, false)}
                {renderRow('Ticket Médio', metricsA?.ticketMedio, metricsB?.ticketMedio, formatCurrency, false)}
                {renderRow('Receita por Cliente', metricsA?.receitaPorCliente, metricsB?.receitaPorCliente, formatCurrency, false)}
                {renderRow('LTV Estimado', metricsA?.ltv, metricsB?.ltv, formatCurrency, false)}
                {renderRow('Margem de Contribuição', metricsA?.margemContribuicao, metricsB?.margemContribuicao, formatPercent, false)}
                {renderRow('Lucro Operacional', metricsA?.lucroOperacional, metricsB?.lucroOperacional, formatCurrency, false)}

                {/* Aquisição & Tráfego */}
                <tr className="bg-[#131d33]/60">
                  <td colSpan={5} className="py-1.5 px-4 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Aquisição & Mídia
                  </td>
                </tr>
                {renderRow('Investimento em Anúncios', dataA?.acquisition.investment, dataB?.acquisition.investment, formatCurrency, true)}
                {renderRow('CAC (Custo por Cliente)', metricsA?.cac, metricsB?.cac, formatCurrency, true)}
                {renderRow('CPL (Custo por Lead)', metricsA?.cpl, metricsB?.cpl, formatCurrency, true)}
                {renderRow('CPC Médio', metricsA?.cpc, metricsB?.cpc, formatCurrency, true)}
                {renderRow('Leads Captados', dataA?.acquisition.leads, dataB?.acquisition.leads, formatNumber, false)}
                {renderRow('Cliques em Anúncios', dataA?.acquisition.clicks, dataB?.acquisition.clicks, formatNumber, false)}
                {renderRow('Taxa de Conversão Funil', metricsA?.taxaConversaoGeral, metricsB?.taxaConversaoGeral, formatPercent, false)}

                {/* Custos Operacionais */}
                <tr className="bg-[#131d33]/60">
                  <td colSpan={5} className="py-1.5 px-4 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Estrutura de Custos
                  </td>
                </tr>
                {renderRow('Custos Fixos', dataA?.financial.fixedCosts, dataB?.financial.fixedCosts, formatCurrency, true)}
                {renderRow('Custos Variáveis', metricsA?.custosVariaveis, metricsB?.custosVariaveis, formatCurrency, true)}
                {renderRow('Taxas de Plataforma', dataA?.financial.platformFees, dataB?.financial.platformFees, formatCurrency, true)}
                {renderRow('Ferramentas & Software', dataA?.financial.tools, dataB?.financial.tools, formatCurrency, true)}

                {/* Mentoria API */}
                <tr className="bg-[#131d33]/60">
                  <td colSpan={5} className="py-1.5 px-4 text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Mentoria API
                  </td>
                </tr>
                {renderRow('Receita Mentoria', metricsA?.mentoriaReceita, metricsB?.mentoriaReceita, formatCurrency, false)}
                {renderRow('Clientes Fechados', dataA?.mentorship.closed, dataB?.mentorship.closed, formatNumber, false)}
                {renderRow('Clientes Ativos', dataA?.mentorship.activeClients, dataB?.mentorship.activeClients, formatNumber, false)}
                {renderRow('Reuniões Realizadas', dataA?.mentorship.meetingsHeld, dataB?.mentorship.meetingsHeld, formatNumber, false)}
                {renderRow('Taxa de Fechamento Mentoria', metricsA?.mentoriaTaxaFechamento, metricsB?.mentoriaTaxaFechamento, formatPercent, false)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#1c263d] bg-[#0a0f1d]/50">
          <div className="text-xs text-slate-400">
            * Variações favoráveis ao negócio são destacadas em verde.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#131d33] hover:bg-[#1a2642] text-slate-200 border border-[#1c263d] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
