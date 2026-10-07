import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Target,
  Calculator,
  Building
} from 'lucide-react';
import { AppSettings, Product } from '../types';
import { formatCurrency } from '../utils/calculations';

interface SettingsPageProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  onClearAllData,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(JSON.parse(JSON.stringify(settings)));
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New product form
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'low_ticket',
    description: '',
  });

  // Editing product
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price === undefined) return;

    const prod: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      price: Number(newProduct.price),
      order: localSettings.products.length + 1,
      active: true,
      category: (newProduct.category as Product['category']) || 'low_ticket',
      description: newProduct.description || '',
    };

    const updated = {
      ...localSettings,
      products: [...localSettings.products, prod],
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    setIsAddingProduct(false);
    setNewProduct({ name: '', price: 0, category: 'low_ticket', description: '' });
  };

  const handleUpdateProduct = (id: string, field: keyof Product, val: any) => {
    const updated = {
      ...localSettings,
      products: localSettings.products.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    };
    setLocalSettings(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = {
      ...localSettings,
      products: localSettings.products.filter((p) => p.id !== id),
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Configurações da Operação</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Gerenciamento de produtos, preços de catálogo, fórmula do LTV, metas padrão e dados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-blue-400 flex items-center gap-1 font-mono">
              <Check className="w-4 h-4" /> Configurações salvas
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* SECTION 1: PRODUTOS & PREÇOS */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-6 shadow-sm shadow-blue-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-[#f1f5f9]">Produtos & Esteira de Ofertas</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingProduct(!isAddingProduct)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Produto
          </button>
        </div>

        {/* Add Product Form */}
        {isAddingProduct && (
          <form onSubmit={handleAddProduct} className="p-4 mb-4 rounded-xl bg-[#131d33] border border-blue-500/40 space-y-3">
            <h4 className="text-xs font-bold text-blue-400">Cadastrar Novo Produto</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Formação IA Avançada"
                  className="w-full bg-[#0e1526] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">Preço Atual (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0e1526] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">Categoria na Esteira</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })}
                  className="w-full bg-[#0e1526] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                >
                  <option value="low_ticket">Low Ticket (Entrada)</option>
                  <option value="mid_ticket">Intermediário</option>
                  <option value="high_ticket">High Ticket</option>
                  <option value="mentorship">Mentoria / Serviço</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#94a3b8] mb-1">Descrição</label>
              <input
                type="text"
                value={newProduct.description || ''}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Breve propósito deste produto no ecossistema"
                className="w-full bg-[#0e1526] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30"
              >
                Adicionar Produto
              </button>
            </div>
          </form>
        )}

        {/* Existing Products List */}
        <div className="space-y-3">
          {localSettings.products.map((prod, idx) => (
            <div
              key={prod.id}
              className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d] hover:border-blue-500/40 transition-all flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f1f5f9]">{prod.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0e1526] text-blue-400 border border-blue-500/30">
                      {prod.category}
                    </span>
                  </div>
                  {prod.description && (
                    <p className="text-[11px] text-[#94a3b8]">{prod.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#64748b]">Preço:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={prod.price}
                    onChange={(e) =>
                      handleUpdateProduct(prod.id, 'price', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 bg-[#0e1526] border border-[#1c263d] rounded-lg px-2.5 py-1 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="p-1.5 text-[#94a3b8] hover:text-rose-400 hover:bg-[#0e1526] rounded-lg transition-colors"
                  title="Remover produto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: METAS MENSAIS PADRÃO & LTV */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Metas Padrão */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-6 shadow-sm shadow-blue-950/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-[#f1f5f9]">Metas Mensais Padrão</h3>
          </div>
          <p className="text-xs text-[#94a3b8] mb-4">
            Valores atribuídos automaticamente aos novos meses criados
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Meta de Faturamento (R$)
              </label>
              <input
                type="number"
                value={localSettings.defaultGoals.revenue}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    defaultGoals: {
                      ...localSettings.defaultGoals,
                      revenue: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Meta de Novos Clientes
              </label>
              <input
                type="number"
                value={localSettings.defaultGoals.customers}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    defaultGoals: {
                      ...localSettings.defaultGoals,
                      customers: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Meta de Mentorias
              </label>
              <input
                type="number"
                value={localSettings.defaultGoals.mentorships}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    defaultGoals: {
                      ...localSettings.defaultGoals,
                      mentorships: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Meta de Margem (%)
              </label>
              <input
                type="number"
                value={localSettings.defaultGoals.margin}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    defaultGoals: {
                      ...localSettings.defaultGoals,
                      margin: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Parâmetros da Fórmula do LTV */}
        <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl p-6 shadow-sm shadow-blue-950/20">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-[#f1f5f9]">Fórmula de Cálculo do LTV</h3>
          </div>
          <p className="text-xs text-[#94a3b8] mb-4">
            LTV = Ticket Médio × Frequência Média de Compra × Multiplicador
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Frequência de Compra
              </label>
              <input
                type="number"
                step="0.1"
                value={localSettings.ltvFormula.avgPurchaseFrequency}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    ltvFormula: {
                      ...localSettings.ltvFormula,
                      avgPurchaseFrequency: parseFloat(e.target.value) || 1,
                    },
                  })
                }
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1">
                Multiplicador de Retenção
              </label>
              <input
                type="number"
                step="0.1"
                value={localSettings.ltvFormula.multiplier}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    ltvFormula: {
                      ...localSettings.ltvFormula,
                      multiplier: parseFloat(e.target.value) || 1,
                    },
                  })
                }
                className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: GERENCIAMENTO DE DADOS LOCAIS */}
      <div className="p-6 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#f1f5f9]">Gerenciamento de Dados</h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Todos os dados exibidos no painel são exclusivamente inseridos por você. Caso deseje, você pode zerar todos os registros.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClearAllData}
            className="px-3.5 py-2 bg-[#131d33] hover:bg-rose-950/40 text-rose-400 border border-[#1c263d] hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Zerar Todos os Dados Registrados
          </button>
        </div>
      </div>
    </div>
  );
};
