export type BleConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface BleDeviceState {
  status: BleConnectionStatus;
  deviceName?: string;
  macAddress?: string;
  batteryLevel?: number;
}

export class BleDeviceService {
  private state: BleDeviceState = {
    status: 'CONNECTED',
    deviceName: 'Chaveiro DeliveryBoy BLE',
    macAddress: 'A4:C1:38:90:7E:11',
    batteryLevel: 94,
  };

  private statusListeners: Array<(state: BleDeviceState) => void> = [];

  getState(): BleDeviceState {
    return this.state;
  }

  /**
   * Conecta ao chaveiro Bluetooth do motoboy.
   */
  async connectDevice(macAddress: string = 'A4:C1:38:90:7E:11'): Promise<BleDeviceState> {
    this.updateState({ status: 'CONNECTING' });

    // Simulação de pareamento via Bluetooth Low Energy (GATT Service)
    await new Promise((resolve) => setTimeout(resolve, 800));

    this.updateState({
      status: 'CONNECTED',
      deviceName: 'Chaveiro DeliveryBoy BLE',
      macAddress,
      batteryLevel: 94,
    });

    console.log(`🔑 [BLE] Chaveiro Bluetooth pareado com sucesso: ${macAddress}`);
    return this.state;
  }

  /**
   * Transmite o payload de comando hexadecimal (Header 0xA1) para o chaveiro físico pareado.
   *
   * Exemplos:
   * - PULSE_YELLOW: "A1011388" (0xA1 0x01 0x13 0x88)
   * - ALERT_GREEN: "A1020BB8" (0xA1 0x02 0x0B 0xB8)
   */
  async sendHexCommand(hexString: string): Promise<boolean> {
    if (this.state.status !== 'CONNECTED') {
      console.warn('⚠️ Impossivel enviar comando BLE: Chaveiro nao esta conectado.');
      return false;
    }

    console.log(`📡 [BLE TX -> CHAVEIRO] Transmitindo Pacote Hexadecimal: 0x${hexString}`);
    return true;
  }

  /**
   * Desconecta o chaveiro Bluetooth.
   */
  disconnectDevice() {
    this.updateState({
      status: 'DISCONNECTED',
      deviceName: undefined,
      macAddress: undefined,
    });
  }

  onStatusChange(callback: (state: BleDeviceState) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((fn) => fn !== callback);
    };
  }

  private updateState(partial: Partial<BleDeviceState>) {
    this.state = { ...this.state, ...partial };
    this.statusListeners.forEach((fn) => fn(this.state));
  }
}

export const bleDeviceService = new BleDeviceService();
