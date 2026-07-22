import React from 'react';
import { LayoutDashboard, UploadCloud, BrainCircuit, Radio, Activity, X } from 'lucide-react';

interface Props {
  activeTab: 'DASHBOARD' | 'INGESTION' | 'ANALYTICS';
  setActiveTab: (tab: 'DASHBOARD' | 'INGESTION' | 'ANALYTICS') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay de fundo escuro para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-[#1e293b] border-r border-[#334155] flex flex-col justify-between h-screen fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header da Sidebar */}
          <div className="p-6 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <Activity className="w-6 h-6 text-[#00ff66]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-white">DELIVERYBOY AI</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">PATOS DE MINAS (MG)</p>
              </div>
            </div>

            {/* Botão Fechar no Mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('DASHBOARD');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Radar</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('INGESTION');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'INGESTION'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingestão WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ANALYTICS');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Análise Preditiva IA</span>
            </button>
          </nav>
        </div>

        {/* Footer / Status da Conexão */}
        <div className="p-4 border-t border-[#334155] bg-slate-900/50">
          <div className="flex items-center space-x-2.5 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-xs">
            <Radio className="w-4 h-4 text-[#00ff66] animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-[#00ff66] text-[11px]">WEBSOCKET ONLINE</span>
              <span className="text-[9px] text-slate-400 font-mono">Porta 3001 • /realtime</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
