import { garminClient } from './garminClient';
import {
  getAllActivities,
  getActivityById,
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
   * Reads the latest activity date in SQLite, fetches activities from Garmin Connect,
   * and saves them to the local SQLite database without creating duplicates.
   */
  async syncLatestActivities(limit: number = 100): Promise<number> {
    if (this.status.isSyncing) {
      console.warn('Sync is already in progress.');
      return 0;
    }

    this.status.isSyncing = true;
    this.status.error = null;

    try {
      // 1. Fetch activities from Garmin Connect (newest to oldest, up to limit)
      const fetchedActivities = await garminClient.getActivities(undefined, limit);

      // 3. Insert into SQLite checking for existing IDs
      let newInsertedCount = 0;
      for (const activity of fetchedActivities) {
        const existing = getActivityById(activity.activityId);
        if (!existing) {
          newInsertedCount++;
        }
        insertActivity(activity);
      }

      this.status.lastSyncedAt = new Date().toISOString();
      this.status.isSyncing = false;
      return newInsertedCount;
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
