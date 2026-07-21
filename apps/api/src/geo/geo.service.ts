import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DistanceAndEtaResult {
  originNeighborhood: string;
  destinationNeighborhood: string;
  distanceKm: number;
  durationMinutes: number;
  source: 'HAUL_HAVERSINE' | 'GOOGLE_MAPS';
}

export interface LocatedNeighborhoodResult {
  neighborhood: any;
  distanceFromCenterKm: number;
}

const INITIAL_PATOS_NEIGHBORHOODS = [
  { name: 'Centro', latitude: -18.5789, longitude: -46.5153 },
  { name: 'Céu Azul', latitude: -18.6145, longitude: -46.5050 },
  { name: 'Panorâmico', latitude: -18.5952, longitude: -46.4905 },
  { name: 'Sebastião Amorim', latitude: -18.5950, longitude: -46.4800 },
  { name: 'Brasil', latitude: -18.5755, longitude: -46.5100 },
  { name: 'Rosário', latitude: -18.5850, longitude: -46.5120 },
  { name: 'Fátima', latitude: -18.5700, longitude: -46.5200 },
  { name: 'Guanabara', latitude: -18.5850, longitude: -46.5000 },
  { name: 'Ipanema', latitude: -18.6250, longitude: -46.5100 },
  { name: 'Abner Afonso', latitude: -18.5800, longitude: -46.5250 },
  { name: 'Alvorada', latitude: -18.6010, longitude: -46.5050 },
  { name: 'Lagoa Grande', latitude: -18.5800, longitude: -46.5180 },
  { name: 'Caramuru', latitude: -18.5900, longitude: -46.5080 },
  { name: 'Padre Eustáquio', latitude: -18.5720, longitude: -46.5220 },
  { name: 'Novo Horizonte', latitude: -18.6000, longitude: -46.4950 },
  { name: 'Gramado', latitude: -18.6060, longitude: -46.5000 },
  { name: 'Sobradinho', latitude: -18.5860, longitude: -46.5150 },
  { name: 'Quebec', latitude: -18.6100, longitude: -46.4980 },
  { name: 'Barreiro', latitude: -18.6050, longitude: -46.4850 },
  { name: 'Cristo Redentor', latitude: -18.5880, longitude: -46.5110 },
  { name: 'Jardim Europa', latitude: -18.5930, longitude: -46.4880 },
  { name: 'Alto da Serra', latitude: -18.6120, longitude: -46.4920 },
  { name: 'Coração Eucarístico', latitude: -18.5790, longitude: -46.5300 },
  { name: 'Vila Garcia', latitude: -18.5880, longitude: -46.5280 },
  { name: 'Jardim América', latitude: -18.5820, longitude: -46.5080 },
  { name: 'Santa Terezinha', latitude: -18.5840, longitude: -46.5020 },
  { name: 'Nossa Senhora Aparecida', latitude: -18.5760, longitude: -46.5200 },
];

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Trata a fórmula esférica Haversine para calcular a distância física em km entre duas coordenadas lat/lng.
   */
  public calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em KM
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(2));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Pre-popula o banco de dados com os bairros de Patos de Minas e coordenadas centrais.
   */
  async seedNeighborhoods() {
    let createdCount = 0;
    for (const item of INITIAL_PATOS_NEIGHBORHOODS) {
      await this.prisma.neighborhood.upsert({
        where: { name: item.name },
        update: { latitude: item.latitude, longitude: item.longitude },
        create: item,
      });
      createdCount++;
    }

    return {
      message: `${createdCount} bairros de Patos de Minas (MG) populados/atualizados com sucesso.`,
      count: createdCount,
    };
  }

  /**
   * Encontra o bairro cadastrado de Patos de Minas mais próximo da coordenada GPS do motoboy.
   */
  async getNeighborhoodFromCoordinates(latitude: number, longitude: number): Promise<LocatedNeighborhoodResult> {
    const neighborhoods = await this.prisma.neighborhood.findMany();

    if (neighborhoods.length === 0) {
      // Se a tabela estiver vazia, executa o seed automático
      await this.seedNeighborhoods();
      return this.getNeighborhoodFromCoordinates(latitude, longitude);
    }

    let closestNeighborhood = neighborhoods[0];
    let minDistance = Infinity;

    for (const neighborhood of neighborhoods) {
      if (neighborhood.latitude != null && neighborhood.longitude != null) {
        const dist = this.calculateHaversineDistance(latitude, longitude, neighborhood.latitude, neighborhood.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          closestNeighborhood = neighborhood;
        }
      }
    }

    return {
      neighborhood: closestNeighborhood,
      distanceFromCenterKm: minDistance,
    };
  }

  /**
   * Calcula distância e ETA estimado em minutos entre dois bairros de Patos de Minas.
   */
  async calculateDistanceAndEta(originName: string, destinationName: string): Promise<DistanceAndEtaResult> {
    const [origin, destination] = await Promise.all([
      this.prisma.neighborhood.findFirst({
        where: { name: { contains: originName, mode: 'insensitive' } },
      }),
      this.prisma.neighborhood.findFirst({
        where: { name: { contains: destinationName, mode: 'insensitive' } },
      }),
    ]);

    if (!origin || !destination) {
      throw new NotFoundException(
        `Não foi possível localizar as coordenadas para o par de bairros: "${originName}" -> "${destinationName}"`,
      );
    }

    const oLat = origin.latitude || -18.5789;
    const oLng = origin.longitude || -46.5153;
    const dLat = destination.latitude || -18.5789;
    const dLng = destination.longitude || -46.5153;

    // Distância direta com fator de tortuosidade urbana (1.35x para ruas de Patos de Minas)
    const directDist = this.calculateHaversineDistance(oLat, oLng, dLat, dLng);
    const urbanDistanceKm = parseFloat((directDist * 1.35).toFixed(2));

    // Velocidade média urbana da moto em Patos de Minas: ~30 km/h (0.5 km/min) + 3 min tempo de embarque
    const durationMinutes = Math.max(3, Math.round((urbanDistanceKm / 30) * 60 + 3));

    return {
      originNeighborhood: origin.name,
      destinationNeighborhood: destination.name,
      distanceKm: urbanDistanceKm,
      durationMinutes,
      source: 'HAUL_HAVERSINE',
    };
  }

  /**
   * Retorna a lista de todos os bairros cadastrados de Patos de Minas.
   */
  async findAllNeighborhoods() {
    const items = await this.prisma.neighborhood.findMany({
      orderBy: { name: 'asc' },
    });

    if (items.length === 0) {
      await this.seedNeighborhoods();
      return this.prisma.neighborhood.findMany({ orderBy: { name: 'asc' } });
    }

    return items;
  }
}
