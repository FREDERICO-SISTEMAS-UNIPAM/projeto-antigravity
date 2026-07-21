import { describe, it, expect, beforeEach } from 'vitest';
import { BleProtocolService } from './ble-protocol.service';

describe('BleProtocolService (Módulo 6 - Protocolo IoT do Chaveiro BLE)', () => {
  let bleService: BleProtocolService;

  beforeEach(() => {
    bleService = new BleProtocolService();
  });

  it('deve codificar o comando PULSE_YELLOW para a sequência hexadecimal 0xA1 0x01 0x13 0x88', () => {
    const pkg = bleService.encodeBleCommand('PULSE_YELLOW', true, 5000);

    expect(pkg.header).toBe('0xA1');
    expect(pkg.actionByte).toBe(0x01);
    expect(pkg.durationMs).toBe(5000);
    expect(pkg.hexString).toBe('A1011388');
    expect(pkg.rawBuffer[0]).toBe(0xa1);
    expect(pkg.rawBuffer[1]).toBe(0x01);
    expect(pkg.rawBuffer[2]).toBe(0x13);
    expect(pkg.rawBuffer[3]).toBe(0x88);
  });

  it('deve codificar o comando ALERT_GREEN para a sequência hexadecimal 0xA1 0x02 0x0B 0xB8', () => {
    const pkg = bleService.encodeBleCommand('ALERT_GREEN', true, 3000);

    expect(pkg.actionByte).toBe(0x02);
    expect(pkg.durationMs).toBe(3000);
    expect(pkg.hexString).toBe('A1020BB8');
  });

  it('deve codificar o comando ALERT_RED para a sequência hexadecimal 0xA1 0x03 0x0B 0xB8', () => {
    const pkg = bleService.encodeBleCommand('ALERT_RED', true, 3000);

    expect(pkg.actionByte).toBe(0x03);
    expect(pkg.hexString).toBe('A1030BB8');
  });

  it('deve decodificar uma string hexadecimal recebida do dispositivo física BLE', () => {
    const decoded = bleService.decodeBleCommand('A1011388');

    expect(decoded.header).toBe('0XA1');
    expect(decoded.action).toBe('PULSE_YELLOW');
    expect(decoded.durationMs).toBe(5000);
  });
});
