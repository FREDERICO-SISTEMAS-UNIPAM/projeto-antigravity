import { ApiProperty } from '@nestjs/swagger';

export class CalculateEtaQueryDto {
  @ApiProperty({ description: 'Bairro de origem de coleta em Patos de Minas', example: 'Centro' })
  originNeighborhood!: string;

  @ApiProperty({ description: 'Bairro de destino de entrega em Patos de Minas', example: 'Céu Azul' })
  destinationNeighborhood!: string;
}
