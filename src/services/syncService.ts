import { garminClient } from './garminClient';
import {
  getAllActivities,
  getLatestActivityDate,
  insertActivity,
} from '../database/queries';
import { Activity, SyncStatus } from '../types';

export class SyncService {
  private status: SyncStatus = {
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  };

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Reads the latest activity date in SQLite, fetches only newer activities from Garmin Connect,
   * and saves them to the local SQLite database.
   */
  async syncLatestActivities(limit: number = 20): Promise<number> {
    if (this.status.isSyncing) {
      console.warn('Sync is already in progress.');
      return 0;
    }

    this.status.isSyncing = true;
    this.status.error = null;

    try {
      // 1. Read latest date saved in SQLite database
      const latestDate = getLatestActivityDate();

      // 2. Fetch recent activities from Garmin starting after latestDate
      const fetchedActivities = await garminClient.getActivities(latestDate || undefined, limit);

      // 3. Insert newly fetched activities into SQLite
      let insertedCount = 0;
      for (const activity of fetchedActivities) {
        insertActivity(activity);
        insertedCount++;
      }

      this.status.lastSyncedAt = new Date().toISOString();
      this.status.isSyncing = false;
      return insertedCount;
    } catch (error: any) {
      this.status.isSyncing = false;
      this.status.error = error?.message || 'Synchronization failed.';
      console.error('Error during syncLatestActivities:', error);
      throw error;
    }
  }

  /**
   * Retrieves all local activities stored in SQLite.
   */
  getLocalActivities(): Activity[] {
    return getAllActivities();
  }
}

export const syncService = new SyncService();
