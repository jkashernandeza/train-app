import * as SecureStore from 'expo-secure-store';
import { Activity, GarminCredentials, Workout } from '../types';

const GARMIN_CREDENTIALS_KEY = 'train_garmin_credentials';

export class GarminClient {
  private credentials: GarminCredentials = {
    username: '',
    isLoggedIn: false,
  };

  async loadCredentials(): Promise<GarminCredentials> {
    try {
      const stored = await SecureStore.getItemAsync(GARMIN_CREDENTIALS_KEY);
      if (stored) {
        this.credentials = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load Garmin credentials from SecureStore:', error);
    }
    return this.credentials;
  }

  async saveCredentials(creds: GarminCredentials): Promise<void> {
    this.credentials = creds;
    await SecureStore.setItemAsync(GARMIN_CREDENTIALS_KEY, JSON.stringify(creds));
  }

  async login(username: string, password?: string): Promise<boolean> {
    // Garmin Connect login logic (OAuth / session token exchange)
    // Stub implementation to be expanded in next phase
    console.log(`Connecting to Garmin Connect for user: ${username}`);
    const creds: GarminCredentials = {
      username,
      isLoggedIn: true,
    };
    await this.saveCredentials(creds);
    return true;
  }

  async fetchRecentActivities(limit: number = 10): Promise<Activity[]> {
    if (!this.credentials.isLoggedIn) {
      console.warn('Garmin client is not authenticated.');
      return [];
    }
    // Fetch activities from Garmin API / Connect
    return [];
  }

  async uploadWorkout(workout: Workout): Promise<boolean> {
    if (!this.credentials.isLoggedIn) {
      console.warn('Garmin client is not authenticated.');
      return false;
    }
    // Upload FIT file or JSON workout structure to Garmin Connect
    console.log(`Uploading workout ${workout.name} to Garmin Connect...`);
    return true;
  }
}

export const garminClient = new GarminClient();
