import * as SQLite from 'expo-sqlite';
import {
  CREATE_ACTIVITIES_TABLE,
  CREATE_CHECKINS_TABLE,
  CREATE_WORKOUTS_TABLE,
} from './schema';

const DB_NAME = 'train.db';

export const db = SQLite.openDatabaseSync(DB_NAME);

export function initDatabase(): void {
  try {
    db.execSync(CREATE_ACTIVITIES_TABLE);
    db.execSync(CREATE_CHECKINS_TABLE);
    db.execSync(CREATE_WORKOUTS_TABLE);
    console.log('TrAIn database initialized successfully.');
  } catch (error) {
    console.error('Error initializing TrAIn database:', error);
    throw error;
  }
}
