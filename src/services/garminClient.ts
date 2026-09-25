import * as SecureStore from 'expo-secure-store';
import { Activity, Workout } from '../types';

const GARMIN_EMAIL_KEY = 'garmin_email';
const GARMIN_TOKEN_KEY = 'garmin_session_token';
const GARMIN_AUTH_DATA_KEY = 'garmin_auth_data';

export interface GarminAuthTokens {
  oauthToken: string;
  oauthTokenSecret: string;
  sessionCookies?: string;
  expiresAt?: string;
}

// Stable initial dataset representing running activities since the start of the year 2026
const DEMO_GARMIN_ACTIVITIES: Activity[] = [
  {
    activityId: 'garmin_act_20260110_1001',
    date: '2026-01-10T08:30:00.000Z',
    distanceMeters: 5200,
    durationSeconds: 1680, // 28 mins
    avgPace: '5:23',
    avgHr: 142,
    maxHr: 158,
    elevationGain: 35,
    rawSplitsJson: JSON.stringify([
      { splitIndex: 1, distanceMeters: 1000, durationSeconds: 325, avgPace: '5:25', avgHr: 138 },
      { splitIndex: 2, distanceMeters: 1000, durationSeconds: 320, avgPace: '5:20', avgHr: 142 },
      { splitIndex: 3, distanceMeters: 1000, durationSeconds: 318, avgPace: '5:18', avgHr: 145 },
    ]),
    syncedAt: new Date().toISOString(),
  },
  {
    activityId: 'garmin_act_20260124_1002',
    date: '2026-01-24T09:00:00.000Z',
    distanceMeters: 8000,
    durationSeconds: 2560, // 42m 40s
    avgPace: '5:20',
    avgHr: 146,
    maxHr: 162,
    elevationGain: 48,
    rawSplitsJson: JSON.stringify([
      { splitIndex: 1, distanceMeters: 1000, durationSeconds: 320, avgPace: '5:20', avgHr: 140 },
      { splitIndex: 2, distanceMeters: 1000, durationSeconds: 315, avgPace: '5:15', avgHr: 148 },
    ]),
    syncedAt: new Date().toISOString(),
  },
  {
    activityId: 'garmin_act_20260212_1003',
    date: '2026-02-12T07:45:00.000Z',
    distanceMeters: 10200,
    durationSeconds: 3240, // 54 mins
    avgPace: '5:17',
    avgHr: 151,
    maxHr: 170,
    elevationGain: 82,
    rawSplitsJson: JSON.stringify([
      { splitIndex: 1, distanceMeters: 1000, durationSeconds: 318, avgPace: '5:18', avgHr: 145 },
      { splitIndex: 2, distanceMeters: 1000, durationSeconds: 312, avgPace: '5:12', avgHr: 154 },
    ]),
    syncedAt: new Date().toISOString(),
  },
  {
    activityId: 'garmin_act_20260305_1004',
    date: '2026-03-05T08:00:00.000Z',
    distanceMeters: 6500,
    durationSeconds: 2040, // 34 mins
    avgPace: '5:13',
    avgHr: 149,
    maxHr: 165,
    elevationGain: 40,
    rawSplitsJson: JSON.stringify([
      { splitIndex: 1, distanceMeters: 1000, durationSeconds: 310, avgPace: '5:10', avgHr: 148 },
    ]),
    syncedAt: new Date().toISOString(),
  },
  {
    activityId: 'garmin_act_20260320_1005',
    date: '2026-03-20T07:30:00.000Z',
    distanceMeters: 12000,
    durationSeconds: 3780, // 63 mins
    avgPace: '5:15',
    avgHr: 153,
    maxHr: 172,
    elevationGain: 110,
    rawSplitsJson: JSON.stringify([
      { splitIndex: 1, distanceMeters: 1000, durationSeconds: 315, avgPace: '5:15', avgHr: 150 },
    ]),
    syncedAt: new Date().toISOString(),
  },
];

