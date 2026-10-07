import { MonthData, AppSettings, InsightItem } from '../types';
import { calculateMetrics, computeDelta, formatPercent, formatCurrency } from './calculations';

export const generateInsights = (
  currentMonth: MonthData,
  previousMonth: MonthData | null,
  settings: AppSettings
): InsightItem[] => {
  const insights: InsightItem[] = [];
  const currentMetrics = calculateMetrics(currentMonth, settings);
  const prevMetrics = previousMonth ? calculateMetrics(previousMonth, settings) : null;

  // 1. Revenue & Sales variation vs previous month
  if (prevMetrics && prevMetrics.faturamento > 0) {
    const revDelta = computeDelta(currentMetrics.faturamento, prevMetrics.faturamento, false);
    if (revDelta.percent !== null) {
      if (Math.abs(revDelta.percent) >= 0.1) {
        const direction = revDelta.percent > 0 ? 'aumentou' : 'diminuiu';
        insights.push({
          id: 'rev-growth',
          type: revDelta.percent > 0 ? 'positive' : 'warning',
          title: 'Faturamento Mensal',
          message: `Seu faturamento ${direction} ${formatPercent(Math.abs(revDelta.percent))} em relação ao mês anterior (${formatCurrency(prevMetrics.faturamento)} → ${formatCurrency(currentMetrics.faturamento)}).`,
          metric: formatPercent(revDelta.percent)
        });
      }
    }

    // Ticket vs Sales divergence
    const salesDelta = computeDelta(currentMetrics.vendas, prevMetrics.vendas, false);
    const ticketDelta = computeDelta(currentMetrics.ticketMedio, prevMetrics.ticketMedio, false);
    if (salesDelta.diff !== null && ticketDelta.diff !== null) {
      if (salesDelta.diff > 0 && ticketDelta.diff < 0) {
        insights.push({
          id: 'sales-ticket-divergence',
          type: 'neutral',
          title: 'Composição de Vendas',
          message: 'Você teve aumento no volume de vendas, acompanhado de uma redução no ticket médio no período.',
          metric: `${formatPercent(salesDelta.percent)} vendas`
        });
      }
    }
  }

  // 2. CAC vs Revenue behavior
  if (prevMetrics && currentMetrics.cac !== null && prevMetrics.cac !== null && prevMetrics.cac > 0) {
    const cacDelta = computeDelta(currentMetrics.cac, prevMetrics.cac, true);
    const revDelta = computeDelta(currentMetrics.faturamento, prevMetrics.faturamento, false);
    if (cacDelta.percent !== null && cacDelta.percent > 5 && Math.abs(revDelta.percent || 0) < 5) {
      insights.push({
        id: 'cac-warning',
        type: 'warning',
        title: 'Custo de Aquisição (CAC)',
        message: `O CAC aumentou ${formatPercent(cacDelta.percent)} enquanto a receita permaneceu praticamente estável no mês.`,
        metric: formatCurrency(currentMetrics.cac)
      });
    } else if (cacDelta.percent !== null && cacDelta.percent < -5) {
      insights.push({
        id: 'cac-positive',
        type: 'positive',
        title: 'Eficiência de Aquisição',
        message: `Seu CAC reduziu ${formatPercent(Math.abs(cacDelta.percent))} comparado ao mês anterior, alcançando ${formatCurrency(currentMetrics.cac)} por cliente.`,
        metric: formatCurrency(currentMetrics.cac)
      });
    }
  }

  // 3. Dominant Product in Revenue Share
  if (currentMetrics.faturamento > 0) {
    let topProduct: { id: string; name: string; revenue: number; share: number } | null = null;
    for (const p of settings.products) {
      const pRev = currentMonth.revenue.byProduct[p.id] || 0;
      const share = (pRev / currentMetrics.faturamento) * 100;
      if (!topProduct || pRev > topProduct.revenue) {
        topProduct = { id: p.id, name: p.name, revenue: pRev, share };
      }
    }

    if (topProduct && topProduct.revenue > 0) {
      insights.push({
        id: 'top-product-share',
        type: 'highlight',
        title: 'Participação de Receita',
        message: `O produto "${topProduct.name}" representa ${formatPercent(topProduct.share)} do faturamento total do mês (${formatCurrency(topProduct.revenue)}).`,
        metric: formatPercent(topProduct.share)
      });
    }
  }

  // 4. Product Ladder Ascension
  const sortedProducts = [...settings.products].sort((a, b) => a.order - b.order);
  if (sortedProducts.length >= 2) {
    const entryProduct = sortedProducts[0];
    const nextProduct = sortedProducts[1];
    const entryData = currentMonth.ascension[entryProduct.id];
    if (entryData && entryData.eligible > 0) {
      const rate = (entryData.progressed / entryData.eligible) * 100;
      insights.push({
        id: 'ladder-ascension',
        type: rate >= 20 ? 'positive' : 'neutral',
        title: 'Ascensão de Clientes',
        message: `Seu produto de entrada gerou ${entryData.eligible} clientes, dos quais ${entryData.progressed} (${formatPercent(rate)}) avançaram para "${nextProduct.name}".`,
        metric: formatPercent(rate)
      });
    }
  }

  // 5. Course Completion Rates
  Object.entries(currentMonth.education).forEach(([prodId, data]) => {
    if (data.buyers > 0 && data.completed > 0) {
      const completionRate = (data.completed / data.buyers) * 100;
      const prod = settings.products.find(p => p.id === prodId);
      if (prod && completionRate >= 50) {
        insights.push({
          id: `completion-${prodId}`,
          type: 'positive',
          title: 'Engajamento de Conteúdo',
          message: `A taxa de conclusão do "${prod.name}" atingiu ${formatPercent(completionRate)} (${data.completed} de ${data.buyers} alunos).`,
          metric: formatPercent(completionRate)
        });
      }
    }
  });

  // 6. Mentorship Conversion Rates
  const mentoria = currentMonth.mentorship;
  if (mentoria.proposals > 0 && mentoria.closed > 0) {
    const closeRate = (mentoria.closed / mentoria.proposals) * 100;
    insights.push({
      id: 'mentorship-close-rate',
      type: closeRate >= 40 ? 'positive' : 'neutral',
      title: 'Conversão da Mentoria',
      message: `Taxa de fechamento da Mentoria em ${formatPercent(closeRate)}: ${mentoria.closed} clientes fechados a partir de ${mentoria.proposals} propostas apresentadas.`,
      metric: `${mentoria.closed} fechados`
    });
  }

  // 7. Goals achievement
  if (currentMetrics.faturamentoGoalPct !== null) {
    if (currentMetrics.faturamentoGoalPct >= 100) {
      insights.push({
        id: 'goal-revenue-hit',
        type: 'positive',
        title: 'Meta de Faturamento',
        message: `Meta de faturamento mensal atingida com sucesso! Você alcançou ${formatPercent(currentMetrics.faturamentoGoalPct)} da meta estipulada.`,
        metric: 'Meta superada'
      });
    } else if (currentMetrics.faturamentoGoalPct < 50 && currentMonth.revenue.total > 0) {
      insights.push({
        id: 'goal-revenue-progress',
        type: 'neutral',
        title: 'Progresso da Meta',
        message: `Faturamento atual em ${formatPercent(currentMetrics.faturamentoGoalPct)} da meta estabelecida de ${formatCurrency(currentMonth.goals.revenue)}.`,
        metric: formatPercent(currentMetrics.faturamentoGoalPct)
      });
    }
  }

  // If no specific insights generated yet because month is empty:
  if (insights.length === 0) {
    insights.push({
      id: 'empty-state-insight',
      type: 'neutral',
      title: 'Aguardando Lançamento de Dados',
      message: 'Insira os dados de vendas, aquisição ou financeiro deste mês para que as análises automáticas e diagnósticos sejam gerados.',
      metric: 'Pronto para dados'
    });
  }

  return insights;
};
