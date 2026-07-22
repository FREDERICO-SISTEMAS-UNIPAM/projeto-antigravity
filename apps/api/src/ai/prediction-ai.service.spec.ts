import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PredictionAiService } from './prediction-ai.service';

describe('PredictionAiService (Módulo 4 - Motor Preditivo)', () => {
  let service: PredictionAiService;
  let mockPrisma: any;
  let mockGeo: any;

  beforeEach(() => {
    mockPrisma = {
      city: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'mock-city-id',
          name: 'Patos de Minas',
          state: 'MG',
          slug: 'patos-de-minas',
        }),
      },
      deliveryRequest: {
        findMany: vi.fn().mockResolvedValue([
          { pickupNeighborhood: 'Céu Azul', deliveryFee: 13.5 },
          { pickupNeighborhood: 'Céu Azul', deliveryFee: 14.0 },
          { pickupNeighborhood: 'Centro', deliveryFee: 11.0 },
        ]),
      },
    };

    mockGeo = {
      calculateDistanceAndEta: vi.fn().mockResolvedValue({
        distanceKm: 3.5,
        durationMinutes: 8,
      }),
    };

    service = new PredictionAiService(mockPrisma, mockGeo);
  });

  it('deve gerar predição de demanda com fallback determinístico caso a GEMINI_API_KEY não esteja definida', async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await service.predictDemand({
      currentNeighborhood: 'Centro',
      currentLat: -18.5789,
      currentLng: -46.5153,
      currentDateTime: new Date('2026-07-21T11:30:00.000Z'),
    });

    expect(result.recommendedNeighborhood).toBe('Céu Azul');
    expect(result.confidencePercentage).toBeGreaterThanOrEqual(70);
    expect(result.reasoning).toContain('Céu Azul');
    expect(result.hotspotAddress).toContain('Céu Azul');
    expect(result.expectedAverageFee).toBe(13.75);
    expect(result.engineSource).toBe('DETERMINISTIC_FALLBACK');
  });

  it('deve recomendar rota de retorno eficiente ("Bag Cheia") para o motoboy', async () => {
    const returnRoute = await service.recommendReturnRoute({
      deliveryDestinationNeighborhood: 'Panorâmico',
      currentLat: -18.5952,
      currentLng: -46.4905,
    });

    expect(returnRoute.recommendedNeighborhood).toBeDefined();
    expect(returnRoute.reasoning).toContain('Panorâmico');
    expect(returnRoute.reasoning).toContain('bag vazia');
    expect(returnRoute.confidencePercentage).toBe(88);
  });
});
