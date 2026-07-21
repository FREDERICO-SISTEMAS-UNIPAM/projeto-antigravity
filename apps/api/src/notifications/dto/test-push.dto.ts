import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BleActionType } from '../../hardware/ble-protocol.service';

export class TestPushDto {
  @ApiProperty({ description: 'ID do motoboy cadastrado', example: 'motoboy-patos-01' })
  motoboyId!: string;

  @ApiProperty({ description: 'Título da notificação Push', example: '⚡ Alerta de Demanda Iminente!' })
  title!: string;

  @ApiProperty({ description: 'Corpo da notificação Push', example: 'Restaurante Laranjinha no Céu Azul está preparando entregas.' })
  body!: string;

  @ApiPropertyOptional({ description: 'Ação do sinal BLE para o chaveiro físico', example: 'PULSE_YELLOW' })
  bleAction?: BleActionType;
}
