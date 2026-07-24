import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventsGateway } from '../realtime/events.gateway';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';

@Injectable()
export class WhatsAppMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppMonitorService.name);
  private simulationInterval: NodeJS.Timeout | null = null;
  private sock: any = null;
  private lastQr: string | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' = 'disconnected';
  private qrCode: string | null = null;
  private ownerName: string | null = null;
  private lidToPhoneMap = new Map<string, string>();
  private qrAttempts = 0;

  constructor(private readonly eventsGateway: EventsGateway) {}

  async onModuleInit() {
    this.logger.log('🔌 Inicializando WhatsApp Monitor em segundo plano...');
    
    // Tenta conectar com o WhatsApp físico se não for Vercel/Serverless
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      this.logger.log('☁️ Detectado ambiente Vercel Serverless. Ignorando conexão Baileys física.');
      return;
    }

    const authDir = path.join(os.homedir(), '.deliveryboy-auth');
    const credsPath = path.join(authDir, 'creds.json');
    if (fs.existsSync(credsPath)) {
      this.logger.log('🔑 Credenciais encontradas. Conectando automaticamente...');
      await this.initWhatsAppConnection(true);
    } else {
      this.logger.log('📱 Nenhuma sessão ativa encontrada. WhatsApp permanecerá offline até que o usuário clique para conectar no dashboard.');
      this.connectionStatus = 'disconnected';
      this.broadcastStatus();
    }
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

  getStatus() {
    return {
      status: this.connectionStatus,
      qr: this.qrCode,
      ownerName: this.ownerName,
    };
  }

  private broadcastStatus() {
    if (this.eventsGateway && this.eventsGateway.server) {
      this.eventsGateway.server.emit('whatsapp_status_update', this.getStatus());
    }
  }

  async disconnect() {
    this.logger.log('🔌 Desconectando do WhatsApp físico e limpando sessão...');
    this.connectionStatus = 'disconnected';
    this.qrCode = null;
    this.lastQr = null;
    this.ownerName = null;
    this.lidToPhoneMap.clear();
    if (this.sock) {
      try {
        this.sock.end();
      } catch {}
      this.sock = null;
    }
    try {
      const authDir = path.join(os.homedir(), '.deliveryboy-auth');
      if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
        this.logger.log('🧹 Pasta de credenciais .deliveryboy-auth excluída com sucesso.');
      }
    } catch (err) {
      this.logger.error(`Erro ao limpar pasta de credenciais: ${(err as Error).message}`);
    }
    this.broadcastStatus();
  }

  async initWhatsAppConnection(force = false) {
    if (!force && process.env.ENABLE_PHYSICAL_WHATSAPP !== 'true') {
      this.logger.log('📱 Conexão física com WhatsApp via Baileys desativada para economizar recursos (4GB RAM safe). Rodando apenas em modo de simulação.');
      this.connectionStatus = 'disconnected';
      return;
    }

    if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
      if (this.sock && !force) {
        this.logger.log('📱 Conexão com WhatsApp já ativa ou em progresso.');
        return;
      }
    }

    this.qrAttempts = 0;
    this.connectionStatus = 'connecting';
    this.broadcastStatus();

    try {
      // Importações dinâmicas para evitar erros se as dependências não puderem compilar localmente
      const makeWASocket = (await import('@whiskeysockets/baileys')).default;
      const { useMultiFileAuthState, DisconnectReason, fetchLatestWaWebVersion } = await import('@whiskeysockets/baileys');

      this.logger.log('📱 Inicializando conexão física com WhatsApp Web via Baileys...');
      
      const authDir = path.join(os.homedir(), '.deliveryboy-auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      const { state, saveCreds } = await useMultiFileAuthState(authDir);

      let version = [2, 3000, 1017588443]; // Fallback robusto
      try {
        const latest = await fetchLatestWaWebVersion({});
        version = latest.version;
        this.logger.log(`WhatsApp Web Version obtido: ${version.join('.')}`);
      } catch (e) {
        this.logger.warn(`Erro ao buscar versão web do WhatsApp. Usando fallback default. Erro: ${(e as Error).message}`);
      }

      this.sock = makeWASocket({
        version: version as any,
        auth: state as any,
        printQRInTerminal: true,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && qr !== this.lastQr) {
          this.lastQr = qr;
          this.qrAttempts++;
          this.connectionStatus = 'qr_ready';
          this.qrCode = qr;
          this.broadcastStatus();
          this.logger.log(`🔑 Novo QR Code do WhatsApp gerado (Tentativa ${this.qrAttempts}/5).`);

          if (this.qrAttempts > 5) {
            this.logger.warn('⚠️ Limite de tentativas de QR Code atingido. Cancelando conexão automática...');
            this.disconnect();
            return;
          }
        }

        if (connection === 'close') {
          if (this.connectionStatus === 'disconnected') {
            this.logger.log('🔌 Conexão encerrada pelo sistema ou pelo usuário. Ignorando reconexão.');
            return;
          }

          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const errorMsg = lastDisconnect?.error?.message || '';
          const isConflict = errorMsg.includes('conflict') || errorMsg.includes('device_removed') || errorMsg.includes('Connection Failure') || statusCode === 401 || statusCode === 403;
          
          if (isConflict) {
            this.logger.warn('⚠️ Credenciais inválidas ou conflito detectado. Removendo cache de sessão antigo para forçar novo QR Code...');
            try {
              const authDir = path.join(os.homedir(), '.deliveryboy-auth');
              if (fs.existsSync(authDir)) {
                fs.rmSync(authDir, { recursive: true, force: true });
              }
            } catch (err) {
              this.logger.error(`Erro ao limpar pasta de sessão: ${(err as Error).message}`);
            }
            this.connectionStatus = 'disconnected';
            this.qrCode = null;
            this.ownerName = null;
            this.broadcastStatus();
            
            // Re-inicia conexão limpa após 2 segundos
            setTimeout(() => this.initWhatsAppConnection(true), 2000);
            return;
          }

          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          this.logger.warn(`Conexão fechada devido a: ${lastDisconnect?.error}. Reconectando: ${shouldReconnect}`);
          this.ownerName = null;
          if (shouldReconnect) {
            this.connectionStatus = 'connecting';
            this.broadcastStatus();
            this.initWhatsAppConnection(true);
          } else {
            this.connectionStatus = 'disconnected';
            this.qrCode = null;
            this.broadcastStatus();
          }
        } else if (connection === 'open') {
          this.logger.log('✅ Conexão com o WhatsApp aberta com sucesso via Baileys!');
          this.connectionStatus = 'connected';
          const ownerName = this.sock?.user?.name || this.sock?.user?.id?.split(':')[0] || 'Dono do WhatsApp';
          this.ownerName = ownerName;
          this.qrCode = null;
          this.lastQr = null;
          this.qrAttempts = 0;
          this.broadcastStatus();

          // Subscrever presenças de todos os contatos da agenda para receber eventos de digitação
          this.subscribeAllContactsPresence();

          try {
            const qrHtmlPath = path.join(os.tmpdir(), 'whatsapp-qr.html');
            if (fs.existsSync(qrHtmlPath)) {
              fs.unlinkSync(qrHtmlPath);
              this.logger.log('🧹 Arquivo temporário do QR Code removido.');
            }
          } catch (e) {}
        }
      });

      this.sock.ev.on('contacts.upsert', (contacts: any[]) => {
        for (const contact of contacts) {
          if (contact.id && contact.id.endsWith('@lid') && contact.phone) {
            const cleanLid = contact.id.split('@')[0];
            this.lidToPhoneMap.set(cleanLid, contact.phone);
            this.logger.log(`🔗 Mapeado LID ${cleanLid} para Telefone ${contact.phone}`);
          }
        }
      });

      this.sock.ev.on('contacts.update', (updates: any[]) => {
        for (const update of updates) {
          if (update.id && update.id.endsWith('@lid') && update.phone) {
            const cleanLid = update.id.split('@')[0];
            this.lidToPhoneMap.set(cleanLid, update.phone);
            this.logger.log(`🔗 Atualizado mapeamento LID ${cleanLid} para Telefone ${update.phone}`);
          }
        }
      });

      this.sock.ev.on('messaging-history.set', (historicalData: any) => {
        const contacts = historicalData.contacts || [];
        for (const contact of contacts) {
          if (contact.id && contact.id.endsWith('@lid') && contact.phone) {
            const cleanLid = contact.id.split('@')[0];
            this.lidToPhoneMap.set(cleanLid, contact.phone);
            this.logger.log(`🔗 Mapeado de histórico LID ${cleanLid} para Telefone ${contact.phone}`);
          }
        }
      });

      this.sock.ev.on('presence.update', async (presence: any) => {
        const jid = presence.id;
        const info = presence.presences;
        if (!info) return;

        for (const [senderJid, presenceInfo] of Object.entries(info)) {
          const pInfo = presenceInfo as any;
          if (pInfo && pInfo.lastKnownPresence === 'composing') {
            const cleanPhone = await this.resolveJidToPhone(senderJid);
            this.logger.log(`⚡ Contato/Estabelecimento ${cleanPhone} está digitando em ${jid}`);
            
            // Emite o evento restaurant_typing via websockets para o mapa
            if (this.eventsGateway && this.eventsGateway.server) {
              this.eventsGateway.server.emit('restaurant_typing', { restaurantId: cleanPhone });
            }
          }
        }
      });

      this.sock.ev.on('messages.upsert', async (m: any) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg.key.fromMe) {
              const jid = msg.key.remoteJid;
              if (jid) {
                const cleanPhone = await this.resolveJidToPhone(jid);
                this.logger.log(`💬 Mensagem recebida em tempo real de ${cleanPhone}. Disparando alerta de digitação.`);
                
                // Emite o evento restaurant_typing via websockets para o mapa
                if (this.eventsGateway && this.eventsGateway.server) {
                  this.eventsGateway.server.emit('restaurant_typing', { restaurantId: cleanPhone });
                }

                // Subscreve a presença dinamicamente para capturar futuras digitações
                try {
                  await this.sock.presenceSubscribe(jid);
                } catch (err) {}
              }
            }
          }
        }
      });

    } catch (error) {
      this.logger.warn(`Erro ao conectar com o WhatsApp via Baileys: ${(error as Error).message}`);
    }
  }

  private async resolveLidOnline(jid: string): Promise<string | null> {
    if (!this.sock) return null;
    try {
      const cleanJid = jid.split('@')[0];
      const result = await this.sock.onWhatsApp(cleanJid);
      if (result && result.length > 0 && result[0].exists) {
        const resolvedJid = result[0].jid;
        const phone = resolvedJid.split('@')[0];
        this.logger.log(`🔍 [USync Online] Resolvido JID ${jid} para Telefone: ${phone}`);
        return phone;
      }
    } catch (e) {
      this.logger.warn(`Erro ao resolver JID online para ${jid}: ${(e as Error).message}`);
    }
    return null;
  }

  private async resolveJidToPhone(jid: string): Promise<string> {
    const cleanJid = jid.split('@')[0];
    
    // 1. Tenta buscar no mapa dinâmico de LIDs
    if (this.lidToPhoneMap.has(cleanJid)) {
      return this.lidToPhoneMap.get(cleanJid)!;
    }
    
    // 2. Se for um LID (contém @lid ou é ID longo numérico sem @s.whatsapp.net)
    if (jid.endsWith('@lid') || (!jid.includes('@s.whatsapp.net') && cleanJid.length > 12)) {
      const resolved = await this.resolveLidOnline(jid);
      if (resolved) {
        this.lidToPhoneMap.set(cleanJid, resolved);
        this.lidToPhoneMap.set(jid, resolved);
        return resolved;
      }
    }
    
    // 3. Tenta buscar em sock.contacts se disponível
    if (this.sock && this.sock.contacts) {
      const contact = this.sock.contacts[jid] || this.sock.contacts[cleanJid];
      if (contact && contact.phone) {
        this.lidToPhoneMap.set(cleanJid, contact.phone);
        return contact.phone;
      }
    }
    
    return cleanJid;
  }

  private async subscribeAllContactsPresence() {
    if (!this.sock) return;
    this.logger.log('📢 Subscrevendo presenças de contatos da agenda VCF para receber eventos de digitação...');
    try {
      let contactsPath = path.join(process.cwd(), '../web/public/contacts-with-addresses.json');
      if (!fs.existsSync(contactsPath)) {
        contactsPath = path.join(process.cwd(), 'apps/web/public/contacts-with-addresses.json');
      }

      if (fs.existsSync(contactsPath)) {
        const data = fs.readFileSync(contactsPath, 'utf-8');
        const contacts = JSON.parse(data);
        
        for (const contact of contacts) {
          if (contact.phone) {
            const jid = contact.phone.includes('@') ? contact.phone : `${contact.phone}@s.whatsapp.net`;
            this.sock.presenceSubscribe(jid).catch(() => {});
          }
        }
        this.logger.log(`✅ Inscrição de presença em tempo real disparada com sucesso para ${contacts.length} contatos da agenda.`);
      } else {
        this.logger.warn('⚠️ Arquivo de contatos da agenda não encontrado. Não foi possível inscrever as presenças.');
      }
    } catch (err) {
      this.logger.error(`Erro ao subscrever presenças dos contatos: ${(err as Error).message}`);
    }
  }

  private startSimulation() {
    this.logger.log('🤖 Inicializando Simulador de Digitação de Restaurantes (Fallbacks inativos por padrão)...');
    
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
    }, 20000);
  }
}
