import * as SecureStore from 'expo-secure-store';

export const GEMINI_SECURE_KEY = 'gemini_api_key';
export const PLACEHOLDER_API_KEY = 'PEGA_AQUI_TU_GEMINI_API_KEY';

/**
 * Retrieves the Gemini API Key according to priority:
 * 1. Read 'gemini_api_key' from Expo SecureStore.
 * 2. Fallback to process.env.GEMINI_API_KEY / process.env.EXPO_PUBLIC_GEMINI_API_KEY.
 * 3. Validate key and throw a controlled, descriptive error if invalid/missing/placeholder.
 */
export async function getGeminiApiKey(): Promise<string> {
  try {
    const storedKey = await SecureStore.getItemAsync(GEMINI_SECURE_KEY);
    if (storedKey && storedKey.trim() !== '' && storedKey !== PLACEHOLDER_API_KEY) {
      return storedKey.trim();
    }
  } catch (error) {
    console.warn('Failed to access SecureStore for Gemini API Key:', error);
  }

  const envKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!envKey || envKey.trim() === '' || envKey.trim() === PLACEHOLDER_API_KEY) {
    throw new Error(
      'Gemini API Key non configurada. Por favor, configura tu API Key en .env.local o guardala mediante la aplicación.'
    );
  }

  return envKey.trim();
}

/**
 * Saves a custom Gemini API Key into Expo SecureStore.
 */
export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === PLACEHOLDER_API_KEY) {
    throw new Error('La clave API proporcionada no es válida.');
  }
  await SecureStore.setItemAsync(GEMINI_SECURE_KEY, apiKey.trim());
}
