import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryRequestDto } from './create-delivery-request.dto';

export class UpdateDeliveryRequestDto extends PartialType(CreateDeliveryRequestDto) {}
