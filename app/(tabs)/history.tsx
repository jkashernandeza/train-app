import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAllActivities, getCheckInByActivityId } from '@/src/database/queries';
import { Activity, CheckIn } from '@/src/types';
import { Activity as RunIcon, Heart, MapPin, Clock, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react-native';

export default function HistoryScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = useCallback(() => {
    try {
      const data = getAllActivities();
      setActivities(data);
    } catch (err) {
      console.error('Error reading activities from database:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [loadActivities])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
    setRefreshing(false);
  };

  const totalDistanceKm = activities
    .reduce((acc, act) => acc + act.distanceMeters, 0) / 1000;

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Sesiones</Text>
          <Text style={styles.summaryValue}>{activities.length}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Distancia Total</Text>
          <Text style={styles.summaryValue}>{totalDistanceKm.toFixed(1)} km</Text>
        </View>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.activityId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A84FF" />
        }
        renderItem={({ item }) => {
          const checkIn: CheckIn | null = getCheckInByActivityId(item.activityId);
          const km = (item.distanceMeters / 1000).toFixed(2);
          const mins = Math.floor(item.durationSeconds / 60);

          return (
            <View style={styles.activityCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <RunIcon size={20} color="#30D158" />
                  <Text style={styles.activityTitle}>Carrera en Exterior</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricCell}>
                  <MapPin size={14} color="#8E8E93" />
                  <Text style={styles.metricVal}>{km} km</Text>
                </View>
                <View style={styles.metricCell}>
                  <Clock size={14} color="#8E8E93" />
                  <Text style={styles.metricVal}>{mins} min</Text>
                </View>
                <View style={styles.metricCell}>
                  <Text style={styles.metricLabel}>Ritmo:</Text>
                  <Text style={styles.metricVal}>{item.avgPace}</Text>
                </View>
                <View style={styles.metricCell}>
                  <Heart size={14} color="#FF3B30" />
                  <Text style={styles.metricVal}>{item.avgHr} bpm</Text>
                </View>
              </View>

              {/* Check-in Footer */}
              <View style={styles.checkInFooter}>
                {checkIn ? (
                  <View style={styles.checkInDone}>
                    <CheckCircle2 size={14} color="#30D158" />
                    <Text style={styles.checkInText}>
                      RPE: {checkIn.rpe}/10 | Energía: {checkIn.energyLevel}/5
                      {checkIn.hasPain ? ` | ⚠️ Dolor en ${checkIn.painLocation}` : ''}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.checkInPending}>
                    <AlertTriangle size={14} color="#FF9500" />
                    <Text style={styles.pendingText}>Sin Check-in registrado</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={36} color="#3A3A3C" />
            <Text style={styles.emptyTitle}>No hay carreras guardadas</Text>
            <Text style={styles.emptySubtitle}>
              Sincroniza tu cuenta de Garmin Connect desde el Dashboard para ver tu historial de entrenamiento.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A84FF',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#2C2C2E',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  metricCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkInFooter: {
    paddingTop: 4,
  },
  checkInDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkInText: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  checkInPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
