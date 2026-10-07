import React, { useState } from 'react';
import { Award, Plus, CheckCircle2, Clock, Calendar, UserCheck, X, Edit, Trash2 } from 'lucide-react';
import { MonthData, AppSettings, MentorshipClient, AchievedOutcome, MentorshipStatus } from '../types';
import { calculateMetrics, formatCurrency, formatPercent, formatNumber } from '../utils/calculations';
import { MetricCard } from '../components/common/MetricCard';

interface MentorshipPageProps {
  currentMonth: MonthData;
  settings: AppSettings;
  onUpdateMonth: (updatedMonth: MonthData) => void;
  onOpenDataInput: () => void;
}

export const MentorshipPage: React.FC<MentorshipPageProps> = ({
  currentMonth,
  settings,
  onUpdateMonth,
  onOpenDataInput,
}) => {
  const metrics = calculateMetrics(currentMonth, settings);
  const mentoria = currentMonth.mentorship;
  const clients = mentoria.clients || [];

  // Local state for client modal (add/edit)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<MentorshipClient | null>(null);

  // Form state for client
  const [clientForm, setClientForm] = useState<Partial<MentorshipClient>>({
    name: '',
    startDate: new Date().toISOString().slice(0, 10),
    plan: 'Mentoria Individual API',
    value: 497.90,
    status: 'active',
    target: '',
    expectedOutcome: '',
    achievedOutcome: 'pending',
    meetingsTotal: 4,
    meetingsCompleted: 0,
    tasksTotal: 4,
    tasksCompleted: 0,
    implementations: '',
    notes: '',
  });

  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientForm({
      name: '',
      startDate: new Date().toISOString().slice(0, 10),
      plan: 'Mentoria Individual API',
      value: 497.90,
      status: 'active',
      target: '',
      expectedOutcome: '',
      achievedOutcome: 'pending',
      meetingsTotal: 4,
      meetingsCompleted: 0,
      tasksTotal: 4,
      tasksCompleted: 0,
      implementations: '',
      notes: '',
    });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (c: MentorshipClient) => {
    setEditingClient(c);
    setClientForm({ ...c });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...currentMonth };
    const clientList = [...(updated.mentorship.clients || [])];

    if (editingClient) {
      const idx = clientList.findIndex((c) => c.id === editingClient.id);
      if (idx !== -1) {
        clientList[idx] = { ...clientList[idx], ...clientForm } as MentorshipClient;
      }
    } else {
      const newClient: MentorshipClient = {
        id: `client-${Date.now()}`,
        name: clientForm.name || 'Novo Mentorado',
        startDate: clientForm.startDate || new Date().toISOString().slice(0, 10),
        plan: clientForm.plan || 'Mentoria API',
        value: Number(clientForm.value) || 497.90,
        status: (clientForm.status as MentorshipStatus) || 'active',
        target: clientForm.target || '',
        expectedOutcome: clientForm.expectedOutcome || '',
        achievedOutcome: (clientForm.achievedOutcome as AchievedOutcome) || 'pending',
        meetingsTotal: Number(clientForm.meetingsTotal) || 4,
        meetingsCompleted: Number(clientForm.meetingsCompleted) || 0,
        tasksTotal: Number(clientForm.tasksTotal) || 0,
        tasksCompleted: Number(clientForm.tasksCompleted) || 0,
        implementations: clientForm.implementations || '',
        notes: clientForm.notes || '',
      };
      clientList.push(newClient);
    }

    updated.mentorship.clients = clientList;
    // update active clients count
    updated.mentorship.activeClients = clientList.filter((c) => c.status === 'active').length;

    onUpdateMonth(updated);
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (clientId: string) => {
    const updated = { ...currentMonth };
    updated.mentorship.clients = (updated.mentorship.clients || []).filter((c) => c.id !== clientId);
    updated.mentorship.activeClients = updated.mentorship.clients.filter((c) => c.status === 'active').length;
    onUpdateMonth(updated);
  };

  // Outcome statistics
  const totalRoster = clients.length;
  const achievedCount = clients.filter((c) => c.achievedOutcome === 'achieved').length;
  const partialCount = clients.filter((c) => c.achievedOutcome === 'partial').length;
  const successRate = totalRoster > 0 ? ((achievedCount + partialCount * 0.5) / totalRoster) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#f1f5f9]">Mentoria API & Acompanhamento de Clientes</h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Funil comercial de alta conversão, reuniões de diagnóstico e gestão de resultados dos mentorados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenDataInput}
            className="px-3.5 py-2 bg-[#131d33] hover:bg-[#1e2d4d] text-[#f1f5f9] border border-[#1c263d] hover:border-blue-500/40 rounded-xl text-xs font-semibold transition-colors"
          >
            Editar Funil Comercial
          </button>
          <button
            type="button"
            onClick={handleOpenAddClient}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Mentorado
          </button>
        </div>
      </div>

      {/* KPI Funnel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita da Mentoria"
          value={formatCurrency(metrics.mentoriaReceita)}
          subtitle={`${mentoria.closed} fechamentos no mês`}
          icon={<Award className="w-4 h-4" />}
          accentColor="#2563eb"
          tooltip="Receita bruta oriunda do programa de mentoria no mês."
        />

        <MetricCard
          title="Taxa de Comparecimento"
          value={formatPercent(metrics.mentoriaComparecimento)}
          subtitle={`${mentoria.meetingsHeld} de ${mentoria.meetingsScheduled} reuniões`}
          icon={<Calendar className="w-4 h-4" />}
          accentColor="#3b82f6"
          tooltip="Reuniões realizadas / Reuniões agendadas."
        />

        <MetricCard
          title="Taxa de Fechamento"
          value={formatPercent(metrics.mentoriaTaxaFechamento)}
          subtitle={`${mentoria.closed} fechados de ${mentoria.proposals} propostas`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accentColor="#60a5fa"
          tooltip="Clientes fechados / Propostas apresentadas."
        />

        <MetricCard
          title="Mentorados Ativos"
          value={`${formatNumber(mentoria.activeClients)} clientes`}
          subtitle={`Sucesso: ${formatPercent(successRate)}`}
          icon={<UserCheck className="w-4 h-4" />}
          accentColor="#0284c7"
          tooltip="Total de clientes que estão no ciclo ativo de acompanhamento."
        />
      </div>

      {/* Pipeline Funnel Visual */}
      <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#1c263d] shadow-sm shadow-blue-950/20">
        <h3 className="text-sm font-bold text-[#f1f5f9] mb-3">Funil Comercial da Mentoria</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
            <span className="text-[10px] text-[#64748b] uppercase block">Leads Mentoria</span>
            <span className="text-xl font-mono font-bold text-[#f1f5f9]">{mentoria.leads}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
            <span className="text-[10px] text-[#64748b] uppercase block">Agendadas</span>
            <span className="text-xl font-mono font-bold text-blue-400">{mentoria.meetingsScheduled}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
            <span className="text-[10px] text-[#64748b] uppercase block">Realizadas</span>
            <span className="text-xl font-mono font-bold text-blue-300">{mentoria.meetingsHeld}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
            <span className="text-[10px] text-[#64748b] uppercase block">Propostas</span>
            <span className="text-xl font-mono font-bold text-sky-400">{mentoria.proposals}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#131d33] border border-[#1c263d]">
            <span className="text-[10px] text-[#64748b] uppercase block">Fechados</span>
            <span className="text-xl font-mono font-bold text-blue-400">{mentoria.closed}</span>
          </div>
        </div>
      </div>

      {/* Mentorship Clients Roster (Delivery & Results) */}
      <div className="bg-[#0e1526] border border-[#1c263d] rounded-2xl overflow-hidden shadow-sm shadow-blue-950/20">
        <div className="p-5 border-b border-[#1c263d] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#f1f5f9]">Acompanhamento de Entregas & Resultados</h3>
            <p className="text-xs text-[#94a3b8]">Painel administrativo pessoal dos mentorados</p>
          </div>
          <span className="text-xs font-mono text-blue-400">{clients.length} cadastrados</span>
        </div>

        {clients.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#64748b]">
            Nenhum cliente cadastrado neste mês ainda.{' '}
            <button
              type="button"
              onClick={handleOpenAddClient}
              className="text-blue-400 underline font-medium hover:text-blue-300"
            >
              Adicionar primeiro cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1c263d] bg-[#131d33] text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-5">Cliente</th>
                  <th className="py-3 px-4">Objetivo / Resultado Esperado</th>
                  <th className="py-3 px-4 text-center">Encontros</th>
                  <th className="py-3 px-4 text-center">Tarefas</th>
                  <th className="py-3 px-4 text-center">Status Resultado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c263d]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#131d33]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-xs text-[#f1f5f9]">{c.name}</div>
                      <div className="text-[11px] font-mono text-[#94a3b8]">
                        Início: {c.startDate} · {formatCurrency(c.value)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#f1f5f9] max-w-xs">
                      <div className="font-medium text-[#f1f5f9] truncate" title={c.target}>
                        {c.target || 'Não definido'}
                      </div>
                      <div className="text-[11px] text-[#64748b] truncate" title={c.expectedOutcome}>
                        Esperado: {c.expectedOutcome || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className="text-blue-400 font-bold">{c.meetingsCompleted}</span>
                      <span className="text-[#64748b]">/{c.meetingsTotal}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className="text-blue-300 font-bold">{c.tasksCompleted}</span>
                      <span className="text-[#64748b]">/{c.tasksTotal}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded ${
                          c.achievedOutcome === 'achieved'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : c.achievedOutcome === 'partial'
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            : 'bg-[#1c263d] text-[#94a3b8] border border-[#1c263d]'
                        }`}
                      >
                        {c.achievedOutcome === 'achieved'
                          ? 'Atingido'
                          : c.achievedOutcome === 'partial'
                          ? 'Parcial'
                          : 'Em Progresso'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditClient(c)}
                          className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131d33] rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(c.id)}
                          className="p-1 text-[#94a3b8] hover:text-rose-400 hover:bg-[#131d33] rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Add/Edit Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-[#0e1526] border border-[#1c263d] rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1c263d]">
              <h3 className="text-base font-bold text-[#f1f5f9]">
                {editingClient ? 'Editar Mentorado' : 'Adicionar Novo Mentorado'}
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={clientForm.name || ''}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Data de Entrada</label>
                  <input
                    type="date"
                    value={clientForm.startDate || ''}
                    onChange={(e) => setClientForm({ ...clientForm, startDate: e.target.value })}
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Valor Pago (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={clientForm.value || 0}
                    onChange={(e) => setClientForm({ ...clientForm, value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Status da Mentoria</label>
                  <select
                    value={clientForm.status || 'active'}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as MentorshipStatus })}
                    className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Ativo</option>
                    <option value="completed">Concluído</option>
                    <option value="paused">Pausado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1">Objetivo Principal do Cliente</label>
                <input
                  type="text"
                  value={clientForm.target || ''}
                  onChange={(e) => setClientForm({ ...clientForm, target: e.target.value })}
                  placeholder="Ex: Escalar prospecção ativa de 0 para 20 reuniões/mês"
                  className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1">Resultado Esperado vs Alcançado</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={clientForm.achievedOutcome || 'pending'}
                    onChange={(e) => setClientForm({ ...clientForm, achievedOutcome: e.target.value as AchievedOutcome })}
                    className="col-span-1 bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                  >
                    <option value="achieved">Objetivo Atingido</option>
                    <option value="partial">Parcialmente</option>
                    <option value="pending">Em Andamento</option>
                    <option value="none">Sem Resultado</option>
                  </select>
                  <input
                    type="text"
                    value={clientForm.expectedOutcome || ''}
                    onChange={(e) => setClientForm({ ...clientForm, expectedOutcome: e.target.value })}
                    placeholder="Descrição do resultado esperado"
                    className="col-span-2 bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Encontros Realizados / Total</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={clientForm.meetingsCompleted || 0}
                      onChange={(e) => setClientForm({ ...clientForm, meetingsCompleted: parseInt(e.target.value) || 0 })}
                      className="w-1/2 bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[#64748b]">/</span>
                    <input
                      type="number"
                      min={1}
                      value={clientForm.meetingsTotal || 4}
                      onChange={(e) => setClientForm({ ...clientForm, meetingsTotal: parseInt(e.target.value) || 4 })}
                      className="w-1/2 bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1">Tarefas Concluídas / Total</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={clientForm.tasksCompleted || 0}
                      onChange={(e) => setClientForm({ ...clientForm, tasksCompleted: parseInt(e.target.value) || 0 })}
                      className="w-1/2 bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[#64748b]">/</span>
                    <input
                      type="number"
                      min={0}
                      value={clientForm.tasksTotal || 0}
                      onChange={(e) => setClientForm({ ...clientForm, tasksTotal: parseInt(e.target.value) || 0 })}
                      className="w-1/2 bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-1.5 text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1">Implementações Técnicas / Observações</label>
                <textarea
                  rows={2}
                  value={clientForm.implementations || ''}
                  onChange={(e) => setClientForm({ ...clientForm, implementations: e.target.value })}
                  placeholder="Ex: Scripts no Make instalados, automação de WhatsApp funcionando"
                  className="w-full bg-[#131d33] border border-[#1c263d] rounded-lg px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c263d]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94a3b8] hover:text-[#f1f5f9] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all"
                >
                  Salvar Mentorado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
