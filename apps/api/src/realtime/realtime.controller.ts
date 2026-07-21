import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsGateway } from './events.gateway';
import { SimulateTypingDto } from './dto/simulate-typing.dto';

@ApiTags('WebSockets & Tempo Real (Módulo 5)')
@Controller('api/realtime')
export class RealtimeController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @Post('simulate-typing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simula o evento de digitação/preparação de pedido por um restaurante',
    description: 'Dispara um evento WebSocket em tempo real para a sala do bairro informado com o payload de sinalização BLE do chaveiro físico.',
  })
  @ApiResponse({ status: 200, description: 'Evento emitido com sucesso para a sala geográfica.' })
  simulateTyping(@Body() dto: SimulateTypingDto) {
    return this.eventsGateway.emitTypingAlert(dto.restaurantName, dto.neighborhood);
  }
}
