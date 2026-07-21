import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, AlertCircle } from 'lucide-react';
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
    <div className="glass-card p-6 border border-gray-800 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Cpu className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide">MOTOR PREDITIVO GOOGLE GEMINI AI</h2>
            <p className="text-xs text-gray-400">Análise espaço-temporal de probabilidade de chamadas por janela de horário</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          <span>GEMINI 2.5 FLASH</span>
        </span>
      </div>

      {/* Seleção do Bairro Atual */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-400 block mb-2">SELECIONE O BAIRRO DE ORIGEM DO MOTOBOY:</label>
        <div className="flex flex-wrap gap-2">
          {['Centro', 'Céu Azul', 'Panorâmico', 'Sebastião Amorim', 'Brasil', 'Rosário'].map((n) => (
            <button
              key={n}
              onClick={() => setCurrentNeighborhood(n)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                currentNeighborhood === n
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                  : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado da Predição */}
      {loading ? (
        <div className="p-6 bg-gray-900/60 border border-gray-800 rounded-xl text-center text-sm font-semibold text-emerald-400 animate-pulse">
          Consultando a IA do Google Gemini e o histórico no PostgreSQL...
        </div>
      ) : (
        prediction && (
          <div className="p-6 bg-gray-900/90 border border-emerald-500/40 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                  RECOMENDAÇÃO DE DESLOCAMENTO
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  VÁ PARA: <span className="text-emerald-400">{prediction.recommendedNeighborhood.toUpperCase()}</span>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 font-semibold block">Probabilidade</span>
                <span className="text-2xl font-black text-emerald-400">{prediction.confidencePercentage}%</span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-4">{prediction.reasoning}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <span className="text-xs text-gray-400 font-semibold">📍 Ponto Estratégico de Espera</span>
                <p className="text-sm font-bold text-white mt-0.5">{prediction.hotspotAddress}</p>
              </div>

              <div className="p-3 bg-gray-800/50 rounded-lg">
                <span className="text-xs text-gray-400 font-semibold">💰 Estimativa da Taxa Média</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">R$ {prediction.expectedAverageFee.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-gray-800/80">
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                <span>Motor: {prediction.engineSource}</span>
              </div>
              <span>Status: Otimização Preditiva Ativa</span>
            </div>
          </div>
        )
      )}
    </div>
  );
};
