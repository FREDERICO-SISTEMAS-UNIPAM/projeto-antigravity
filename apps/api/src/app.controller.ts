import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponse } from '@repo/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verifica o estado de saúde da API' })
  @SwaggerResponse({ status: 200, description: 'API está online e saudável' })
  getHealth(): ApiResponse<{ status: string; userValidation: boolean }> {
    return this.appService.getHealth();
  }
}
