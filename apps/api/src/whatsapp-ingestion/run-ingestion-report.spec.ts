import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { processAllLocalWhatsAppLogs } from './run-ingestion-report';

describe('Ingestão de Logs Locais de WhatsApp (3 Arquivos)', () => {
  it('deve ler os 3 arquivos da pasta raw-whatsapp-logs, extrair entregas e aplicar desduplicação SHA-256', () => {
    const logsDir = path.join(__dirname, '../../data/raw-whatsapp-logs');
    const result = processAllLocalWhatsAppLogs(logsDir);

    expect(result.filesReport.length).toBe(3);
    expect(result.totalMessages).toBeGreaterThan(0);
    expect(result.totalValidExtracted).toBeGreaterThan(0);
    expect(result.totalNewSavedInDb).toBeGreaterThan(0);

    console.log('=== RESUMO DETALHADO DA INGESTÃO DE LOGS ===');
    result.filesReport.forEach((f) => {
      console.log(`\n📄 Arquivo: ${f.fileName}`);
      console.log(`   - Total de Mensagens Lidas: ${f.totalMessagesProcessed}`);
      console.log(`   - Entregas Válidas Extraídas: ${f.extractedValidCount}`);
      console.log(`   - Entregas Únicas Salvas (SHA-256): ${f.newUniqueSavedCount}`);
      console.log(`   - Mensagens Duplicadas Ignoradas: ${f.duplicatesIgnoredCount}`);
      console.log(`   - Mensagens de Sistema/Inválidas Descartadas: ${f.invalidOrSystemMessagesCount}`);
    });
    console.log('\n===========================================');
    console.log(`TOTAL GLOBAL:`);
    console.log(`Total de Mensagens Lidas: ${result.totalMessages}`);
    console.log(`Total de Entregas Válidas: ${result.totalValidExtracted}`);
    console.log(`Total de Entregas Inéditas Salvas no Banco: ${result.totalNewSavedInDb}`);
    console.log(`Total de Duplicadas Ignoradas: ${result.totalDuplicatesIgnored}`);
    console.log(`Total de Descartes/Sistema: ${result.totalInvalidOrSystem}`);
    console.log('===========================================');
  });
});
