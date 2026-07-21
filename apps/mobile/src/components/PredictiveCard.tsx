import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OLEDTheme } from '../theme/colors';
import { AiPredictionResponse } from '../services/api.service';

interface Props {
  prediction: AiPredictionResponse | null;
  loading?: boolean;
}

export const PredictiveCard: React.FC<Props> = ({ prediction, loading }) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>ROTA PREDITIVA (IA GEMINI)</Text>
        <Text style={styles.loadingText}>Calculando densidade de pedidos em Patos de Minas...</Text>
      </View>
    );
  }

  if (!prediction) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.tag}>DESTAQUE PREDITIVO (IA)</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{prediction.confidencePercentage}% CHANCE</Text>
        </View>
      </View>

      <Text style={styles.destinationTitle}>
        VÁ PARA: <Text style={styles.highlightNeighborhood}>{prediction.recommendedNeighborhood.toUpperCase()}</Text>
      </Text>

      <Text style={styles.reasoning}>{prediction.reasoning}</Text>

      <View style={styles.footer}>
        <Text style={styles.hotspotLabel}>📍 Ponto de Espera:</Text>
        <Text style={styles.hotspotText}>{prediction.hotspotAddress}</Text>

        <Text style={styles.feeText}>
          Taxa Média Estimada: <Text style={styles.feeHighlight}>R$ {prediction.expectedAverageFee.toFixed(2)}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: OLEDTheme.surface,
    borderColor: OLEDTheme.neonGreen,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: OLEDTheme.neonGreen,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: OLEDTheme.neonGreenAlpha,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderColor: OLEDTheme.neonGreen,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: OLEDTheme.neonGreen,
  },
  destinationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: OLEDTheme.textPrimary,
    marginBottom: 8,
  },
  highlightNeighborhood: {
    color: OLEDTheme.neonGreen,
  },
  reasoning: {
    fontSize: 13,
    color: OLEDTheme.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  loadingText: {
    fontSize: 13,
    color: OLEDTheme.textSecondary,
    marginTop: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: OLEDTheme.border,
    paddingTop: 10,
  },
  hotspotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: OLEDTheme.textMuted,
  },
  hotspotText: {
    fontSize: 12,
    fontWeight: '600',
    color: OLEDTheme.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  feeText: {
    fontSize: 12,
    color: OLEDTheme.textSecondary,
  },
  feeHighlight: {
    fontWeight: '800',
    color: OLEDTheme.warningYellow,
  },
});
