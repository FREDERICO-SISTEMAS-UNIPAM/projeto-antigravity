import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../geo/geo.service';
import { PredictDemandDto, AiPredictionResponseDto } from './dto/predict-demand.dto';
import { ReturnRouteDto } from './dto/return-route.dto';

@Injectable()
export class PredictionAiService {
  private readonly logger = new Logger(PredictionAiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geoService: GeoService,
  ) {}

  /**
   * Realiza a predição espaço-temporal para o motoboy usando Google Gemini AI SDK com Fallback Estatístico.
   */
  async predictDemand(dto: PredictDemandDto): Promise<AiPredictionResponseDto> {
    const requestedAt = dto.currentDateTime ? new Date(dto.currentDateTime) : new Date();
    const dayOfWeek = requestedAt.getDay();
    const hourOfDay = requestedAt.getHours();

    const citySlug = dto.city || 'patos-de-minas';
    let city = await this.prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      await this.geoService.seedNeighborhoods(citySlug);
      city = await this.prisma.city.findUnique({ where: { slug: citySlug } }) as any;
    }

    // 1. Consultar densidade histórica no PostgreSQL via Prisma para a janela de horário (+/- 1h) filtrando pela cidade
    const historicalStats = await this.getNeighborhoodDemandStats(dayOfWeek, hourOfDay, city?.id);

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Se a chave da Gemini API estiver configurada, chama o modelo Gemini AI
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const geminiResult = await this.callGeminiApi(dto, historicalStats, requestedAt, city);
        if (geminiResult) {
          return {
            ...geminiResult,
            engineSource: 'GOOGLE_GEMINI_AI',
          };
        }
      } catch (err) {
        this.logger.warn(`Erro na chamada da Gemini API. Acionando fallback estatístico: ${(err as Error).message}`);
      }
    }

    // 3. Fallback Determinístico Estatístico caso a chave Gemini não esteja presente ou ocorra erro
    return this.generateDeterministicFallback(dto, historicalStats, dayOfWeek, hourOfDay, city);
  }

  /**
   * Algoritmo "Bag Cheia": Sugere rota de retorno com parada intermediária estratégica para evitar viagens com a bag vazia.
   */
  async recommendReturnRoute(dto: ReturnRouteDto): Promise<AiPredictionResponseDto> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hourOfDay = now.getHours();

    const citySlug = dto.city || 'patos-de-minas';
    let city = await this.prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      await this.geoService.seedNeighborhoods(citySlug);
      city = await this.prisma.city.findUnique({ where: { slug: citySlug } }) as any;
    }

    const historicalStats = await this.getNeighborhoodDemandStats(dayOfWeek, hourOfDay, city?.id);
    const destNeighborhood = dto.deliveryDestinationNeighborhood;

    // Filtra bairros que não são o próprio bairro periférico de destino
    const candidates = historicalStats.filter((item) => item.neighborhood.toLowerCase() !== destNeighborhood.toLowerCase());

    const topCandidate = candidates[0] || {
      neighborhood: 'Centro',
      count: 15,
      avgFee: 12.0,
    };

    return {
      recommendedNeighborhood: topCandidate.neighborhood,
      confidencePercentage: 88,
      reasoning: `Ao sair do bairro ${destNeighborhood}, posicione-se em ${topCandidate.neighborhood}. O corredor de retorno apresenta histórico elevado de chamadas nos próximos 15 minutos, otimizando seu tempo e evitando rodar com a bag vazia em ${city?.name || 'Patos de Minas'}.`,
      hotspotAddress: `Av. Principal de ${topCandidate.neighborhood}, ${city?.name || 'Patos de Minas'} (${city?.state || 'MG'})`,
      expectedAverageFee: topCandidate.avgFee,
      engineSource: 'DETERMINISTIC_FALLBACK',
    };
  }

  /**
   * Consulta agregada de pedidos no Prisma por bairro para o dia da semana e janela de horário e cidade específicos.
   */
  private async getNeighborhoodDemandStats(dayOfWeek: number, hourOfDay: number, cityId?: string) {
    const hourMin = (hourOfDay - 1 + 24) % 24;
    const hourMax = (hourOfDay + 1) % 24;

    const rawRequests = await this.prisma.deliveryRequest.findMany({
      where: {
        cityId,
        dayOfWeek,
        hourOfDay: { in: [hourMin, hourOfDay, hourMax] },
      },
      select: {
        pickupNeighborhood: true,
        deliveryFee: true,
      },
    });

    const neighborhoodMap = new Map<string, { count: number; totalFee: number }>();

    for (const req of rawRequests) {
      const neigh = req.pickupNeighborhood;
      const fee = req.deliveryFee ? Number(req.deliveryFee) : 11.0;

      const current = neighborhoodMap.get(neigh) || { count: 0, totalFee: 0 };
      neighborhoodMap.set(neigh, {
        count: current.count + 1,
        totalFee: current.totalFee + fee,
      });
    }

    const stats = Array.from(neighborhoodMap.entries()).map(([neighborhood, data]) => ({
      neighborhood,
      count: data.count,
      avgFee: parseFloat((data.totalFee / data.count).toFixed(2)),
    }));

    // Ordena do maior volume de pedidos para o menor
    stats.sort((a, b) => b.count - a.count);

    if (stats.length === 0) {
      return [
        { neighborhood: 'Céu Azul', count: 12, avgFee: 13.5 },
        { neighborhood: 'Centro', count: 10, avgFee: 11.0 },
        { neighborhood: 'Panorâmico', count: 8, avgFee: 12.5 },
        { neighborhood: 'Sebastião Amorim', count: 7, avgFee: 14.0 },
      ];
    }

    return stats;
  }

  /**
   * Chamada ao SDK oficial da Google Gemini AI.
   */
  private async callGeminiApi(dto: PredictDemandDto, stats: any[], requestedAt: Date, city: any) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
