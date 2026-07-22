import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventsGateway } from '../realtime/events.gateway';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class WhatsAppMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppMonitorService.name);
  private simulationInterval: NodeJS.Timeout | null = null;
  private sock: any = null;

  constructor(private readonly eventsGateway: EventsGateway) {}

  async onModuleInit() {
    this.logger.log('🔌 Inicializando WhatsApp Monitor em segundo plano...');
    
    // 1. Inicializa o simulador em segundo plano para garantir o funcionamento visual instantâneo
    this.startSimulation();

    // 2. Tenta conectar com o WhatsApp físico se não for Vercel/Serverless
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      this.logger.log('☁️ Detectado ambiente Vercel Serverless. Ignorando conexão Baileys física e mantendo simulador ativo.');
      return;
    }

    await this.initWhatsAppConnection();
  }

  onModuleDestroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.sock) {
      try {
        this.sock.end();
      } catch (err) {}
    }
  }

  private async initWhatsAppConnection() {
    try {
      // Importações dinâmicas para evitar erros se as dependências não puderem compilar localmente
      const makeWASocket = (await import('@whiskeysockets/baileys')).default;
      const { useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');

      this.logger.log('📱 Inicializando conexão física com WhatsApp Web via Baileys...');
      
      const dataDir = path.join(__dirname, '../../../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const authDir = path.join(dataDir, 'whatsapp-auth');
      const { state, saveCreds } = await useMultiFileAuthState(authDir);

      this.sock = makeWASocket({
        auth: state as any,
        printQRInTerminal: true,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
          this.logger.warn(`Conexão fechada devido a: ${lastDisconnect?.error}. Reconectando: ${shouldReconnect}`);
          if (shouldReconnect) {
            this.initWhatsAppConnection();
          }
        } else if (connection === 'open') {
          this.logger.log('✅ Conexão com o WhatsApp aberta com sucesso via Baileys!');
        }
      });

      this.sock.ev.on('presence.update', (presence: any) => {
        const jid = presence.id;
        const info = presence.presences;
        if (!info) return;

        for (const [senderJid, presenceInfo] of Object.entries(info)) {
          if (presenceInfo.lastKnownPresence === 'composing') {
            const cleanPhone = senderJid.split('@')[0];
            this.logger.log(`⚡ Estabelecimento ${cleanPhone} está digitando em ${jid}`);
            
            // Emite o evento restaurant_typing via websockets para o mapa
            if (this.eventsGateway && this.eventsGateway.server) {
              this.eventsGateway.server.emit('restaurant_typing', { restaurantId: cleanPhone });
            }
          }
        }
      });

    } catch (error) {
      this.logger.warn(`Erro ao conectar com o WhatsApp via Baileys (Operando apenas no modo de simulação): ${(error as Error).message}`);
    }
  }

  private startSimulation() {
    this.logger.log('🤖 Inicializando Simulador de Digitação de Restaurantes (Fallbacks ativos)...');
    
    const simulatedRestaurants = [
      'steak-grill',
      'sangreal-burguer',
      'ebimaki-sushi',
      'pizzaria-di-roma',
      'point-do-sorvete',
      'bells-burguer',
      'emporio-copacabana',
      'whatsbeer',
      'dubai-lanches'
    ];

    this.simulationInterval = setInterval(() => {
      if (!this.eventsGateway || !this.eventsGateway.server) return;

      const randomId = simulatedRestaurants[Math.floor(Math.random() * simulatedRestaurants.length)];
      this.logger.log(`🤖 [Simulação de Evento] Restaurante "${randomId}" começou a digitar...`);

      // Transmite o sinal restaurant_typing para o radar Leaflet
      this.eventsGateway.server.emit('restaurant_typing', { restaurantId: randomId });
    }, 20000); // Dispara a cada 20 segundos
  }
}
