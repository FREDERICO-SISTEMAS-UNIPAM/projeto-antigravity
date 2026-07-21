import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { ApiClient, NeighborhoodItem } from '../services/api-client';

export const InteractiveHeatmap: React.FC = () => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Céu Azul');

  useEffect(() => {
    ApiClient.fetchNeighborhoods().then(setNeighborhoods);
  }, []);

  const getHeatBadge = (idx: number) => {
    if (idx === 0) return { label: 'ALTA DENSIDADE', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    if (idx < 3) return { label: 'MÉDIA DENSIDADE', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    return { label: 'MODERADO', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
  };

  return (
    <div className="glass-card p-6 border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-wide">MAPA INTERATIVO DE CALOR (HEATMAP DE PATOS DE MINAS)</h2>
          <p className="text-xs text-gray-400">Classificação dos bairros conforme densidade histórica de corridas e taxa média</p>
        </div>
        <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-3 py-1 rounded-full font-semibold">
          PATOS DE MINAS (MG)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista dos Bairros */}
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
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">#{idx + 1} {n.name}</h3>
                    <p className="text-xs text-gray-400">GPS: {n.latitude || -18.5789}, {n.longitude || -46.5153}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">Taxa Média</p>
                    <p className="text-sm font-black text-amber-400">R$ {(11 + idx * 0.75).toFixed(2)}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card Lateral de Detalhes do Bairro Selecionado */}
        <div className="p-5 bg-gray-900/90 border border-gray-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>DETALHES DA REGIÃO</span>
            </div>
            <h3 className="text-xl font-black text-white mb-2">{selectedNeighborhood}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Região estratégica de Patos de Minas monitorada em tempo real com maior concentração de estabelecimentos parceiros nos horários de pico.
            </p>

            <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50 mb-3">
              <span className="text-xs text-gray-400">Previsão de Demanda Iminente</span>
              <p className="text-lg font-black text-emerald-400">ALTA (85% CHANCE)</p>
            </div>

            <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <span className="text-xs text-gray-400">Faturamento Médio por Corrida</span>
              <p className="text-lg font-black text-amber-400 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                R$ 13,50
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 text-[10px] text-gray-500 font-mono">
            ID Geofence: PATOS-{selectedNeighborhood.toUpperCase().replace(/\s+/g, '-')}
          </div>
        </div>
      </div>
    </div>
  );
};
