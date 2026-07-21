import { describe, it, expect, beforeEach } from 'vitest';
import { WhatsAppParserService } from './whatsapp-parser.service';
import { RawSourceEnum } from '../delivery-requests/dto/create-delivery-request.dto';

describe('WhatsAppParserService (Módulo 2)', () => {
  let parserService: WhatsAppParserService;

  beforeEach(() => {
    parserService = new WhatsAppParserService();
  });

  it('deve extrair dados de mensagens no formato colchetes [DD/MM/YYYY, HH:mm:ss]', () => {
    const sampleChat = `
[21/07/2026, 19:15:00] Restaurante Laranjinha: Coleta: Céu Azul -> Entrega: Panorâmico R$ 12,50
[21/07/2026, 19:20:00] +55 34 99999-8888: Busca no bairro Brasil entrega no Sebastião Amorim valor R$ 15
    `.trim();

    const result = parserService.parseWhatsAppChat(sampleChat, RawSourceEnum.WHATSAPP_DISPONIVEIS);

    expect(result.totalMessagesProcessed).toBe(2);
    expect(result.requestsCreated).toBe(2);
    expect(result.errorsCount).toBe(0);

    const first = result.extractedRequests[0];
    expect(first.requesterName).toBe('Restaurante Laranjinha');
    expect(first.pickupNeighborhood).toBe('Céu Azul');
    expect(first.deliveryNeighborhood).toBe('Panorâmico');
    expect(first.deliveryFee).toBe(12.5);
    expect(first.dayOfWeek).toBe(2); // 21/07/2026 é Terça-feira (2)

    const second = result.extractedRequests[1];
    expect(second.requesterPhone).toBe('+55 34 99999-8888');
    expect(second.pickupNeighborhood).toBe('Brasil');
    expect(second.deliveryNeighborhood).toBe('Sebastião Amorim');
    expect(second.deliveryFee).toBe(15);
  });

  it('deve identificar o Grupo DL e alterar rawSource para WHATSAPP_GRUPO_DL', () => {
    const sampleChat = `
21/07/2026 20:00 - Grupo DL Entregas: Motoboy urgente! Retirar no Centro para entregar no Fátima. Taxa 10
    `.trim();

    const result = parserService.parseWhatsAppChat(sampleChat);

    expect(result.requestsCreated).toBe(1);
    const req = result.extractedRequests[0];
    expect(req.rawSource).toBe(RawSourceEnum.WHATSAPP_GRUPO_DL);
    expect(req.pickupNeighborhood).toBe('Centro');
    expect(req.deliveryNeighborhood).toBe('Fátima');
    expect(req.deliveryFee).toBe(10);
  });

  it('deve ignorar mensagens do sistema sem dados de entrega', () => {
    const sampleChat = `
[21/07/2026, 18:00:00] As mensagens e as chamadas são protegidas com a criptografia de ponta a ponta.
[21/07/2026, 18:05:00] João entrou usando o link de convite deste grupo
[21/07/2026, 18:10:00] Padaria Maranata: Boa noite pessoal!
    `.trim();

    const result = parserService.parseWhatsAppChat(sampleChat);

    expect(result.totalMessagesProcessed).toBe(3);
    expect(result.requestsCreated).toBe(0);
    expect(result.errorsCount).toBe(3);
  });
});
