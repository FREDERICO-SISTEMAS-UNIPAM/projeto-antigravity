import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { WhatsAppParserService } from './whatsapp-parser.service';
import { DeliveryRequestsService } from '../delivery-requests/delivery-requests.service';
import { RawSourceEnum } from '../delivery-requests/dto/create-delivery-request.dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('WhatsApp Ingestion (Módulo 2)')
@Controller('api/whatsapp')
export class WhatsAppIngestionController {
  constructor(
    private readonly whatsappParserService: WhatsAppParserService,
    private readonly deliveryRequestsService: DeliveryRequestsService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de arquivo de log .txt do WhatsApp',
    description: 'Processa mensagens exportadas do WhatsApp de grupos de Patos de Minas e realiza a gravação em lote (Bulk Create) no PostgreSQL.',
  })
  @ApiQuery({
    name: 'defaultSource',
    enum: RawSourceEnum,
    required: false,
    description: 'Fonte padrão caso não identificada no arquivo (ex: WHATSAPP_GRUPO_DL ou WHATSAPP_DISPONIVEIS)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo .txt exportado do WhatsApp',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Log processado com sucesso. Retorna estatísticas da ingestão.',
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou não fornecido.' })
  async uploadWhatsAppChat(
    @UploadedFile() file: MulterFile,
    @Query('defaultSource') defaultSource?: RawSourceEnum,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('É necessário enviar um arquivo de log do WhatsApp (.txt).');
    }

    const fileContent = file.buffer.toString('utf-8');
    const sourceEnum = defaultSource || RawSourceEnum.WHATSAPP_DISPONIVEIS;

    // 1. Parsing do chat via WhatsAppParserService
    const parseResult = this.whatsappParserService.parseWhatsAppChat(fileContent, sourceEnum);

    let savedCount = 0;

    // 2. Gravação em lote no banco via DeliveryRequestsService se houver itens válidos
    if (parseResult.extractedRequests.length > 0) {
      const bulkResult = await this.deliveryRequestsService.createBulk({
        items: parseResult.extractedRequests,
      });
      savedCount = bulkResult.count;
    }

    return {
      totalMessagesProcessed: parseResult.totalMessagesProcessed,
      requestsCreated: parseResult.requestsCreated,
      errorsCount: parseResult.errorsCount,
      savedCount,
      message: `Ingestão de logs de WhatsApp concluída. ${savedCount} registros de entrega salvos no histórico.`,
    };
  }
}
