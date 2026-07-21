import { io, Socket } from 'socket.io-client';

export interface BleSignalPayload {
  action: 'PULSE_YELLOW' | 'PULSE_RED' | 'BEEP_FAST' | 'BEEP_NORMAL';
  soundBip: boolean;
  durationMs: number;
}

export interface TypingAlertPayload {
  restaurantName: string;
  neighborhood: string;
  bleSignal: BleSignalPayload;
  message: string;
  timestamp: string;
}

export class RealtimeSocketService {
  private socket: Socket | null = null;
  private currentNeighborhood: string = 'Centro';
  private typingListeners: Array<(alert: TypingAlertPayload) => void> = [];

  connect(serverUrl: string = 'http://localhost:3001') {
    if (this.socket && this.socket.connected) return;

    this.socket = io(`${serverUrl}/realtime`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket.IO conectado no namespace /realtime');
      if (this.currentNeighborhood) {
        this.updateLocation(this.currentNeighborhood);
      }
    });

    this.socket.on('merchants:typing', (payload: TypingAlertPayload) => {
      console.log(`🔔 Evento merchants:typing recebido no app mobile:`, payload);
      this.typingListeners.forEach((fn) => fn(payload));
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket.IO desconectado');
    });
  }

  updateLocation(neighborhood: string) {
    this.currentNeighborhood = neighborhood;
    if (this.socket && this.socket.connected) {
      this.socket.emit('location:update', { neighborhood });
    }
  }

  onMerchantTyping(callback: (alert: TypingAlertPayload) => void) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter((fn) => fn !== callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const realtimeSocketService = new RealtimeSocketService();
