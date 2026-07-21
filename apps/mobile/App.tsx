import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OLEDTheme } from './src/theme/colors';
import { CopilotScreen } from './src/screens/CopilotScreen';
import { HeatmapScreen } from './src/screens/HeatmapScreen';

const queryClient = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState<'COPILOT' | 'HEATMAP'>('COPILOT');

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor={OLEDTheme.background} />

        {/* Exibição da Tela Ativa */}
        <View style={styles.screenContainer}>
          {activeTab === 'COPILOT' ? <CopilotScreen /> : <HeatmapScreen />}
        </View>

        {/* Barra de Navegação Inferior (Bottom Navigation OLED) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'COPILOT' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('COPILOT')}
          >
            <Text style={[styles.tabText, activeTab === 'COPILOT' && styles.tabTextActive]}>
              🏍️ COPILOTO HUD
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'HEATMAP' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('HEATMAP')}
          >
            <Text style={[styles.tabText, activeTab === 'HEATMAP' && styles.tabTextActive]}>
              🔥 MAPA DE CALOR
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OLEDTheme.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: OLEDTheme.surface,
    borderTopWidth: 1,
    borderTopColor: OLEDTheme.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: OLEDTheme.neonGreenAlpha,
    borderColor: OLEDTheme.neonGreen,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: OLEDTheme.textSecondary,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: OLEDTheme.neonGreen,
  },
});
