import { Injectable, Logger } from '@nestjs/common';

export type BleActionType = 'PULSE_YELLOW' | 'ALERT_GREEN' | 'ALERT_RED';

export interface BleCommandPackage {
  header: string; // 0xA1
  actionByte: number; // 0x01 = Yellow, 0x02 = Green, 0x03 = Red
  durationMs: number;
  soundBip: boolean;
  rawBuffer: Buffer;
  hexString: string; // ex: "A1011388"
}

@Injectable()
export class BleProtocolService {
  private readonly logger = new Logger(BleProtocolService.name);

  private readonly HEADER_BYTE = 0xa1;

  /**
   * Constrói o pacote hexadecimal de comandos IoT BLE para o chaveiro Bluetooth física do entregador.
   *
   * Tabela de Enquadramento:
   * - Byte 0: 0xA1 (Header de Identificação do Dispositivo)
   * - Byte 1: Ação de LED (0x01 = PULSE_YELLOW, 0x02 = ALERT_GREEN, 0x03 = ALERT_RED)
   * - Byte 2-3: Duração em ms (Big-Endian uint16, ex: 5000ms = 0x1388, 3000ms = 0x0BB8)
   */
  encodeBleCommand(action: BleActionType, soundBip: boolean = true, durationMs: number = 5000): BleCommandPackage {
    let actionByte = 0x01; // PULSE_YELLOW

    if (action === 'ALERT_GREEN') {
      actionByte = 0x02;
    } else if (action === 'ALERT_RED') {
      actionByte = 0x03;
    }

    // Garante limites de duração (500ms até 60.000ms)
    const validDuration = Math.min(60000, Math.max(500, durationMs));

    const buffer = Buffer.alloc(4);
    buffer.writeUInt8(this.HEADER_BYTE, 0);
    buffer.writeUInt8(actionByte, 1);
    buffer.writeUInt16BE(validDuration, 2);

    const hexString = buffer.toString('hex').toUpperCase();

    this.logger.debug(`[BLE IoT] Comando serializado para chaveiro: ${hexString} (Ação: ${action}, Duração: ${validDuration}ms)`);

    return {
      header: '0xA1',
      actionByte,
      durationMs: validDuration,
      soundBip,
      rawBuffer: buffer,
      hexString,
    };
  }

  /**
   * Decodifica uma string hexadecimal enviada pelo chaveiro Bluetooth.
   */
  decodeBleCommand(hexString: string) {
    const cleanHex = hexString.replace(/^0x/i, '').trim();
    if (cleanHex.length < 8) {
      throw new Error('Formato Hexadecimal inválido para pacote BLE (tamanho mínimo: 8 caracteres hex).');
    }

    const buffer = Buffer.from(cleanHex, 'hex');
    const header = buffer.readUInt8(0);
    const actionByte = buffer.readUInt8(1);
    const durationMs = buffer.readUInt16BE(2);

    let action: BleActionType = 'PULSE_YELLOW';
    if (actionByte === 0x02) action = 'ALERT_GREEN';
    if (actionByte === 0x03) action = 'ALERT_RED';

    return {
      header: `0x${header.toString(16).toUpperCase()}`,
      action,
      durationMs,
    };
  }
}
