import { Module } from '@nestjs/common';
import { FcmPushService } from './fcm-push.service';
import { BleProtocolService } from '../hardware/ble-protocol.service';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [FcmPushService, BleProtocolService],
  exports: [FcmPushService, BleProtocolService],
})
export class NotificationsModule {}
