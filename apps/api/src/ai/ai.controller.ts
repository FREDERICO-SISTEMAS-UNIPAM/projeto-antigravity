import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PredictionAiService } from './prediction-ai.service';
import { PredictDemandDto, AiPredictionResponseDto } from './dto/predict-demand.dto';
import { ReturnRouteDto } from './dto/return-route.dto';

@ApiTags('DeliveryBoy AI Engine (Módulo 4)')
@Controller('api/ai')
export class AiController {
  constructor(private readonly predictionAiService: PredictionAiService) {}

  @Post('predict')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera a recomendação preditiva espaço-temporal para o motoboy em Patos de Minas (MG)',
    description: 'Analisa o histórico no PostgreSQL e consulta a Gemini AI para calcular para qual bairro o motoboy deve se deslocar antes que os pedidos surjam.',
  })
  @ApiResponse({
    status: 200,
    type: AiPredictionResponseDto,
    description: 'Recomendação preditiva calculada com sucesso.',
  })
  predictDemand(@Body() dto: PredictDemandDto): Promise<AiPredictionResponseDto> {
    return this.predictionAiService.predictDemand(dto);
  }

  @Post('return-route')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Algoritmo "Bag Cheia": Sugere rota de retorno com parada intermediária estratégica',
    description: 'Calcula o bairro com maior probabilidade de gerar corridas no trajeto de volta após finalizar uma entrega periférica.',
  })
  @ApiResponse({
    status: 200,
    type: AiPredictionResponseDto,
    description: 'Recomendação de rota de retorno gerada com sucesso.',
  })
  recommendReturnRoute(@Body() dto: ReturnRouteDto): Promise<AiPredictionResponseDto> {
    return this.predictionAiService.recommendReturnRoute(dto);
  }
}
