import { Module } from '@nestjs/common';
import { WhatsAppParserService } from './whatsapp-parser.service';
import { WhatsAppIngestionController } from './whatsapp-ingestion.controller';
import { DeliveryRequestsModule } from '../delivery-requests/delivery-requests.module';
import { WhatsAppMonitorService } from './whatsapp-monitor.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [DeliveryRequestsModule, RealtimeModule],
  controllers: [WhatsAppIngestionController],
  providers: [WhatsAppParserService, WhatsAppMonitorService],
  exports: [WhatsAppParserService],
})
export class WhatsAppIngestionModule {}
