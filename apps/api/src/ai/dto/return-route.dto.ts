import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReturnRouteDto {
  @ApiProperty({ description: 'Bairro onde o motoboy acabou de finalizar a entrega', example: 'Panorâmico' })
  deliveryDestinationNeighborhood!: string;

  @ApiPropertyOptional({ description: 'Latitude GPS atual', example: -18.5952 })
  currentLat?: number;

  @ApiPropertyOptional({ description: 'Longitude GPS atual', example: -46.4905 })
  currentLng?: number;

  @ApiPropertyOptional({ description: 'Slug identificador da cidade (opcional)', example: 'patos-de-minas', required: false })
  city?: string;
}
