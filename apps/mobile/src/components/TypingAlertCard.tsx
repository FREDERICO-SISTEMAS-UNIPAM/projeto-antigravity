import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OLEDTheme } from '../theme/colors';
import { TypingAlertPayload } from '../services/realtime-socket.service';

interface Props {
  alert: TypingAlertPayload | null;
  onTriggerBle?: () => void;
}

export const TypingAlertCard: React.FC<Props> = ({ alert, onTriggerBle }) => {
  if (!alert) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.pulseDot} />
        <Text style={styles.tag}>ALERTA DE DIGITAÇÃO (TEMPO REAL)</Text>
      </View>

      <Text style={styles.message}>{alert.message}</Text>

      <View style={styles.footer}>
        <Text style={styles.restaurantName}>🏪 {alert.restaurantName}</Text>
        <Text style={styles.neighborhoodBadge}>📍 {alert.neighborhood}</Text>
      </View>

      {onTriggerBle && (
        <TouchableOpacity style={styles.bleButton} activeOpacity={0.8} onPress={onTriggerBle}>
          <Text style={styles.bleButtonText}>⚡ PULSAR SINAL AMRELO NO CHAVEIRO BLE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: OLEDTheme.surfaceElevated,
    borderColor: OLEDTheme.warningYellow,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: OLEDTheme.warningYellow,
    marginRight: 8,
  },
  tag: {
    fontSize: 10,
    fontWeight: '900',
    color: OLEDTheme.warningYellow,
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    color: OLEDTheme.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 12,
    fontWeight: '700',
    color: OLEDTheme.textSecondary,
  },
  neighborhoodBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: OLEDTheme.warningYellow,
  },
  bleButton: {
    backgroundColor: OLEDTheme.warningYellowAlpha,
    borderColor: OLEDTheme.warningYellow,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  bleButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: OLEDTheme.warningYellow,
    letterSpacing: 0.5,
  },
});
