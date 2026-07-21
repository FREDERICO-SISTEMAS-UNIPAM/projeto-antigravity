import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export enum RawSourceEnum {
  WHATSAPP_GRUPO_DL = 'WHATSAPP_GRUPO_DL',
  WHATSAPP_DISPONIVEIS = 'WHATSAPP_DISPONIVEIS',
  IFOOD_HISTORIC = 'IFOOD_HISTORIC',
  RYD = 'RYD',
  MANUAL = 'MANUAL',
}

export enum DeliveryStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export const CreateDeliveryRequestZodSchema = z.object({
  messageHash: z.string().optional(),
  rawSource: z.nativeEnum(RawSourceEnum),
  requesterName: z.string().optional(),
  requesterPhone: z.string().optional(),
  pickupLocation: z.string().min(1, 'Origem do pedido é obrigatória'),
  pickupNeighborhood: z.string().min(1, 'Bairro de origem é obrigatório'),
  deliveryAddress: z.string().optional(),
  deliveryNeighborhood: z.string().min(1, 'Bairro de destino é obrigatório'),
  deliveryFee: z.number().nonnegative().optional(),
  requestedAt: z.string().or(z.date()).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  hourOfDay: z.number().int().min(0).max(23).optional(),
  status: z.nativeEnum(DeliveryStatusEnum).optional().default(DeliveryStatusEnum.PENDING),
});

export class CreateDeliveryRequestDto {
  @ApiPropertyOptional({ description: 'Hash SHA-256 para desduplicação da mensagem', example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' })
  messageHash?: string;

  @ApiProperty({
    enum: RawSourceEnum,
    description: 'Fonte dos dados brutos recebidos',
    example: RawSourceEnum.WHATSAPP_GRUPO_DL,
  })
  rawSource!: RawSourceEnum;

  @ApiPropertyOptional({ description: 'Nome do solicitante/restaurante', example: 'Restaurante Laranjinha' })
  requesterName?: string;

  @ApiPropertyOptional({ description: 'Telefone do solicitante', example: '(34) 99999-8888' })
  requesterPhone?: string;

  @ApiProperty({ description: 'Local de retirada', example: 'Padaria Maranata' })
  pickupLocation!: string;

  @ApiProperty({ description: 'Bairro de retirada em Patos de Minas', example: 'Céu Azul' })
  pickupNeighborhood!: string;

  @ApiPropertyOptional({ description: 'Endereço de entrega', example: 'Rua Major Gote, 1000' })
  deliveryAddress?: string;

  @ApiProperty({ description: 'Bairro de entrega em Patos de Minas', example: 'Panorâmico' })
  deliveryNeighborhood!: string;

  @ApiPropertyOptional({ description: 'Taxa de entrega cobrada', example: 12.50 })
  deliveryFee?: number;

  @ApiPropertyOptional({ description: 'Data/Hora em que a entrega foi solicitada', example: '2026-07-21T01:30:00.000Z' })
  requestedAt?: Date | string;

  @ApiPropertyOptional({ description: 'Dia da semana (0=Domingo, 6=Sábado)', example: 2 })
  dayOfWeek?: number;

  @ApiPropertyOptional({ description: 'Hora do dia (0 a 23)', example: 19 })
  hourOfDay?: number;

  @ApiPropertyOptional({
    enum: DeliveryStatusEnum,
    description: 'Status do pedido',
    default: DeliveryStatusEnum.PENDING,
    example: DeliveryStatusEnum.PENDING,
  })
  status?: DeliveryStatusEnum;
}
