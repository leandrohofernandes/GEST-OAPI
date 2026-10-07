import { MonthData, AppSettings } from '../types';
import {
  DEFAULT_SETTINGS,
  createEmptyMonthData
} from '../data/initialData';

const STORAGE_KEYS = {
  MONTHS: 'painel_gestao_months_v2',
  SETTINGS: 'painel_gestao_settings_v2',
};

class StorageService {
  private initStorage() {
    try {
      if (typeof window === 'undefined') return;

      // Remove any legacy v1 demo data if present
      localStorage.removeItem('painel_gestao_months_v1');
      localStorage.removeItem('painel_gestao_settings_v1');

      const existingSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!existingSettings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }

      const existingMonths = localStorage.getItem(STORAGE_KEYS.MONTHS);
      if (!existingMonths) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const key = `${year}-${month.toString().padStart(2, '0')}`;
        const initialMonths: Record<string, MonthData> = {
          [key]: createEmptyMonthData(year, month, DEFAULT_SETTINGS.products, DEFAULT_SETTINGS.defaultGoals)
        };
        localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(initialMonths));
      }
    } catch (e) {
      console.error('Failed to initialize storage:', e);
    }
  }

  constructor() {
    this.initStorage();
  }

  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data) as AppSettings;
      }
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }

  public getAllMonths(): Record<string, MonthData> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MONTHS);
      if (data) {
        return JSON.parse(data) as Record<string, MonthData>;
      }
    } catch (e) {
      console.error('Error reading months from localStorage:', e);
    }
    return {};
  }

  public getMonth(year: number, month: number): MonthData {
    const months = this.getAllMonths();
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    if (months[key]) {
      return months[key];
    }
    // If not found, create empty month for this period
    const settings = this.getSettings();
    const newMonth = createEmptyMonthData(year, month, settings.products, settings.defaultGoals);
    this.saveMonth(newMonth);
    return newMonth;
  }

  public saveMonth(monthData: MonthData): void {
    try {
      const months = this.getAllMonths();
      monthData.updatedAt = new Date().toISOString();
      months[monthData.id] = monthData;
      localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(months));
    } catch (e) {
      console.error('Error saving month to localStorage:', e);
    }
  }

  public deleteMonth(year: number, month: number): void {
    try {
      const months = this.getAllMonths();
      const key = `${year}-${month.toString().padStart(2, '0')}`;
      if (months[key]) {
        delete months[key];
        localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(months));
      }
    } catch (e) {
      console.error('Error deleting month:', e);
    }
  }

  public getSortedMonthKeys(): string[] {
    const months = this.getAllMonths();
    return Object.keys(months).sort(); // chronological order
  }

  public exportBackupJSON(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      months: this.getAllMonths()
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object' || !parsed.months) {
        return { success: false, message: 'Formato de arquivo inválido. Faltando dados de meses.' };
      }

      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(parsed.months));
      return { success: true, message: 'Dados restaurados com sucesso!' };
    } catch (e) {
      return { success: false, message: `Erro ao importar: ${(e as Error).message}` };
    }
  }

  public exportCSV(): string {
    const months = this.getAllMonths();
    const sortedKeys = Object.keys(months).sort();
    
    const headers = [
      'Período',
      'Ano',
      'Mês',
      'Faturamento Total (R$)',
      'Total de Vendas',
      'Novos Clientes',
      'Investimento em Anúncios (R$)',
      'Leads',
      'Cliques',
      'Custos Fixos (R$)',
      'Custos Variáveis (R$)',
      'Mentoria Fechados',
      'Mentoria Ativos'
    ];

    const rows = sortedKeys.map(key => {
      const m = months[key];
      return [
        m.id,
        m.year,
        m.month,
        m.revenue.total.toFixed(2),
        m.sales.total,
        m.acquisition.customers,
        m.acquisition.investment.toFixed(2),
        m.acquisition.leads,
        m.acquisition.clicks,
        m.financial.fixedCosts.toFixed(2),
        m.financial.variableCosts.toFixed(2),
        m.mentorship.closed,
        m.mentorship.activeClients
      ].join(';');
    });

    return [headers.join(';'), ...rows].join('\n');
  }

  public clearAllData(): void {
    const settings = this.getSettings();
    settings.isDemoDataActive = false;
    this.saveSettings(settings);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const cleanMonths: Record<string, MonthData> = {
      [key]: createEmptyMonthData(year, month, settings.products, settings.defaultGoals)
    };

    localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(cleanMonths));
  }
}

export const storageService = new StorageService();
