import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RealtimeController } from './realtime.controller';

@Module({
  controllers: [RealtimeController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class RealtimeModule {}
