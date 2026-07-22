import { ApiProperty } from '@nestjs/swagger';

export class CalculateEtaQueryDto {
  @ApiProperty({ description: 'Bairro de origem de coleta', example: 'Centro' })
  originNeighborhood!: string;

  @ApiProperty({ description: 'Bairro de destino de entrega', example: 'Céu Azul' })
  destinationNeighborhood!: string;

  @ApiProperty({ description: 'Slug identificador da cidade (opcional)', example: 'patos-de-minas', required: false })
  city?: string;
}
