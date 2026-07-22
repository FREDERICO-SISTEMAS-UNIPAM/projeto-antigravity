import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RealtimeConsoleTerminal } from './components/RealtimeConsoleTerminal';
import { DashboardHeatmap } from './pages/DashboardHeatmap';
import { WhatsAppIngestionCard } from './components/WhatsAppIngestionCard';
import { PredictiveAnalyticsPanel } from './components/PredictiveAnalyticsPanel';
import { TrendingUp, Package, ShieldCheck, DollarSign, Menu, Activity } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INGESTION' | 'ANALYTICS'>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col md:flex-row relative">
      {/* Sidebar Fixa à Esquerda (Desktop) / Slide-out (Mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Top Bar Mobile (Exibido apenas em Celulares/Tablets) */}
      <header className="md:hidden bg-[#1e293b] border-b border-[#334155] px-6 py-4 flex items-center justify-between fixed top-0 left-0 w-full z-30">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-[#00ff66]" />
          <span className="text-sm font-black tracking-wider text-white">DELIVERYBOY AI</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Área Principal - Padding-top adicionado no mobile para não cortar sob a topbar */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl md:ml-64 mt-16 md:mt-0 w-full overflow-x-hidden">
        {/* Header Desktop */}
        <header className="hidden md:flex justify-between items-center mb-8 gap-4">
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

        {/* 4 Cards de Métricas Rápidas (KPIs) - 1 coluna no celular, 2 em tablet, 4 no desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block">Total de Entregas</span>
              <span className="text-lg sm:text-xl font-black text-white">34 Válidas</span>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block">Desduplicação SHA-256</span>
              <span className="text-lg sm:text-xl font-black text-[#00ff66]">100% Taxa</span>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-[#00ff66] rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block">Acurácia Preditiva IA</span>
              <span className="text-lg sm:text-xl font-black text-white">85% Precisão</span>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="saas-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block">Ticket Médio por Corrida</span>
              <span className="text-lg sm:text-xl font-black text-[#ffcc00]">R$ 13,50</span>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-[#ffcc00] rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <RealtimeConsoleTerminal />
            <DashboardHeatmap />
          </div>
        )}

        {activeTab === 'INGESTION' && (
          <div className="space-y-6">
            <WhatsAppIngestionCard />
            <RealtimeConsoleTerminal />
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <PredictiveAnalyticsPanel />
            <DashboardHeatmap />
          </div>
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
