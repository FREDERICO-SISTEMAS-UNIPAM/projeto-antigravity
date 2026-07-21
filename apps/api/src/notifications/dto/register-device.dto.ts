import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DevicePlatform } from '@prisma/client';

export class RegisterDeviceDto {
  @ApiProperty({ description: 'ID do Motoboy no sistema', example: 'motoboy-patos-01' })
  motoboyId!: string;

  @ApiProperty({ description: 'Token FCM para envio de Push Notification', example: 'fcm_token_sample_123' })
  fcmToken!: string;

  @ApiPropertyOptional({ description: 'Endereço MAC do Chaveiro Bluetooth pareado', example: 'AA:BB:CC:DD:EE:FF' })
  bleMacAddress?: string;

  @ApiPropertyOptional({ description: 'Plataforma do dispositivo (ANDROID ou IOS)', enum: DevicePlatform, example: DevicePlatform.ANDROID })
  platform?: DevicePlatform;
}
