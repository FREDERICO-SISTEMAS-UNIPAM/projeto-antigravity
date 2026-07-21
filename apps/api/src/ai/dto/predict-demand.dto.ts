import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const PredictDemandZodSchema = z.object({
  currentNeighborhood: z.string().min(1, 'Bairro atual é obrigatório'),
  currentLat: z.number().min(-90).max(90),
  currentLng: z.number().min(-180).max(180),
  currentDateTime: z.string().or(z.date()).optional(),
});

export class PredictDemandDto {
  @ApiProperty({ description: 'Bairro atual onde o motoboy se encontra', example: 'Centro' })
  currentNeighborhood!: string;

  @ApiProperty({ description: 'Latitude GPS atual do motoboy', example: -18.5789 })
  currentLat!: number;

  @ApiProperty({ description: 'Longitude GPS atual do motoboy', example: -46.5153 })
  currentLng!: number;

  @ApiPropertyOptional({ description: 'Data/Hora de referência da consulta', example: '2026-07-21T11:30:00.000Z' })
  currentDateTime?: Date | string;
}

export class AiPredictionResponseDto {
  @ApiProperty({ description: 'Bairro recomendado de Patos de Minas para deslocamento', example: 'Céu Azul' })
  recommendedNeighborhood!: string;

  @ApiProperty({ description: 'Porcentagem de probabilidade de surgimento de corridas (ex: 85%)', example: 85 })
  confidencePercentage!: number;

  @ApiProperty({ description: 'Explicação direta e focada no motoboy', example: 'Zona atual fria. O restaurante Laranjinha no Céu Azul costuma abrir demanda forte às 11:30.' })
  reasoning!: string;

  @ApiProperty({ description: 'Ponto estratégico sugerido para estacionar e aguardar', example: 'Av. JK próximo à Padaria Maranata (Céu Azul)' })
  hotspotAddress!: string;

  @ApiProperty({ description: 'Estimativa da taxa média de entrega na região de destino em R$', example: 13.50 })
  expectedAverageFee!: number;

  @ApiProperty({ description: 'Indica se a resposta veio da Gemini AI ou do Fallback Estatístico', example: 'GOOGLE_GEMINI_AI' })
  engineSource!: 'GOOGLE_GEMINI_AI' | 'DETERMINISTIC_FALLBACK';
}
