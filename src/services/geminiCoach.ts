import { GoogleGenAI } from '@google/genai';
import { Activity, CheckIn, Workout } from '../types';

export class GeminiCoachService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  setApiKey(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generates or adapts a workout based on user's recent activity, RPE and pain feedback.
   */
  async adaptWorkoutPlan(
    recentActivities: Activity[],
    recentCheckIns: CheckIn[],
    targetGoals: string
  ): Promise<Workout | null> {
    if (!this.ai) {
      console.warn('Gemini API key not configured.');
      return null;
    }

    const prompt = `
      Act as an expert running and strength coach with an anti-injury philosophy.
      Analyze the following athlete data:
      - Recent Activities: ${JSON.stringify(recentActivities.slice(0, 5))}
      - Recent Check-ins (RPE/Pain): ${JSON.stringify(recentCheckIns.slice(0, 5))}
      - Goal: ${targetGoals}

      If pain level is > 3 or energy level is low (< 4), reduce running intensity or suggest active recovery / strength stability.
      Provide a structured workout JSON response.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      console.log('Gemini Coach response received:', response.text);
      return null;
    } catch (error) {
      console.error('Error calling Gemini Coach:', error);
      return null;
    }
  }
}

export const geminiCoach = new GeminiCoachService();
