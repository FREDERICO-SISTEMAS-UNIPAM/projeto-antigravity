import React, { useState, useEffect } from 'react';
import { LayoutDashboard, UploadCloud, BrainCircuit, Radio, Activity, X, QrCode, CheckCircle, RefreshCw, LogOut, Briefcase } from 'lucide-react';
import { ApiClient } from '../services/api-client';
import { socketClient } from '../services/socket-client';

interface Props {
  activeTab: 'DASHBOARD' | 'INGESTION' | 'ANALYTICS' | 'INVESTOR';
  setActiveTab: (tab: 'DASHBOARD' | 'INGESTION' | 'ANALYTICS' | 'INVESTOR') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const [waStatus, setWaStatus] = useState<'disconnected' | 'connecting' | 'qr_ready' | 'connected'>('disconnected');
  const [waQr, setWaQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch status inicial do WhatsApp
    ApiClient.getWhatsAppStatus().then((res) => {
      setWaStatus(res.status as any);
      setWaQr(res.qr);
    });

    // 2. Conectar socket
    socketClient.connect();

    // 3. Ouvinte WebSocket para atualizações em tempo real
    const unsubscribe = socketClient.onWhatsAppStatusUpdate((payload) => {
      setWaStatus(payload.status as any);
      setWaQr(payload.qr);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await ApiClient.connectWhatsApp();
      setWaStatus('connecting');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await ApiClient.disconnectWhatsApp();
      setWaStatus('disconnected');
      setWaQr(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay de fundo escuro para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-[#1e293b] border-r border-[#334155] flex flex-col justify-between h-screen fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header da Sidebar */}
          <div className="p-6 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <Activity className="w-6 h-6 text-[#00ff66]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-white">DELIVERYBOY AI</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">PATOS DE MINAS (MG)</p>
              </div>
            </div>

            {/* Botão Fechar no Mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('DASHBOARD');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Radar</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('INGESTION');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'INGESTION'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Ingestão WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ANALYTICS');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Análise Preditiva IA</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('INVESTOR');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'INVESTOR'
                  ? 'bg-emerald-500/15 text-[#00ff66] border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Área do Investidor (Pitch)</span>
            </button>
          </nav>

          {/* Integração WhatsApp Web */}
          <div className="p-4 mx-4 mt-4 bg-[#0f172a]/60 border border-[#334155]/60 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-2 mb-3">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black tracking-widest text-slate-300 uppercase">WhatsApp Web</span>
            </div>

            {waStatus === 'disconnected' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Escaneie o QR Code para que, assim que seus contatos que têm endereço salvo começarem a digitar, seja mostrada no mapa a localização dos mesmos e o nome.
                </p>
                <p className="text-[9px] text-slate-500 leading-relaxed font-semibold italic">
                  As interações serão feitas pelo seu aparelho ou por uma conexão web externa. Suas conversas não são abertas.
                </p>
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-[#00ff66] hover:bg-[#00e65c] active:bg-[#00cc52] text-slate-950 text-[11px] font-black tracking-wider uppercase rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Conectar WhatsApp</span>
                  )}
                </button>
              </div>
            )}

            {waStatus === 'connecting' && (
              <div className="flex flex-col items-center justify-center py-4 space-y-2.5">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-[10px] text-slate-400 font-semibold animate-pulse text-center">Iniciando sessão do WhatsApp...</span>
              </div>
            )}

            {waStatus === 'qr_ready' && waQr && (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-700">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(waQr)}`}
                    alt="WhatsApp QR Code"
                    className="w-[140px] h-[140px]"
                  />
                </div>
                <p className="text-[10px] text-slate-300 text-center leading-relaxed font-semibold">
                  escaneia o qrcode para que assim que seus contatos que tem endereço salvo comecarem a digitar será mostrado no mapa a localização dos mesmos e o nome
                </p>
                <p className="text-[9px] text-slate-500 text-center leading-relaxed italic">
                  As interações do dono do whatsapp serão pelo aparelho dele ou por uma coneção web que ele definir fora do meu programa.
                </p>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}

            {waStatus === 'connected' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-[#00ff66]" />
                  <span className="text-[10px] text-[#00ff66] font-bold uppercase tracking-wider">CONECTADO</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Monitorando atividades de digitação em tempo real.
                </p>
                <p className="text-[9px] text-slate-500 leading-relaxed italic">
                  Suas interações ocorrem fora deste programa. Nenhuma conversa privada é exposta.
                </p>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-[11px] font-black tracking-wider uppercase rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Status da Conexão */}
        <div className="p-4 border-t border-[#334155] bg-slate-900/50">
          <div className="flex items-center space-x-2.5 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-xs">
            <Radio className="w-4 h-4 text-[#00ff66] animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-[#00ff66] text-[11px]">WEBSOCKET ONLINE</span>
              <span className="text-[9px] text-slate-400 font-mono">Porta 3001 • /realtime</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
