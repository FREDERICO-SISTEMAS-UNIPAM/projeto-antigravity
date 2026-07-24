import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conectado ao banco de dados PostgreSQL com sucesso.');
    } catch (err) {
      this.logger.error(
        `⚠️ Não foi possível estabelecer conexão inicial com o banco de dados PostgreSQL. A API continuará operando com persistência offline local. Erro: ${(err as Error).message}`
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err) {}
  }
}
