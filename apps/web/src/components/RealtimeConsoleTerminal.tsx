import React, { useState, useEffect } from 'react';
import { Terminal, Zap, Play, Radio, Shield } from 'lucide-react';
import { socketClient, TypingAlertPayload } from '../services/socket-client';
import { ApiClient } from '../services/api-client';

export const RealtimeConsoleTerminal: React.FC = () => {
  const [logs, setLogs] = useState<TypingAlertPayload[]>([]);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    socketClient.connect();
    const unsubscribe = socketClient.onMerchantTyping((alert) => {
      setLogs((prev) => [alert, ...prev.slice(0, 9)]);
    });
    return () => unsubscribe();
  }, []);

  const handleSimulate = async (restaurantName: string, neighborhood: string) => {
    setSimulating(true);
    await ApiClient.simulateTyping(restaurantName, neighborhood);
    setSimulating(false);
  };

  return (
    <div className="saas-card overflow-hidden border border-[#334155] mb-8">
      {/* Console Terminal Header */}
      <div className="bg-slate-900 border-b border-[#334155] px-5 py-3.5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center space-x-2 text-slate-300 font-mono text-xs font-bold pl-2 border-l border-slate-700">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>REALTIME_WEBSOCKET_CONSOLE_V2.0</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] bg-emerald-500/10 text-[#00ff66] border border-emerald-500/30 px-2.5 py-1 rounded-md font-mono font-bold flex items-center">
            <Radio className="w-3 h-3 mr-1 animate-pulse" />
            LIVE STREAM
          </span>
        </div>
      </div>

      <div className="p-6 bg-[#090d16]">
        {/* Controles de Disparo de Alertas em Tempo Real */}
        <div className="mb-4 pb-4 border-b border-slate-800 flex flex-wrap gap-2 items-center justify-between">
          <span className="text-xs font-mono text-slate-400">DISPARAR EVENTO DE TESTE NO CLIENTE:</span>
          <div className="flex space-x-2">
            <button
              disabled={simulating}
              onClick={() => handleSimulate('Restaurante Laranjinha', 'Céu Azul')}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-[#ffcc00] rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simular Laranjinha (Céu Azul)</span>
            </button>

            <button
              disabled={simulating}
              onClick={() => handleSimulate('Steak Grill Bar', 'Rosário')}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-[#ffcc00] rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simular Steak Grill (Rosário)</span>
            </button>
          </div>
        </div>

        {/* Display do Terminal de Logs */}
        <div className="font-mono text-xs space-y-2.5 max-h-72 overflow-y-auto pr-2">
          {logs.length === 0 ? (
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-lg text-center text-slate-500">
              [SYSTEM_INFO] Conectado ao namespace /realtime. Aguardando novos eventos de empresários...
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-lg flex justify-between items-center animate-fade-in">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">[EVENT_RECV]</span>
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-amber-400 font-bold uppercase">• {log.restaurantName}</span>
                    <span className="text-slate-400">({log.neighborhood})</span>
                  </div>
                  <p className="text-slate-200 font-semibold">{log.message}</p>
                </div>
                <div className="text-right font-mono text-[10px]">
                  <span className="px-2 py-1 bg-amber-500/20 text-[#ffcc00] rounded border border-amber-500/40 font-bold block">
                    BLE: 0x{log.bleSignal?.action || 'A1011388'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
