import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Save, DollarSign, Megaphone, Users, Award, Target, Calculator } from 'lucide-react';
import { MonthData, AppSettings } from '../../types';
import { formatCurrency, formatMonthName } from '../../utils/calculations';

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthData: MonthData;
  settings: AppSettings;
  onSave: (updatedData: MonthData) => void;
}

type TabType = 'sales' | 'acquisition' | 'mentorship' | 'financial' | 'goals';

export const DataInputModal: React.FC<DataInputModalProps> = ({
  isOpen,
  onClose,
  monthData,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [formData, setFormData] = useState<MonthData>(JSON.parse(JSON.stringify(monthData)));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if month changes
  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(monthData)));
  }, [monthData.id]);

  if (!isOpen) return null;

  const triggerAutoSave = (updated: MonthData) => {
    setSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      onSave(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 450);
  };

  // Helper to recalculate total revenue and sales
  const handleProductChange = (productId: string, field: 'sales' | 'revenue', value: number) => {
    const updated = { ...formData };
    
    if (field === 'sales') {
      updated.sales.byProduct[productId] = value;
      // Auto-compute revenue if product price exists and user changed sales
      const product = settings.products.find(p => p.id === productId);
      if (product) {
        updated.revenue.byProduct[productId] = Number((value * product.price).toFixed(2));
      }
    } else {
      updated.revenue.byProduct[productId] = value;
    }

    // Recompute total sales
    let totalSales = 0;
    Object.values(updated.sales.byProduct).forEach(v => {
      totalSales += v || 0;
    });
    updated.sales.total = totalSales;

    // Recompute total revenue
    let totalRev = 0;
    Object.values(updated.revenue.byProduct).forEach(v => {
      totalRev += v || 0;
    });
    updated.revenue.total = Number(totalRev.toFixed(2));

    // If buyers changed, also update education buyers count
    if (!updated.education[productId]) {
      updated.education[productId] = { buyers: 0, started: 0, completed: 0, notStarted: 0 };
    }
    updated.education[productId].buyers = updated.sales.byProduct[productId] || 0;

    // Also auto-sync customers if not explicitly set higher
    if (updated.acquisition.customers === 0 || updated.acquisition.customers < totalSales) {
      updated.acquisition.customers = totalSales;
    }

    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleEducationChange = (productId: string, field: 'started' | 'completed' | 'notStarted', value: number) => {
    const updated = { ...formData };
    if (!updated.education[productId]) {
      updated.education[productId] = { 
        buyers: updated.sales.byProduct[productId] || 0, 
        started: 0, 
        completed: 0, 
        notStarted: 0 
      };
    }
    updated.education[productId][field] = value;
    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleAscensionChange = (productId: string, field: 'eligible' | 'progressed', value: number) => {
    const updated = { ...formData };
    if (!updated.ascension[productId]) {
      updated.ascension[productId] = { eligible: 0, progressed: 0 };
    }
    updated.ascension[productId][field] = value;
    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleAcquisitionFieldChange = (field: keyof MonthData['acquisition'], value: number) => {
    const updated = { ...formData };
    (updated.acquisition as any)[field] = value;
    // Keep adCosts synced with investment if not custom
    if (field === 'investment' && updated.financial.adCosts === 0) {
      updated.financial.adCosts = value;
    }
    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleFinancialFieldChange = (field: keyof MonthData['financial'], value: number) => {
    const updated = { ...formData };
    updated.financial[field] = value;
    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleMentorshipFieldChange = (field: keyof MonthData['mentorship'], value: number) => {
    const updated = { ...formData };
    (updated.mentorship as any)[field] = value;
    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleGoalFieldChange = (field: keyof MonthData['goals'], value: number) => {
    const updated = { ...formData };
    updated.goals[field] = value;
    setFormData(updated);
    triggerAutoSave(updated);
  };

  const handleManualSave = () => {
    onSave(formData);
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0e1526] border border-[#1c263d] rounded-2xl shadow-2xl shadow-blue-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c263d] bg-[#0e1526]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Lançar e Editar Dados</h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-400">
                  {formatMonthName(formData.month)} / {formData.year}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Insira ou ajuste os números operacionais deste mês
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save status */}
            <div className="text-xs font-mono">
              {saveStatus === 'saving' && (
                <span className="text-amber-400 animate-pulse">Salvando...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Salvo
                </span>
              )}
              {saveStatus === 'idle' && (
                <span className="text-slate-500">Auto-salvamento ativo</span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#131d33] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1c263d] bg-[#0a0f1d] px-6 overflow-x-auto gap-2">
          {[
            { id: 'sales', label: 'Vendas & Produtos', icon: DollarSign },
            { id: 'acquisition', label: 'Aquisição & Tráfego', icon: Megaphone },
            { id: 'mentorship', label: 'Mentoria API', icon: Award },
            { id: 'financial', label: 'Financeiro (DRE)', icon: Target },
            { id: 'goals', label: 'Metas do Mês', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-[#1c263d]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body content based on Active Tab */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SALES & PRODUCTS */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#131d33] border border-[#1c263d]">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Faturamento Total Calculado
                  </span>
                  <div className="text-2xl font-mono font-bold text-blue-400">
                    {formatCurrency(formData.revenue.total)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Total de Unidades Vendidas
                  </span>
                  <div className="text-2xl font-mono font-bold text-slate-100">
                    {formData.sales.total} vendas
                  </div>
                </div>
              </div>

              {/* Product list */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-100">Vendas por Produto</h3>
                <div className="space-y-3">
                  {settings.products.map((product) => {
                    const salesCount = formData.sales.byProduct[product.id] ?? 0;
                    const revenueVal = formData.revenue.byProduct[product.id] ?? 0;
                    const edu = formData.education[product.id] || { buyers: salesCount, started: 0, completed: 0, notStarted: 0 };
                    const asc = formData.ascension[product.id] || { eligible: salesCount, progressed: 0 };

                    return (
                      <div
                        key={product.id}
                        className="p-4 rounded-xl bg-[#131d33]/70 border border-[#1c263d] hover:border-blue-500/30 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="text-sm font-bold text-slate-100 block">
                              {product.name}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              Preço cadastrado: {formatCurrency(product.price)}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-blue-400 font-medium">
                            Subtotal: {formatCurrency(revenueVal)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1">
                              Vendas (Unidades)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={salesCount}
                              onChange={(e) =>
                                handleProductChange(product.id, 'sales', Math.max(0, parseInt(e.target.value) || 0))
                              }
                              className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1">
                              Faturamento (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={revenueVal}
                              onChange={(e) =>
                                handleProductChange(product.id, 'revenue', Math.max(0, parseFloat(e.target.value) || 0))
                              }
                              className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          {/* Course Consumption fields */}
                          {product.category !== 'mentorship' && (
                            <>
                              <div>
                                <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1">
                                  Alunos Concluíram
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={edu.completed}
                                  onChange={(e) =>
                                    handleEducationChange(product.id, 'completed', Math.max(0, parseInt(e.target.value) || 0))
                                  }
                                  placeholder="0"
                                  className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1">
                                  Ascenderam p/ Próximo
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={asc.progressed}
                                  onChange={(e) =>
                                    handleAscensionChange(product.id, 'progressed', Math.max(0, parseInt(e.target.value) || 0))
                                  }
                                  placeholder="0"
                                  className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACQUISITION & TRAFFIC */}
          {activeTab === 'acquisition' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Investimento em Anúncios (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.acquisition.investment}
                    onChange={(e) =>
                      handleAcquisitionFieldChange('investment', Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Novos Clientes Adquiridos
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.acquisition.customers}
                    onChange={(e) =>
                      handleAcquisitionFieldChange('customers', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Total de Leads
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.acquisition.leads}
                    onChange={(e) =>
                      handleAcquisitionFieldChange('leads', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Cliques
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.acquisition.clicks}
                    onChange={(e) =>
                      handleAcquisitionFieldChange('clicks', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Funnel Stages */}
              <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d] space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Etapas Detalhadas do Funil Comercial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Impressões
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.acquisition.impressions}
                      onChange={(e) =>
                        handleAcquisitionFieldChange('impressions', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Visitantes da Página / Checkout
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.acquisition.visitors}
                      onChange={(e) =>
                        handleAcquisitionFieldChange('visitors', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Conversas Iniciadas (WhatsApp/Direct)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.acquisition.conversations}
                      onChange={(e) =>
                        handleAcquisitionFieldChange('conversations', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Oportunidades Comerciais
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.acquisition.opportunities}
                      onChange={(e) =>
                        handleAcquisitionFieldChange('opportunities', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MENTORSHIP */}
          {activeTab === 'mentorship' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
                  Funil de Vendas da Mentoria API
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Leads Específicos Mentoria
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.mentorship.leads}
                      onChange={(e) =>
                        handleMentorshipFieldChange('leads', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Reuniões Agendadas
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.mentorship.meetingsScheduled}
                      onChange={(e) =>
                        handleMentorshipFieldChange('meetingsScheduled', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Reuniões Realizadas (Comparecimento)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.mentorship.meetingsHeld}
                      onChange={(e) =>
                        handleMentorshipFieldChange('meetingsHeld', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Propostas Apresentadas
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.mentorship.proposals}
                      onChange={(e) =>
                        handleMentorshipFieldChange('proposals', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Mentorados Fechados no Mês
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.mentorship.closed}
                      onChange={(e) =>
                        handleMentorshipFieldChange('closed', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Total de Clientes Ativos em Acompanhamento
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.mentorship.activeClients}
                      onChange={(e) =>
                        handleMentorshipFieldChange('activeClients', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
                  Custos e Despesas do Período
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Custos de Anúncios (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.financial.adCosts}
                      onChange={(e) =>
                        handleFinancialFieldChange('adCosts', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Taxas de Plataforma / Gateway (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.financial.platformFees}
                      onChange={(e) =>
                        handleFinancialFieldChange('platformFees', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Ferramentas & Software (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.financial.tools}
                      onChange={(e) =>
                        handleFinancialFieldChange('tools', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Outros Custos Variáveis (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.financial.otherCosts}
                      onChange={(e) =>
                        handleFinancialFieldChange('otherCosts', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Custos Fixos da Operação (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.financial.fixedCosts}
                      onChange={(e) =>
                        handleFinancialFieldChange('fixedCosts', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
                  Metas Estabelecidas para este Mês
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Meta de Faturamento (R$)
                    </label>
                    <input
                      type="number"
                      step="100"
                      min={0}
                      value={formData.goals.revenue}
                      onChange={(e) =>
                        handleGoalFieldChange('revenue', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Meta de Novos Clientes
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.goals.customers}
                      onChange={(e) =>
                        handleGoalFieldChange('customers', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Meta de Clientes de Mentoria
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.goals.mentorships}
                      onChange={(e) =>
                        handleGoalFieldChange('mentorships', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Meta de Margem de Contribuição (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min={0}
                      max={100}
                      value={formData.goals.margin}
                      onChange={(e) =>
                        handleGoalFieldChange('margin', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#0a0f1d] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1c263d] bg-[#0e1526]">
          <span className="text-xs text-slate-500">
            Valores são persistidos automaticamente no armazenamento local.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-[#131d33] rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
