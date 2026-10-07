import React from 'react';
import { Layers, GraduationCap, CheckCircle2, TrendingUp, Plus, Edit } from 'lucide-react';
import { MonthData, AppSettings } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/calculations';

interface ProductsPageProps {
  currentMonth: MonthData;
  settings: AppSettings;
  onOpenDataInput: () => void;
  onNavigateToSettings: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  currentMonth,
  settings,
  onOpenDataInput,
  onNavigateToSettings,
}) => {
  const totalRevenue = currentMonth.revenue.total || 0;
  const sortedProducts = [...settings.products].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Desempenho dos Produtos</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Análise de vendas, participação no faturamento, engajamento e taxa de ascensão
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="px-3.5 py-2 bg-[#131d33] hover:bg-[#1e2d4d] text-[#f1f5f9] border border-[#1c263d] hover:border-blue-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-blue-400" />
            Configurar Produtos & Preços
          </button>
          <button
            type="button"
            onClick={onOpenDataInput}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Lançar Vendas do Mês
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedProducts.map((product) => {
          const sales = currentMonth.sales.byProduct[product.id] || 0;
          const rev = currentMonth.revenue.byProduct[product.id] || 0;
          const share = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
          const ticket = sales > 0 ? rev / sales : null;

          // Consumption / Education metrics
          const edu = currentMonth.education[product.id] || { buyers: sales, started: 0, completed: 0, notStarted: 0 };
          const completionRate = edu.buyers > 0 ? (edu.completed / edu.buyers) * 100 : 0;
          const startRate = edu.buyers > 0 ? (edu.started / edu.buyers) * 100 : 0;

          // Ascension
          const asc = currentMonth.ascension[product.id] || { eligible: sales, progressed: 0 };
          const ascRate = asc.eligible > 0 ? (asc.progressed / asc.eligible) * 100 : 0;

          return (
            <div
              key={product.id}
              className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
                      {product.category === 'low_ticket'
                        ? 'Low Ticket'
                        : product.category === 'mid_ticket'
                        ? 'Intermediário'
                        : 'Mentoria / Alto Ticket'}
                    </span>
                    <h3 className="text-base font-bold text-[#f1f5f9] mt-0.5">{product.name}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-[#131d33] border border-[#1c263d] rounded-lg text-blue-400">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {product.description && (
                  <p className="text-xs text-[#94a3b8] mb-4 line-clamp-2">{product.description}</p>
                )}

                {/* Metrics 4-grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-3.5 bg-[#131d33] rounded-xl border border-[#1e2d4d] mb-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Vendas</span>
                    <span className="text-sm font-semibold text-[#f1f5f9]">{formatNumber(sales)} un.</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Faturamento</span>
                    <span className="text-sm font-semibold text-blue-400">{formatCurrency(rev)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Participação</span>
                    <span className="text-sm font-semibold text-blue-300">{formatPercent(share)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase block">Ticket Médio</span>
                    <span className="text-sm font-semibold text-[#f1f5f9]">{formatCurrency(ticket)}</span>
                  </div>
                </div>
              </div>

              {/* Consumption / Engagement breakdown */}
              {product.category !== 'mentorship' ? (
                <div className="border-t border-[#1c263d] pt-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                      Consumo do Curso
                    </span>
                    <span className="font-mono text-[#f1f5f9] font-semibold">
                      {edu.completed} concluíram de {edu.buyers || sales} alunos
                    </span>
                  </div>

                  <div className="w-full bg-[#131d33] rounded-full h-2 overflow-hidden border border-[#1c263d]">
                    <div
                      className="h-full rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      style={{ width: `${Math.min(100, completionRate)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                    <span>Início: {formatPercent(startRate)}</span>
                    <span className="text-blue-400 font-medium">Taxa Conclusão: {formatPercent(completionRate)}</span>
                    <span className="text-blue-300">Ascensão: {formatPercent(ascRate)}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#1c263d] pt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94a3b8]">Mentorados Ativos:</span>
                  <span className="text-blue-400 font-bold">
                    {currentMonth.mentorship.activeClients} em acompanhamento
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ESTEIRA DE ASCENSÃO DETALHADA */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-6 shadow-sm shadow-blue-950/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#f1f5f9]">Esteira Completa de Ascensão</h3>
            <p className="text-xs text-[#94a3b8]">
              Jornada de progressão entre os produtos da esteira de valor
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {sortedProducts.map((prod, idx) => {
            const asc = currentMonth.ascension[prod.id] || { eligible: currentMonth.sales.byProduct[prod.id] || 0, progressed: 0 };
            const rate = asc.eligible > 0 ? (asc.progressed / asc.eligible) * 100 : 0;
            const isLast = idx === sortedProducts.length - 1;

            return (
              <div key={prod.id} className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d] hover:border-blue-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#94a3b8]">{formatCurrency(prod.price)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#f1f5f9] mb-2">{prod.name}</h4>
                </div>

                <div className="pt-3 border-t border-[#1c263d] space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Compradores:</span>
                    <span className="text-[#f1f5f9] font-semibold">{asc.eligible}</span>
                  </div>
                  {!isLast && (
                    <div className="flex justify-between text-blue-400">
                      <span>Taxa Ascensão:</span>
                      <span className="font-bold">{formatPercent(rate)}</span>
                    </div>
                  )}
                  {isLast && (
                    <div className="flex justify-between text-blue-300">
                      <span>Fim da Esteira:</span>
                      <span className="font-bold">Entrega</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
