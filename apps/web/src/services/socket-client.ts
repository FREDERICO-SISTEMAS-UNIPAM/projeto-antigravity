import { io, Socket } from 'socket.io-client';

export interface TypingAlertPayload {
  restaurantName: string;
  neighborhood: string;
  bleSignal: {
    action: string;
    soundBip: boolean;
    durationMs: number;
  };
  message: string;
  timestamp: string;
}

export class SocketClient {
  private socket: Socket | null = null;
  private listeners: Array<(payload: TypingAlertPayload) => void> = [];
  private typingListeners: Array<(payload: { restaurantId: string }) => void> = [];

  connect(serverUrl: string = 'http://localhost:3001') {
    if (this.socket && this.socket.connected) return;

    this.socket = io(`${serverUrl}/realtime`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Dashboard Web conectado ao namespace WebSocket /realtime');
    });

    this.socket.on('merchants:typing', (payload: TypingAlertPayload) => {
      console.log('🔔 Alerta de digitação recebido no Dashboard Web:', payload);
      this.listeners.forEach((fn) => fn(payload));
    });

    this.socket.on('restaurant_typing', (payload: { restaurantId: string }) => {
      console.log('🔔 Evento restaurant_typing recebido no Dashboard Web:', payload);
      this.typingListeners.forEach((fn) => fn(payload));
    });
  }

  onMerchantTyping(callback: (payload: TypingAlertPayload) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }

  onRestaurantTyping(callback: (payload: { restaurantId: string }) => void) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter((fn) => fn !== callback);
    };
  }

  emitRestaurantTyping(restaurantId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('restaurant_typing', { restaurantId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();
