import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveryRequestsService } from './delivery-requests.service';
import { RawSourceEnum, DeliveryStatusEnum } from './dto/create-delivery-request.dto';

describe('DeliveryRequestsService', () => {
  let service: DeliveryRequestsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      deliveryRequest: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'uuid-123', ...data })),
        createMany: vi.fn().mockImplementation(({ data }) => Promise.resolve({ count: data.length })),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'existing-id') {
            return Promise.resolve({ id: 'existing-id', pickupLocation: 'Test Location' });
          }
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'existing-id', ...data })),
        delete: vi.fn().mockResolvedValue({ id: 'existing-id' }),
      },
    };

    service = new DeliveryRequestsService(mockPrisma);
  });

  it('deve criar uma solicitação de entrega calculando dayOfWeek e hourOfDay automaticamente', async () => {
    const requestedAt = new Date('2026-07-21T19:30:00.000Z');

    const result = await service.create({
      rawSource: RawSourceEnum.WHATSAPP_GRUPO_DL,
      requesterName: 'Restaurante Laranjinha',
      pickupLocation: 'Padaria Maranata',
      pickupNeighborhood: 'Céu Azul',
      deliveryNeighborhood: 'Panorâmico',
      requestedAt,
    });

    expect(result.id).toBe('uuid-123');
    expect(result.rawSource).toBe('WHATSAPP_GRUPO_DL');
    expect(result.pickupNeighborhood).toBe('Céu Azul');
    expect(result.deliveryNeighborhood).toBe('Panorâmico');
    expect(result.dayOfWeek).toBe(requestedAt.getDay());
    expect(result.hourOfDay).toBe(requestedAt.getHours());
  });

  it('deve criar em lote (bulk create) com sucesso', async () => {
    const result = await service.createBulk({
      items: [
        {
          rawSource: RawSourceEnum.IFOOD_HISTORIC,
          pickupLocation: 'Lanchonete X',
          pickupNeighborhood: 'Centro',
          deliveryNeighborhood: 'Rosário',
        },
        {
          rawSource: RawSourceEnum.RYD,
          pickupLocation: 'Pizzaria Y',
          pickupNeighborhood: 'Brasil',
          deliveryNeighborhood: 'Fátima',
        },
      ],
    });

    expect(result.count).toBe(2);
    expect(result.message).toContain('2 solicitações de entrega inseridas com sucesso');
  });

  it('deve lançar exceção 404 ao buscar ID inexistente', async () => {
    await expect(service.findOne('non-existent-id')).rejects.toThrow('não encontrada');
  });
});
