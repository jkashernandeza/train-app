import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from './configService';
import { Activity, CheckIn, Workout } from '../types';

export interface CoachAnalysisResult {
  sessionImpact: {
    stressScore: number; // 1-100
    recoveryTimeHours: number;
    physiologicalAssessment: string;
    injuryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  nextDayRecommendation: {
    suggestedActivityType: 'RUNNING' | 'STRENGTH' | 'REST' | 'ACTIVE_RECOVERY';
    summary: string;
    keyFocus: string;
    antiInjuryWarning?: string;
  };
  proposedWorkout?: Workout | null;
}

export const COACH_SYSTEM_PROMPT = `
Eres TrAIn, un Entrenador Senior de Carrera y Fuerza Adaptativo con enfoque Fisiológico y Anti-Lesiones.
Tu filosofía se rige por los siguientes principios estrictos:

1. PRINCIPIO DE MÍNIMA DOSIS EFECTIVA: Maximiza las adaptaciones con el menor estrés acumulado innecesario. No prescribas volumen o intensidad excesivos.
2. PREVENCIÓN PROACTIVA DE LESIONES: Si el atleta reporta dolor articular, tendinoso o muscular (nivel de dolor > 3 o molestias focalizadas en rodillas, Aquiles, rodilla de corredor, periostitis, etc.), debes FRENAR la carga inmediatamente y recomendar descanso activo o sustituir la carrera por trabajo de estabilidad/fuerza regenerativa.
3. ENTRENAMIENTO CONCURRENTE EQUILIBRADO: Coordina las sesiones de fuerza (tren inferior, core, estabilidad) con los días de carrera. Nunca acumules trabajo de fuerza pesado para piernas justo el día previo a un entrenamiento de calidad o series de velocidad.
4. CONTROL POR ESFUERZO / FRECUENCIA CARDÍACA (RPE y FC): Las métricas se analizan según la respuesta fisiológica real (RPE y FC media/máxima) y no por metas arbitrarias de cronómetro ciego.

Debes responder SIEMPRE en formato JSON estructurado siguiendo el esquema solicitado.
`;

export class GeminiCoachService {
  /**
   * Dynamically instantiates the GoogleGenAI client using getGeminiApiKey()
   */
  private async getAIClient(): Promise<GoogleGenAI> {
    const apiKey = await getGeminiApiKey();
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Analyzes an activity, its associated check-in (RPE, energy, pain), and historical data.
   * Returns a complete physiological analysis, next day recommendations, and an optional structured workout.
   */
  async analyzeWorkoutAndSensations(
    activity: Activity | null,
    checkIn: CheckIn | null,
    history: { activities: Activity[]; checkIns: CheckIn[] }
  ): Promise<CoachAnalysisResult> {
    try {
      const ai = await this.getAIClient();

      const userPrompt = `
Por favor analiza la siguiente sesión de entrenamiento y sensaciones del atleta:

[Actividad Reciente]
${activity ? JSON.stringify(activity, null, 2) : 'Sin actividad registrada hoy.'}

[Check-In Subjetivo / RPE y Dolor]
${checkIn ? JSON.stringify(checkIn, null, 2) : 'Sin check-in registrado hoy.'}

[Histórico Reciente (Últimas 5 sesiones)]
Actividades: ${JSON.stringify(history.activities.slice(0, 5), null, 2)}
Check-Ins: ${JSON.stringify(history.checkIns.slice(0, 5), null, 2)}

Responde estrictamente con un objeto JSON estructurado como el siguiente:
{
  "sessionImpact": {
    "stressScore": 65,
    "recoveryTimeHours": 24,
    "physiologicalAssessment": "Evaluación clara del impacto aeróbico/muscular...",
    "injuryRiskLevel": "LOW" | "MEDIUM" | "HIGH"
  },
  "nextDayRecommendation": {
    "suggestedActivityType": "RUNNING" | "STRENGTH" | "REST" | "ACTIVE_RECOVERY",
    "summary": "Resumen ejecutivo del plan para mañana...",
    "keyFocus": "Enfoque clave...",
    "antiInjuryWarning": "Advertencia específica si hay dolor o fatiga alta..."
  },
  "proposedWorkout": {
    "id": "workout_id_timestamp",
    "name": "Nombre de la Sesión Propuesta",
    "sportType": "RUNNING" | "STRENGTH",
    "structureJson": "{\\"warmup\\": \\"10m Z1\\", \\"intervals\\": \\"...\\", \\"cooldown\\": \\"5m Z1\\"}",
    "isUploadedToGarmin": 0,
    "scheduledDate": "YYYY-MM-DD"
  }
}
Si no se recomienda una propuesta de sesión de calidad para mañana (por ejemplo si se sugiere descanso), "proposedWorkout" puede ser null.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: COACH_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('La respuesta del modelo Gemini volvió vacía.');
      }

      const parsed: CoachAnalysisResult = JSON.parse(text);
      return parsed;
    } catch (error: any) {
      console.error('Error in analyzeWorkoutAndSensations:', error);
      throw error;
    }
  }
}

export const geminiCoach = new GeminiCoachService();
