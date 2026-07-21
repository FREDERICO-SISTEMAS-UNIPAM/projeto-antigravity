import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OLEDTheme } from '../theme/colors';
import { BleDeviceState } from '../services/ble-device.service';

interface Props {
  bleState: BleDeviceState;
  onPressConnect?: () => void;
}

export const BleStatusBadge: React.FC<Props> = ({ bleState, onPressConnect }) => {
  const isConnected = bleState.status === 'CONNECTED';
  const isConnecting = bleState.status === 'CONNECTING';

  const badgeColor = isConnected
    ? OLEDTheme.neonGreen
    : isConnecting
    ? OLEDTheme.warningYellow
    : OLEDTheme.alertRed;

  const statusLabel = isConnected
    ? `Chaveiro BLE | ${bleState.batteryLevel || 100}%`
    : isConnecting
    ? 'Conectando...'
    : 'Chaveiro Desconectado';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPressConnect}
      style={[
        styles.container,
        {
          borderColor: badgeColor,
          backgroundColor: isConnected ? OLEDTheme.neonGreenAlpha : OLEDTheme.surfaceElevated,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[styles.text, { color: isConnected ? OLEDTheme.neonGreen : OLEDTheme.textPrimary }]}>
        {statusLabel}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
