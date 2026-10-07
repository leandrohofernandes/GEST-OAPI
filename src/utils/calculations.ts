import { MonthData, AppSettings, CalculatedMetrics, ComparisonDelta } from '../types';

export const calculateMetrics = (monthData: MonthData, settings: AppSettings): CalculatedMetrics => {
  // 1. Revenue & Sales
  const faturamento = monthData.revenue.total || 0;
  const vendas = monthData.sales.total || 0;
  const ticketMedio = vendas > 0 ? faturamento / vendas : null;

  // 2. Acquisition
  const novosClientes = monthData.acquisition.customers || 0;
  const investimento = monthData.acquisition.investment || 0;
  const cac = novosClientes > 0 && investimento > 0 ? investimento / novosClientes : null;
  const cpl = monthData.acquisition.leads > 0 && investimento > 0 ? investimento / monthData.acquisition.leads : null;
  const cpc = monthData.acquisition.clicks > 0 && investimento > 0 ? investimento / monthData.acquisition.clicks : null;
  const ctr = monthData.acquisition.impressions > 0 && monthData.acquisition.clicks > 0 
    ? (monthData.acquisition.clicks / monthData.acquisition.impressions) * 100 
    : null;
  const custoPorOportunidade = monthData.acquisition.opportunities > 0 && investimento > 0
    ? investimento / monthData.acquisition.opportunities
    : null;

  const taxaConversaoGeral = monthData.acquisition.opportunities > 0 && novosClientes > 0
    ? (novosClientes / monthData.acquisition.opportunities) * 100
    : (monthData.acquisition.clicks > 0 && novosClientes > 0 ? (novosClientes / monthData.acquisition.clicks) * 100 : null);

  const receitaPorCliente = novosClientes > 0 ? faturamento / novosClientes : null;

  // 3. LTV formula (Default: Ticket Médio * Frequência Média * Multiplicador)
  const ltv = ticketMedio !== null && ticketMedio > 0
    ? ticketMedio * settings.ltvFormula.avgPurchaseFrequency * settings.ltvFormula.multiplier
    : null;

  // 4. Financials & Margins
  // Variable costs: sum of declared variableCosts or individual components
  const adCosts = monthData.financial.adCosts || investimento;
  const platformFees = monthData.financial.platformFees || 0;
  const tools = monthData.financial.tools || 0;
  const otherCosts = monthData.financial.otherCosts || 0;
  
  const custosVariaveis = monthData.financial.variableCosts > 0 
    ? monthData.financial.variableCosts 
    : (adCosts + platformFees + tools + otherCosts);

  const custosFixos = monthData.financial.fixedCosts || 0;
  const custosTotais = custosVariaveis + custosFixos;
  const margemContribuicao = faturamento > 0
    ? ((faturamento - custosVariaveis) / faturamento) * 100
    : null;
  const lucroOperacional = faturamento - custosTotais;
  const margemOperacional = faturamento > 0
    ? (lucroOperacional / faturamento) * 100
    : null;

  // 5. Mentorship
  const mentoria = monthData.mentorship;
  const mentoriaComparecimento = mentoria.meetingsScheduled > 0
    ? (mentoria.meetingsHeld / mentoria.meetingsScheduled) * 100
    : null;
  const mentoriaTaxaProposta = mentoria.meetingsHeld > 0
    ? (mentoria.proposals / mentoria.meetingsHeld) * 100
    : null;
  const mentoriaTaxaFechamento = mentoria.proposals > 0
    ? (mentoria.closed / mentoria.proposals) * 100
    : null;

  // Mentorship revenue: search for product with category 'mentorship'
  const mentorshipProduct = settings.products.find(p => p.category === 'mentorship');
  const mentoriaReceita = mentorshipProduct && monthData.revenue.byProduct[mentorshipProduct.id] 
    ? monthData.revenue.byProduct[mentorshipProduct.id] 
    : 0;

  const mentoriaTicketMedio = mentoria.closed > 0 && mentoriaReceita > 0
    ? mentoriaReceita / mentoria.closed
    : null;

  // Mentorship CAC: estimated 30% of ad investment or proportional
  const mentoriaCac = mentoria.closed > 0 && investimento > 0
    ? (investimento * 0.35) / mentoria.closed
    : null;

  // 6. Goals Progress
  const goals = monthData.goals;
  const faturamentoGoalPct = goals.revenue > 0 ? (faturamento / goals.revenue) * 100 : null;
  const clientesGoalPct = goals.customers > 0 ? (novosClientes / goals.customers) * 100 : null;
  const mentoriaGoalPct = goals.mentorships > 0 ? (mentoria.closed / goals.mentorships) * 100 : null;
  const margemGoalPct = (goals.margin > 0 && margemContribuicao !== null)
    ? (margemContribuicao / goals.margin) * 100
    : null;

  return {
    faturamento,
    vendas,
    ticketMedio,
    novosClientes,
    cac,
    ltv,
    margemContribuicao,
    custosVariaveis,
    custosFixos,
    custosTotais,
    lucroOperacional,
    margemOperacional,
    receitaPorCliente,
    ctr,
    cpc,
    cpl,
    custoPorOportunidade,
    taxaConversaoGeral,
    mentoriaComparecimento,
    mentoriaTaxaProposta,
    mentoriaTaxaFechamento,
    mentoriaCac,
    mentoriaTicketMedio,
    mentoriaReceita,
    faturamentoGoalPct,
    clientesGoalPct,
    mentoriaGoalPct,
    margemGoalPct,
  };
};

export const computeDelta = (
  current: number | null,
  previous: number | null,
  lowerIsBetter: boolean = false
): ComparisonDelta => {
  if (current === null || previous === null || previous === 0) {
    if (current !== null && (previous === null || previous === 0)) {
      return {
        previous,
        current,
        diff: previous !== null ? current - previous : null,
        percent: null,
        isPositive: lowerIsBetter ? false : true,
      };
    }
    return { previous: null, current: null, diff: null, percent: null, isPositive: null };
  }

  const diff = current - previous;
  const percent = (diff / Math.abs(previous)) * 100;
  const isPositive = lowerIsBetter ? diff < 0 : diff > 0;

  return {
    previous,
    current,
    diff,
    percent,
    isPositive,
  };
};

// Formatting helpers
export const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return 'Dados insuficientes';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatPercent = (val: number | null | undefined, decimals: number = 1): string => {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `${val >= 0 ? '' : '-'}${Math.abs(val).toFixed(decimals).replace('.', ',')}%`;
};

export const formatNumber = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return new Intl.NumberFormat('pt-BR').format(val);
};

export const formatMonthName = (monthNumber: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthNumber - 1] || `Mês ${monthNumber}`;
};

export const formatShortMonthName = (monthNumber: number): string => {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return months[monthNumber - 1] || `M${monthNumber}`;
};
