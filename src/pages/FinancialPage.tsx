import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { MonthData, AppSettings } from '../types';
import { calculateMetrics, formatCurrency, formatPercent } from '../utils/calculations';
import { MetricCard } from '../components/common/MetricCard';

interface FinancialPageProps {
  currentMonth: MonthData;
  settings: AppSettings;
  onOpenDataInput: () => void;
}

export const FinancialPage: React.FC<FinancialPageProps> = ({
  currentMonth,
  settings,
  onOpenDataInput,
}) => {
  const metrics = calculateMetrics(currentMonth, settings);
  const fin = currentMonth.financial;
  const faturamento = metrics.faturamento;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Financeiro & DRE Gerencial</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Demonstrativo de resultado: receitas brutas, custos variáveis, despesas fixas e margens
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDataInput}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Ajustar Custos do Mês
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Bruta"
          value={formatCurrency(faturamento)}
          subtitle="Total faturado no mês"
          icon={<DollarSign className="w-4 h-4" />}
          accentColor="#3b82f6"
          tooltip="Somatório de todas as vendas e mentorias do período."
        />

        <MetricCard
          title="Margem de Contribuição"
          value={formatPercent(metrics.margemContribuicao)}
          subtitle={`R$ ${(faturamento - metrics.custosVariaveis).toFixed(2)} gerados`}
          icon={<Percent className="w-4 h-4" />}
          accentColor="#2563eb"
          tooltip="(Receita - Custos Variáveis) / Receita."
        />

        <MetricCard
          title="Lucro Operacional"
          value={formatCurrency(metrics.lucroOperacional)}
          subtitle={`Margem Operacional: ${formatPercent(metrics.margemOperacional)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor={metrics.lucroOperacional >= 0 ? '#60a5fa' : '#fb7185'}
          tooltip="Receita Bruta menos Custos Totais (Variáveis + Fixos)."
        />

        <MetricCard
          title="Custos Totais"
          value={formatCurrency(metrics.custosTotais)}
          subtitle={`Fixos: ${formatCurrency(metrics.custosFixos)} · Var: ${formatCurrency(metrics.custosVariaveis)}`}
          icon={<Calculator className="w-4 h-4" />}
          accentColor="#0284c7"
          tooltip="Soma dos custos variáveis com os custos fixos da operação."
        />
      </div>

      {/* DRE GERENCIAL DETALHADA */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl overflow-hidden shadow-sm shadow-blue-950/20">
        <div className="p-5 border-b border-[#1c263d] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#f1f5f9]">DRE Gerencial do Período</h3>
            <p className="text-xs text-[#94a3b8]">Estrutura analítica em cascata</p>
          </div>
          <span className="text-xs font-mono text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-600/15 border border-blue-500/30">
            Resultado Líquido Operacional
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1c263d] bg-[#131d33] text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">
                <th className="py-3 px-6">Linha do DRE</th>
                <th className="py-3 px-4 text-right">Valor Nominal</th>
                <th className="py-3 px-6 text-right">% s/ Receita Bruta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c263d] font-mono text-xs">
              {/* (+) RECEITA BRUTA */}
              <tr className="bg-[#131d33]/50 font-bold">
                <td className="py-3 px-6 text-[#f1f5f9] font-sans">
                  (+) RECEITA BRUTA DE VENDAS
                </td>
                <td className="py-3 px-4 text-right text-blue-400 font-bold">
                  {formatCurrency(faturamento)}
                </td>
                <td className="py-3 px-6 text-right text-[#f1f5f9]">100,0%</td>
              </tr>

              {/* (-) CUSTOS VARIÁVEIS */}
              <tr className="text-[#94a3b8]">
                <td className="py-2.5 px-6 pl-10 font-sans">
                  (-) Anúncios e Tráfego Pago
                </td>
                <td className="py-2.5 px-4 text-right text-rose-400">
                  - {formatCurrency(fin.adCosts || currentMonth.acquisition.investment)}
                </td>
                <td className="py-2.5 px-6 text-right">
                  {faturamento > 0
                    ? formatPercent(((fin.adCosts || currentMonth.acquisition.investment) / faturamento) * 100)
                    : '—'}
                </td>
              </tr>

              <tr className="text-[#94a3b8]">
                <td className="py-2.5 px-6 pl-10 font-sans">
                  (-) Taxas de Gateway e Plataforma (Hotmart/Kiwify)
                </td>
                <td className="py-2.5 px-4 text-right text-rose-400">
                  - {formatCurrency(fin.platformFees)}
                </td>
                <td className="py-2.5 px-6 text-right">
                  {faturamento > 0 ? formatPercent((fin.platformFees / faturamento) * 100) : '—'}
                </td>
              </tr>

              <tr className="text-[#94a3b8]">
                <td className="py-2.5 px-6 pl-10 font-sans">
                  (-) Softwares e Ferramentas Operacionais
                </td>
                <td className="py-2.5 px-4 text-right text-rose-400">
                  - {formatCurrency(fin.tools)}
                </td>
                <td className="py-2.5 px-6 text-right">
                  {faturamento > 0 ? formatPercent((fin.tools / faturamento) * 100) : '—'}
                </td>
              </tr>

              <tr className="text-[#94a3b8]">
                <td className="py-2.5 px-6 pl-10 font-sans">
                  (-) Outros Custos Variáveis
                </td>
                <td className="py-2.5 px-4 text-right text-rose-400">
                  - {formatCurrency(fin.otherCosts)}
                </td>
                <td className="py-2.5 px-6 text-right">
                  {faturamento > 0 ? formatPercent((fin.otherCosts / faturamento) * 100) : '—'}
                </td>
              </tr>

              {/* (=) MARGEM DE CONTRIBUIÇÃO */}
              <tr className="bg-[#131d33] font-bold border-y border-[#1c263d]">
                <td className="py-3 px-6 text-blue-400 font-sans">
                  (=) MARGEM DE CONTRIBUIÇÃO
                </td>
                <td className="py-3 px-4 text-right text-blue-400">
                  {formatCurrency(faturamento - metrics.custosVariaveis)}
                </td>
                <td className="py-3 px-6 text-right text-blue-400">
                  {formatPercent(metrics.margemContribuicao)}
                </td>
              </tr>

              {/* (-) CUSTOS FIXOS */}
              <tr className="text-[#94a3b8]">
                <td className="py-2.5 px-6 pl-10 font-sans">
                  (-) Custos Fixos Gerais (infraestrutura, equipe)
                </td>
                <td className="py-2.5 px-4 text-right text-rose-400">
                  - {formatCurrency(fin.fixedCosts)}
                </td>
                <td className="py-2.5 px-6 text-right">
                  {faturamento > 0 ? formatPercent((fin.fixedCosts / faturamento) * 100) : '—'}
                </td>
              </tr>

              {/* (=) LUCRO OPERACIONAL */}
              <tr className="bg-[#0a101f] font-bold text-sm">
                <td className="py-4 px-6 text-[#f1f5f9] font-sans">
                  (=) RESULTADO OPERACIONAL LÍQUIDO
                </td>
                <td
                  className={`py-4 px-4 text-right ${
                    metrics.lucroOperacional >= 0 ? 'text-blue-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(metrics.lucroOperacional)}
                </td>
                <td
                  className={`py-4 px-6 text-right ${
                    metrics.lucroOperacional >= 0 ? 'text-blue-400' : 'text-rose-400'
                  }`}
                >
                  {formatPercent(metrics.margemOperacional)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
