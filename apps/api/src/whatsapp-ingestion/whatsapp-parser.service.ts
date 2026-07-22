import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  CreateDeliveryRequestDto,
  RawSourceEnum,
  DeliveryStatusEnum,
} from '../delivery-requests/dto/create-delivery-request.dto';

export interface ParseResult {
  totalMessagesProcessed: number;
  requestsCreated: number;
  errorsCount: number;
  extractedRequests: CreateDeliveryRequestDto[];
}

export const PATOS_DE_MINAS_NEIGHBORHOODS: string[] = [
  'Centro',
  'Céu Azul',
  'Panorâmico',
  'Sebastião Amorim',
  'Brasil',
  'Rosário',
  'Fátima',
  'Guanabara',
  'Ipanema',
  'Nossa Senhora das Graças',
  'Jardim Califórnia',
  'Jardim Esperança',
  'Lagoinha',
  'Planalto',
  'Bela Vista',
  'Abner Afonso',
  'Vila Garcia',
  'Santarém',
  'Vanderley de Paula',
  'Alto dos Caiçaras',
  'Caiçaras',
  'Marcondes',
  'Caramuru',
  'Novo Sorriso',
  'Padre Eustáquio',
  'Coronel Severiano',
  'Santo Antônio',
  'Laranjeiras',
  'Alvorada',
  'Residencial Monjolo',
  'Monjolo',
  'Residencial Eldorado',
  'Eldorado',
  'Boa Vista',
  'Vila Rosa',
  'Sorriso',
  'Gramado',
  'São Francisco',
  'Sobradinho',
  'Campos Elíseos',
  'Jardim Europa',
  'Alto da Serra',
  'Coração Eucarístico',
  'Jardim América',
  'Valparaíso',
  'Santa Terezinha',
  'Nossa Senhora Aparecida',
  'Aparecida',
  'Vila Santa Luzia',
  'Santa Luzia',
  'Jardim Vitória',
  'Cidade Jardim',
  'Quebec',
  'Peluzzo',
  'Afonso Queiroz',
  'Barreiro',
  'Cristo Redentor',
  'Cristo',
  'Nossa Senhora de Fátima',
  'Jardim Centro',
  'Santo Antonio',
  'Laguna',
];

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Injectable()
export class WhatsAppParserService {
  private readonly logger = new Logger(WhatsAppParserService.name);

  parseWhatsAppChat(content: string, defaultSource: RawSourceEnum = RawSourceEnum.WHATSAPP_DISPONIVEIS, neighborhoodsList?: string[]): ParseResult {
    if (!content || typeof content !== 'string') {
      return { totalMessagesProcessed: 0, requestsCreated: 0, errorsCount: 0, extractedRequests: [] };
    }

    const rawMessages = this.splitIntoMessages(content);
    const extractedRequests: CreateDeliveryRequestDto[] = [];
    let errorsCount = 0;

    for (const msgText of rawMessages) {
      try {
        const parsed = this.parseSingleMessage(msgText, defaultSource, neighborhoodsList);
        if (parsed) {
          extractedRequests.push(parsed);
        } else {
          errorsCount++;
        }
      } catch (err) {
        this.logger.debug(`Erro ao realizar parse de mensagem: ${(err as Error).message}`);
        errorsCount++;
      }
    }

    return {
      totalMessagesProcessed: rawMessages.length,
      requestsCreated: extractedRequests.length,
      errorsCount,
      extractedRequests,
    };
  }

  private splitIntoMessages(content: string): string[] {
    const lines = content.split(/\r?\n/);
    const messages: string[] = [];
    let currentMessage = '';

    const timestampRegex = /^(?:\[?\d{1,2}\/\d{1,2}\/\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\]?\s*[-–]?\s*)/;

    for (const line of lines) {
      if (timestampRegex.test(line.trim())) {
        if (currentMessage.trim()) {
          messages.push(currentMessage.trim());
        }
        currentMessage = line;
      } else {
        currentMessage += '\n' + line;
      }
    }

    if (currentMessage.trim()) {
      messages.push(currentMessage.trim());
    }

    return messages;
  }

