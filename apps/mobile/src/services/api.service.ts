const API_BASE_URL = 'http://localhost:3001';

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

export class ApiService {
  /**
   * Obtém a predição de demanda espaço-temporal da Gemini AI / Fallback.
   */
  static async getPrediction(
    currentNeighborhood: string,
    currentLat: number = -18.5789,
    currentLng: number = -46.5153,
  ): Promise<AiPredictionResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentNeighborhood,
          currentLat,
          currentLng,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Retorno de fallback resiliente local para offline/dev
      return {
        recommendedNeighborhood: 'Céu Azul',
        confidencePercentage: 85,
        reasoning: `Sua zona atual (${currentNeighborhood}) apresenta baixa atividade. O restaurante Laranjinha no Céu Azul costuma abrir demanda forte às 11:30.`,
        hotspotAddress: 'Av. JK próximo à Padaria Maranata (Céu Azul)',
        expectedAverageFee: 13.5,
        engineSource: 'DETERMINISTIC_FALLBACK',
      };
    }
  }

  /**
   * Calcula a rota de retorno eficiente ("Bag Cheia").
   */
  static async getReturnRoute(deliveryDestinationNeighborhood: string): Promise<AiPredictionResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/return-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryDestinationNeighborhood }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        recommendedNeighborhood: 'Centro',
        confidencePercentage: 88,
        reasoning: `Ao sair do bairro ${deliveryDestinationNeighborhood}, posicione-se no Centro. O corredor de retorno apresenta histórico elevado de chamadas nos próximos 15 minutos.`,
        hotspotAddress: 'Av. Brasil, Patos de Minas (MG)',
        expectedAverageFee: 11.0,
        engineSource: 'DETERMINISTIC_FALLBACK',
      };
    }
  }

  /**
   * Lista todos os bairros de Patos de Minas.
   */
  static async getNeighborhoods(): Promise<NeighborhoodItem[]> {
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
      ];
    }
  }

  /**
   * Registra token FCM e MAC Address do chaveiro Bluetooth do motoboy.
   */
  static async registerDevice(motoboyId: string, fcmToken: string, bleMacAddress?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/register-device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motoboyId, fcmToken, bleMacAddress }),
      });
      return await res.json();
    } catch {
      return { success: true, mode: 'OFFLINE_SIMULATION' };
    }
  }
}
