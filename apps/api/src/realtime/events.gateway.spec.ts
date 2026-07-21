import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventsGateway } from './events.gateway';

describe('EventsGateway (Módulo 5 - WebSockets & IoT Gateway)', () => {
  let gateway: EventsGateway;
  let mockSocket: any;
  let mockServer: any;

  beforeEach(() => {
    gateway = new EventsGateway();

    mockSocket = {
      id: 'socket-motoboy-01',
      join: vi.fn(),
      leave: vi.fn(),
    };

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    gateway.server = mockServer as any;
  });

  it('deve associar o motoboy à sala do bairro ao receber a atualização de localização', () => {
    const response = gateway.handleLocationUpdate(mockSocket as any, {
      motoboyId: 'motoboy-123',
      neighborhood: 'Céu Azul',
    });

    expect(response?.joinedRoom).toBe('room:bairro:ceu-azul');
    expect(mockSocket.join).toHaveBeenCalledWith('room:bairro:ceu-azul');
  });

  it('deve alternar de sala quando o motoboy mudar de bairro em Patos de Minas', () => {
    gateway.handleLocationUpdate(mockSocket as any, { neighborhood: 'Centro' });
    expect(mockSocket.join).toHaveBeenCalledWith('room:bairro:centro');

    gateway.handleLocationUpdate(mockSocket as any, { neighborhood: 'Panorâmico' });
    expect(mockSocket.leave).toHaveBeenCalledWith('room:bairro:centro');
    expect(mockSocket.join).toHaveBeenCalledWith('room:bairro:panoramico');
  });

  it('deve emitir o alerta de digitação com o comando BLE correto para o chaveiro físico', () => {
    const payload = gateway.emitTypingAlert('Restaurante Laranjinha', 'Céu Azul');

    expect(payload.restaurantName).toBe('Restaurante Laranjinha');
    expect(payload.neighborhood).toBe('Céu Azul');
    expect(payload.bleSignal.action).toBe('PULSE_YELLOW');
    expect(payload.bleSignal.soundBip).toBe(true);
    expect(payload.bleSignal.durationMs).toBe(5000);
    expect(payload.message).toContain('Restaurante Laranjinha está preparando uma entrega na sua região!');

    expect(mockServer.to).toHaveBeenCalledWith('room:bairro:ceu-azul');
    expect(mockServer.emit).toHaveBeenCalledWith('merchants:typing', payload);
  });
});
