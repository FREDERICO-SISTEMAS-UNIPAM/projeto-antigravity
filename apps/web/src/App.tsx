import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { RealtimeEventStream } from './components/RealtimeEventStream';
import { WhatsAppIngestionCard } from './components/WhatsAppIngestionCard';
import { InteractiveHeatmap } from './components/InteractiveHeatmap';
import { PredictiveAnalyticsPanel } from './components/PredictiveAnalyticsPanel';

export function App() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INGESTION' | 'ANALYTICS'>('DASHBOARD');

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'DASHBOARD' && (
          <>
            <RealtimeEventStream />
            <InteractiveHeatmap />
          </>
        )}

        {activeTab === 'INGESTION' && (
          <>
            <WhatsAppIngestionCard />
            <RealtimeEventStream />
          </>
        )}

        {activeTab === 'ANALYTICS' && (
          <>
            <PredictiveAnalyticsPanel />
            <InteractiveHeatmap />
          </>
        )}

        <footer className="mt-12 text-center text-xs text-gray-500 font-medium py-6 border-t border-gray-800/80">
          DeliveryBoy AI © 2026 • Plataforma de Predição Estratégica de Entregas para Patos de Minas (MG)
        </footer>
      </div>
    </div>
  );
}

export default App;
