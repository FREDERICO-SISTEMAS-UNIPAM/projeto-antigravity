import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    const appService = new AppService();
    appController = new AppController(appService);
  });

  it('deve retornar status OK da API', () => {
    const response = appController.getHealth();
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('ok');
    expect(response.data?.userValidation).toBe(true);
  });
});
