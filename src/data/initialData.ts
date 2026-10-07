import { Product, AppSettings, MonthData } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-ia-prospeccao',
    name: 'Curso de IA para automação de prospecção',
    price: 4.99,
    order: 1,
    active: true,
    category: 'low_ticket',
    description: 'Produto de entrada para captação massiva de novos clientes com baixo custo de aquisição.'
  },
  {
    id: 'prod-ia-video',
    name: 'Curso de IA para criação de anúncio em vídeo',
    price: 9.99,
    order: 2,
    active: true,
    category: 'low_ticket',
    description: 'Order bump e upsell imediato para criação rápida de criativos com Inteligência Artificial.'
  },
  {
    id: 'prod-gargalos',
    name: 'Principais gargalos do empreendedor',
    price: 97.90,
    order: 3,
    active: true,
    category: 'mid_ticket',
    description: 'Treinamento intermediário focado em destravar processos, operação e gestão de vendas.'
  },
  {
    id: 'prod-mentoria-api',
    name: 'Mentoria API',
    price: 497.90,
    order: 4,
    active: true,
    category: 'mentorship',
    description: 'Programa individual de acompanhamento prático, implementação de sistemas e escala.'
  }
];

export const INITIAL_CHANNELS = [
  'Meta Ads',
  'Instagram Orgânico',
  'YouTube',
  'WhatsApp',
  'Indicação',
  'Google',
  'TikTok',
  'Outros'
];

export const DEFAULT_SETTINGS: AppSettings = {
  products: INITIAL_PRODUCTS,
  channels: INITIAL_CHANNELS,
  ltvFormula: {
    multiplier: 1.0,
    avgRelationshipMonths: 6,
    avgPurchaseFrequency: 1.0
  },
  companyInfo: {
    name: 'Gestão API',
    owner: 'Gestor'
  },
  defaultGoals: {
    revenue: 0,
    customers: 0,
    sales: 0,
    mentorships: 0,
    margin: 0
  },
  isDemoDataActive: false,
  hasSeenWelcome: true
};

// Initial state for new months (blank state)
export const createEmptyMonthData = (year: number, month: number, products: Product[], defaultGoals = DEFAULT_SETTINGS.defaultGoals): MonthData => {
  const monthStr = month.toString().padStart(2, '0');
  const revenueByProduct: Record<string, number> = {};
  const salesByProduct: Record<string, number> = {};
  const education: MonthData['education'] = {};
  const ascension: MonthData['ascension'] = {};

  products.forEach(p => {
    revenueByProduct[p.id] = 0;
    salesByProduct[p.id] = 0;
    education[p.id] = { buyers: 0, started: 0, completed: 0, notStarted: 0 };
    ascension[p.id] = { eligible: 0, progressed: 0 };
  });

  return {
    id: `${year}-${monthStr}`,
    year,
    month,
    revenue: {
      total: 0,
      byProduct: revenueByProduct
    },
    sales: {
      total: 0,
      byProduct: salesByProduct
    },
    acquisition: {
      investment: 0,
      impressions: 0,
      clicks: 0,
      visitors: 0,
      leads: 0,
      conversations: 0,
      opportunities: 0,
      customers: 0,
      byChannel: {}
    },
    financial: {
      variableCosts: 0,
      fixedCosts: 0,
      adCosts: 0,
      platformFees: 0,
      tools: 0,
      otherCosts: 0
    },
    education,
    ascension,
    mentorship: {
      leads: 0,
      meetingsScheduled: 0,
      meetingsHeld: 0,
      proposals: 0,
      closed: 0,
      activeClients: 0,
      clients: []
    },
    goals: {
      revenue: defaultGoals.revenue,
      customers: defaultGoals.customers,
      sales: defaultGoals.sales,
      mentorships: defaultGoals.mentorships,
      margin: defaultGoals.margin
    },
    updatedAt: new Date().toISOString(),
    isDemo: false
  };
};
