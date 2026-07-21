import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface LocationUpdateData {
  motoboyId?: string;
  neighborhood: string;
}

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

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  // Mapeia SocketID -> Sala de Bairro Atual
  private clientRooms = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`📱 Cliente conectado no WebSocket /realtime: ID ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`📱 Cliente desconectado do WebSocket: ID ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  /**
   * Evento acionado pelo aplicativo do entregador para atualizar sua localização e sala por bairro.
   */
  @SubscribeMessage('location:update')
  handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: LocationUpdateData) {
    const { neighborhood } = data;
    if (!neighborhood) return;

    const formattedRoom = this.formatRoomName(neighborhood);
    const currentRoom = this.clientRooms.get(client.id);

    if (currentRoom && currentRoom !== formattedRoom) {
      client.leave(currentRoom);
      this.logger.debug(`Motoboy ${client.id} saiu da sala ${currentRoom}`);
    }

    client.join(formattedRoom);
    this.clientRooms.set(client.id, formattedRoom);

    this.logger.log(`📍 Motoboy ${client.id} associado à sala geográfica: ${formattedRoom}`);

    return {
      status: 'ok',
      joinedRoom: formattedRoom,
      neighborhood,
    };
  }

  /**
   * Dispara um alerta de digitação/preparação de pedido em tempo real para os motoboys na sala do bairro.
   */
  emitTypingAlert(restaurantName: string, neighborhood: string): TypingAlertPayload {
    const roomName = this.formatRoomName(neighborhood);

    const payload: TypingAlertPayload = {
      restaurantName,
      neighborhood,
      bleSignal: {
        action: 'PULSE_YELLOW',
        soundBip: true,
        durationMs: 5000,
      },
      message: `Restaurante ${restaurantName} está preparando uma entrega na sua região! Encoste e aguarde.`,
      timestamp: new Date().toISOString(),
    };

    if (this.server) {
      this.server.to(roomName).emit('merchants:typing', payload);
      this.logger.log(`⚡ Alerta de digitação emitido para a sala ${roomName} [Restaurante: ${restaurantName}]`);
    }

    return payload;
  }

  private formatRoomName(neighborhood: string): string {
    const cleanName = neighborhood
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    return `room:bairro:${cleanName}`;
  }
}
