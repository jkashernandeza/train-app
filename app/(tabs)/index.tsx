import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { syncService } from '@/src/services/syncService';
import { garminClient } from '@/src/services/garminClient';
import {
  getAllActivities,
  getAllWorkouts,
  getCheckInByActivityId,
} from '@/src/database/queries';
import { Activity, CheckIn, Workout } from '@/src/types';
import { CheckInModal } from '@/src/components/CheckInModal';
import { MetricCard } from '@/src/components/MetricCard';
import { WorkoutCard } from '@/src/components/WorkoutCard';
import {
  RefreshCw,
  Zap,
  Activity as RunIcon,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  TrendingUp,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const [loadingSync, setLoadingSync] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [latestActivity, setLatestActivity] = useState<Activity | null>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<CheckIn | null>(null);
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(() => {
    try {
      const activities = getAllActivities();
      if (activities.length > 0) {
        const topActivity = activities[0];
        setLatestActivity(topActivity);
        const checkIn = getCheckInByActivityId(topActivity.activityId);
        setLatestCheckIn(checkIn);
      } else {
        setLatestActivity(null);
        setLatestCheckIn(null);
      }

      const workouts = getAllWorkouts();
      if (workouts.length > 0) {
        setNextWorkout(workouts[0]);
      } else {
        setNextWorkout({
          id: 'suggested_default_1',
          name: '7K Carrera Z2 Base Aeróbica',
          sportType: 'RUNNING',
          structureJson: JSON.stringify({
            warmup: '10 min suave',
            main: '35 min @ 5:20-5:35 /km (Zona 2)',
            cooldown: '5 min caminata',
          }),
          isUploadedToGarmin: 0,
          scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Error loading local data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSync = async () => {
    setLoadingSync(true);
    try {
      const syncedCount = await syncService.syncLatestActivities(10);
      loadData();
      Alert.alert(
        'Sincronización Exitosa',
        syncedCount > 0
          ? `Se importaron ${syncedCount} nueva(s) actividad(es) de Garmin.`
          : 'Tu historial ya estaba al día con Garmin Connect.'
      );
    } catch (err: any) {
      Alert.alert('Error de Sincronización', err?.message || 'No se pudo conectar a Garmin Connect.');
    } finally {
      setLoadingSync(false);
    }
  };

  const handleSendToGarmin = async (workoutId: string) => {
    if (!nextWorkout) return;
    try {
      const success = await garminClient.uploadWorkout(nextWorkout);
      if (success) {
        Alert.alert('¡Éxito!', `Entrenamiento "${nextWorkout.name}" enviado a tu reloj Garmin.`);
      }
    } catch (err: any) {
      Alert.alert('Error al enviar a Garmin', err?.message || 'Fallo de envío.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const todayFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A84FF" />
        }>
        {/* Header Greeting */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dateText}>{todayFormatted.toUpperCase()}</Text>
            <Text style={styles.greetingTitle}>¡Hola, Atleta! 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={loadingSync}>
            {loadingSync ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.syncBtnText}>Sync Garmin</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Status & Load Recovery Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Zap size={20} color="#FFCC00" />
            <Text style={styles.cardTitle}>Estado de Recuperación & Carga</Text>
          </View>
          <View style={styles.statusBadgeRow}>
            <View style={styles.readinessBadge}>
              <CheckCircle size={16} color="#30D158" />
              <Text style={styles.readinessText}>Listo para entrenar</Text>
            </View>
            <Text style={styles.fatigueSubtext}>Fatiga muscular baja • VFC óptima</Text>
          </View>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Carga 7 Días"
              value="340"
              unit="TSS"
              accentColor="#0A84FF"
              subtitle="Optima (+5%)"
            />
            <MetricCard
              title="Estrés Fisiológico"
              value="Bajo"
              accentColor="#30D158"
              subtitle="RPE prom. 5/10"
            />
          </View>
        </View>

        {/* Latest Activity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <RunIcon size={20} color="#30D158" />
            <Text style={styles.cardTitle}>Última Sesión Registrada</Text>
          </View>

          {latestActivity ? (
            <View style={styles.activityBody}>
              <Text style={styles.activityDate}>{latestActivity.date}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Distancia</Text>
                  <Text style={styles.statValue}>
                    {(latestActivity.distanceMeters / 1000).toFixed(2)} km
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Ritmo Medio</Text>
                  <Text style={styles.statValue}>{latestActivity.avgPace} /km</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>FC Media</Text>
                  <Text style={styles.statValue}>{latestActivity.avgHr} bpm</Text>
                </View>
              </View>

              {/* Check-in status */}
              {latestCheckIn ? (
                <View style={styles.checkInDoneBadge}>
                  <CheckCircle size={16} color="#30D158" />
                  <Text style={styles.checkInDoneText}>
                    Check-in completado (RPE {latestCheckIn.rpe}/10
                    {latestCheckIn.hasPain ? ` • Molestia en ${latestCheckIn.painLocation}` : ''})
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.checkInPendingBtn}
                  onPress={() => setModalVisible(true)}>
                  <PlusCircle size={18} color="#FFFFFF" />
                  <Text style={styles.checkInPendingText}>Completar Check-in de Sensaciones</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <AlertCircle size={24} color="#8E8E93" />
              <Text style={styles.emptyText}>No hay actividades registradas en SQLite aún.</Text>
              <TouchableOpacity style={styles.inlineSyncBtn} onPress={handleSync}>
                <Text style={styles.inlineSyncText}>Sincronizar ahora</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Suggested Workout Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#FF9500" />
            <Text style={styles.cardTitle}>Próximo Entrenamiento Sugerido</Text>
          </View>
          {nextWorkout ? (
            <WorkoutCard
              workout={nextWorkout}
              onUpload={(id) => handleSendToGarmin(id)}
            />
          ) : (
            <Text style={styles.emptyText}>No hay rutinas sugeridas por el Coach.</Text>
          )}
        </View>
      </ScrollView>

      {/* Check-in Modal */}
      <CheckInModal
        visible={modalVisible}
        activityId={latestActivity?.activityId ?? null}
        onClose={() => setModalVisible(false)}
        onSuccess={loadData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A84FF',
    letterSpacing: 1,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readinessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readinessText: {
    color: '#30D158',
    fontWeight: '700',
    fontSize: 13,
  },
  fatigueSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  activityBody: {
    gap: 12,
  },
  activityDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkInDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    padding: 10,
    borderRadius: 10,
  },
  checkInDoneText: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '600',
  },
  checkInPendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkInPendingText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
  },
  inlineSyncBtn: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  inlineSyncText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
