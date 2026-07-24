import React, { useState, useEffect } from 'react';
import { Compass, MapPin, TrendingUp, DollarSign, ShieldAlert, Cpu, LogOut, QrCode, User, Store, AlertTriangle } from 'lucide-react';
import { ApiClient, NeighborhoodItem } from '../services/api-client';
import { socketClient } from '../services/socket-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';



const ESTABLISHMENTS = [
  { id: '5534996972929', name: 'Steak Grill Bar', lat: -18.5850, lng: -46.5120, icon: '/logos/media__1784629913070.png' },
  { id: '556593259654', name: 'Sangreal Burguer!', lat: -18.5780, lng: -46.5130, icon: '/logos/media__1784630556152.png' },
  { id: 'ebimaki-sushi', name: 'Ebimaki Sushi', lat: -18.5750, lng: -46.5190, icon: '/logos/media__1784631637300.png' },
  { id: 'pizzaria-di-roma', name: 'Pizzaria Di Roma', lat: -18.5789, lng: -46.5153, icon: '/logos/media__1784631897861.png' },
  { id: '553496716021', name: 'Point Do Sorvete', lat: -18.6050, lng: -46.4850, icon: '/logos/media__1784632056475.png' },
  { id: 'bells-burguer', name: 'Bells Burguer', lat: -18.6010, lng: -46.5050, icon: '/logos/media__1784632229727.png' },
  { id: 'emporio-copacabana', name: 'Emporio Copacabana', lat: -18.5900, lng: -46.5080, icon: '/logos/media__1784632467719.png' },
  { id: 'whatsbeer', name: 'Whatsbeer', lat: -18.5755, lng: -46.5100, icon: '/logos/media__1784632697714.png' },
  { id: '553498266106', name: 'Dubai Lanches', lat: -18.6145, lng: -46.5050, icon: '/logos/media__1784634521177.png' },
  { id: '553496798638', name: 'Borracharia 034 / Carlos', lat: -18.5820, lng: -46.5080, icon: '/logos/media__1784632697714.png' },
  { id: '553498812152', name: 'IGOOD😎', lat: -18.5755, lng: -46.5100, icon: '/logos/media__1784632697714.png' }
];

export interface TypingHistoryItem {
  name: string;
  phone: string;
  time: string;
  status: 'contato' | 'estabelecimento' | 'desconhecido';
  neighborhood?: string;
}