  private parseSingleMessage(fullMessage: string, defaultSource: RawSourceEnum, neighborhoodsList?: string[]): CreateDeliveryRequestDto | null {
    const dateMatch = fullMessage.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})[,\s]+(\d{1,2}):(\d{2})/);
    let requestedAt = new Date();

    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      let year = parseInt(dateMatch[3], 10);
      if (year < 100) year += 2000;
      const hour = parseInt(dateMatch[4], 10);
      const minute = parseInt(dateMatch[5], 10);

      requestedAt = new Date(year, month, day, hour, minute);
    }

    const bodyMatch = fullMessage.match(/^(?:\[?.*?\]?\s*[-–]?\s*)(.*?):\s*([\s\S]*)$/);
    let senderName = 'Grupo WhatsApp';
    let textContent = fullMessage;

    if (bodyMatch) {
      senderName = bodyMatch[1].trim();
      textContent = bodyMatch[2].trim();
    }

    // Descarte de mensagens do sistema e conversas irrelevantes
    const textClean = removeAccents(textContent);
    if (
      textClean.includes('criptografia') ||
      textClean.includes('entrou usando o link') ||
      textClean.includes('criou o grupo') ||
      textClean.includes('adicionou') ||
      textClean.includes('removeu') ||
      textClean.includes('mudou') ||
      textClean.includes('saiu') ||
      textClean.includes('mensagem apagada') ||
      textClean === 'eu' ||
      textClean === 'indo' ||
      textClean === 'ok' ||
      textClean === 'sua' ||
      textClean === 'proximo'
    ) {
      return null;
    }

    let rawSource = defaultSource;
    if (
      fullMessage.toUpperCase().includes('GRUPO DL') ||
      fullMessage.toUpperCase().includes('ENTREGAS DL') ||
      fullMessage.toUpperCase().includes('DN_ ENTREGAS') ||
      textContent.toUpperCase().includes('DL')
    ) {
      rawSource = RawSourceEnum.WHATSAPP_GRUPO_DL;
    }

    const foundNeighborhoods = this.findNeighborhoods(textContent, neighborhoodsList);
    let pickupNeighborhood = foundNeighborhoods.pickup;
    let deliveryNeighborhood = foundNeighborhoods.delivery;

    if (!pickupNeighborhood && foundNeighborhoods.matchedList.length > 0) {
      pickupNeighborhood = foundNeighborhoods.matchedList[0];
    }
    if (!deliveryNeighborhood && foundNeighborhoods.matchedList.length > 1) {
      deliveryNeighborhood = foundNeighborhoods.matchedList[1];
    }

    if (!pickupNeighborhood || !deliveryNeighborhood) {
      return null;
    }

    let deliveryFee: number | undefined = undefined;
    const feeMatch = textContent.match(/(?:R\$\s*|taxa:?\s*|tx:?\s*|valor:?\s*|pago:?\s*)(\d+[\.,]?\d*)/i);
    if (feeMatch) {
      const valStr = feeMatch[1].replace(',', '.');
      const parsedVal = parseFloat(valStr);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        deliveryFee = parsedVal;
      }
    }

    const requesterName = senderName.startsWith('+') ? undefined : senderName;
    const requesterPhone = senderName.startsWith('+') ? senderName : undefined;

    const pickupLocationMatch = textContent.match(/(?:coleta|retirar|retirada|buscar|loja|restaurante):?\s*([A-Za-z0-9\s]+?)(?:[-,\n]|$)/i);
    const pickupLocation = pickupLocationMatch
      ? pickupLocationMatch[1].trim()
      : requesterName || 'Estabelecimento Patos de Minas';

    const hashPayload = `${requestedAt.toISOString()}|${senderName}|${pickupNeighborhood}|${deliveryNeighborhood}|${deliveryFee || 0}|${textContent.trim()}`;
    const messageHash = createHash('sha256').update(hashPayload).digest('hex');

    return {
      messageHash,
      rawSource,
      requesterName,
      requesterPhone,
      pickupLocation,
      pickupNeighborhood,
      deliveryAddress: undefined,
      deliveryNeighborhood,
      deliveryFee,
      requestedAt,
      dayOfWeek: requestedAt.getDay(),
      hourOfDay: requestedAt.getHours(),
      status: DeliveryStatusEnum.PENDING,
    };
  }

  private findNeighborhoods(text: string, neighborhoodsList?: string[]): { pickup?: string; delivery?: string; matchedList: string[] } {
    const textNormalized = removeAccents(text);
    const matchedList: string[] = [];

    const explicitPatternMatch = text.match(
      /(?:coleta|de|retirada|retirar|pegar|saida):?\s*([A-Za-zÀ-ÿ0-9\s]+?)\s*(?:->|para|entrega|entregar|levar|no|em|ate)\s*([A-Za-zÀ-ÿ0-9\s]+?)(?:[,\n\.]|$)/i,
    );

    const listToMatch = neighborhoodsList && neighborhoodsList.length > 0
      ? neighborhoodsList
      : PATOS_DE_MINAS_NEIGHBORHOODS;

    let explicitPickup: string | undefined;
    let explicitDelivery: string | undefined;

    if (explicitPatternMatch) {
      explicitPickup = this.matchNeighborhoodInText(explicitPatternMatch[1], listToMatch);
      explicitDelivery = this.matchNeighborhoodInText(explicitPatternMatch[2], listToMatch);
    }

    for (const neighborhood of listToMatch) {
      const neighNormalized = removeAccents(neighborhood);
      if (textNormalized.includes(neighNormalized)) {
        if (!matchedList.includes(neighborhood)) {
          matchedList.push(neighborhood);
        }
      }
    }

    return {
      pickup: explicitPickup || matchedList[0],
      delivery: explicitDelivery || matchedList[1],
      matchedList,
    };
  }

  private matchNeighborhoodInText(segment: string, listToMatch: string[]): string | undefined {
    const segmentNormalized = removeAccents(segment);
    return listToMatch.find((n) => segmentNormalized.includes(removeAccents(n)));
  }
}
