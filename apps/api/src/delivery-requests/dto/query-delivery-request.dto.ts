import { ApiPropertyOptional } from '@nestjs/swagger';
import { RawSourceEnum, DeliveryStatusEnum } from './create-delivery-request.dto';

export class QueryDeliveryRequestsDto {
  @ApiPropertyOptional({ description: 'Filtrar por bairro de busca/retirada' })
  pickupNeighborhood?: string;

  @ApiPropertyOptional({ description: 'Filtrar por bairro de entrega' })
  deliveryNeighborhood?: string;

  @ApiPropertyOptional({ enum: RawSourceEnum, description: 'Filtrar por origem dos dados' })
  rawSource?: RawSourceEnum;

  @ApiPropertyOptional({ enum: DeliveryStatusEnum, description: 'Filtrar por status' })
  status?: DeliveryStatusEnum;

  @ApiPropertyOptional({ description: 'Filtrar por dia da semana (0-6)' })
  dayOfWeek?: number;

  @ApiPropertyOptional({ description: 'Filtrar por hora do dia (0-23)' })
  hourOfDay?: number;

  @ApiPropertyOptional({ description: 'Limite de registros retornados', default: 50 })
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  offset?: number;
}
