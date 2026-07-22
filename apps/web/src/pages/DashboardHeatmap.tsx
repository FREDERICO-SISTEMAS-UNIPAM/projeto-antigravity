import React, { useState, useEffect } from 'react';
import { Compass, MapPin, TrendingUp, DollarSign, ShieldAlert, Cpu } from 'lucide-react';
import { ApiClient, NeighborhoodItem } from '../services/api-client';
import { socketClient } from '../services/socket-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const NEIGHBORHOODS_MAP = [
  { name: 'Centro', lat: -18.5789, lng: -46.5153, color: '#38bdf8' },
  { name: 'Céu Azul', lat: -18.6145, lng: -46.5050, color: '#ff3366' },
  { name: 'Rosário', lat: -18.5850, lng: -46.5120, color: '#ffcc00' },
  { name: 'Sebastião Amorim', lat: -18.5950, lng: -46.4800, color: '#00ff66' },
  { name: 'Brasil', lat: -18.5755, lng: -46.5100, color: '#00ff66' },
  { name: 'Panorâmico', lat: -18.5952, lng: -46.4905, color: '#00ff66' },
];

const ESTABLISHMENTS = [
  { id: 'steak-grill', name: 'Steak Grill Bar', lat: -18.5850, lng: -46.5120, icon: '/logos/media__1784629913070.png' },
  { id: 'sangreal-burguer', name: 'Sangreal Burguer!', lat: -18.5780, lng: -46.5130, icon: '/logos/media__1784630556152.png' },
  { id: 'ebimaki-sushi', name: 'Ebimaki Sushi', lat: -18.5750, lng: -46.5190, icon: '/logos/media__1784631637300.png' },
  { id: 'pizzaria-di-roma', name: 'Pizzaria Di Roma', lat: -18.5789, lng: -46.5153, icon: '/logos/media__1784631897861.png' },
  { id: 'point-do-sorvete', name: 'Point Do Sorvete', lat: -18.6050, lng: -46.4850, icon: '/logos/media__1784632056475.png' },
  { id: 'bells-burguer', name: 'Bells Burguer', lat: -18.6010, lng: -46.5050, icon: '/logos/media__1784632229727.png' },
  { id: 'emporio-copacabana', name: 'Emporio Copacabana', lat: -18.5900, lng: -46.5080, icon: '/logos/media__1784632467719.png' },
  { id: 'whatsbeer', name: 'Whatsbeer', lat: -18.5755, lng: -46.5100, icon: '/logos/media__1784632697714.png' },
  { id: 'dubai-lanches', name: 'Dubai Lanches', lat: -18.6145, lng: -46.5050, icon: '/logos/media__1784634521177.png' }
];

export const DashboardHeatmap: React.FC = () => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Céu Azul');
  const [typingRestaurants, setTypingRestaurants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    ApiClient.fetchNeighborhoods().then(setNeighborhoods);
  }, []);

  useEffect(() => {
    socketClient.connect();
    const unsubscribe = socketClient.onRestaurantTyping((payload) => {
      const { restaurantId } = payload;
      const matched = ESTABLISHMENTS.find(
        (e) =>
          e.id === restaurantId ||
          e.name.toLowerCase() === restaurantId.toLowerCase() ||
          restaurantId.toLowerCase().includes(e.id)
      );

      if (matched) {
        setTypingRestaurants((prev) => ({ ...prev, [matched.id]: true }));
        setTimeout(() => {
          setTypingRestaurants((prev) => ({ ...prev, [matched.id]: false }));
        }, 5000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getHeatBadge = (idx: number) => {
    if (idx === 0) return { label: 'CRÍTICO', color: 'bg-red-500/10 text-red-400 border-red-500/30' };
    if (idx < 3) return { label: 'ALTO FLUXO', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: 'NORMAL', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const createNeighborhoodIcon = (n: typeof NEIGHBORHOODS_MAP[0], isSelected: boolean) => {
    return L.divIcon({
      className: 'custom-neighborhood-marker',
      html: `
        <div class="relative w-4 h-4 flex items-center justify-center">
          <span class="sonar-ripple" style="color: ${n.color};"></span>
          <span class="w-2 h-2 rounded-full radar-blip-dot ${
            isSelected ? 'ring-2 ring-[#00ff66] scale-125 bg-white' : ''
          }" style="background-color: ${isSelected ? '#ffffff' : n.color};"></span>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const createCustomIcon = (est: typeof ESTABLISHMENTS[0], isTyping: boolean) => {
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

            {/* Bairros */}
            {NEIGHBORHOODS_MAP.map((n) => {
              const isSelected = selectedNeighborhood === n.name;
              return (
                <Marker
                  key={n.name}
                  position={[n.lat, n.lng]}
                  icon={createNeighborhoodIcon(n, isSelected)}
                  eventHandlers={{
                    click: () => {
                      setSelectedNeighborhood(n.name);
                    },
                  }}
                >
                  <Popup>
                    <div className="text-xs font-mono text-slate-800">
                      <p className="font-bold">{n.name}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Estabelecimentos */}
            {ESTABLISHMENTS.map((est) => {
              const isTyping = !!typingRestaurants[est.id];
              return (
                <Marker
                  key={est.id}
                  position={[est.lat, est.lng]}
                  icon={createCustomIcon(est, isTyping)}
                >
                  <Popup>
                    <div className="text-xs font-mono text-slate-800">
                      <p className="font-bold">{est.name}</p>
                      <p className="text-[10px]">Lat: {est.lat}, Lng: {est.lng}</p>
                      {isTyping && <p className="text-[#00ff66] font-bold animate-pulse">DIGITANDO...</p>}
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
                <span className="text-[10px] text-slate-400 block font-bold mb-0.5 uppercase tracking-wide">Previsão da IA</span>
                <p className="text-sm font-black text-[#00ff66]">98% de confiança</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-bold mb-0.5 uppercase tracking-wide">Tempo Estimado de Espera</span>
                <p className="text-sm font-black text-slate-200">2 min</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-bold mb-0.5 uppercase tracking-wide">Ganhos Estimados</span>
                <p className="text-sm font-black text-[#ffcc00] flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-[#ffcc00]" />
                  R$ 40,03/hora
                </p>
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
