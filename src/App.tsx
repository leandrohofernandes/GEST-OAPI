import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Megaphone,
  ShoppingCart,
  Award,
  DollarSign,
  History,
  Settings,
  Menu,
  X,
  Download,
  GitCompare,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MonthData, AppSettings } from './types';
import { storageService } from './services/storageService';
import { formatMonthName } from './utils/calculations';
import { DateSelector } from './components/common/DateSelector';
import { ComparisonModal } from './components/common/ComparisonModal';
import { NewMonthModal } from './components/common/NewMonthModal';
import { DataInputModal } from './components/common/DataInputModal';
import { BackupRestoreModal } from './components/common/BackupRestoreModal';

// Pages
import { BentoDashboard } from './components/dashboard/BentoDashboard';
import { ProductsPage } from './pages/ProductsPage';
import { AcquisitionPage } from './pages/AcquisitionPage';
import { SalesPage } from './pages/SalesPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { FinancialPage } from './pages/FinancialPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'acquisition'
  | 'sales'
  | 'mentorship'
  | 'financial'
  | 'history'
  | 'settings';

export default function App() {
  // Application Data States
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [allMonths, setAllMonths] = useState<Record<string, MonthData>>(() => storageService.getAllMonths());

  // Current selected period defaults to current date
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isDataInputModalOpen, setIsDataInputModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Reload months whenever storage changes
  const refreshStorageData = () => {
    setSettings(storageService.getSettings());
    setAllMonths(storageService.getAllMonths());
  };

  const currentMonthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
  
  // Ensure active month exists or get from storage
  const currentMonthData: MonthData =
    allMonths[currentMonthKey] || storageService.getMonth(selectedYear, selectedMonth);

  // Determine chronological previous month
  const sortedKeys = Object.keys(allMonths).sort();
  const currentIndex = sortedKeys.indexOf(currentMonthKey);
  const previousMonthKey = currentIndex > 0 ? sortedKeys[currentIndex - 1] : null;
  const previousMonthData = previousMonthKey ? allMonths[previousMonthKey] : null;

  // Handlers for month selection & creation
  const handleSelectPeriod = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    // ensure month exists in storage
    storageService.getMonth(year, month);
    setAllMonths(storageService.getAllMonths());
  };

  const handleMonthCreated = (newMonth: MonthData) => {
    storageService.saveMonth(newMonth);
    setAllMonths(storageService.getAllMonths());
    setSelectedYear(newMonth.year);
    setSelectedMonth(newMonth.month);
  };

  const handleSaveMonthData = (updated: MonthData) => {
    storageService.saveMonth(updated);
    setAllMonths(storageService.getAllMonths());
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    storageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleClearAllData = () => {
    storageService.clearAllData();
    refreshStorageData();
    const currentNow = new Date();
    setSelectedYear(currentNow.getFullYear());
    setSelectedMonth(currentNow.getMonth() + 1);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produtos', icon: Layers },
    { id: 'acquisition', label: 'Aquisição', icon: Megaphone },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'mentorship', label: 'Mentoria', icon: Award },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080c18] text-[#f1f5f9] flex flex-col selection:bg-blue-600/40 selection:text-white">
      {/* ========================================================================= */}
      {/* TOP BAR / APP HEADER (Clean 3-Zone SaaS Contract)                          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0a101f]/95 backdrop-blur-md border-b border-[#1c263d] px-4 sm:px-6 py-3 shadow-sm shadow-blue-950/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark & Operation Descriptor */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131d33] rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <img
                src="/lereon_strategy_favicon_512.png"
                alt="Gestão API"
                className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-sm font-extrabold tracking-tight text-[#f1f5f9] block leading-tight group-hover:text-blue-400 transition-colors">
                  Gestão API
                </span>
                <span className="text-[10px] font-mono text-blue-400/90 block leading-tight font-medium">
                  Educação + Serviços
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Period Controls (DateSelector + Compare) */}
          <div className="flex items-center gap-2">
            <DateSelector
              currentYear={selectedYear}
              currentMonth={selectedMonth}
              onSelectPeriod={handleSelectPeriod}
              availableMonthKeys={Object.keys(allMonths)}
              onOpenNewMonthModal={() => setIsNewMonthModalOpen(true)}
            />

            <button
              type="button"
              onClick={() => setIsComparisonModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-[#0e1526] hover:bg-[#131d33] text-[#f1f5f9] border border-[#1c263d] hover:border-blue-500/40 rounded-lg text-xs font-semibold transition-all shadow-sm"
              title="Comparar com outro mês"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-400" />
              <span>Comparar</span>
            </button>
          </div>

          {/* Zone 3: Export & Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-[#0e1526] hover:bg-[#131d33] text-[#f1f5f9] border border-[#1c263d] hover:border-blue-500/40 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDataInputModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/35 transition-all hover:shadow-blue-500/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lançar Dados</span>
              <span className="sm:hidden">Dados</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECONDARY NAVIGATION BAR (Desktop Links & Mobile Drawer)                 */}
      {/* ========================================================================= */}
      <nav className="bg-[#0c1222] border-b border-[#1c263d] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id as NavTab);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#131d33] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-[#64748b]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu (if expanded) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1222] border-b border-[#1c263d] p-4 space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#1c263d]">
            <button
              type="button"
              onClick={() => {
                setIsComparisonModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#0e1526] border border-[#1c263d] text-xs font-semibold text-[#f1f5f9] hover:border-blue-500/40"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-400" />
              Comparar Períodos
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBackupModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#0e1526] border border-[#1c263d] text-xs font-semibold text-[#f1f5f9] hover:border-blue-500/40"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Backup / Exportar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT / PAGE CONTENT                                              */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <BentoDashboard
            currentMonth={currentMonthData}
            previousMonth={previousMonthData}
            allMonths={allMonths}
            settings={settings}
            onOpenDataInput={() => setIsDataInputModalOpen(true)}
            onSelectPeriod={handleSelectPeriod}
            onOpenComparison={() => setIsComparisonModalOpen(true)}
          />
        )}

        {activeTab === 'products' && (
          <ProductsPage
            currentMonth={currentMonthData}
            settings={settings}
            onOpenDataInput={() => setIsDataInputModalOpen(true)}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'acquisition' && (
          <AcquisitionPage
            currentMonth={currentMonthData}
            settings={settings}
            onOpenDataInput={() => setIsDataInputModalOpen(true)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesPage
            currentMonth={currentMonthData}
            settings={settings}
            onOpenDataInput={() => setIsDataInputModalOpen(true)}
          />
        )}

        {activeTab === 'mentorship' && (
          <MentorshipPage
            currentMonth={currentMonthData}
            settings={settings}
            onUpdateMonth={handleSaveMonthData}
            onOpenDataInput={() => setIsDataInputModalOpen(true)}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialPage
            currentMonth={currentMonthData}
            settings={settings}
            onOpenDataInput={() => setIsDataInputModalOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            allMonths={allMonths}
            currentMonthId={currentMonthKey}
            settings={settings}
            onSelectPeriod={(y, m) => {
              handleSelectPeriod(y, m);
              setActiveTab('dashboard');
            }}
            onOpenNewMonthModal={() => setIsNewMonthModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* ========================================================================= */}
      {/* QUIET FOOTER                                                              */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#1c263d] py-4 px-6 text-center text-xs font-mono text-[#64748b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/lereon_strategy_favicon_512.png" alt="Gestão API" className="w-4 h-4 object-contain" />
            <span>Gestão API · Educação + Serviços</span>
          </div>
          <span>Armazenamento local persistido</span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS                                                         */}
      {/* ========================================================================= */}
      <DataInputModal
        isOpen={isDataInputModalOpen}
        onClose={() => setIsDataInputModalOpen(false)}
        monthData={currentMonthData}
        settings={settings}
        onSave={handleSaveMonthData}
      />

      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        months={allMonths}
        defaultMonthAId={previousMonthKey || currentMonthKey}
        defaultMonthBId={currentMonthKey}
        settings={settings}
      />

      <NewMonthModal
        isOpen={isNewMonthModalOpen}
        onClose={() => setIsNewMonthModalOpen(false)}
        existingMonthKeys={Object.keys(allMonths)}
        products={settings.products}
        settings={settings}
        onMonthCreated={handleMonthCreated}
      />

      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={refreshStorageData}
      />
    </div>
  );
}
