import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';
import { ApiClient, IngestionReportResponse } from '../services/api-client';

export const WhatsAppIngestionCard: React.FC = () => {
  const [report, setReport] = useState<IngestionReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await ApiClient.uploadWhatsAppLog(content, file.name);
      setReport(res);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="saas-card p-6 border border-[#334155] mb-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-wide">INGESTOR & PARSER DE LOGS DO WHATSAPP</h2>
          <p className="text-xs text-slate-400">Processamento Regex de arquivos .TXT exportados dos grupos de Patos de Minas (MG)</p>
        </div>
        <span className="text-xs bg-emerald-500/10 text-[#00ff66] border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          DESDUPLICAÇÃO SHA-256 ATIVA
        </span>
      </div>

      {/* Drag & Drop Upload Container */}
      <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors rounded-xl p-8 text-center bg-slate-900/60">
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
          id="whatsapp-log-input"
        />
        <label htmlFor="whatsapp-log-input" className="cursor-pointer flex flex-col items-center justify-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-3">
            <UploadCloud className="w-8 h-8 text-[#00ff66]" />
          </div>
          <p className="text-sm font-bold text-slate-200">Arraste ou clique para enviar o histórico .TXT do WhatsApp</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">Exemplo: entregas_disponiveis.txt, motoboys_disponiveis_mg.txt</p>
        </label>
      </div>

      {loading && (
        <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded-xl text-center text-xs font-bold text-[#00ff66] animate-pulse">
          Lendo histórico de mensagens e executando algoritmo de desduplicação SHA-256...
        </div>
      )}

      {/* Relatório de Processamento */}
      {report && !loading && (
        <div className="mt-6 p-5 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#00ff66]" />
            <h3 className="text-sm font-bold text-white">Relatório de Processamento: {fileName}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Mensagens Lidas</span>
              </div>
              <p className="text-2xl font-black text-white">{report.totalMessagesProcessed}</p>
            </div>

            <div className="p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
                <span>Entregas Válidas Salvas</span>
              </div>
              <p className="text-2xl font-black text-[#00ff66]">{report.requestsCreated}</p>
            </div>

            <div className="p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                <Database className="w-4 h-4 text-[#ffcc00]" />
                <span>Mensagens Descartadas</span>
              </div>
              <p className="text-2xl font-black text-[#ffcc00]">{report.errorsCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
