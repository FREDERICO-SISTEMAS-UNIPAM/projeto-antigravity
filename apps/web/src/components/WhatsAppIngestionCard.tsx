import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
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
    <div className="glass-card p-6 border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-wide">INGESTOR & PARSER DE LOGS DO WHATSAPP</h2>
          <p className="text-xs text-gray-400">Suporte a arquivos .TXT exportados dos grupos de Patos de Minas (MG)</p>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-semibold">
          DESDUPLICAÇÃO SHA-256 ATIVA
        </span>
      </div>

      {/* Área de Drag & Drop / Upload */}
      <div className="border-2 border-dashed border-gray-700 hover:border-emerald-500 transition-colors rounded-2xl p-8 text-center bg-gray-900/40">
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
          id="whatsapp-log-input"
        />
        <label htmlFor="whatsapp-log-input" className="cursor-pointer flex flex-col items-center justify-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-3">
            <Upload className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-gray-200">Clique para selecionar ou arraste o arquivo .TXT de chat do WhatsApp</p>
          <p className="text-xs text-gray-500 mt-1">Exemplo: entregas_disponiveis.txt, motoboys_disponiveis_mg.txt, dn_entregas.txt</p>
        </label>
      </div>

      {loading && (
        <div className="mt-4 p-4 bg-gray-900/80 rounded-xl text-center text-sm font-semibold text-emerald-400 animate-pulse">
          Processando histórico e aplicando desduplicação SHA-256...
        </div>
      )}

      {/* Relatório do Processamento */}
      {report && !loading && (
        <div className="mt-6 p-5 bg-gray-900/90 border border-gray-800 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Relatório de Ingestão: {fileName}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Mensagens Lidas</span>
              </div>
              <p className="text-xl font-black text-white">{report.totalMessagesProcessed}</p>
            </div>

            <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Entregas Extraídas</span>
              </div>
              <p className="text-xl font-black text-emerald-400">{report.requestsCreated}</p>
            </div>

            <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Mensagens Descartadas</span>
              </div>
              <p className="text-xl font-black text-amber-400">{report.errorsCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
