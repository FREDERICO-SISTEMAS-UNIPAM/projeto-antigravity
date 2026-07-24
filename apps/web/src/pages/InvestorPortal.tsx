import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Briefcase, Video, Copy, FileText, 
  CheckCircle, ChevronRight, ChevronLeft, Monitor, PieChart, Users, 
  MapPin, Clock, Gauge, Flame, Check, HelpCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock do Mapa de Calor para a Simulação do Investidor
const MOCK_DEMAND_POINTS = [
  { name: 'Centro (Pizzarias e Lanches)', lat: -18.5789, lng: -46.5153, intensity: 0.8, color: '#ff3366', size: 300 },
  { name: 'Rosário (Hamburguerias)', lat: -18.5850, lng: -46.5120, intensity: 0.9, color: '#00ff66', size: 250 },
  { name: 'Brasil (Restaurantes Japoneses)', lat: -18.5755, lng: -46.5100, intensity: 0.6, color: '#ffcc00', size: 200 },
  { name: 'Céu Azul (Demandas Residenciais)', lat: -18.6145, lng: -46.5050, intensity: 0.75, color: '#38bdf8', size: 280 }
];

export const InvestorPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PITCH_DECK' | 'DEMO' | 'WHY_INVEST' | 'ASSETS'>('PITCH_DECK');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Estados para simulação do Dashboard de IA
  const [simulatedHour, setSimulatedHour] = useState('20:30');
  const [waitTime, setWaitTime] = useState(3.5);
  const [fuelSavings, setFuelSavings] = useState(24.5);
  const [hourlyEarnings, setHourlyEarnings] = useState(38.80);
  const [currentHotspot, setCurrentHotspot] = useState('Rosário (Pico)');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const runSimulationUpdate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setWaitTime(parseFloat((2.0 + Math.random() * 2.5).toFixed(1)));
      setFuelSavings(parseFloat((20.0 + Math.random() * 8.0).toFixed(1)));
      setHourlyEarnings(parseFloat((34.0 + Math.random() * 10.0).toFixed(2)));
      
      const hotspots = ['Centro (Crítico)', 'Rosário (Alto fluxo)', 'Céu Azul (Normal)', 'Brasil (Pico)'];
      setCurrentHotspot(hotspots[Math.floor(Math.random() * hotspots.length)]);
      
      const hours = ['19:15', '20:45', '21:30', '22:10'];
      setSimulatedHour(hours[Math.floor(Math.random() * hours.length)]);
      
      setIsSimulating(false);
    }, 1200);
  };

  const slides = [
    {
      title: "1. AntiGravity — DeliveryBoy AI",
      subtitle: "A Revolução Inteligente do Delivery e Logística Local",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            O **AntiGravity** é um motor de inteligência artificial espaço-temporal projetado para eliminar o tempo ocioso e maximizar os lucros de entregadores autônomos. Através da captura passiva de padrões de demanda e localização preditiva, reduzimos a ineficiência do delivery de ponta a ponta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block font-bold mb-1">MERCADO PIVÔ</span>
              <span className="text-base font-black text-[#00ff66]">Patos de Minas</span>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block font-bold mb-1">TECNOLOGIA</span>
              <span className="text-base font-black text-purple-400">IA Preditiva</span>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block font-bold mb-1">FOCO DO NEGÓCIO</span>
              <span className="text-base font-black text-amber-400">SaaS / Recorrência</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. O Problema Real",
      subtitle: "O Custo Invisível do Tempo Ocioso de Pilotos de Entrega",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Entregadores passam até **40% de suas jornadas de trabalho estacionados ou rodando aleatoriamente**, buscando o próximo pedido.
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
              <p className="text-xs text-red-300 font-semibold">**Desperdício de Combustível:** Pilotos andam em círculos guiados por intuição, gastando até 35% mais do que o necessário.</p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
              <p className="text-xs text-red-300 font-semibold">**Frustração Financeira:** O tempo ocioso derruba o ganho por hora a níveis insustentáveis, provocando rotatividade e desmotivação.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. A Solução AntiGravity",
      subtitle: "Direcionamento Antecipado via Inteligência Artificial Espaço-Temporal",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Usamos inteligência artificial para prever o próximo ponto quente de demanda **antes mesmo que o pedido seja feito ou que o entregador saia para a rua**.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <h4 className="text-xs font-black text-[#00ff66] mb-1.5 uppercase">Mapa de Calor Preditivo</h4>
              <p className="text-[11px] text-slate-400">Gera zonas térmicas que indicam a concentração de pedidos por bairro e horário.</p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <h4 className="text-xs font-black text-[#00ff66] mb-1.5 uppercase">Navegação Planejada</h4>
              <p className="text-[11px] text-slate-400">Guia o motoboy aos locais com 90%+ de probabilidade de corrida imediata.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Integração WhatsApp Web Passiva",
      subtitle: "A Captura Inteligente que Respeita a Privacidade",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Não abrimos e não salvamos conversas privadas. AntiGravity escuta apenas os **eventos de digitação** (`composing`) em grupos de WhatsApp de entregas e contatos parceiros.
          </p>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-4">
            <div className="p-3 bg-[#00ff66]/10 text-[#00ff66] rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase mb-0.5">Como Funciona:</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Assim que um contato da agenda (restaurante ou outro motoboy) começa a digitar, o radar mapeia as coordenadas geográficas do seu endereço e plota a atividade em tempo real no mapa.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "5. Tamanho do Mercado (TAM/SAM/SOM)",
      subtitle: "A Oportunidade Gigante do Mercado de Delivery Exponencial",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Mercado Total (TAM)</span>
              <span className="text-base font-black text-white">1.5M+</span>
              <p className="text-[10px] text-slate-500 mt-1">Entregadores ativos no Brasil.</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Mercado Acessível (SAM)</span>
              <span className="text-base font-black text-purple-400">300k+</span>
              <p className="text-[10px] text-slate-500 mt-1">Motoboys em grupos de WhatsApp e fóruns de entregas regionais.</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Foco Inicial (SOM)</span>
              <span className="text-base font-black text-[#00ff66]">1.2k+</span>
              <p className="text-[10px] text-slate-500 mt-1">Entregadores em Patos de Minas e Alto Paranaíba (MG).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6. Modelo de Negócios e Monetização",
      subtitle: "Receita Recorrente e Modelo SaaS Escalável",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Estruturamos duas vertentes de monetização previsível baseadas em assinaturas SaaS:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl border-l-4 border-l-[#00ff66]">
              <h4 className="text-xs font-black text-white uppercase mb-1">Assinatura Motoboy (B2C)</h4>
              <p className="text-sm font-bold text-[#00ff66] mb-1">R$ 19,90 / mês</p>
              <p className="text-[10px] text-slate-400">Acesso ao radar de pontos quentes em tempo real e previsões da IA via App.</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl border-l-4 border-l-purple-400">
              <h4 className="text-xs font-black text-white uppercase mb-1">Painel Restaurante (B2B)</h4>
              <p className="text-sm font-bold text-purple-400 mb-1">R$ 89,90 / mês</p>
              <p className="text-[10px] text-slate-400">Previsão de demanda para planejamento de estoque e otimização das frotas de motoboys próprios.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "7. Métricas de Impacto Simuladas",
      subtitle: "Validação Espaço-Temporal de Alto Desempenho",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Resultados obtidos com base em análises históricas do algoritmo de inteligência artificial de Patos de Minas:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-[22px] font-black text-white block">18k+</span>
              <span className="text-[9px] text-slate-500 uppercase font-black">Entregas Analisadas</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-[22px] font-black text-[#00ff66] block">30%</span>
              <span className="text-[9px] text-slate-500 uppercase font-black">Menos Ocio</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-[22px] font-black text-purple-400 block">25%</span>
              <span className="text-[9px] text-slate-500 uppercase font-black">Mais Lucro</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
              <span className="text-[22px] font-black text-amber-400 block">22%</span>
              <span className="text-[9px] text-slate-500 uppercase font-black">Filtro de Gasolina</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "8. Diferencial Competitivo",
      subtitle: "Vantagens Técnicas Exclusivas",
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                <th className="py-2">Funcionalidade</th>
                <th className="py-2 text-[#00ff66]">AntiGravity</th>
                <th className="py-2">App Entregador Comum</th>
                <th className="py-2">GPS Tradicional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              <tr>
                <td className="py-2 font-bold">IA Preditiva</td>
                <td className="py-2 text-[#00ff66] font-bold">Sim (Gemini/LORA)</td>
                <td className="py-2 text-slate-500">Não (Histórico simples)</td>
                <td className="py-2 text-slate-500">Não</td>
              </tr>
              <tr>
                <td className="py-2 font-bold">Detecção de Digitação</td>
                <td className="py-2 text-[#00ff66] font-bold">Sim (Real-Time)</td>
                <td className="py-2 text-slate-500">Não</td>
                <td className="py-2 text-slate-500">Não</td>
              </tr>
              <tr>
                <td className="py-2 font-bold">Custo Fixo de Servidor</td>
                <td className="py-2 text-[#00ff66] font-bold">Extremamente Baixo (VPS)</td>
                <td className="py-2 text-slate-400">Alto (SaaS caro)</td>
                <td className="py-2 text-slate-400">Médio</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      title: "9. Custo para Escalar",
      subtitle: "Margens Altas com Infraestrutura Enxuta e Otimizada",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Nossa arquitetura enxuta (Docker, Node, SQLite/PostgreSQL) permite hospedar o núcleo do projeto por um **custo fixo previsível de R$ 49,99/mês**, escalando para mais de 100 cidades com o mesmo servidor básico.
          </p>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-black text-white uppercase mb-2">Simulação de Escala Financeira:</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-950/60 rounded">
                <span className="text-[10px] text-slate-500 block">1 Cidade</span>
                <span className="font-bold text-[#00ff66]">Margem: 92%</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded">
                <span className="text-[10px] text-slate-500 block">10 Cidades</span>
                <span className="font-bold text-purple-400">Margem: 96%</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded">
                <span className="text-[10px] text-slate-500 block">100 Cidades</span>
                <span className="font-bold text-amber-400">Margem: 98%</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "10. Roteiro e Próximos Passos (Roadmap)",
      subtitle: "A Evolução do Produto Rumo ao SaaS Nacional",
      content: (
        <div className="space-y-3 font-mono text-[11px]">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#00ff66] shrink-0" />
            <span className="text-slate-300 font-bold">**[CONCLUÍDO]** MVP & Painel Geocodificado de Patos de Minas</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#00ff66] shrink-0" />
            <span className="text-slate-300 font-bold">**[CONCLUÍDO]** Resolvedor de LID Online e Integração Física</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-400 flex items-center justify-center shrink-0"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span></div>
            <span className="text-white font-bold">**[EM EXECUÇÃO]** Aplicativo Nativo Android para Pilotos</span>
          </div>
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="text-slate-500">**[PRÓXIMO]** Marketplace de Peças e Serviços para Motoboys</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Menu Superior do Portal */}
      <div className="flex flex-wrap border-b border-slate-800 pb-3 mb-6 gap-3 justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-wider">AntiGravity Investor Portal</h2>
          <p className="text-[10px] text-slate-400 font-mono">Espaço de Negócios e Apresentações do DeliveryBoy AI</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'PITCH_DECK', label: 'Pitch Deck (Slides)' },
            { id: 'DEMO', label: 'IA Sandbox (Demo)' },
            { id: 'WHY_INVEST', label: 'Por que Investir?' },
            { id: 'ASSETS', label: 'Assets & Roteiros' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-[10px] font-black uppercase tracking-wide px-3.5 py-1.5 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 border-[#00ff66] text-[#00ff66]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ABA 1: Pitch Deck Interativo */}
      {activeTab === 'PITCH_DECK' && (
        <div className="saas-card p-6 border border-[#334155] bg-[#090d16]/80 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest animate-pulse">
                APRESENTAÇÃO INTERATIVA
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Slide {currentSlide + 1} de {slides.length}
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{slides[currentSlide].title}</h3>
            <p className="text-xs text-slate-400 font-mono mb-6">{slides[currentSlide].subtitle}</p>
            
            <div className="min-h-[160px] flex flex-col justify-center">
              {slides[currentSlide].content}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <div className="flex space-x-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === idx ? 'bg-[#00ff66] w-4' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center space-x-1.5 text-xs text-[#00ff66] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ABA 2: IA Sandbox (Demo Interativa) */}
      {activeTab === 'DEMO' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Painel do Mapa de Demonstração */}
              <div className="saas-card p-4 border border-[#334155]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-ping" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase">Simulador Espaço-Temporal do Radar</h3>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    AMBIENTE DE TESTE DO INVESTIDOR
                  </span>
                </div>

                <div className="w-full h-80 bg-[#090d16] border border-slate-800 rounded-xl relative overflow-hidden">
                  <MapContainer
                    center={[-18.5789, -46.5181]}
                    zoom={14}
                    zoomControl={false}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '100%', zIndex: 10 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Pontos de calor dinâmicos simulação */}
                    {MOCK_DEMAND_POINTS.map((pt, idx) => (
                      <React.Fragment key={idx}>
                        <Marker 
                          position={[pt.lat, pt.lng]}
                          icon={L.divIcon({
                            className: 'custom-neighborhood-marker',
                            html: `
                              <div class="relative w-4 h-4 flex items-center justify-center">
                                <span class="sonar-ripple" style="color: ${pt.color};"></span>
                                <span class="w-2 h-2 rounded-full radar-blip-dot bg-white ring-1 ring-[#00ff66]"></span>
                              </div>
                            `,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                          })}
                        >
                          <Popup>
                            <div className="text-xs font-mono text-slate-200">
                              <p className="font-bold">{pt.name}</p>
                              <p className="text-[10px] text-[#00ff66] font-bold animate-pulse mt-0.5">Demanda: {Math.round(pt.intensity * 100)}%</p>
                            </div>
                          </Popup>
                        </Marker>
                        <Circle 
                          center={[pt.lat, pt.lng]}
                          radius={pt.size}
                          pathOptions={{ color: pt.color, fillColor: pt.color, fillOpacity: 0.15, weight: 1 }}
                        />
                      </React.Fragment>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Painel Lateral com as Metricas de Negocio da Demo */}
            <div className="space-y-4">
              <div className="saas-card p-5 border border-[#334155] space-y-4">
                <h4 className="text-xs font-black text-[#00ff66] uppercase tracking-wider border-b border-slate-800 pb-2">Resultados Estimados (IA)</h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-500 block uppercase font-black">Previsão Próxima Corrida</span>
                    <span className="text-sm font-black text-white">{currentHotspot}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                      <span className="text-[9px] text-slate-500 block uppercase font-black">Espera Média</span>
                      <span className="text-sm font-black text-[#00ff66]">{waitTime} min</span>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                      <span className="text-[9px] text-slate-500 block uppercase font-black">Gasolina Salva</span>
                      <span className="text-sm font-black text-purple-400">{fuelSavings}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <span className="text-[9px] text-slate-500 block uppercase font-black">Ganho Médio por Hora</span>
                    <span className="text-base font-black text-amber-400">R$ {hourlyEarnings.toFixed(2)}/h</span>
                  </div>
                </div>

                <button
                  onClick={runSimulationUpdate}
                  disabled={isSimulating}
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSimulating ? 'Recalculando Padrões...' : 'Simular Nova Corrida (IA)'}
                </button>
              </div>

              {/* Box de explicação para o investidor */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-relaxed font-mono">
                <span className="text-white block font-bold mb-1 uppercase">💡 Sandbox de Demonstração</span>
                Este painel simula a geolocalização e as estimativas do nosso algoritmo preditivo de forma 100% autônoma, dispensando conexões com o WhatsApp para permitir testes rápidos durante reuniões e pitches de captação de recursos.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: Por que investir? (Tese de Investimento) */}
      {activeTab === 'WHY_INVEST' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="saas-card p-6 border border-[#334155] space-y-3">
            <div className="p-2.5 bg-emerald-500/10 text-[#00ff66] rounded-xl w-fit">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Tese de Negócio & TAM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O mercado de delivery no Brasil cresce a taxas de dois dígitos ao ano. No entanto, o lado dos prestadores de serviço (entregadores e frotas) sofre com a falta de dados. O AntiGravity resolve uma dor real de ponta, permitindo que pilotos ganhem mais gastando menos combustível.
            </p>
          </div>

          <div className="saas-card p-6 border border-[#334155] space-y-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Facilidade de Escala</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nosso sistema foi construído sobre uma arquitetura leve (Node.js/Docker). Hospedar o software inteiro em produção em uma VPS de custo fixo custa apenas R$ 49,99/mês. Isso possibilita escalar para novas cidades sem aumentar linearmente os custos de servidores.
            </p>
          </div>

          <div className="saas-card p-6 border border-[#334155] space-y-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Modelo Financeiro</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Com apenas 300 motoboys assinantes em Patos de Minas no plano B2C (R$ 19,90/mês), a plataforma gera R$ 5.970,00 de receita recorrente mensal (MRR). Ao expandir para frotas B2B e restaurantes (R$ 89,90/mês), a receita ultrapassa R$ 15.000,00 mensais apenas na fase piloto da cidade.
            </p>
          </div>
        </div>
      )}

      {/* ABA 4: Roteiros, Copys e Textos de Suporte */}
      {activeTab === 'ASSETS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* README voltado para investidores */}
          <div className="saas-card p-6 border border-[#334155] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-emerald-400" />
                  README de Negócios / Pitch
                </span>
                <button
                  onClick={() => handleCopy(`AntiGravity é uma plataforma de inteligência artificial que ajuda entregadores a reduzir tempo ocioso, aumentar ganhos e otimizar deslocamentos usando análise preditiva baseada em localização e histórico de demanda.`, 'readme')}
                  className="text-[10px] text-slate-500 hover:text-white flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'readme' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed">
                <p className="font-bold text-emerald-400"># AntiGravity — O Waze dos Entregadores Autônomos</p>
                <p className="mt-2">AntiGravity é uma plataforma de inteligência artificial que ajuda entregadores a reduzir tempo ocioso, aumentar ganhos e otimizar deslocamentos usando análise preditiva baseada em localização e histórico de demanda.</p>
                <p className="mt-2"><strong>Diferenciais:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Escuta passiva de eventos de digitação no WhatsApp Web.</li>
                  <li>Mapa de calor de demanda atualizado em tempo real.</li>
                  <li>SaaS escalável com baixo custo de hospedagem fixa.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Roteiro para Vídeo Demonstrativo */}
          <div className="saas-card p-6 border border-[#334155] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center">
                  <Video className="w-4 h-4 mr-1.5 text-purple-400" />
                  Roteiro do Vídeo (2 min)
                </span>
                <button
                  onClick={() => handleCopy(`[Roteiro Vídeo 2 Minutos - AntiGravity]\n00:00 - Abertura com tela do app carregando: "Você sabia que um entregador autônomo perde até 40% do seu dia parado, gastando gasolina sem rumo?"\n00:30 - Apresentação do mapa térmico do AntiGravity: "Aqui entra o AntiGravity. Nossa IA preditiva analisa o fluxo de demanda em tempo real..."\n01:00 - Mostrando o pareamento WhatsApp: "Com uma integração via WhatsApp Web, geocodificamos os pontos quentes imediatamente..."\n01:30 - Demonstração das métricas: "O piloto visualiza a melhor região para se posicionar e o tempo de espera reduz de 12 para 3 minutos."\n02:00 - Call to Action: "Acesse o painel, faça o teste e junte-se à revolução."`, 'video')}
                  className="text-[10px] text-slate-500 hover:text-white flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedText === 'video' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed max-h-[160px] overflow-y-auto">
                <p className="font-bold text-purple-400">**[Roteiro do Pitch em Vídeo]**</p>
                <p className="mt-1"><strong>00:00 - Dor:</strong> "Você sabia que um motoboy de delivery passa quase metade do dia parado esperando pedidos?"</p>
                <p className="mt-1"><strong>00:30 - Solução:</strong> "Apresentamos o AntiGravity. Nossa inteligência artificial prediz o fluxo de corrida antes mesmo do restaurante chamar."</p>
                <p className="mt-1"><strong>01:00 - Como funciona:</strong> "Mapeamos os grupos de entrega em tempo real, plotando locais quentes sem violar privacidade."</p>
                <p className="mt-1"><strong>01:30 - Resultados:</strong> "Aumentamos a renda em 25% e reduzimos a emissão/desperdício de combustível."</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