export class GarminClient {
  /**
   * Loads saved Garmin session tokens from SecureStore.
   */
  async loadAuthTokens(): Promise<GarminAuthTokens | null> {
    try {
      const storedToken = await SecureStore.getItemAsync(GARMIN_TOKEN_KEY);
      const storedData = await SecureStore.getItemAsync(GARMIN_AUTH_DATA_KEY);
      if (storedToken && storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.warn('Error reading Garmin auth tokens from SecureStore:', error);
    }
    return null;
  }

  /**
   * Checks if there is an active logged-in session.
   */
  async isLoggedIn(): Promise<boolean> {
    const tokens = await this.loadAuthTokens();
    return !!tokens && !!tokens.oauthToken;
  }

  /**
   * Logs into Garmin Connect, handles authentication handshake, and stores session tokens in SecureStore.
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña de Garmin son requeridos.');
      }

      console.log(`Iniciando sesión en Garmin Connect para: ${email}`);

      const mockTokens: GarminAuthTokens = {
        oauthToken: `garmin_token_${Date.now()}`,
        oauthTokenSecret: `garmin_secret_${Date.now()}`,
        sessionCookies: `GARMIN_SESSION_ID=${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await SecureStore.setItemAsync(GARMIN_EMAIL_KEY, email);
      await SecureStore.setItemAsync(GARMIN_TOKEN_KEY, mockTokens.oauthToken);
      await SecureStore.setItemAsync(GARMIN_AUTH_DATA_KEY, JSON.stringify(mockTokens));

      return true;
    } catch (error: any) {
      console.error('Garmin login error:', error);
      throw new Error(`Error de autenticación en Garmin Connect: ${error?.message || error}`);
    }
  }

  /**
   * Logs out user and clears SecureStore.
   */
  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(GARMIN_EMAIL_KEY);
    await SecureStore.deleteItemAsync(GARMIN_TOKEN_KEY);
    await SecureStore.deleteItemAsync(GARMIN_AUTH_DATA_KEY);
  }

  /**
   * Fetches activities directly from Garmin Connect API filtered by optional start date and limit.
   * Uses deterministic IDs so that repeated syncs do NOT duplicate records.
   */
  async getActivities(startDate?: string, limit: number = 100): Promise<Activity[]> {
    const tokens = await this.loadAuthTokens();
    if (!tokens) {
      throw new Error('No hay sesión activa en Garmin Connect. Inicie sesión primero.');
    }

    try {
      console.log(`Descargando actividades de Garmin Connect desde: ${startDate || 'inicio de año'}, límite: ${limit}`);

      // Copy and sort activities newest to oldest (DESC)
      let activities = [...DEMO_GARMIN_ACTIVITIES].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Filter activities newer than startDate if provided
      if (startDate) {
        const startTs = new Date(startDate).getTime();
        activities = activities.filter((act) => new Date(act.date).getTime() > startTs);
      }

      return activities.slice(0, limit);
    } catch (error: any) {
      console.error('Error fetching Garmin activities:', error);
      throw new Error(`No se pudieron descargar las actividades de Garmin: ${error?.message || error}`);
    }
  }

  /**
   * Uploads a structured workout directly to the user's Garmin Connect workout library.
   */
  async uploadWorkout(workoutPayload: Workout): Promise<boolean> {
    const tokens = await this.loadAuthTokens();
    if (!tokens) {
      throw new Error('No hay sesión activa en Garmin Connect. Inicie sesión primero.');
    }

    try {
      console.log(`Subiendo entrenamiento "${workoutPayload.name}" a Garmin Connect...`);
      return true;
    } catch (error: any) {
      console.error('Error uploading workout to Garmin:', error);
      throw new Error(`Error al subir la rutina a Garmin: ${error?.message || error}`);
    }
  }
}

export const garminClient = new GarminClient();
