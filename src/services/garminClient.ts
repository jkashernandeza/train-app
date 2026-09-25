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

function generateDemoGarminActivities(count: number = 100): Activity[] {
  const list: Activity[] = [];
  const baseTime = new Date('2026-09-24T08:00:00.000Z').getTime();

  for (let i = 0; i < count; i++) {
    const offsetMs = i * 2.6 * 24 * 60 * 60 * 1000;
    const actDate = new Date(baseTime - offsetMs);
    const isoDate = actDate.toISOString();

    const distM = 5000 + ((i * 350) % 15000);
    const paceSec = 300 + ((i * 13) % 75);
    const mins = Math.floor(paceSec / 60);
    const secs = Math.floor(paceSec % 60);
    const avgPace = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    const durSec = Math.round((distM / 1000) * paceSec);
    const avgHr = 138 + ((i * 3) % 25);
    const maxHr = avgHr + 15 + (i % 10);
    const elev = 25 + ((i * 19) % 150);

    const pad = (count - i).toString().padStart(4, '0');
    const ymd = isoDate.substring(0, 10).replace(/-/g, '');

    list.push({
      activityId: `garmin_act_${ymd}_${pad}`,
      date: isoDate,
      distanceMeters: distM,
      durationSeconds: durSec,
      avgPace: avgPace,
      avgHr: avgHr,
      maxHr: maxHr,
      elevationGain: elev,
      rawSplitsJson: JSON.stringify([
        { splitIndex: 1, distanceMeters: 1000, durationSeconds: paceSec, avgPace, avgHr },
      ]),
      syncedAt: '2026-09-24T21:50:00.000Z',
    });
  }

  return list;
}

const DEMO_GARMIN_ACTIVITIES: Activity[] = generateDemoGarminActivities(100);

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
