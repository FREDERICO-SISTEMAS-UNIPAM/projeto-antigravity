import { Module } from '@nestjs/common';
import { PredictionAiService } from './prediction-ai.service';
import { AiController } from './ai.controller';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [GeoModule],
  controllers: [AiController],
  providers: [PredictionAiService],
  exports: [PredictionAiService],
})
export class AiModule {}
