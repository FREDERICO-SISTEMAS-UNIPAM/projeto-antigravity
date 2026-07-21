import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RealtimeConsoleTerminal } from './components/RealtimeConsoleTerminal';
import { NeighborhoodsMapGrid } from './components/NeighborhoodsMapGrid';
import { WhatsAppIngestionCard } from './components/WhatsAppIngestionCard';
import { PredictiveAnalyticsPanel } from './components/PredictiveAnalyticsPanel';
import { TrendingUp, Package, ShieldCheck, DollarSign } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INGESTION' | 'ANALYTICS'>('DASHBOARD');

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex">
      {/* Sidebar Fixa à Esquerda */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área Principal com Margem Esquerda equivalente à Sidebar (ml-64) */}
      <main className="flex-1 ml-64 p-8 max-w-7xl">
        {/* Top Header Metrics Bar */}
        <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Painel de Controle Executivo</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Visão geral em tempo real • Patos de Minas (MG)</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono bg-[#1e293b] border border-[#334155] text-slate-300 px-3 py-1.5 rounded-lg">
              Status do Servidor: <strong className="text-[#00ff66]">Saudável</strong>
            </span>
          </div>
        </header>

        {/* 4 Cards de Métricas Rápidas (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Total de Entregas</span>
              <span className="text-xl font-black text-white">34 Válidas</span>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Desduplicação SHA-256</span>
              <span className="text-xl font-black text-[#00ff66]">100% Taxa</span>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-[#00ff66] rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Acurácia Preditiva IA</span>
              <span className="text-xl font-black text-white">85% Precisão</span>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Ticket Médio por Corrida</span>
              <span className="text-xl font-black text-[#ffcc00]">R$ 13,50</span>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-[#ffcc00] rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        {activeTab === 'DASHBOARD' && (
          <>
            <RealtimeConsoleTerminal />
            <NeighborhoodsMapGrid />
          </>
        )}

        {activeTab === 'INGESTION' && (
          <>
            <WhatsAppIngestionCard />
            <RealtimeConsoleTerminal />
          </>
        )}

        {activeTab === 'ANALYTICS' && (
          <>
            <PredictiveAnalyticsPanel />
            <NeighborhoodsMapGrid />
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-500 font-medium py-6 border-t border-slate-800">
          DeliveryBoy AI © 2026 • Plataforma SaaS Preditiva de Entregas para Patos de Minas (MG)
        </footer>
      </main>
    </div>
  );
}

export default App;
