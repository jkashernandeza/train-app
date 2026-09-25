import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Workout } from '../types';
import { Dumbbell, Activity as RunIcon, CheckCircle2, Clock } from 'lucide-react-native';

interface WorkoutCardProps {
  workout: Workout;
  onPress?: () => void;
  onUpload?: (workoutId: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onUpload,
}) => {
  const isStrength = workout.sportType.toUpperCase() === 'STRENGTH';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isStrength ? (
            <Dumbbell size={20} color="#FF9500" style={styles.icon} />
          ) : (
            <RunIcon size={20} color="#30D158" style={styles.icon} />
          )}
          <Text style={styles.name}>{workout.name}</Text>
        </View>
        <View
          style={[
            styles.badge,
            workout.isUploadedToGarmin ? styles.badgeSuccess : styles.badgePending,
          ]}>
          <Text style={styles.badgeText}>
            {workout.isUploadedToGarmin ? 'Garmin Synced' : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{workout.scheduledDate}</Text>
        </View>
        <Text style={styles.sportBadge}>{workout.sportType.toUpperCase()}</Text>
      </View>

      {!workout.isUploadedToGarmin && onUpload && (
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => onUpload(workout.id)}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.uploadBtnText}>Enviar a Garmin</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  badgePending: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#E5E5EA',
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sportBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A84FF',
    letterSpacing: 0.5,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 12,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
