import { db } from './db';
import { Activity, CheckIn, Workout } from '../types';

// --- Activities Queries ---
export function insertActivity(activity: Activity): void {
  const statement = db.prepareSync(`
    INSERT OR REPLACE INTO activities 
    (activityId, date, distanceMeters, durationSeconds, avgPace, avgHr, maxHr, elevationGain, rawSplitsJson, syncedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);
  try {
    statement.executeSync([
      activity.activityId,
      activity.date,
      activity.distanceMeters,
      activity.durationSeconds,
      activity.avgPace,
      activity.avgHr,
      activity.maxHr,
      activity.elevationGain,
      activity.rawSplitsJson ?? null,
      activity.syncedAt,
    ]);
  } finally {
    statement.finalizeSync();
  }
}

export function getAllActivities(): Activity[] {
  return db.getAllSync<Activity>('SELECT * FROM activities ORDER BY date DESC;');
}

export function getActivityById(activityId: string): Activity | null {
  return db.getFirstSync<Activity>('SELECT * FROM activities WHERE activityId = ?;', [activityId]);
}

// --- Check-ins Queries ---
export function insertCheckIn(checkIn: Omit<CheckIn, 'id'>): number {
  const statement = db.prepareSync(`
    INSERT INTO checkins (activityId, date, rpe, energyLevel, hasPain, painLocation, painLevel, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `);
  try {
    const result = statement.executeSync([
      checkIn.activityId ?? null,
      checkIn.date,
      checkIn.rpe,
      checkIn.energyLevel,
      typeof checkIn.hasPain === 'boolean' ? (checkIn.hasPain ? 1 : 0) : checkIn.hasPain,
      checkIn.painLocation ?? null,
      checkIn.painLevel ?? null,
      checkIn.notes ?? null,
    ]);
    return result.lastInsertRowId;
  } finally {
    statement.finalizeSync();
  }
}

export function getAllCheckIns(): CheckIn[] {
  return db.getAllSync<CheckIn>('SELECT * FROM checkins ORDER BY date DESC;');
}

export function getCheckInByActivityId(activityId: string): CheckIn | null {
  return db.getFirstSync<CheckIn>('SELECT * FROM checkins WHERE activityId = ?;', [activityId]);
}

// --- Workouts Queries ---
export function insertWorkout(workout: Workout): void {
  const statement = db.prepareSync(`
    INSERT OR REPLACE INTO workouts (id, name, sportType, structureJson, isUploadedToGarmin, scheduledDate)
    VALUES (?, ?, ?, ?, ?, ?);
  `);
  try {
    statement.executeSync([
      workout.id,
      workout.name,
      workout.sportType,
      workout.structureJson,
      typeof workout.isUploadedToGarmin === 'boolean' ? (workout.isUploadedToGarmin ? 1 : 0) : workout.isUploadedToGarmin,
      workout.scheduledDate,
    ]);
  } finally {
    statement.finalizeSync();
  }
}

export function getAllWorkouts(): Workout[] {
  return db.getAllSync<Workout>('SELECT * FROM workouts ORDER BY scheduledDate DESC;');
}

export function markWorkoutUploaded(id: string): void {
  db.runSync('UPDATE workouts SET isUploadedToGarmin = 1 WHERE id = ?;', [id]);
}
