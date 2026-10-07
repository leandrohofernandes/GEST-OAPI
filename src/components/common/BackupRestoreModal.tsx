import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    try {
      const dataStr = storageService.exportBackupJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-gestao-api-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: 'Backup JSON baixado com sucesso!' });
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Erro ao gerar arquivo de backup.' });
    }
  };

  const handleDownloadCSV = () => {
    try {
      const csvStr = storageService.exportCSV();
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-metricas-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: 'Relatório CSV exportado com sucesso!' });
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Erro ao gerar relatório CSV.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = storageService.importBackupJSON(content);
        if (result.success) {
          setStatusMessage({ type: 'success', text: 'Dados restaurados com sucesso!' });
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 1000);
        } else {
          setStatusMessage({ type: 'error', text: result.message });
        }
      }
    };
    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: 'Falha ao ler arquivo.' });
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#0e1526] border border-[#1c263d] rounded-2xl shadow-2xl shadow-blue-950/40 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1c263d]">
          <div>
            <h2 className="text-base font-bold text-slate-100">Exportação e Backup</h2>
            <p className="text-xs text-slate-400">Preserve e sincronize seus dados locais</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#131d33] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-950/40 border border-red-800/60 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-3.5">
          {/* JSON Backup Button */}
          <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-100">Backup Completo (JSON)</h4>
              <p className="text-[11px] text-slate-400">
                Download de todos os meses, histórico, clientes e configurações.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              Baixar JSON
            </button>
          </div>

          {/* CSV Export Button */}
          <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-100">Planilha Analítica (CSV)</h4>
              <p className="text-[11px] text-slate-400">
                Exportar tabela com linha temporal de todos os meses cadastrados.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1526] hover:bg-[#1a2642] text-slate-200 border border-[#1c263d] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Exportar CSV
            </button>
          </div>

          {/* Restore JSON */}
          <div className="p-4 rounded-xl bg-[#131d33] border border-[#1c263d] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-100">Restaurar Backup</h4>
              <p className="text-[11px] text-slate-400">
                Importar arquivo .json gerado anteriormente.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Importar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#1c263d] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-[#131d33] rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
