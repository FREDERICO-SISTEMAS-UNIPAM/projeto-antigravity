import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const LocateCoordinatesZodSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().optional(),
});

export class LocateCoordinatesDto {
  @ApiProperty({ description: 'Latitude GPS do entregador', example: -18.5872 })
  latitude!: number;

  @ApiProperty({ description: 'Longitude GPS do entregador', example: -46.5150 })
  longitude!: number;

  @ApiProperty({ description: 'Slug identificador da cidade (opcional)', example: 'patos-de-minas', required: false })
  city?: string;
}
