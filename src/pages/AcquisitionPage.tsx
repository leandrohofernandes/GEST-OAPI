import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { Megaphone, Target, ArrowRight, Edit3, DollarSign, Users, Eye, MousePointer } from 'lucide-react';
import { MonthData, AppSettings } from '../types';
import { calculateMetrics, formatCurrency, formatPercent, formatNumber } from '../utils/calculations';
import { MetricCard } from '../components/common/MetricCard';

interface AcquisitionPageProps {
  currentMonth: MonthData;
  settings: AppSettings;
  onOpenDataInput: () => void;
}

export const AcquisitionPage: React.FC<AcquisitionPageProps> = ({
  currentMonth,
  settings,
  onOpenDataInput,
}) => {
  const metrics = calculateMetrics(currentMonth, settings);
  const acq = currentMonth.acquisition;

  // Channel charts data
  const channelData = Object.entries(acq.byChannel).map(([channel, cData]) => ({
    channel,
    investment: cData.investment,
    customers: cData.customers,
    revenue: cData.revenue,
    leads: cData.leads,
    cpl: cData.leads > 0 ? cData.investment / cData.leads : 0,
    cac: cData.customers > 0 ? cData.investment / cData.customers : 0,
  }));

  // Commercial Funnel stages - Blue spectrum
  const funnelStages = [
    { label: 'Impressões', value: acq.impressions, color: '#334155' },
    { label: 'Cliques', value: acq.clicks, color: '#1e3a8a' },
    { label: 'Visitantes da Página', value: acq.visitors, color: '#1d4ed8' },
    { label: 'Leads Captados', value: acq.leads, color: '#2563eb' },
    { label: 'Conversas Iniciadas', value: acq.conversations, color: '#3b82f6' },
    { label: 'Oportunidades', value: acq.opportunities, color: '#60a5fa' },
    { label: 'Clientes Fechados', value: acq.customers, color: '#93c5fd' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Aquisição, Mídia & Tráfego</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Controle de investimento em anúncios, eficiência de canais e taxas de conversão do funil
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDataInput}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Lançar Dados de Tráfego
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Investimento em Anúncios"
          value={formatCurrency(acq.investment)}
          subtitle="Gasto total no mês"
          icon={<DollarSign className="w-4 h-4" />}
          accentColor="#3b82f6"
          tooltip="Total investido em tráfego pago (Meta Ads, Google, etc.)."
        />

        <MetricCard
          title="CAC Médio"
          value={formatCurrency(metrics.cac)}
          subtitle="Custo de Aquisição por Cliente"
          icon={<Target className="w-4 h-4" />}
          accentColor="#2563eb"
          tooltip="Investimento total / novos clientes adquiridos."
        />

        <MetricCard
          title="CPL (Custo por Lead)"
          value={formatCurrency(metrics.cpl)}
          subtitle={`Total: ${formatNumber(acq.leads)} leads`}
          icon={<Users className="w-4 h-4" />}
          accentColor="#60a5fa"
          tooltip="Investimento total / quantidade de leads captados."
        />

        <MetricCard
          title="Taxa de Conversão Funil"
          value={formatPercent(metrics.taxaConversaoGeral)}
          subtitle="Oportunidade → Cliente"
          icon={<MousePointer className="w-4 h-4" />}
          accentColor="#0284c7"
          tooltip="Percentual de oportunidades que converteram em clientes pagantes."
        />
      </div>

      {/* Funnel Section */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-6 shadow-sm shadow-blue-950/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#f1f5f9]">Funil Comercial Completo</h3>
            <p className="text-xs text-[#94a3b8]">Taxas de passagem entre cada degrau da jornada de atração</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#94a3b8]">CTR: <strong className="text-blue-400">{formatPercent(metrics.ctr)}</strong></span>
            <span className="text-[#94a3b8]">CPC: <strong className="text-[#f1f5f9]">{formatCurrency(metrics.cpc)}</strong></span>
          </div>
        </div>

        <div className="space-y-3">
          {funnelStages.map((stage, idx) => {
            const maxVal = Math.max(...funnelStages.map((s) => s.value), 1);
            const widthPct = Math.max(10, Math.min(100, (stage.value / maxVal) * 100));
            const prevStage = idx > 0 ? funnelStages[idx - 1] : null;
            const dropOrPass = prevStage && prevStage.value > 0 ? (stage.value / prevStage.value) * 100 : null;

            return (
              <div key={stage.label} className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#f1f5f9]">{stage.label}</span>
                  <div className="flex items-center gap-4 font-mono">
                    {dropOrPass !== null && (
                      <span className="text-[11px] text-blue-300">
                        Passagem: <strong>{formatPercent(dropOrPass)}</strong>
                      </span>
                    )}
                    <span className="text-sm font-bold text-[#f1f5f9]">{formatNumber(stage.value)}</span>
                  </div>
                </div>

                <div className="w-full bg-[#0a101f] rounded-full h-2.5 overflow-hidden border border-[#1c263d]">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channels Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Clientes por Canal */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 hover:border-blue-500/40 transition-all shadow-sm shadow-blue-950/20">
          <h3 className="text-sm font-bold text-[#f1f5f9] mb-1">Clientes Adquiridos por Canal</h3>
          <p className="text-xs text-[#94a3b8] mb-4">Volume de novos compradores gerados por mídia</p>

          {channelData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c263d" vertical={false} />
                  <XAxis dataKey="channel" stroke="#64748b" fontSize={10} axisLine={{ stroke: '#1c263d' }} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0e1526] border border-blue-500/40 p-2.5 rounded-lg text-xs font-mono shadow-xl">
                            <div className="text-[#f1f5f9] font-sans font-bold">{data.channel}</div>
                            <div className="text-blue-400">Clientes: {data.customers}</div>
                            <div className="text-[#94a3b8]">CAC: {formatCurrency(data.cac)}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="customers" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748b]">
              Nenhum canal com métricas detalhadas registrado ainda.
            </div>
          )}
        </div>

        {/* Receita por Canal */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 hover:border-blue-500/40 transition-all shadow-sm shadow-blue-950/20">
          <h3 className="text-sm font-bold text-[#f1f5f9] mb-1">Receita Gerada por Canal</h3>
          <p className="text-xs text-[#94a3b8] mb-4">Faturamento correspondente às vendas de cada origem</p>

          {channelData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c263d" vertical={false} />
                  <XAxis dataKey="channel" stroke="#64748b" fontSize={10} axisLine={{ stroke: '#1c263d' }} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0e1526] border border-blue-500/40 p-2.5 rounded-lg text-xs font-mono shadow-xl">
                            <div className="text-[#f1f5f9] font-sans font-bold">{data.channel}</div>
                            <div className="text-blue-400 font-bold">Receita: {formatCurrency(data.revenue)}</div>
                            <div className="text-[#94a3b8]">Investimento: {formatCurrency(data.investment)}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#64748b]">
              Nenhum canal com métricas detalhadas registrado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
