import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DeliveryRequestsService } from './delivery-requests.service';
import { CreateDeliveryRequestDto } from './dto/create-delivery-request.dto';
import { BulkCreateDeliveryRequestsDto } from './dto/bulk-create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from './dto/update-delivery-request.dto';
import { QueryDeliveryRequestsDto } from './dto/query-delivery-request.dto';

@ApiTags('Delivery Requests (Historian)')
@Controller('delivery-requests')
export class DeliveryRequestsController {
  constructor(private readonly deliveryRequestsService: DeliveryRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova solicitação de entrega individual' })
  @ApiResponse({ status: 201, description: 'Solicitação de entrega registrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  create(@Body() createDto: CreateDeliveryRequestDto) {
    return this.deliveryRequestsService.create(createDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Insere múltiplas solicitações de entrega em lote (Bulk Create)' })
  @ApiResponse({ status: 201, description: 'Registros em lote inseridos com sucesso' })
  @ApiResponse({ status: 400, description: 'Lista inválida ou vazia' })
  createBulk(@Body() bulkDto: BulkCreateDeliveryRequestsDto) {
    return this.deliveryRequestsService.createBulk(bulkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista solicitações de entrega registradas com suporte a filtros por bairro e histórico' })
  @ApiResponse({ status: 200, description: 'Lista paginada de solicitações retornada' })
  findAll(@Query() query: QueryDeliveryRequestsDto) {
    return this.deliveryRequestsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes de uma solicitação de entrega pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID da solicitação de entrega' })
  @ApiResponse({ status: 200, description: 'Detalhes da solicitação retornados' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.deliveryRequestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de uma solicitação de entrega' })
  @ApiParam({ name: 'id', description: 'UUID da solicitação de entrega' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  update(@Param('id') id: string, @Body() updateDto: UpdateDeliveryRequestDto) {
    return this.deliveryRequestsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma solicitação de entrega' })
  @ApiParam({ name: 'id', description: 'UUID da solicitação de entrega' })
  @ApiResponse({ status: 204, description: 'Solicitação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  remove(@Param('id') id: string) {
    return this.deliveryRequestsService.remove(id);
  }
}
