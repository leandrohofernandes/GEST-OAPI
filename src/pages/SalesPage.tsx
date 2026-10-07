import React from 'react';
import { ShoppingCart, Plus, Edit2, TrendingUp } from 'lucide-react';
import { MonthData, AppSettings } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/calculations';

interface SalesPageProps {
  currentMonth: MonthData;
  settings: AppSettings;
  onOpenDataInput: () => void;
}

export const SalesPage: React.FC<SalesPageProps> = ({
  currentMonth,
  settings,
  onOpenDataInput,
}) => {
  const totalSales = currentMonth.sales.total || 0;
  const totalRevenue = currentMonth.revenue.total || 0;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Registro de Vendas</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Detalhamento de transações, volume de pedidos e receita unitária por produto
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDataInput}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Lançar Vendas deste Mês
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20 hover:border-blue-500/40 transition-all">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
            Total de Vendas no Mês
          </span>
          <div className="text-3xl font-mono font-bold text-[#f1f5f9]">
            {formatNumber(totalSales)} un.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20 hover:border-blue-500/40 transition-all">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
            Faturamento Bruto
          </span>
          <div className="text-3xl font-mono font-bold text-blue-400">
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20 hover:border-blue-500/40 transition-all">
          <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
            Ticket Médio Geral
          </span>
          <div className="text-3xl font-mono font-bold text-blue-300">
            {formatCurrency(avgTicket)}
          </div>
        </div>
      </div>

      {/* Sales Table by Product */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl overflow-hidden shadow-sm shadow-blue-950/20">
        <div className="p-5 border-b border-[#1c263d] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#f1f5f9]">Desdobramento de Vendas por Produto</h3>
          <button
            type="button"
            onClick={onOpenDataInput}
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar Valores
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1c263d] bg-[#131d33] text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">Produto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-right">Preço Unitário</th>
                <th className="py-3 px-4 text-right">Unidades Vendidas</th>
                <th className="py-3 px-4 text-right">Faturamento</th>
                <th className="py-3 px-4 text-right">Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c263d]">
              {settings.products.map((product) => {
                const units = currentMonth.sales.byProduct[product.id] || 0;
                const rev = currentMonth.revenue.byProduct[product.id] || 0;
                const share = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;

                return (
                  <tr key={product.id} className="hover:bg-[#131d33]/50 transition-colors">
                    <td className="py-3 px-5 text-xs font-semibold text-[#f1f5f9]">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-[#94a3b8]">
                      {product.category === 'low_ticket'
                        ? 'Low Ticket'
                        : product.category === 'mid_ticket'
                        ? 'Intermediário'
                        : 'Mentoria / Serviço'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-right text-[#94a3b8]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-right font-semibold text-[#f1f5f9]">
                      {formatNumber(units)} un.
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-right font-bold text-blue-400">
                      {formatCurrency(rev)}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-right font-semibold text-blue-300">
                      {formatPercent(share)}
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