export const DashboardHeatmap: React.FC = () => {
  const [vcfContacts, setVcfContacts] = useState<any[]>([]);
  const [activeVcfMarkers, setActiveVcfMarkers] = useState<Record<string, { name: string; lat: number; lng: number; address: string; timestamp: number }>>({});
  const [activeEstablishmentMarkers, setActiveEstablishmentMarkers] = useState<Record<string, { id: string; name: string; lat: number; lng: number; icon: string; timestamp: number }>>({});
  const [realtimeLogs, setRealtimeLogs] = useState<string[]>([]);
  
  // Estados do WhatsApp
  const [waStatus, setWaStatus] = useState<'disconnected' | 'connecting' | 'qr_ready' | 'connected'>('disconnected');
  const [waOwnerName, setWaOwnerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typingHistory, setTypingHistory] = useState<TypingHistoryItem[]>([]);



  useEffect(() => {
    fetch('/contacts-with-addresses.json')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar os contatos do VCF.');
        return res.json();
      })
      .then(setVcfContacts)
      .catch((err) => console.warn(err.message));
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setRealtimeLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 4)]);
  };

  // Carrega status e ouve atualizações do WhatsApp
  useEffect(() => {
    ApiClient.getWhatsAppStatus().then((res) => {
      setWaStatus(res.status as any);
      setWaOwnerName(res.ownerName || null);
    });

    const unsubscribeStatus = socketClient.onWhatsAppStatusUpdate((payload) => {
      setWaStatus(payload.status as any);
      setWaOwnerName(payload.ownerName || null);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await ApiClient.disconnectWhatsApp();
      setWaStatus('disconnected');
      setWaOwnerName(null);
      addLog('🔌 Conexão física com WhatsApp desconectada pelo usuário.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socketClient.connect();
    addLog('🔌 Conectado ao barramento de eventos websockets em tempo real.');

    const unsubscribe = socketClient.onRestaurantTyping((payload) => {
      const { restaurantId } = payload;
      
      const matchedEst = ESTABLISHMENTS.find(
        (e) =>
          e.id === restaurantId ||
          e.name.toLowerCase() === restaurantId.toLowerCase() ||
          restaurantId.toLowerCase().includes(e.id)
      );

      if (matchedEst) {
        addLog(`⚡ Estabelecimento "${matchedEst.name}" digitando. Exibindo no mapa...`);
        
        // Adiciona ao histórico de digitação
        setTypingHistory((prev) => [
          {
            name: matchedEst.name,
            phone: matchedEst.id,
            time: new Date().toLocaleTimeString(),
            status: 'estabelecimento',
            neighborhood: 'Patos de Minas (Central)'
          },
          ...prev.slice(0, 19)
        ]);

        setActiveEstablishmentMarkers((prev) => ({
          ...prev,
          [matchedEst.id]: {
            id: matchedEst.id,
            name: matchedEst.name,
            lat: matchedEst.lat,
            lng: matchedEst.lng,
            icon: matchedEst.icon,
            timestamp: Date.now()
          }
        }));

        setTimeout(() => {
          setActiveEstablishmentMarkers((prev) => {
            const updated = { ...prev };
            delete updated[matchedEst.id];
            return updated;
          });
        }, 5000);
      } else {
        const cleanId = restaurantId.replace(/\D/g, '');
        const matchedContact = vcfContacts.find(
          (c) => c.phone === cleanId || cleanId.includes(c.phone) || c.phone.includes(cleanId)
        );

        if (matchedContact) {
          addLog(`📱 Contato da agenda "${matchedContact.name}" digitando. Exibindo no mapa...`);
          
          // Adiciona ao histórico de digitação
          setTypingHistory((prev) => [
            {
              name: matchedContact.name,
              phone: matchedContact.phone,
              time: new Date().toLocaleTimeString(),
              status: 'contato',
              neighborhood: matchedContact.neighborhood || 'Patos de Minas'
            },
            ...prev.slice(0, 19)
          ]);

          setActiveVcfMarkers((prev) => ({
            ...prev,
            [matchedContact.phone]: {
              name: matchedContact.name,
              lat: matchedContact.lat,
              lng: matchedContact.lng,
              address: matchedContact.address,
              timestamp: Date.now(),
            },
          }));

          setTimeout(() => {
            setActiveVcfMarkers((prev) => {
              const updated = { ...prev };
              delete updated[matchedContact.phone];
              return updated;
            });
          }, 5000);
        } else {
          addLog(`⚠️ Evento de digitação recebido do número ${restaurantId} (Ocultado do mapa: sem endereço na agenda VCF).`);
          
          // Adiciona ao histórico de digitação (desconhecido/ignorado)
          setTypingHistory((prev) => [
            {
              name: 'Contato Desconhecido',
              phone: restaurantId,
              time: new Date().toLocaleTimeString(),
              status: 'desconhecido'
            },
            ...prev.slice(0, 19)
          ]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [vcfContacts]);



  const createCustomIcon = (est: typeof ESTABLISHMENTS[0] | any, isTyping: boolean) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative group">
          <div class="w-8 h-8 rounded-full border-2 bg-slate-900 overflow-hidden flex items-center justify-center transition-all duration-300 relative ${
            isTyping
              ? 'border-[#00ff66] neon-typing-pulse scale-110 shadow-lg shadow-[#00ff66]/50'
              : 'border-slate-600 hover:border-slate-300'
          }">
            <img src="${est.icon}" alt="${est.name}" class="w-full h-full object-cover" />
            ${isTyping ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff66] rounded-full border border-slate-950 animate-ping"></span>' : ''}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createContactIcon = (name: string, isTyping: boolean) => {
    const initials = name.substring(0, 2).toUpperCase() || 'CT';
    return L.divIcon({
      className: 'custom-contact-marker',
      html: `
        <div class="relative group">
          <div class="w-8 h-8 rounded-full border-2 bg-[#090d16] border-[#00ff66] overflow-hidden flex items-center justify-center transition-all duration-300 relative ${
            isTyping ? 'neon-typing-pulse scale-110 shadow-lg shadow-[#00ff66]/50' : 'border-slate-500'
          }">
            <span class="text-[10px] font-black text-white font-mono">${initials}</span>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ff66] rounded-full border border-slate-950 animate-ping"></span>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
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

          <div className="flex items-center space-x-3">
            {waStatus === 'connected' ? (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] status-glow-green animate-ping" />
                <span className="text-[11px] font-black text-white tracking-wide">
                  CONECTADO: <span className="text-[#00ff66]">{waOwnerName || 'Dono do WhatsApp'}</span>
                </span>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  title="Desconectar WhatsApp"
                  className="p-1 hover:bg-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-[11px] font-bold text-slate-400">WhatsApp Offline</span>
              </div>
            )}

            <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-mono font-bold">
              SCANNER ATIVO: LORA/BLE
            </span>
          </div>
        </div>

        {/* Display do Radar Tático (Mapa Leaflet Interativo) */}
        <div className="w-full h-96 bg-[#090d16] border border-slate-800 rounded-xl relative overflow-hidden">
          <MapContainer
            center={[-18.5789, -46.5181]}
            zoom={14}
            zoomControl={true}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', zIndex: 10 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />



            {/* Estabelecimentos Padrão Ativos */}
            {Object.values(activeEstablishmentMarkers).map((est) => {
              return (
                <Marker
                  key={est.id}
                  position={[est.lat, est.lng]}
                  icon={createCustomIcon(est, true)}
                >
                  <Popup>
                    <div className="text-xs font-mono text-slate-200">
                      <p className="font-bold">{est.name}</p>
                      <p className="text-[10px] text-slate-400">Lat: {est.lat}, Lng: {est.lng}</p>
                      <p className="text-[#00ff66] font-bold animate-pulse mt-0.5">DIGITANDO...</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Contatos VCF Ativos */}
            {Object.entries(activeVcfMarkers).map(([phone, contact]) => {
              return (
                <Marker
                  key={phone}
                  position={[contact.lat, contact.lng]}
                  icon={createContactIcon(contact.name, true)}
                >
                  <Popup>
                    <div className="text-xs font-mono text-slate-200">
                      <p className="font-bold text-[#00ff66]">📱 CONTATO VCF DIGITANDO</p>
                      <p className="font-bold text-white mt-0.5">{contact.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{contact.address}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Tel: {phone}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Centro Tático com Texto Pulsante */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end justify-center pointer-events-none">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 status-glow-green animate-ping" />
              <span className="text-[9px] font-mono text-slate-300 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded uppercase">
                IA DA AMD / Operações
              </span>
            </div>
          </div>
        </div>

        {/* Relação de Contatos que digitaram (logo abaixo do mapa) */}
        <div className="mt-4 p-5 bg-[#090d16] rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <QrCode className="w-4 h-4 text-[#00ff66]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Histórico de Contatos que Digitaram</h3>
            </div>
            <span className="text-[9px] text-slate-500 font-mono uppercase font-black">Tempo Real</span>
          </div>

          {typingHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs italic">
              Nenhum contato com endereço salvo digitou ainda. O histórico aparecerá aqui em tempo real.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                    <th className="py-2.5">Tipo</th>
                    <th className="py-2.5">Nome / Identificador</th>
                    <th className="py-2.5">Telefone</th>
                    <th className="py-2.5">Bairro Geocodificado</th>
                    <th className="py-2.5 text-right">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {typingHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                      <td className="py-3">
                        {item.status === 'contato' && (
                          <span className="flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase w-fit">
                            <User className="w-3 h-3 mr-1" />
                            Contato
                          </span>
                        )}
                        {item.status === 'estabelecimento' && (
                          <span className="flex items-center text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase w-fit">
                            <Store className="w-3 h-3 mr-1" />
                            Loja
                          </span>
                        )}
                        {item.status === 'desconhecido' && (
                          <span className="flex items-center text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase w-fit">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Ignorado
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-bold text-white">{item.name}</td>
                      <td className="py-3 text-slate-400 font-semibold">{item.phone}</td>
                      <td className="py-3 text-slate-400">
                        {item.neighborhood ? (
                          <span className="flex items-center text-emerald-400/90 font-semibold">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {item.neighborhood}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-semibold italic">Sem endereço cadastrado</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-slate-400 font-bold">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Terminal de Eventos em Tempo Real (Console de Auditoria) */}
        <div className="mt-4 p-4 bg-[#090d16] rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Console de Logs Táticos (Auditoria)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          {realtimeLogs.length === 0 ? (
            <p className="text-slate-500 italic">Aguardando eventos do WhatsApp...</p>
          ) : (
            realtimeLogs.map((log, idx) => (
              <div key={idx} className="fade-in transition-all">
                {log}
              </div>
            ))
          )}
        </div>

        {/* Simulador de Digitação em Tempo Real */}
        <div className="mt-4 p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="text-xs text-slate-300 font-mono">Simulador de Eventos:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ESTABLISHMENTS.slice(0, 4).map((est) => (
              <button
                key={est.id}
                onClick={() => socketClient.emitRestaurantTyping(est.id)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all font-mono font-bold"
              >
                Simular {est.name.replace('!', '').split(' ')[0]}
              </button>
            ))}
            
            <button
              onClick={() => {
                if (vcfContacts.length > 0) {
                  const randomContact = vcfContacts[Math.floor(Math.random() * vcfContacts.length)];
                  console.log('🤖 Simulação VCF:', randomContact.name, randomContact.phone);
                  socketClient.emitRestaurantTyping(randomContact.phone);
                }
              }}
              className="text-[10px] bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700 px-3 py-1.5 rounded-lg transition-all font-mono font-bold"
            >
              Simular Contato VCF
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
