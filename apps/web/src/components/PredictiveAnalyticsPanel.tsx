import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, MapPin, DollarSign, Activity } from 'lucide-react';
import { ApiClient, AiPredictionResponse } from '../services/api-client';

export const PredictiveAnalyticsPanel: React.FC = () => {
  const [prediction, setPrediction] = useState<AiPredictionResponse | null>(null);
  const [currentNeighborhood, setCurrentNeighborhood] = useState<string>('Centro');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    handlePredict(currentNeighborhood);
  }, [currentNeighborhood]);

  const handlePredict = async (neighborhood: string) => {
    setLoading(true);
    const res = await ApiClient.fetchPrediction(neighborhood);
    setPrediction(res);
    setLoading(false);
  };

  return (
    <div className="saas-card p-6 border border-[#334155] mb-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <BrainCircuit className="w-6 h-6 text-[#00ff66]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-wide">MOTOR PREDITIVO GOOGLE GEMINI AI</h2>
            <p className="text-xs text-slate-400">Análise espaço-temporal de densidade de chamadas por janela de horário</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-500/10 text-[#00ff66] border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          GEMINI 2.5 FLASH
        </span>
      </div>

      {/* Seleção do Bairro de Origem */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-400 block mb-2 font-mono">SELECIONE O BAIRRO ATUAL DO MOTOBOY:</label>
        <div className="flex flex-wrap gap-2">
          {['Centro', 'Céu Azul', 'Panorâmico', 'Sebastião Amorim', 'Brasil', 'Rosário'].map((n) => (
            <button
              key={n}
              onClick={() => setCurrentNeighborhood(n)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentNeighborhood === n
                  ? 'bg-emerald-500/20 text-[#00ff66] border border-emerald-500 status-glow-green'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Card da Predição */}
      {loading ? (
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-center text-xs font-bold text-[#00ff66] animate-pulse">
          Consultando a API do Google Gemini e o histórico PostgreSQL...
        </div>
      ) : (
        prediction && (
          <div className="p-6 bg-slate-900/90 border border-emerald-500/40 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00ff66] uppercase bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                  RECOMENDAÇÃO DE DESLOCAMENTO
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  VÁ PARA: <span className="text-[#00ff66]">{prediction.recommendedNeighborhood.toUpperCase()}</span>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Probabilidade</span>
                <span className="text-2xl font-black text-[#00ff66]">{prediction.confidencePercentage}%</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">{prediction.reasoning}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="p-3 bg-[#1e293b] rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 font-semibold flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#00ff66]" /> Ponto Estratégico de Espera
                </span>
                <p className="text-sm font-bold text-white mt-1">{prediction.hotspotAddress}</p>
              </div>

              <div className="p-3 bg-[#1e293b] rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 font-semibold flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-[#ffcc00]" /> Estimativa da Taxa Média
                </span>
                <p className="text-sm font-bold text-[#ffcc00] mt-1">R$ {prediction.expectedAverageFee.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
