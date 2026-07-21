import { describe, it, expect } from 'vitest';
import App from './App';

describe('Painel Web de Gestão (React + Vite)', () => {
  it('deve exportar a função principal App do Dashboard', () => {
    expect(typeof App).toBe('function');
  });
});
