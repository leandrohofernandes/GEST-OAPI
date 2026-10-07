import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  Target,
  Sparkles,
  ArrowRight,
  Edit3,
  Layers,
  Percent,
  Compass
} from 'lucide-react';
import { MonthData, AppSettings } from '../../types';
import {
  calculateMetrics,
  computeDelta,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatShortMonthName,
  formatMonthName
} from '../../utils/calculations';
import { generateInsights } from '../../utils/insights';
import { MetricCard } from '../common/MetricCard';

interface BentoDashboardProps {
  currentMonth: MonthData;
  previousMonth: MonthData | null;
  allMonths: Record<string, MonthData>;
  settings: AppSettings;
  onOpenDataInput: () => void;
  onSelectPeriod: (year: number, month: number) => void;
  onOpenComparison: () => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  currentMonth,
  previousMonth,
  allMonths,
  settings,
  onOpenDataInput,
  onSelectPeriod,
  onOpenComparison,
}) => {
  const currentMetrics = calculateMetrics(currentMonth, settings);
  const prevMetrics = previousMonth ? calculateMetrics(previousMonth, settings) : null;

  // Deltas for KPIs
  const faturamentoDelta = computeDelta(currentMetrics.faturamento, prevMetrics?.faturamento ?? null, false);
  const vendasDelta = computeDelta(currentMetrics.vendas, prevMetrics?.vendas ?? null, false);
  const ticketDelta = computeDelta(currentMetrics.ticketMedio, prevMetrics?.ticketMedio ?? null, false);
  const clientesDelta = computeDelta(currentMetrics.novosClientes, prevMetrics?.novosClientes ?? null, false);
  const cacDelta = computeDelta(currentMetrics.cac, prevMetrics?.cac ?? null, true);
  const ltvDelta = computeDelta(currentMetrics.ltv, prevMetrics?.ltv ?? null, false);
  const margemDelta = computeDelta(currentMetrics.margemContribuicao, prevMetrics?.margemContribuicao ?? null, false);

  // 12-month timeline data for the main revenue chart
  const sortedMonthKeys = Object.keys(allMonths).sort();
  const timelineData = sortedMonthKeys.map((key) => {
    const m = allMonths[key];
    const isCurrent = m.id === currentMonth.id;
    return {
      id: m.id,
      label: `${formatShortMonthName(m.month)}/${m.year.toString().slice(2)}`,
      month: m.month,
      year: m.year,
      revenue: m.revenue.total,
      sales: m.sales.total,
      isCurrent
    };
  });

  // Calculate statistics across recorded months
  const revenues = timelineData.map((d) => d.revenue);
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 0;
  const avgRevenue = revenues.length > 0 ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0;

  // Revenue by product data
  const productData = settings.products.map((p, idx) => {
    const rev = currentMonth.revenue.byProduct[p.id] || 0;
    const units = currentMonth.sales.byProduct[p.id] || 0;
    const share = currentMetrics.faturamento > 0 ? (rev / currentMetrics.faturamento) * 100 : 0;
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#0284c7', '#38bdf8', '#93c5fd'];
    return {
      name: p.name,
      shortName: p.name.length > 25 ? p.name.slice(0, 23) + '...' : p.name,
      price: p.price,
      revenue: rev,
      units,
      share,
      color: colors[idx % colors.length]
    };
  });

  // Commercial Funnel stages - Blue chromatic spectrum
  const acq = currentMonth.acquisition;
  const funnelStages = [
    { label: 'Impressões', value: acq.impressions, color: '#334155' },
    { label: 'Cliques', value: acq.clicks, color: '#1e3a8a' },
    { label: 'Visitantes', value: acq.visitors, color: '#1d4ed8' },
    { label: 'Leads', value: acq.leads, color: '#2563eb' },
    { label: 'Conversas', value: acq.conversations, color: '#3b82f6' },
    { label: 'Oportunidades', value: acq.opportunities, color: '#60a5fa' },
    { label: 'Clientes', value: acq.customers, color: '#93c5fd' },
  ];

  // Product ladder / Esteira de Ascensão
  const sortedProducts = [...settings.products].sort((a, b) => a.order - b.order);

  // Insights
  const insights = generateInsights(currentMonth, previousMonth, settings);

  return (
    <div className="space-y-6">
      {/* Quick Context Bar / Top Stats Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f1f5f9]">
                Painel Operacional — {formatMonthName(currentMonth.month)} {currentMonth.year}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8]">
              {currentMetrics.faturamento > 0
                ? `Faturamento atual de ${formatCurrency(currentMetrics.faturamento)} com ${currentMetrics.vendas} vendas registradas.`
                : 'Mês iniciado zerado. Clique em "Lançar Dados" para registrar suas métricas.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenComparison}
            className="px-3 py-1.5 bg-[#131d33] hover:bg-[#1e2d4d] text-[#f1f5f9] border border-[#1c263d] hover:border-blue-500/40 rounded-lg text-xs font-semibold transition-colors"
          >
            Comparar Mês
          </button>
          <button
            type="button"
            onClick={onOpenDataInput}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Lançar Dados
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO GRID: ROW 1 (BIG REVENUE CARD 2x2 + 4 KPI CARDS)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BIG CARD 2x2: FATURAMENTO & HISTÓRICO */}
        <div className="md:col-span-2 lg:col-span-2 bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-medium text-[#94a3b8] tracking-wide uppercase">
                  Faturamento Mensal
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-[#f1f5f9] tracking-tight tabular-nums">
                    {formatCurrency(currentMetrics.faturamento)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#64748b] block">Variação</span>
                <div className="text-xs font-mono font-semibold">
                  {faturamentoDelta.percent !== null ? (
                    <span className={faturamentoDelta.isPositive ? 'text-blue-400' : 'text-rose-400'}>
                      {faturamentoDelta.percent > 0 ? '+' : ''}
                      {formatPercent(faturamentoDelta.percent)} vs mês ant.
                    </span>
                  ) : (
                    <span className="text-[#94a3b8]">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats mini ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 px-3 bg-[#131d33] rounded-xl border border-[#1e2d4d] mb-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Maior Mês</span>
                <span className="text-blue-400 font-semibold">{formatCurrency(maxRevenue)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748b] uppercase block">Média Histórica</span>
                <span className="text-[#f1f5f9] font-semibold">{formatCurrency(avgRevenue)}</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] text-[#64748b] uppercase block">Mês Selecionado</span>
                <span className="text-blue-400 font-semibold">
                  {formatShortMonthName(currentMonth.month)}/{currentMonth.year}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="h-44 sm:h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c263d" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#1c263d' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0e1526] border border-blue-500/40 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                          <div className="font-sans font-semibold text-[#f1f5f9] mb-1">
                            {formatMonthName(data.month)} {data.year}
                          </div>
                          <div className="text-blue-400 font-bold">
                            Faturamento: {formatCurrency(data.revenue)}
                          </div>
                          <div className="text-[#94a3b8]">
                            Vendas: {data.sales} un.
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 CORE KPI CARDS (2x2 on tablet/desktop right side) - Harmonious Blue Accents */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            title="Total de Vendas"
            value={`${formatNumber(currentMetrics.vendas)} un.`}
            delta={vendasDelta}
            subtitle="Volume total comercializado"
            icon={<ShoppingBag className="w-4 h-4" />}
            accentColor="#3b82f6"
            tooltip="Quantidade total de produtos e serviços vendidos no mês."
          />

          <MetricCard
            title="Novos Clientes"
            value={formatNumber(currentMetrics.novosClientes)}
            delta={clientesDelta}
            subtitle="Compradores únicos adquiridos"
            icon={<Users className="w-4 h-4" />}
            accentColor="#60a5fa"
            tooltip="Número de novos compradores que entraram na sua base neste período."
          />

          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(currentMetrics.ticketMedio)}
            delta={ticketDelta}
            subtitle="Receita média por venda"
            icon={<CreditCard className="w-4 h-4" />}
            accentColor="#2563eb"
            tooltip="Faturamento total dividido pelo número de transações efetuadas."
          />

          <MetricCard
            title="CAC (Custo de Aquisição)"
            value={formatCurrency(currentMetrics.cac)}
            delta={cacDelta}
            subtitle="Gasto médio por novo cliente"
            icon={<Target className="w-4 h-4" />}
            accentColor="#0284c7"
            tooltip="Investimento em marketing e anúncios dividido pelo número de novos clientes adquiridos."
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO GRID: ROW 2 (FATURAMENTO POR PRODUTO + FUNIL COMERCIAL)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Faturamento por Produto */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#f1f5f9]">Faturamento por Produto</h3>
                <p className="text-xs text-[#94a3b8]">Distribuição de receita e participação no mês</p>
              </div>
              <span className="text-xs font-mono font-medium text-blue-400">
                {settings.products.length} produtos
              </span>
            </div>

            {/* Bar Chart */}
            <div className="h-44 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c263d" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => `R$${val}`}
                    axisLine={{ stroke: '#1c263d' }}
                  />
                  <YAxis
                    dataKey="shortName"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={130}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#0e1526] border border-blue-500/40 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                            <div className="font-sans font-semibold text-[#f1f5f9] mb-1">{item.name}</div>
                            <div className="text-blue-400 font-bold">Receita: {formatCurrency(item.revenue)}</div>
                            <div className="text-[#f1f5f9]">Vendas: {item.units} un.</div>
                            <div className="text-[#94a3b8]">Participação: {formatPercent(item.share)}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product breakdown list */}
          <div className="space-y-2 border-t border-[#1c263d] pt-3">
            {productData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[#f1f5f9] truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono shrink-0 ml-2">
                  <span className="text-[#94a3b8]">{item.units} un.</span>
                  <span className="text-[#f1f5f9] font-semibold">{formatCurrency(item.revenue)}</span>
                  <span className="text-blue-400 w-12 text-right">{formatPercent(item.share)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funil Comercial */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9]">Funil Comercial</h3>
              <p className="text-xs text-[#94a3b8]">Jornada de aquisição e conversão etapa por etapa</p>
            </div>
            <div className="text-xs font-mono text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
              Conv. Geral: {formatPercent(currentMetrics.taxaConversaoGeral)}
            </div>
          </div>

          {/* Visual Funnel bars */}
          <div className="space-y-2.5 my-auto">
            {funnelStages.map((stage, idx) => {
              const maxVal = Math.max(...funnelStages.map((s) => s.value), 1);
              const widthPct = Math.max(8, Math.min(100, (stage.value / maxVal) * 100));
              const prevStage = idx > 0 ? funnelStages[idx - 1] : null;
              const stepConversion =
                prevStage && prevStage.value > 0 ? (stage.value / prevStage.value) * 100 : null;

              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8] font-medium">{stage.label}</span>
                    <div className="flex items-center gap-3 font-mono">
                      {stepConversion !== null && (
                        <span className="text-[11px] text-blue-300">
                          ↓ {formatPercent(stepConversion)}
                        </span>
                      )}
                      <span className="text-[#f1f5f9] font-semibold">{formatNumber(stage.value)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#131d33] rounded-full h-2 overflow-hidden border border-[#1c263d]">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1c263d] grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#64748b] uppercase block">CTR</span>
              <span className="text-blue-400 font-semibold">{formatPercent(currentMetrics.ctr)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] uppercase block">CPC</span>
              <span className="text-[#f1f5f9] font-semibold">{formatCurrency(currentMetrics.cpc)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] uppercase block">CPL</span>
              <span className="text-[#f1f5f9] font-semibold">{formatCurrency(currentMetrics.cpl)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO GRID: ROW 3 (ESTEIRA DE PRODUTOS + AQUISIÇÃO POR CANAIS)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ESTEIRA DE ASCENSÃO */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9]">Esteira de Ascensão</h3>
              <p className="text-xs text-[#94a3b8]">Progressão de clientes do front-end à mentoria</p>
            </div>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>

          {/* Stepper representation */}
          <div className="space-y-4 my-2">
            {sortedProducts.map((prod, idx) => {
              const ascData = currentMonth.ascension[prod.id] || { eligible: currentMonth.sales.byProduct[prod.id] || 0, progressed: 0 };
              const nextProd = idx < sortedProducts.length - 1 ? sortedProducts[idx + 1] : null;
              const rate = ascData.eligible > 0 ? (ascData.progressed / ascData.eligible) * 100 : 0;

              return (
                <div key={prod.id} className="relative">
                  <div className="p-3.5 rounded-xl bg-[#131d33] border border-[#1c263d] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-mono font-bold flex items-center justify-center border border-blue-500/30">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#f1f5f9]">{prod.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#94a3b8] ml-7">
                        Preço: {formatCurrency(prod.price)}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs text-[#f1f5f9] font-semibold block">
                        {formatNumber(ascData.eligible)} clientes
                      </span>
                      {nextProd && (
                        <span className="text-[11px] text-blue-300">
                          {ascData.progressed} avançaram
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flow connector arrow if next product exists */}
                  {nextProd && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0e1526] border border-blue-500/30 text-[11px] font-mono text-blue-400 shadow-sm shadow-blue-950/50">
                        <span>↓ Taxa de Ascensão:</span>
                        <span className="font-bold">{formatPercent(rate)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AQUISIÇÃO & CANAIS */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#f1f5f9]">Aquisição: Investimento vs Receita</h3>
                <p className="text-xs text-[#94a3b8]">Performance de mídia e canais de atração</p>
              </div>
              <div className="text-xs font-mono font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                ROAS:{' '}
                {currentMonth.acquisition.investment > 0
                  ? `${(currentMetrics.faturamento / currentMonth.acquisition.investment).toFixed(1)}x`
                  : '—'}
              </div>
            </div>

            {/* Quick KPI duo */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
                <span className="text-[10px] text-[#64748b] uppercase block">Total Investido</span>
                <span className="text-lg font-mono font-bold text-blue-300">
                  {formatCurrency(currentMonth.acquisition.investment)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
                <span className="text-[10px] text-[#64748b] uppercase block">Receita Gerada</span>
                <span className="text-lg font-mono font-bold text-blue-400">
                  {formatCurrency(currentMetrics.faturamento)}
                </span>
              </div>
            </div>

            {/* Channels table / list */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">
                Canais com Dados Registrados
              </span>
              {Object.keys(currentMonth.acquisition.byChannel).length > 0 ? (
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {Object.entries(currentMonth.acquisition.byChannel).map(([channelName, cData]) => (
                    <div
                      key={channelName}
                      className="p-2.5 rounded-lg bg-[#131d33] border border-[#1c263d] flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-[#f1f5f9]">{channelName}</span>
                      <div className="flex items-center gap-3 font-mono text-[#94a3b8]">
                        <span>Inv: {formatCurrency(cData.investment)}</span>
                        <span className="text-blue-400 font-semibold">{cData.customers} clientes</span>
                        <span className="text-[#f1f5f9] font-semibold">{formatCurrency(cData.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#131d33] text-center text-xs text-[#64748b]">
                  Nenhum detalhamento por canal registrado neste mês. Lance no modal de dados.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1c263d] flex items-center justify-between text-xs font-mono">
            <span className="text-[#94a3b8]">Receita média por cliente:</span>
            <span className="text-blue-400 font-bold">{formatCurrency(currentMetrics.receitaPorCliente)}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO GRID: ROW 4 (METAS MENSAIS, MARGEM/LTV + INSIGHTS DIAGNÓSTICO)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Metas Mensais */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#f1f5f9]">Metas do Período</h3>
              <p className="text-xs text-[#94a3b8]">Atingimento dos objetivos estipulados</p>
            </div>
            <Target className="w-4 h-4 text-blue-400" />
          </div>

          <div className="space-y-4">
            {/* Meta Faturamento */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-[#94a3b8]">Faturamento</span>
                <span className="text-[#f1f5f9] font-semibold">
                  {formatCurrency(currentMetrics.faturamento)} / {formatCurrency(currentMonth.goals.revenue)}
                </span>
              </div>
              <div className="w-full bg-[#131d33] rounded-full h-2 overflow-hidden border border-[#1c263d]">
                <div
                  className="h-full rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(100, currentMetrics.faturamentoGoalPct || 0)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-blue-400 block text-right mt-0.5 font-medium">
                {formatPercent(currentMetrics.faturamentoGoalPct)} atingido
              </span>
            </div>

            {/* Meta Clientes */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-[#94a3b8]">Novos Clientes</span>
                <span className="text-[#f1f5f9] font-semibold">
                  {currentMetrics.novosClientes} / {currentMonth.goals.customers}
                </span>
              </div>
              <div className="w-full bg-[#131d33] rounded-full h-2 overflow-hidden border border-[#1c263d]">
                <div
                  className="h-full rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(100, currentMetrics.clientesGoalPct || 0)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-blue-400 block text-right mt-0.5 font-medium">
                {formatPercent(currentMetrics.clientesGoalPct)} atingido
              </span>
            </div>

            {/* Meta Mentoria */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-[#94a3b8]">Mentorias Fechadas</span>
                <span className="text-[#f1f5f9] font-semibold">
                  {currentMonth.mentorship.closed} / {currentMonth.goals.mentorships}
                </span>
              </div>
              <div className="w-full bg-[#131d33] rounded-full h-2 overflow-hidden border border-[#1c263d]">
                <div
                  className="h-full rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(100, currentMetrics.mentoriaGoalPct || 0)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-blue-400 block text-right mt-0.5 font-medium">
                {formatPercent(currentMetrics.mentoriaGoalPct)} atingido
              </span>
            </div>

            {/* Meta Margem */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-mono">
                <span className="text-[#94a3b8]">Margem de Contribuição</span>
                <span className="text-[#f1f5f9] font-semibold">
                  {formatPercent(currentMetrics.margemContribuicao)} / {formatPercent(currentMonth.goals.margin)}
                </span>
              </div>
              <div className="w-full bg-[#131d33] rounded-full h-2 overflow-hidden border border-[#1c263d]">
                <div
                  className="h-full rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(100, currentMetrics.margemGoalPct || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Margem & LTV Cards */}
        <div className="flex flex-col gap-4">
          <MetricCard
            title="Margem de Contribuição"
            value={formatPercent(currentMetrics.margemContribuicao)}
            delta={margemDelta}
            subtitle={`Lucro Operacional: ${formatCurrency(currentMetrics.lucroOperacional)}`}
            icon={<Percent className="w-4 h-4" />}
            accentColor="#3b82f6"
            tooltip="(Receita Bruta - Custos Variáveis) / Receita Bruta. Demonstra a saúde das vendas após cobrir os custos diretos."
          />

          <MetricCard
            title="LTV (Valor do Tempo de Vida)"
            value={formatCurrency(currentMetrics.ltv)}
            delta={ltvDelta}
            subtitle={`Relação LTV / CAC: ${
              currentMetrics.ltv && currentMetrics.cac && currentMetrics.cac > 0
                ? `${(currentMetrics.ltv / currentMetrics.cac).toFixed(1)}x`
                : '—'
            }`}
            icon={<TrendingUp className="w-4 h-4" />}
            accentColor="#60a5fa"
            tooltip="Estimativa da receita total gerada por um cliente ao longo do relacionamento com sua operação."
          />
        </div>

        {/* INSIGHTS E DIAGNÓSTICO (Pure data-backed observations) */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/40">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[#f1f5f9]">Insights & Diagnóstico</h3>
              </div>
              <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-wider font-semibold">
                Análise de Dados
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mb-3">
              Constatações descritivas extraídas diretamente dos seus números.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d] text-xs hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#f1f5f9]">{insight.title}</span>
                    {insight.metric && (
                      <span className="text-[11px] font-mono font-medium text-blue-400">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-[#94a3b8] leading-relaxed text-[11.5px]">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1c263d] text-[11px] text-[#64748b] flex items-center justify-between">
            <span>Baseado exclusivamente nos dados inseridos</span>
            <button
              type="button"
              onClick={onOpenComparison}
              className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 font-medium transition-colors"
            >
              Comparar mais detalhes <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
