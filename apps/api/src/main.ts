import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Configuração OpenAPI (Swagger) conforme .cursorrules
  const config = new DocumentBuilder()
    .setTitle('Antigravity API')
    .setDescription('Documentação REST OpenAPI da API Antigravity')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API Antigravity rodando na porta ${port}`);
  console.log(`📚 Documentação Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap();
