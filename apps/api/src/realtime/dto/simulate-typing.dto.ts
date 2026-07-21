import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const SimulateTypingZodSchema = z.object({
  restaurantName: z.string().min(1, 'Nome do restaurante é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
});

export class SimulateTypingDto {
  @ApiProperty({ description: 'Nome do restaurante/estabelecimento', example: 'Restaurante Laranjinha' })
  restaurantName!: string;

  @ApiProperty({ description: 'Bairro de Patos de Minas onde o pedido está sendo gerado', example: 'Céu Azul' })
  neighborhood!: string;
}
