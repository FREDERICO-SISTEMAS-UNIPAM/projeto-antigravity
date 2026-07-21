import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, Layers, Compass, ShieldCheck } from 'lucide-react';
import { ApiClient, NeighborhoodItem } from '../services/api-client';

export const NeighborhoodsMapGrid: React.FC = () => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Céu Azul');

  useEffect(() => {
    ApiClient.fetchNeighborhoods().then(setNeighborhoods);
  }, []);

  const getHeatBadge = (idx: number) => {
    if (idx === 0) return { label: 'ALTA DENSIDADE', color: 'bg-emerald-500/15 text-[#00ff66] border-emerald-500/40 status-glow-green' };
    if (idx < 3) return { label: 'MÉDIA DENSIDADE', color: 'bg-amber-500/15 text-[#ffcc00] border-amber-500/40 status-glow-yellow' };
    return { label: 'MODERADO', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' };
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Visualização de Container do Mapa Escuro Stilizado */}
      <div className="saas-card p-6 border border-[#334155]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white tracking-wide">MAPA DE CALOR ESPAÇO-TEMPORAL (PATOS DE MINAS - MG)</h2>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-bold">
            LAT -18.5789 | LON -46.5153
          </span>
        </div>

        {/* Simulação Visual de Mapa Escuro Grafite */}
        <div className="w-full h-48 bg-[#090d16] border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex flex-wrap justify-center gap-4 text-center">
            {neighborhoods.slice(0, 5).map((n, i) => (
              <div
                key={n.name}
                onClick={() => setSelectedNeighborhood(n.name)}
                className={`p-3 rounded-lg border cursor-pointer transition transform hover:scale-105 ${
                  selectedNeighborhood === n.name
                    ? 'bg-emerald-500/20 border-[#00ff66] text-white status-glow-green'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold">
                  <MapPin className={`w-3.5 h-3.5 ${i === 0 ? 'text-[#00ff66]' : 'text-amber-400'}`} />
                  <span>{n.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  R$ {(11 + i * 0.75).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Cards de Bairros + Painel Lateral de Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {neighborhoods.map((n, idx) => {
            const badge = getHeatBadge(idx);
            const isSelected = selectedNeighborhood === n.name;

            return (
              <div
                key={n.id || n.name}
                onClick={() => setSelectedNeighborhood(n.name)}
                className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-center ${
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
                    <h3 className="text-sm font-bold text-white">#{idx + 1} {n.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">GPS: {n.latitude || -18.5789}, {n.longitude || -46.5153}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-semibold">Taxa Média</p>
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

        {/* Card Lateral de Detalhes */}
        <div className="saas-card p-6 border border-[#334155] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#00ff66] text-xs font-bold mb-3">
              <TrendingUp className="w-4 h-4" />
              <span>DETALHES DA REGIÃO</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{selectedNeighborhood}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Região monitorada pelo algoritmo espaço-temporal com alta densidade de pedidos nos horários de pico noturnos em Patos de Minas (MG).
            </p>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80 mb-4">
              <span className="text-xs text-slate-400 block font-semibold mb-1">Previsão de Demanda Iminente</span>
              <p className="text-lg font-black text-[#00ff66]">ALTA (85% CHANCE)</p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/80">
              <span className="text-xs text-slate-400 block font-semibold mb-1">Faturamento Médio Estimado</span>
              <p className="text-lg font-black text-[#ffcc00] flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-[#ffcc00]" />
                R$ 13,50 / corrida
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>PATOS-{selectedNeighborhood.toUpperCase().replace(/\s+/g, '-')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
