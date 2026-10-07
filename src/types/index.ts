export interface Product {
  id: string;
  name: string;
  price: number;
  order: number;
  active: boolean;
  category: 'low_ticket' | 'mid_ticket' | 'high_ticket' | 'mentorship';
  description?: string;
}

export type AchievedOutcome = 'achieved' | 'partial' | 'pending' | 'none';
export type MentorshipStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface MentorshipClient {
  id: string;
  name: string;
  startDate: string;
  plan: string;
  value: number;
  status: MentorshipStatus;
  target: string;
  expectedOutcome: string;
  achievedOutcome: AchievedOutcome;
  meetingsTotal: number;
  meetingsCompleted: number;
  tasksTotal: number;
  tasksCompleted: number;
  implementations: string;
  notes: string;
}

export interface ChannelAcquisitionData {
  investment: number;
  impressions?: number;
  clicks?: number;
  leads: number;
  customers: number;
  revenue: number;
}

export interface MonthData {
  id: string; // "YYYY-MM", e.g. "2026-10"
  year: number;
  month: number; // 1 to 12

  // Revenue & Sales
  revenue: {
    total: number;
    byProduct: Record<string, number>; // productId -> revenue in R$
  };
  sales: {
    total: number;
    byProduct: Record<string, number>; // productId -> units sold
  };

  // Acquisition & Traffic
  acquisition: {
    investment: number;
    impressions: number;
    clicks: number;
    visitors: number;
    leads: number;
    conversations: number;
    opportunities: number;
    customers: number;
    byChannel: Record<string, ChannelAcquisitionData>;
  };

  // Financial (DRE Gerencial)
  financial: {
    variableCosts: number;
    fixedCosts: number;
    adCosts: number;
    platformFees: number;
    tools: number;
    otherCosts: number;
  };

  // Course Consumption
  education: Record<string, {
    buyers: number;
    started: number;
    completed: number;
    notStarted: number;
  }>;

  // Product Ladder Ascension
  ascension: Record<string, {
    eligible: number; // buyers of step n
    progressed: number; // who bought step n+1
  }>;

  // Mentorship Pipeline & Roster
  mentorship: {
    leads: number;
    meetingsScheduled: number;
    meetingsHeld: number;
    proposals: number;
    closed: number;
    activeClients: number;
    clients: MentorshipClient[];
  };

  // Monthly Targets
  goals: {
    revenue: number;
    customers: number;
    sales: number;
    mentorships: number;
    margin: number;
  };

  updatedAt: string;
  isDemo?: boolean;
}

export interface AppSettings {
  products: Product[];
  channels: string[];
  ltvFormula: {
    multiplier: number;
    avgRelationshipMonths: number;
    avgPurchaseFrequency: number;
  };
  companyInfo: {
    name: string;
    owner: string;
  };
  defaultGoals: {
    revenue: number;
    customers: number;
    sales: number;
    mentorships: number;
    margin: number;
  };
  isDemoDataActive: boolean;
  hasSeenWelcome: boolean;
}

export interface CalculatedMetrics {
  faturamento: number;
  vendas: number;
  ticketMedio: number | null;
  novosClientes: number;
  cac: number | null;
  ltv: number | null;
  margemContribuicao: number | null; // in %
  custosVariaveis: number;
  custosFixos: number;
  custosTotais: number;
  lucroOperacional: number;
  margemOperacional: number | null; // in %
  receitaPorCliente: number | null;
  
  // Marketing & Funnel
  ctr: number | null; // in %
  cpc: number | null;
  cpl: number | null;
  custoPorOportunidade: number | null;
  taxaConversaoGeral: number | null; // in %
  
  // Mentorship metrics
  mentoriaComparecimento: number | null; // in %
  mentoriaTaxaProposta: number | null; // in %
  mentoriaTaxaFechamento: number | null; // in %
  mentoriaCac: number | null;
  mentoriaTicketMedio: number | null;
  mentoriaReceita: number;
  
  // Goal Progress
  faturamentoGoalPct: number | null;
  clientesGoalPct: number | null;
  mentoriaGoalPct: number | null;
  margemGoalPct: number | null;
}

export interface ComparisonDelta {
  previous: number | null;
  current: number | null;
  diff: number | null;
  percent: number | null;
  isPositive: boolean | null; // whether the change is favorable for the business
}

export interface InsightItem {
  id: string;
  type: 'positive' | 'warning' | 'neutral' | 'highlight';
  title: string;
  message: string;
  metric?: string;
}
