/**
 * SQLite Database Schema Definitions for TrAIn
 */

export const CREATE_ACTIVITIES_TABLE = `
  CREATE TABLE IF NOT EXISTS activities (
    activityId TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    distanceMeters REAL NOT NULL,
    durationSeconds INTEGER NOT NULL,
    avgPace TEXT NOT NULL,
    avgHr INTEGER NOT NULL,
    maxHr INTEGER NOT NULL,
    elevationGain REAL NOT NULL,
    rawSplitsJson TEXT,
    syncedAt TEXT NOT NULL
  );
`;

export const CREATE_CHECKINS_TABLE = `
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activityId TEXT,
    date TEXT NOT NULL,
    rpe INTEGER NOT NULL,
    energyLevel INTEGER NOT NULL,
    hasPain INTEGER NOT NULL DEFAULT 0,
    painLocation TEXT,
    painLevel INTEGER,
    notes TEXT,
    FOREIGN KEY(activityId) REFERENCES activities(activityId) ON DELETE SET NULL
  );
`;

export const CREATE_WORKOUTS_TABLE = `
  CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    sportType TEXT NOT NULL,
    structureJson TEXT NOT NULL,
    isUploadedToGarmin INTEGER NOT NULL DEFAULT 0,
    scheduledDate TEXT NOT NULL
  );
`;
