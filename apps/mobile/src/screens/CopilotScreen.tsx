import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { OLEDTheme } from '../theme/colors';
import { BleStatusBadge } from '../components/BleStatusBadge';
import { PredictiveCard } from '../components/PredictiveCard';
import { TypingAlertCard } from '../components/TypingAlertCard';
import { ApiService, AiPredictionResponse } from '../services/api.service';
import { realtimeSocketService, TypingAlertPayload } from '../services/realtime-socket.service';
import { bleDeviceService, BleDeviceState } from '../services/ble-device.service';

export const CopilotScreen: React.FC = () => {
  const [currentNeighborhood, setCurrentNeighborhood] = useState<string>('Centro');
  const [prediction, setPrediction] = useState<AiPredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAlert, setActiveAlert] = useState<TypingAlertPayload | null>(null);
  const [bleState, setBleState] = useState<BleDeviceState>(bleDeviceService.getState());

  useEffect(() => {
    // 1. Inicializa WebSocket e BLE
    realtimeSocketService.connect();
    realtimeSocketService.updateLocation(currentNeighborhood);

    const unsubscribeBle = bleDeviceService.onStatusChange(setBleState);

    const unsubscribeSocket = realtimeSocketService.onMerchantTyping((alert) => {
      setActiveAlert(alert);
      // Dispara comando Hexadecimal no chaveiro físico (Header 0xA1)
      bleDeviceService.sendHexCommand('A1011388');
    });

    fetchPrediction(currentNeighborhood);

    return () => {
      unsubscribeBle();
      unsubscribeSocket();
    };
  }, [currentNeighborhood]);

  const fetchPrediction = async (neighborhood: string) => {
    setLoading(true);
    const data = await ApiService.getPrediction(neighborhood);
    setPrediction(data);
    setLoading(false);
  };

  const handleReturnRoute = async () => {
    setLoading(true);
    const returnData = await ApiService.getReturnRoute(currentNeighborhood);
    setPrediction(returnData);
    setLoading(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchPrediction(currentNeighborhood)} tintColor={OLEDTheme.neonGreen} />}
    >
      {/* Header com Status do Chaveiro BLE */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>DELIVERYBOY AI</Text>
          <Text style={styles.appSubtitle}>PATOS DE MINAS (MG)</Text>
        </View>

        <BleStatusBadge bleState={bleState} onPressConnect={() => bleDeviceService.connectDevice()} />
      </View>

      {/* Seleção de Bairro Atual */}
      <View style={styles.neighborhoodBar}>
        <Text style={styles.neighborhoodLabel}>Sua Posição Atual:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          {['Centro', 'Céu Azul', 'Panorâmico', 'Sebastião Amorim', 'Brasil', 'Rosário'].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, currentNeighborhood === n && styles.chipActive]}
              onPress={() => {
                setCurrentNeighborhood(n);
                realtimeSocketService.updateLocation(n);
              }}
            >
              <Text style={[styles.chipText, currentNeighborhood === n && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Card Preditivo de IA */}
      <PredictiveCard prediction={prediction} loading={loading} />

      {/* Card de Alerta de Digitação em Tempo Real */}
      <TypingAlertCard alert={activeAlert} onTriggerBle={() => bleDeviceService.sendHexCommand('A1011388')} />

      {/* Ações Rápidas do Copiloto */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>AÇÕES RÁPIDAS DE ROTA</Text>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleReturnRoute}>
          <Text style={styles.actionButtonText}>🎒 ALGORITMO BAG CHEIA (ROTA DE RETORNO)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OLEDTheme.background,
  },
  content: {
    padding: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: OLEDTheme.neonGreen,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: OLEDTheme.textMuted,
    letterSpacing: 1.5,
  },
  neighborhoodBar: {
    marginBottom: 16,
  },
  neighborhoodLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: OLEDTheme.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  chipScrollView: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: OLEDTheme.surfaceElevated,
    borderColor: OLEDTheme.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: OLEDTheme.neonGreenAlpha,
    borderColor: OLEDTheme.neonGreen,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: OLEDTheme.textSecondary,
  },
  chipTextActive: {
    color: OLEDTheme.neonGreen,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: OLEDTheme.textMuted,
    marginBottom: 10,
    letterSpacing: 1,
  },
  actionButton: {
    backgroundColor: OLEDTheme.surface,
    borderColor: OLEDTheme.accentCyan,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: OLEDTheme.accentCyan,
    letterSpacing: 0.5,
  },
});
