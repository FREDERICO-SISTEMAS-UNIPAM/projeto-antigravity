const API_BASE_URL = `http://${window.location.hostname}:3001`;

export interface IngestionReportResponse {
  totalMessagesProcessed: number;
  requestsCreated: number;
  errorsCount: number;
  extractedRequests: any[];
}

export interface AiPredictionResponse {
  recommendedNeighborhood: string;
  confidencePercentage: number;
  reasoning: string;
  hotspotAddress: string;
  expectedAverageFee: number;
  engineSource: 'GOOGLE_GEMINI_AI' | 'DETERMINISTIC_FALLBACK';
}

export interface NeighborhoodItem {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export class ApiClient {
  /**
   * Envia o conteúdo do arquivo .txt do WhatsApp para ingestão com desduplicação SHA-256.
   */
  static async uploadWhatsAppLog(fileContent: string, fileName: string): Promise<IngestionReportResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/parse-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatContent: fileContent,
          fileName,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Retorno de demonstração em modo offline/dev
      const lines = fileContent.split(/\r?\n/).length;
      return {
        totalMessagesProcessed: lines,
        requestsCreated: Math.floor(lines * 0.08),
        errorsCount: Math.floor(lines * 0.92),
        extractedRequests: [],
      };
    }
  }

  /**
   * Obtém a lista de bairros cadastrados de Patos de Minas (MG).
   */
  static async fetchNeighborhoods(): Promise<NeighborhoodItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/geo/neighborhoods`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [
        { id: '1', name: 'Centro', latitude: -18.5789, longitude: -46.5153 },
        { id: '2', name: 'Céu Azul', latitude: -18.6145, longitude: -46.505 },
        { id: '3', name: 'Panorâmico', latitude: -18.5952, longitude: -46.4905 },
        { id: '4', name: 'Sebastião Amorim', latitude: -18.595, longitude: -46.48 },
        { id: '5', name: 'Brasil', latitude: -18.5755, longitude: -46.51 },
        { id: '6', name: 'Rosário', latitude: -18.585, longitude: -46.512 },
      ];
    }
  }

  /**
   * Obtém a recomendação preditiva de IA.
   */
  static async fetchPrediction(currentNeighborhood: string): Promise<AiPredictionResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNeighborhood, currentLat: -18.5789, currentLng: -46.5153 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        recommendedNeighborhood: 'Céu Azul',
        confidencePercentage: 85,
        reasoning: `O bairro Céu Azul concentra forte atividade histórica de pedidos de delivery nesta janela de horário.`,
        hotspotAddress: 'Av. JK próximo à Padaria Maranata',
        expectedAverageFee: 13.5,
        engineSource: 'DETERMINISTIC_FALLBACK',
      };
    }
  }

  /**
   * Simula um evento de digitação de empresário via REST.
   */
  static async simulateTyping(restaurantName: string, neighborhood: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/realtime/simulate-typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, neighborhood }),
      });
      return await res.json();
    } catch {
      return { success: true, mode: 'OFFLINE_SIMULATION' };
    }
  }

  /**
   * Obtém o status atual do WhatsApp do backend.
   */
  static async getWhatsAppStatus(): Promise<{ status: string; qr: string | null; ownerName?: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { status: 'disconnected', qr: null, ownerName: null };
    }
  }

  /**
   * Conecta o WhatsApp iniciando o processo de escaneamento de QR Code.
   */
  static async connectWhatsApp(): Promise<{ status: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/connect`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { status: 'connecting' };
    }
  }

  /**
   * Desconecta o WhatsApp e limpa a sessão local no servidor.
   */
  static async disconnectWhatsApp(): Promise<{ status: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/disconnect`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { status: 'disconnected' };
    }
  }
}
