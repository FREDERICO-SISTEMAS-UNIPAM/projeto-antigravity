import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface FcmSendResult {
  success: boolean;
  messageId?: string;
  mode: 'FIREBASE_FCM' | 'SIMULATED';
  detail: string;
}

@Injectable()
export class FcmPushService {
  private readonly logger = new Logger(FcmPushService.name);
  private isFirebaseInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (admin.apps.length === 0) {
        const credentialsJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (credentialsJson) {
          const serviceAccount = JSON.parse(credentialsJson);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.isFirebaseInitialized = true;
          this.logger.log('🔥 Firebase Admin SDK inicializado com sucesso.');
        } else {
          this.logger.log('ℹ️ Variavel FIREBASE_SERVICE_ACCOUNT_JSON nao encontrada. FCM operara em Modo de Simulacao.');
        }
      } else {
        this.isFirebaseInitialized = true;
      }
    } catch (err) {
      this.logger.warn(`⚠️ Falha ao inicializar o Firebase Admin SDK: ${(err as Error).message}`);
      this.isFirebaseInitialized = false;
    }
  }

  /**
   * Envia uma notificacao push FCM de altissima prioridade (high priority data message / heads-up)
   * para despertar a aplicacao mobile em segundo plano e disparar o chaveiro BLE.
   */
  async sendHighPriorityPush(
    fcmToken: string,
    title: string,
    body: string,
    dataPayload: Record<string, string> = {},
  ): Promise<FcmSendResult> {
    const payload = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...dataPayload,
        highPriority: 'true',
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'deliveryboy_alerts',
          priority: 'max' as const,
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
          },
        },
        headers: {
          'apns-priority': '10',
        },
      },
    };

    if (this.isFirebaseInitialized) {
      try {
        const messageId = await admin.messaging().send(payload);
        this.logger.log(`🚀 FCM Push enviado com sucesso via Firebase (ID: ${messageId}) para o token: ${fcmToken.substring(0, 15)}...`);
        return {
          success: true,
          messageId,
          mode: 'FIREBASE_FCM',
          detail: 'Notificação enviada via Firebase Cloud Messaging',
        };
      } catch (err) {
        this.logger.error(`Erro no disparo do FCM Push: ${(err as Error).message}`);
        return {
          success: false,
          mode: 'FIREBASE_FCM',
          detail: (err as Error).message,
        };
      }
    }

    // Modo de simulação para desenvolvimento/testes locais
    this.logger.log(`📲 [SIMULAÇÃO FCM PUSH] Título: "${title}" | Body: "${body}" | Token: ${fcmToken.substring(0, 15)}...`);
    return {
      success: true,
      messageId: `simulated-msg-${Date.now()}`,
      mode: 'SIMULATED',
      detail: 'Push simulado com sucesso (modo de desenvolvimento sem Firebase)',
    };
  }
}
