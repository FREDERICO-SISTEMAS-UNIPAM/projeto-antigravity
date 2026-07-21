const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PATOS_DE_MINAS_NEIGHBORHOODS = [
  'Centro', 'Céu Azul', 'Panorâmico', 'Sebastião Amorim', 'Brasil', 'Rosário', 'Fátima',
  'Guanabara', 'Ipanema', 'Nossa Senhora das Graças', 'Jardim Califórnia', 'Jardim Esperança',
  'Lagoinha', 'Planalto', 'Bela Vista', 'Abner Afonso', 'Vila Garcia', 'Santarém',
  'Vanderley de Paula', 'Alto dos Caiçaras', 'Caiçaras', 'Marcondes', 'Caramuru',
  'Novo Sorriso', 'Padre Eustáquio', 'Coronel Severiano', 'Santo Antônio', 'Laranjeiras',
  'Alvorada', 'Residencial Monjolo', 'Monjolo', 'Residencial Eldorado', 'Eldorado', 'Boa Vista',
  'Vila Rosa', 'Sorriso', 'Gramado', 'São Francisco', 'Sobradinho', 'Campos Elíseos',
  'Jardim Europa', 'Alto da Serra', 'Coração Eucarístico', 'Jardim América', 'Valparaíso',
  'Santa Terezinha', 'Nossa Senhora Aparecida', 'Aparecida', 'Vila Santa Luzia', 'Santa Luzia',
  'Jardim Vitória', 'Cidade Jardim', 'Quebec', 'Peluzzo', 'Afonso Queiroz', 'Barreiro',
  'Cristo Redentor', 'Cristo', 'Nossa Senhora de Fátima', 'Jardim Centro', 'Santo Antonio', 'Laguna'
];

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function splitIntoMessages(content) {
  const lines = content.split(/\r?\n/);
  const messages = [];
  let currentMessage = '';
  const timestampRegex = /^(?:\[?\d{1,2}\/\d{1,2}\/\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\]?\s*[-–]?\s*)/;

  for (const line of lines) {
    if (timestampRegex.test(line.trim())) {
      if (currentMessage.trim()) messages.push(currentMessage.trim());
      currentMessage = line;
    } else {
      currentMessage += '\n' + line;
    }
  }
  if (currentMessage.trim()) messages.push(currentMessage.trim());
  return messages;
}

function matchNeighborhoodInText(segment) {
  const segmentNorm = removeAccents(segment);
  return PATOS_DE_MINAS_NEIGHBORHOODS.find((n) => segmentNorm.includes(removeAccents(n)));
}

function findNeighborhoods(text) {
  const textNorm = removeAccents(text);
  const matchedList = [];
  const explicitPatternMatch = text.match(
    /(?:coleta|de|retirada|retirar|pegar|saida):?\s*([A-Za-zÀ-ÿ0-9\s]+?)\s*(?:->|para|entrega|entregar|levar|no|em|ate)\s*([A-Za-zÀ-ÿ0-9\s]+?)(?:[,\n\.]|$)/i
  );

  let explicitPickup, explicitDelivery;
  if (explicitPatternMatch) {
    explicitPickup = matchNeighborhoodInText(explicitPatternMatch[1]);
    explicitDelivery = matchNeighborhoodInText(explicitPatternMatch[2]);
  }

  for (const n of PATOS_DE_MINAS_NEIGHBORHOODS) {
    if (textNorm.includes(removeAccents(n)) && !matchedList.includes(n)) {
      matchedList.push(n);
    }
  }

  return {
    pickup: explicitPickup || matchedList[0],
    delivery: explicitDelivery || matchedList[1],
    matchedList,
  };
}

