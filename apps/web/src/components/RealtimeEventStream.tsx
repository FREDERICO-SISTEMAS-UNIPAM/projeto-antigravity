import React, { useState, useEffect } from 'react';
import { Radio, Zap, Send } from 'lucide-react';
import { socketClient, TypingAlertPayload } from '../services/socket-client';
import { ApiClient } from '../services/api-client';

export const RealtimeEventStream: React.FC = () => {
  const [events, setEvents] = useState<TypingAlertPayload[]>([]);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    socketClient.connect();
    const unsubscribe = socketClient.onMerchantTyping((alert) => {
      setEvents((prev) => [alert, ...prev.slice(0, 9)]);
    });

    return () => unsubscribe();
  }, []);

  const handleSimulate = async (restaurantName: string, neighborhood: string) => {
    setSimulating(true);
    await ApiClient.simulateTyping(restaurantName, neighborhood);
    setSimulating(false);
  };

  return (
    <div className="glass-card p-6 border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="pulse-indicator" />
          <h2 className="text-lg font-extrabold text-white tracking-wide">STREAM DE EVENTOS EM TEMPO REAL (WEBSOCKETS)</h2>
        </div>
        <span className="text-xs text-amber-400 font-semibold">PAINEL DE ALERTAS AO VIVO</span>
      </div>

      {/* Botões de Simulação Rápida */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          disabled={simulating}
          onClick={() => handleSimulate('Restaurante Laranjinha', 'Céu Azul')}
          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold transition flex items-center space-x-1"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simular Digitação (Laranjinha - Céu Azul)</span>
        </button>

        <button
          disabled={simulating}
          onClick={() => handleSimulate('Steak Grill Bar', 'Rosário')}
          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold transition flex items-center space-x-1"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simular Digitação (Steak Grill - Rosário)</span>
        </button>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {events.length === 0 ? (
          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl text-center text-gray-500 text-sm font-medium">
            Aguardando transmissões em tempo real... Use os botões acima ou conecte motoboys.
          </div>
        ) : (
          events.map((evt, idx) => (
            <div key={idx} className="p-4 bg-gray-900/80 border border-amber-500/30 rounded-xl flex justify-between items-center animate-fade-in">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">🏪 {evt.restaurantName}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-extrabold text-emerald-400">📍 {evt.neighborhood}</span>
                </div>
                <p className="text-sm font-bold text-gray-200">{evt.message}</p>
                <div className="mt-2 flex items-center space-x-2 text-[10px] text-gray-400">
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Sinal BLE: 0x{evt.bleSignal?.action || 'A1011388'}</span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                <Send className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