Você é o motor preditivo do software DeliveryBoy AI para entregadores de moto em ${city?.name || 'Patos de Minas'} (${city?.state || 'MG'}).
Contexto do Entregador:
- Bairro Atual: ${dto.currentNeighborhood}
- Posição GPS Atual: Lat ${dto.currentLat}, Lng ${dto.currentLng}
- Horário da Consulta: ${requestedAt.toLocaleString('pt-BR')}

Dados Históricos de Demandas de Entregas nesta janela de horário em ${city?.name || 'Patos de Minas'}:
${JSON.stringify(stats, null, 2)}

Responda APENAS com um objeto JSON estrito sem markdown, sem explicações adicionais, no seguinte formato:
{
  "recommendedNeighborhood": "Nome do Bairro Recomendado",
  "confidencePercentage": 85,
  "reasoning": "Explicação curta e direta ao motoboy sobre por que ir para lá",
  "hotspotAddress": "Ponto de referência/estacionamento sugerido no bairro",
  "expectedAverageFee": 12.50
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleanJson);
      return {
        recommendedNeighborhood: parsed.recommendedNeighborhood || 'Céu Azul',
        confidencePercentage: Number(parsed.confidencePercentage) || 85,
        reasoning: parsed.reasoning || `Sua zona atual (${dto.currentNeighborhood}) está fria. Alta demanda identificada na região sugerida.`,
        hotspotAddress: parsed.hotspotAddress || `Ponto central de ${parsed.recommendedNeighborhood || 'Céu Azul'}, ${city?.name || 'Patos de Minas'} (${city?.state || 'MG'})`,
        expectedAverageFee: Number(parsed.expectedAverageFee) || 12.5,
      };
    } catch (err) {
      this.logger.debug(`Falha ao invocar o Gemini SDK: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Gera a resposta preditiva usando fallback estatístico quando a Gemini API não estiver disponível.
   */
  private generateDeterministicFallback(dto: PredictDemandDto, stats: any[], dayOfWeek: number, hourOfDay: number, city: any): AiPredictionResponseDto {
    const topNeighborhood = stats[0] || { neighborhood: 'Céu Azul', count: 15, avgFee: 13.0 };
    const totalVolume = stats.reduce((acc, s) => acc + s.count, 0) || 1;
    const confidencePercentage = Math.min(95, Math.max(70, Math.round((topNeighborhood.count / totalVolume) * 100 + 40)));

    const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return {
      recommendedNeighborhood: topNeighborhood.neighborhood,
      confidencePercentage,
      reasoning: `Sua zona atual (${dto.currentNeighborhood}) apresenta baixa densidade. O bairro ${topNeighborhood.neighborhood} concentra o maior volume histórico de chamadas em ${daysMap[dayOfWeek]}s por volta das ${hourOfDay}h em ${city?.name || 'Patos de Minas'}.`,
      hotspotAddress: `Cruzamento principal no bairro ${topNeighborhood.neighborhood}, ${city?.name || 'Patos de Minas'} (${city?.state || 'MG'})`,
      expectedAverageFee: topNeighborhood.avgFee,
      engineSource: 'DETERMINISTIC_FALLBACK',
    };
  }
}
