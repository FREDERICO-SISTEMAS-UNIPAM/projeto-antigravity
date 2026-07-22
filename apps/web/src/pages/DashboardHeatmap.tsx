import React, { useState, useEffect } from 'react';
import { Compass, MapPin, TrendingUp, DollarSign, ShieldAlert, Cpu } from 'lucide-react';
import { ApiClient, NeighborhoodItem } from '../services/api-client';

const RADAR_NEIGHBORHOODS = [
  { name: 'Centro', x: -60, y: -45, color: '#38bdf8', ringColor: '#38bdf8' },
  { name: 'Céu Azul', x: 80, y: 70, color: '#ff3366', ringColor: '#ff3366' },
  { name: 'Rosário', x: -50, y: 60, color: '#ffcc00', ringColor: '#ffcc00' },
  { name: 'Sebastião Amorim', x: 90, y: -30, color: '#00ff66', ringColor: '#00ff66' },
  { name: 'Brasil', x: -20, y: -90, color: '#00ff66', ringColor: '#00ff66' },
  { name: 'Panorâmico', x: 40, y: -60, color: '#00ff66', ringColor: '#00ff66' },
];

export const DashboardHeatmap: React.FC = () => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Céu Azul');

  useEffect(() => {
    ApiClient.fetchNeighborhoods().then(setNeighborhoods);
  }, []);

  const getHeatBadge = (idx: number) => {
    if (idx === 0) return { label: 'CRÍTICO', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
    if (idx < 3) return { label: 'ALTO FLUXO', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'NORMAL', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Radar Tático Integrado */}
      <div className="saas-card p-4 sm:p-6 border border-[#334155]">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">centro de comando do radar de ponto quente</h2>
              <p className="text-[10px] text-slate-400 font-mono">Radar AMD Copilot</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-mono font-bold">
            SCANNER ATIVO: LORA/BLE
          </span>
        </div>

        {/* Display do Radar Tático */}
        <div className="w-full h-80 bg-[#090d16] border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
          {/* Círculos Concêntricos de Grade */}
          <div className="absolute w-72 h-72 rounded-full border border-emerald-500/10" />
          <div className="absolute w-56 h-56 rounded-full border border-emerald-500/20" />
          <div className="absolute w-40 h-40 rounded-full border border-emerald-500/35" />
          <div className="absolute w-24 h-24 rounded-full border border-emerald-500/50" />
          
          {/* Eixos Grid */}
          <div className="absolute w-full h-[1px] bg-emerald-500/15" />
          <div className="absolute w-[1px] h-full bg-emerald-500/15" />

          {/* Linha de Varredura de Radar (Sweep Line) */}
          <div className="absolute w-full h-full inset-0">
            <div className="radar-sweep-line" />
          </div>

          {/* Pontos de Bairros Detectados no Radar */}
          {RADAR_NEIGHBORHOODS.map((n) => {
            const isSelected = selectedNeighborhood === n.name;

            return (
              <button
                key={n.name}
                onClick={() => setSelectedNeighborhood(n.name)}
                style={{
                  transform: `translate(${n.x}px, ${n.y}px)`,
                }}
                className="absolute w-3.5 h-3.5 rounded-full transition-all duration-300 z-20 group hover:scale-125 focus:outline-none flex items-center justify-center"
              >
                {/* Sonar Ripple Wave */}
                <span 
                  style={{ color: n.ringColor }}
                  className="sonar-ripple" 
                />
                <span 
                  style={{ backgroundColor: isSelected ? '#ffffff' : n.color }}
                  className={`w-1.5 h-1.5 rounded-full radar-blip-dot ${
                    isSelected ? 'ring-2 ring-[#00ff66] scale-125' : ''
                  }`} 
                />

                {/* Popover Hover */}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-900 border border-slate-700 text-[10px] text-white rounded font-mono opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
                  {n.name}
                </span>
              </button>
            );
          })}

          {/* Centro Tático com Texto Pulsante solicitado */}
          <div className="absolute flex flex-col items-center justify-center z-20">
            <span className="w-4 h-4 rounded-full bg-emerald-500 status-glow-green animate-ping mb-1" />
            <div className="px-3 py-1.5 bg-[#090d16]/95 border border-emerald-500/60 rounded-lg text-center shadow-lg">
              <span className="text-[10px] sm:text-xs font-black text-[#00ff66] tracking-widest radar-pulse-text uppercase">
                IA DA AMD / Operações
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Bairros Reativo e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {neighborhoods.map((n, idx) => {
            const badge = getHeatBadge(idx);
            const isSelected = selectedNeighborhood === n.name;

            return (
              <div
                key={n.id || n.name}
                onClick={() => setSelectedNeighborhood(n.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  isSelected
                    ? 'bg-emerald-500/10 border-[#00ff66] shadow-md'
                    : 'bg-[#1e293b] border-[#334155] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-[#00ff66]' : 'bg-slate-800 text-slate-400'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{n.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Bairro Geocodificado</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-semibold">Estimativa Média</p>
                    <p className="text-sm font-black text-[#ffcc00]">R$ {(11 + idx * 0.75).toFixed(2)}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card Lateral de Detalhes da Região Selecionada */}
        <div className="saas-card p-6 border border-[#334155] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3 gap-2">
              <div className="flex items-center space-x-2 text-[#00ff66] text-xs font-bold">
                <TrendingUp className="w-4 h-4 animate-pulse" />
                <span>INFO REGIÃO</span>
              </div>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-black tracking-wider uppercase">
                MELHOR ÁREA
              </span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">{selectedNeighborhood}</h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              Região integrada ativamente ao scanner espaço-temporal. Histórico com pico de atividade preditiva gerada pelo motor AMD/Gemini.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">PREVISÃO DE DEMANDA IMINENTE</span>
                <p className="text-sm font-black text-[#00ff66] status-glow-green inline-block px-2 py-0.5 bg-emerald-500/10 rounded">ALTA (85% CHANCE)</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">ESTIMATIVA DE FATURAMENTO</span>
                <p className="text-sm font-black text-[#ffcc00] flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-[#ffcc00]" />
                  R$ 13,50 / corrida
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">SINALIZAÇÃO DO CHAVEIRO BLE</span>
                <p className="text-xs font-mono font-bold text-amber-400">PULSE_YELLOW (HEX: 0xA1011388)</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">ETA MÉDIO DE DESLOCAMENTO</span>
                <p className="text-xs font-bold text-slate-200">6.2 Minutos (Fórmula Haversine)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>DETECTOR_ID: AMD-TACTICAL</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
