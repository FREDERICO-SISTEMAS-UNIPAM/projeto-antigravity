import React from 'react';
import { Activity, Radio, Cpu } from 'lucide-react';

interface Props {
  activeTab: 'DASHBOARD' | 'INGESTION' | 'ANALYTICS';
  setActiveTab: (tab: 'DASHBOARD' | 'INGESTION' | 'ANALYTICS') => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="glass-card mb-8 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-800">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <Activity className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-wider text-white">DELIVERYBOY AI</h1>
          <p className="text-xs text-gray-400 font-semibold tracking-widest">PATOS DE MINAS (MG) • CO-PILOTO PREDITIVO</p>
        </div>
      </div>

      <nav className="flex space-x-2 my-2 sm:my-0">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'DASHBOARD'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          MONITORAMENTO & HEATMAP
        </button>

        <button
          onClick={() => setActiveTab('INGESTION')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'INGESTION'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          INGESTÃO WHATSAPP
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'ANALYTICS'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          ANÁLISE PREDITIVA (IA)
        </button>
      </nav>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900/80 border border-gray-800 rounded-full text-xs text-gray-300">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">REST & WS OPERACIONAL</span>
        </div>
      </div>
    </header>
  );
};
