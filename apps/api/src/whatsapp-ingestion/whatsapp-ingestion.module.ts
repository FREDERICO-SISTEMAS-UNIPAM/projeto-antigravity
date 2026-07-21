import { Module } from '@nestjs/common';
import { WhatsAppParserService } from './whatsapp-parser.service';
import { WhatsAppIngestionController } from './whatsapp-ingestion.controller';
import { DeliveryRequestsModule } from '../delivery-requests/delivery-requests.module';

@Module({
  imports: [DeliveryRequestsModule],
  controllers: [WhatsAppIngestionController],
  providers: [WhatsAppParserService],
  exports: [WhatsAppParserService],
})
export class WhatsAppIngestionModule {}
