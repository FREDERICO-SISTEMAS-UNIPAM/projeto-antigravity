import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { OLEDTheme } from '../theme/colors';
import { ApiService, NeighborhoodItem } from '../services/api.service';

export const HeatmapScreen: React.FC = () => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await ApiService.getNeighborhoods();
    setNeighborhoods(data);
    setLoading(false);
  };

  const getHeatLevel = (index: number) => {
    if (index === 0) return { label: 'ALTA DENSIDADE', color: OLEDTheme.neonGreen, bg: OLEDTheme.neonGreenAlpha };
    if (index < 3) return { label: 'MÉDIA DENSIDADE', color: OLEDTheme.warningYellow, bg: OLEDTheme.warningYellowAlpha };
    return { label: 'MODERADO', color: OLEDTheme.accentCyan, bg: OLEDTheme.accentCyanAlpha };
  };

  const renderItem = ({ item, index }: { item: NeighborhoodItem; index: number }) => {
    const heat = getHeatLevel(index);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.neighborhoodName}>#{index + 1} {item.name}</Text>
          <View style={[styles.badge, { backgroundColor: heat.bg, borderColor: heat.color }]}>
            <Text style={[styles.badgeText, { color: heat.color }]}>{heat.label}</Text>
          </View>
        </View>

        <Text style={styles.coordText}>
          GPS: {item.latitude || -18.5789}, {item.longitude || -46.5153}
        </Text>

        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>Previsão de Taxa Média: <Text style={styles.statVal}>R$ {(11 + index * 0.75).toFixed(2)}</Text></Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MAPA DE CALOR PREDITIVO</Text>
        <Text style={styles.subtitle}>DENSIDADE DE CORRIDAS EM PATOS DE MINAS (MG)</Text>
      </View>

      <FlatList
        data={neighborhoods}
        keyExtractor={(item) => item.id || item.name}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OLEDTheme.background,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: OLEDTheme.neonGreen,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: OLEDTheme.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: OLEDTheme.surface,
    borderColor: OLEDTheme.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: OLEDTheme.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  coordText: {
    fontSize: 11,
    color: OLEDTheme.textMuted,
    marginBottom: 8,
  },
  statsRow: {
    borderTopWidth: 1,
    borderTopColor: OLEDTheme.border,
    paddingTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: OLEDTheme.textSecondary,
  },
  statVal: {
    fontWeight: '800',
    color: OLEDTheme.warningYellow,
  },
});
