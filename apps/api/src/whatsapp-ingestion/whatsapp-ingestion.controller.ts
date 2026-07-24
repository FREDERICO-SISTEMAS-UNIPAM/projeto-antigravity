import {
  Controller,
  Get,
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
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppMonitorService } from './whatsapp-monitor.service';

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
    private readonly prisma: PrismaService,
    private readonly whatsappMonitorService: WhatsAppMonitorService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Retorna o status atual de conexão do WhatsApp e o QR Code se disponível',
  })
  getWhatsAppStatus() {
    return this.whatsappMonitorService.getStatus();
  }

  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Força a inicialização da conexão física com o WhatsApp para gerar um novo QR Code',
  })
  async connectWhatsApp() {
    await this.whatsappMonitorService.initWhatsAppConnection(true);
    return { message: 'Iniciando pareamento do WhatsApp...', status: 'connecting' };
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fecha a conexão ativa do WhatsApp e apaga a sessão local de credenciais',
  })
  async disconnectWhatsApp() {
    await this.whatsappMonitorService.disconnect();
    return { message: 'Desconectado do WhatsApp e credenciais limpas.', status: 'disconnected' };
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de arquivo de log .txt do WhatsApp',
    description: 'Processa mensagens exportadas do WhatsApp de grupos e realiza a gravação em lote (Bulk Create) no PostgreSQL.',
  })
  @ApiQuery({
    name: 'defaultSource',
    enum: RawSourceEnum,
    required: false,
    description: 'Fonte padrão caso não identificada no arquivo (ex: WHATSAPP_GRUPO_DL ou WHATSAPP_DISPONIVEIS)',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Slug identificador da cidade (opcional, padrão: patos-de-minas)',
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
    @Query('city') citySlug?: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('É necessário enviar um arquivo de log do WhatsApp (.txt).');
    }

    const fileContent = file.buffer.toString('utf-8');
    const sourceEnum = defaultSource || RawSourceEnum.WHATSAPP_DISPONIVEIS;

    let neighborhoodsList: string[] | undefined = undefined;
    
    // Se a cidade for especificada, buscaremos os bairros cadastrados para ela
    if (citySlug) {
      const city = await this.prisma.city.findUnique({ where: { slug: citySlug } });
      if (city) {
        const neighborhoods = await this.prisma.neighborhood.findMany({
          where: { cityId: city.id },
          select: { name: true },
        });
        neighborhoodsList = neighborhoods.map(n => n.name);
      }
    }

    // 1. Parsing do chat via WhatsAppParserService com a lista de bairros dinâmica
    const parseResult = this.whatsappParserService.parseWhatsAppChat(fileContent, sourceEnum, neighborhoodsList);

    let savedCount = 0;

    // Se uma cidade foi identificada e os requests forem criados, associaremos o cityId a eles
    const cityRecord = citySlug ? await this.prisma.city.findUnique({ where: { slug: citySlug } }) : null;
    const itemsWithCity = parseResult.extractedRequests.map(item => ({
      ...item,
      cityId: cityRecord?.id || null,
    }));

    // 2. Gravação em lote no banco via DeliveryRequestsService se houver itens válidos
    if (itemsWithCity.length > 0) {
      const bulkResult = await this.deliveryRequestsService.createBulk({
        items: itemsWithCity as any,
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
