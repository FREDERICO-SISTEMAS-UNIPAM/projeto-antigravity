import { ApiProperty } from '@nestjs/swagger';
import { CreateDeliveryRequestDto } from './create-delivery-request.dto';

export class BulkCreateDeliveryRequestsDto {
  @ApiProperty({
    type: [CreateDeliveryRequestDto],
    description: 'Lista de solicitações de entrega para inserção em lote (Bulk Create)',
  })
  items!: CreateDeliveryRequestDto[];
}
