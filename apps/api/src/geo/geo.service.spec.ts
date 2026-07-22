import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeoService } from './geo.service';

describe('GeoService (Módulo 3 - Geolocalização)', () => {
  let geoService: GeoService;
  let mockPrisma: any;

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
      neighborhood: {
        findMany: vi.fn().mockResolvedValue([
          { id: '1', name: 'Centro', latitude: -18.5789, longitude: -46.5153 },
          { id: '2', name: 'Céu Azul', latitude: -18.6145, longitude: -46.5050 },
          { id: '3', name: 'Panorâmico', latitude: -18.5952, longitude: -46.4905 },
        ]),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          const searchName = where.name.contains.toLowerCase();
          if ('centro'.includes(searchName)) return Promise.resolve({ id: '1', name: 'Centro', latitude: -18.5789, longitude: -46.5153 });
          if ('céu azul'.includes(searchName) || 'ceu azul'.includes(searchName)) return Promise.resolve({ id: '2', name: 'Céu Azul', latitude: -18.6145, longitude: -46.5050 });
          return Promise.resolve(null);
        }),
        upsert: vi.fn().mockResolvedValue({ id: 'seeded-id' }),
      },
    };

    geoService = new GeoService(mockPrisma);
  });

  it('deve calcular a distância esférica Haversine corretamente', () => {
    // Distância entre Centro e Céu Azul em Patos de Minas
    const dist = geoService.calculateHaversineDistance(-18.5789, -46.5153, -18.6145, -46.5050);
    expect(dist).toBeGreaterThan(3.5);
    expect(dist).toBeLessThan(5.0);
  });

  it('deve identificar o bairro mais próximo dada uma coordenada GPS', async () => {
    // Coordenada próxima ao Céu Azul
    const result = await geoService.getNeighborhoodFromCoordinates(-18.6140, -46.5048);
    expect(result.neighborhood.name).toBe('Céu Azul');
    expect(result.distanceFromCenterKm).toBeLessThan(0.5);
  });

  it('deve calcular a distância urbana e o ETA em minutos entre dois bairros', async () => {
    const eta = await geoService.calculateDistanceAndEta('Centro', 'Céu Azul');
    expect(eta.originNeighborhood).toBe('Centro');
    expect(eta.destinationNeighborhood).toBe('Céu Azul');
    expect(eta.distanceKm).toBeGreaterThan(4.0);
    expect(eta.durationMinutes).toBeGreaterThanOrEqual(10);
    expect(eta.source).toBe('HAUL_HAVERSINE');
  });
});
