import { Controller, Post, Body, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { FcmPushService } from './fcm-push.service';
import { BleProtocolService } from '../hardware/ble-protocol.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { TestPushDto } from './dto/test-push.dto';

@ApiTags('Notificações Push FCM & Hardware BLE (Módulo 6)')
@Controller('api/notifications')
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmPushService: FcmPushService,
    private readonly bleProtocolService: BleProtocolService,
  ) {}

  @Post('register-device')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registra o token FCM e o MAC address do chaveiro Bluetooth do motoboy',
    description: 'Armazena ou atualiza no PostgreSQL os identificadores do dispositivo mobile e chaveiro IoT pareado.',
  })
  @ApiResponse({ status: 201, description: 'Dispositivo cadastrado/atualizado com sucesso.' })
  async registerDevice(@Body() dto: RegisterDeviceDto) {
    const device = await this.prisma.deviceToken.upsert({
      where: { fcmToken: dto.fcmToken },
      update: {
        motoboyId: dto.motoboyId,
        bleMacAddress: dto.bleMacAddress,
        platform: dto.platform || 'ANDROID',
      },
      create: {
        motoboyId: dto.motoboyId,
        fcmToken: dto.fcmToken,
        bleMacAddress: dto.bleMacAddress,
        platform: dto.platform || 'ANDROID',
      },
    });

    return {
      message: 'Dispositivo registrado com sucesso para o motoboy',
      device,
    };
  }

  @Post('test-push')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dispara uma notificação Push FCM de teste com o comando BLE do chaveiro IoT',
  })
  @ApiResponse({ status: 200, description: 'Push enviado e comando BLE codificado.' })
  async testPush(@Body() dto: TestPushDto) {
    const device = await this.prisma.deviceToken.findFirst({
      where: { motoboyId: dto.motoboyId },
      orderBy: { updatedAt: 'desc' },
    });

    const fcmToken = device ? device.fcmToken : 'fcm_test_token_patos_123';
    const bleAction = dto.bleAction || 'PULSE_YELLOW';

    // 1. Constrói o pacote hexadecimal do protocolo BLE
    const bleCmd = this.bleProtocolService.encodeBleCommand(bleAction, true, 5000);

    // 2. Dispara o Push Notification em alta prioridade com o payload BLE no data
    const pushResult = await this.fcmPushService.sendHighPriorityPush(fcmToken, dto.title, dto.body, {
      bleCmdHex: bleCmd.hexString,
      bleMacAddress: device?.bleMacAddress || 'AA:BB:CC:DD:EE:FF',
      action: bleAction,
    });

    return {
      pushResult,
      bleCommandPackage: {
        hexString: bleCmd.hexString,
        header: bleCmd.header,
        action: bleAction,
        durationMs: bleCmd.durationMs,
        bytes: Array.from(bleCmd.rawBuffer),
      },
    };
  }
}
