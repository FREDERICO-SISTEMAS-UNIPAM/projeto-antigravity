import React from 'react';
import App from './App';
import { OLEDTheme } from './src/theme/colors';

describe('App Mobile (React Native + Expo)', () => {
  it('deve possuir o tema OLED Dark configurado corretamente com fundo preto e verde neon', () => {
    expect(OLEDTheme.background).toBe('#000000');
    expect(OLEDTheme.neonGreen).toBe('#00FF66');
    expect(OLEDTheme.warningYellow).toBe('#FFCC00');
  });

  it('deve exportar o componente App como uma função válida de React Native', () => {
    expect(typeof App).toBe('function');
  });
});
