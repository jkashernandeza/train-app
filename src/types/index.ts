/**
 * Core Data Models & Telemetry Definitions for TrAIn
 */

export interface Activity {
  activityId: string;
  date: string;
  distanceMeters: number;
  durationSeconds: number;
  avgPace: string;
  avgHr: number;
  maxHr: number;
  elevationGain: number;
  rawSplitsJson: string | null;
  syncedAt: string;
}

export interface CheckIn {
  id?: number;
  activityId: string | null;
  date: string;
  rpe: number; // 1-10 Rate of Perceived Exertion
  energyLevel: number; // 1-10 Energy level
  hasPain: boolean | number; // 0 (false) or 1 (true)
  painLocation: string | null;
  painLevel: number | null; // 1-10
  notes: string | null;
}

export interface Workout {
  id: string;
  name: string;
  sportType: 'RUNNING' | 'STRENGTH' | 'CYCLING' | string;
  structureJson: string; // JSON string representation of workout steps/exercises
  isUploadedToGarmin: boolean | number;
  scheduledDate: string;
}

// Telemetry Structures for Running
export interface SplitItem {
  splitIndex: number;
  distanceMeters: number;
  durationSeconds: number;
  avgPace: string;
  avgHr?: number;
  elevationGain?: number;
}

export interface RunningTelemetry {
  avgCadence?: number;
  maxCadence?: number;
  avgStrideLengthMeters?: number;
  vo2MaxEstimate?: number;
  groundContactTimeMs?: number;
  verticalOscillationCm?: number;
  heartRateZones?: {
    zone1Seconds: number;
    zone2Seconds: number;
    zone3Seconds: number;
    zone4Seconds: number;
    zone5Seconds: number;
  };
  splits: SplitItem[];
}

// Telemetry Structures for Strength
export interface ExerciseSet {
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  restSeconds?: number;
  targetMuscleGroup?: string;
  rpePerSet?: number;
}

export interface StrengthTelemetry {
  totalVolumeKg: number;
  exercises: {
    name: string;
    targetGroup: string;
    sets: ExerciseSet[];
  }[];
  estimatedMuscleFatigue: Record<string, number>; // e.g. { "quadriceps": 7, "hamstrings": 4 }
  primaryFocus: string; // e.g. "Lower Body Hypertrophy", "Core & Stability"
}

// Garmin Auth & Sync Types
export interface GarminCredentials {
  username: string;
  password?: string;
  sessionToken?: string;
  isLoggedIn: boolean;
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  isSyncing: boolean;
  error: string | null;
}
