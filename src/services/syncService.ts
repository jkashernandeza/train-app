import { garminClient } from './garminClient';
import { getAllActivities, insertActivity } from '../database/queries';
import { Activity, SyncStatus } from '../types';

export class SyncService {
  private status: SyncStatus = {
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  };

  getStatus(): SyncStatus {
    return this.status;
  }

  async syncWithGarmin(): Promise<boolean> {
    if (this.status.isSyncing) {
      return false;
    }

    this.status.isSyncing = true;
    this.status.error = null;

    try {
      const fetched = await garminClient.fetchRecentActivities(10);
      for (const act of fetched) {
        insertActivity(act);
      }
      this.status.lastSyncedAt = new Date().toISOString();
      this.status.isSyncing = false;
      return true;
    } catch (error: any) {
      this.status.isSyncing = false;
      this.status.error = error?.message || 'Sync failed';
      return false;
    }
  }

  getLocalActivities(): Activity[] {
    return getAllActivities();
  }
}

export const syncService = new SyncService();
