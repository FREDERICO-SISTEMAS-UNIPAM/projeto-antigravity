import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DeliveryRequestsModule } from './delivery-requests/delivery-requests.module';
import { WhatsAppIngestionModule } from './whatsapp-ingestion/whatsapp-ingestion.module';
import { GeoModule } from './geo/geo.module';
import { AiModule } from './ai/ai.module';
import { RealtimeModule } from './realtime/realtime.module';
import { NotificationsModule } from './notifications/notifications.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    DeliveryRequestsModule,
    WhatsAppIngestionModule,
    GeoModule,
    AiModule,
    RealtimeModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
