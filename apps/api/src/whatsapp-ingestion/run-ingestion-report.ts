import * as fs from 'node:fs';
import * as path from 'node:path';
import { WhatsAppParserService } from './whatsapp-parser.service';
import { RawSourceEnum } from '../delivery-requests/dto/create-delivery-request.dto';

export interface FileIngestionReport {
  fileName: string;
  totalMessagesProcessed: number;
  extractedValidCount: number;
  newUniqueSavedCount: number;
  duplicatesIgnoredCount: number;
  invalidOrSystemMessagesCount: number;
}

export interface GlobalIngestionReport {
  filesReport: FileIngestionReport[];
  totalMessages: number;
  totalValidExtracted: number;
  totalNewSavedInDb: number;
  totalDuplicatesIgnored: number;
  totalInvalidOrSystem: number;
}

export function processAllLocalWhatsAppLogs(logsDirectoryPath: string): GlobalIngestionReport {
  const parserService = new WhatsAppParserService();
  const seenHashes = new Set<string>();

  const files = fs.readdirSync(logsDirectoryPath).filter((f) => f.endsWith('.txt'));

  const filesReport: FileIngestionReport[] = [];
  let totalMessages = 0;
  let totalValidExtracted = 0;
  let totalNewSavedInDb = 0;
  let totalDuplicatesIgnored = 0;
  let totalInvalidOrSystem = 0;

  for (const fileName of files) {
    const filePath = path.join(logsDirectoryPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');

    let defaultSource = RawSourceEnum.WHATSAPP_DISPONIVEIS;
    if (fileName.includes('dl') || fileName.includes('grupo_dl')) {
      defaultSource = RawSourceEnum.WHATSAPP_GRUPO_DL;
    }

    const parseResult = parserService.parseWhatsAppChat(content, defaultSource);

    let newUniqueSavedCount = 0;
    let duplicatesIgnoredCount = 0;

    for (const req of parseResult.extractedRequests) {
      if (req.messageHash) {
        if (seenHashes.has(req.messageHash)) {
          duplicatesIgnoredCount++;
        } else {
          seenHashes.add(req.messageHash);
          newUniqueSavedCount++;
        }
      } else {
        newUniqueSavedCount++;
      }
    }

    const reportItem: FileIngestionReport = {
      fileName,
      totalMessagesProcessed: parseResult.totalMessagesProcessed,
      extractedValidCount: parseResult.requestsCreated,
      newUniqueSavedCount,
      duplicatesIgnoredCount,
      invalidOrSystemMessagesCount: parseResult.errorsCount,
    };

    filesReport.push(reportItem);

    totalMessages += reportItem.totalMessagesProcessed;
    totalValidExtracted += reportItem.extractedValidCount;
    totalNewSavedInDb += reportItem.newUniqueSavedCount;
    totalDuplicatesIgnored += reportItem.duplicatesIgnoredCount;
    totalInvalidOrSystem += reportItem.invalidOrSystemMessagesCount;
  }

  return {
    filesReport,
    totalMessages,
    totalValidExtracted,
    totalNewSavedInDb,
    totalDuplicatesIgnored,
    totalInvalidOrSystem,
  };
}