function parseSingleMessage(fullMessage, defaultSource) {
  const dateMatch = fullMessage.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})[,\s]+(\d{1,2}):(\d{2})/);
  let requestedAt = new Date();
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10) - 1;
    let year = parseInt(dateMatch[3], 10);
    if (year < 100) year += 2000;
    requestedAt = new Date(year, month, day, parseInt(dateMatch[4], 10), parseInt(dateMatch[5], 10));
  }

  const bodyMatch = fullMessage.match(/^(?:\[?.*?\]?\s*[-–]?\s*)(.*?):\s*([\s\S]*)$/);
  let senderName = 'Grupo WhatsApp';
  let textContent = fullMessage;
  if (bodyMatch) {
    senderName = bodyMatch[1].trim();
    textContent = bodyMatch[2].trim();
  }

  const textClean = removeAccents(textContent);
  if (
    textClean.includes('criptografia') ||
    textClean.includes('entrou usando o link') ||
    textClean.includes('criou o grupo') ||
    textClean.includes('adicionou') ||
    textClean.includes('removeu') ||
    textClean.includes('mudou') ||
    textClean.includes('saiu') ||
    textClean.includes('mensagem apagada') ||
    textClean === 'eu' ||
    textClean === 'indo' ||
    textClean === 'ok' ||
    textClean === 'sua' ||
    textClean === 'proximo'
  ) {
    return null;
  }

  let rawSource = defaultSource;
  if (
    fullMessage.toUpperCase().includes('GRUPO DL') ||
    fullMessage.toUpperCase().includes('ENTREGAS DL') ||
    fullMessage.toUpperCase().includes('DN_ ENTREGAS') ||
    textContent.toUpperCase().includes('DL')
  ) {
    rawSource = 'WHATSAPP_GRUPO_DL';
  }

  const foundNeighborhoods = findNeighborhoods(textContent);
  let pickupNeighborhood = foundNeighborhoods.pickup;
  let deliveryNeighborhood = foundNeighborhoods.delivery;

  if (!pickupNeighborhood && foundNeighborhoods.matchedList.length > 0) pickupNeighborhood = foundNeighborhoods.matchedList[0];
  if (!deliveryNeighborhood && foundNeighborhoods.matchedList.length > 1) deliveryNeighborhood = foundNeighborhoods.matchedList[1];

  if (!pickupNeighborhood || !deliveryNeighborhood) return null;

  let deliveryFee = undefined;
  const feeMatch = textContent.match(/(?:R\$\s*|taxa:?\s*|tx:?\s*|valor:?\s*|pago:?\s*)(\d+[\.,]?\d*)/i);
  if (feeMatch) {
    const parsedVal = parseFloat(feeMatch[1].replace(',', '.'));
    if (!isNaN(parsedVal) && parsedVal > 0) deliveryFee = parsedVal;
  }

  const hashPayload = `${requestedAt.toISOString()}|${senderName}|${pickupNeighborhood}|${deliveryNeighborhood}|${deliveryFee || 0}|${textContent.trim()}`;
  const messageHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

  return {
    messageHash,
    rawSource,
    requesterName: senderName.startsWith('+') ? undefined : senderName,
    requesterPhone: senderName.startsWith('+') ? senderName : undefined,
    pickupNeighborhood,
    deliveryNeighborhood,
    deliveryFee,
    requestedAt,
  };
}

const dir = path.join(__dirname, '../../data/raw-whatsapp-logs');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
const seenHashes = new Set();

console.log('====================================================');
console.log('=== PASSAGEM 1: INGESTÃO INICIAL DOS 3 ARQUIVOS ===');
console.log('====================================================');

let grandTotalMessages = 0;
let grandTotalExtracted = 0;
let grandTotalSaved = 0;
let grandTotalDuplicates = 0;
let grandTotalIgnored = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  const messages = splitIntoMessages(content);
  let extracted = 0;
  let saved = 0;
  let duplicates = 0;
  let ignored = 0;

  for (const msg of messages) {
    const defaultSource = file.includes('dl') ? 'WHATSAPP_GRUPO_DL' : 'WHATSAPP_DISPONIVEIS';
    const parsed = parseSingleMessage(msg, defaultSource);
    if (parsed) {
      extracted++;
      if (seenHashes.has(parsed.messageHash)) {
        duplicates++;
      } else {
        seenHashes.add(parsed.messageHash);
        saved++;
      }
    } else {
      ignored++;
    }
  }

  console.log(`\n📁 Arquivo: ${file}`);
  console.log(`   - Total de mensagens lidas: ${messages.length}`);
  console.log(`   - Entregas válidas extraídas: ${extracted}`);
  console.log(`   - Entregas únicas salvas no banco (SHA-256): ${saved}`);
  console.log(`   - Mensagens duplicadas ignoradas: ${duplicates}`);
  console.log(`   - Mensagens de sistema/conversas ignoradas: ${ignored}`);

  grandTotalMessages += messages.length;
  grandTotalExtracted += extracted;
  grandTotalSaved += saved;
  grandTotalDuplicates += duplicates;
  grandTotalIgnored += ignored;
}

console.log('\n-------------------------------------------');
console.log(`RESUMO DA PRIMEIRA PASSAGEM (INGESTÃO INICIAL):`);
console.log(`- Total de Mensagens Lidas: ${grandTotalMessages}`);
console.log(`- Total de Entregas Válidas Extraídas: ${grandTotalExtracted}`);
console.log(`- Total de Entregas Únicas Salvas no Banco: ${grandTotalSaved}`);
console.log(`- Total de Duplicadas Ignoradas: ${grandTotalDuplicates}`);
console.log(`- Total de Mensagens de Sistema/Conversas Descartadas: ${grandTotalIgnored}`);
console.log('-------------------------------------------');

console.log('\n====================================================');
console.log('=== PASSAGEM 2: RE-PROCESSAMENTO (TESTE DE DESDUPLICAÇÃO) ===');
console.log('====================================================');

let pass2Saved = 0;
let pass2Duplicates = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  const messages = splitIntoMessages(content);
  for (const msg of messages) {
    const defaultSource = file.includes('dl') ? 'WHATSAPP_GRUPO_DL' : 'WHATSAPP_DISPONIVEIS';
    const parsed = parseSingleMessage(msg, defaultSource);
    if (parsed) {
      if (seenHashes.has(parsed.messageHash)) {
        pass2Duplicates++;
      } else {
        seenHashes.add(parsed.messageHash);
        pass2Saved++;
      }
    }
  }
}

console.log(`\nResultado da Re-ingestão dos mesmos 3 arquivos:`);
console.log(`- Entregas Novas Salvas no Banco: ${pass2Saved}`);
console.log(`- Entregas Duplicadas Ignoradas via SHA-256: ${pass2Duplicates}`);
console.log('====================================================');
