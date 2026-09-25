import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '@/src/services/configService';
import { COACH_SYSTEM_PROMPT } from '@/src/services/geminiCoach';
import { getAllActivities, getAllCheckIns } from '@/src/database/queries';
import { Send, Bot, User, Sparkles } from 'lucide-react-native';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '¿Cómo adapto el entrenamiento si me duele el sóleo?',
  '¿Cuándo debo meter trabajo de fuerza pesado para piernas?',
  '¿Cómo evalúas mi última carrera registrada?',
  '¿Qué ritmo debo mantener si mi FC está alta?',
];

export default function CoachChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      sender: 'coach',
      text: '¡Hola! Soy TrAIn Coach, tu entrenador personal de carrera y fuerza con filosofía de prevención de lesiones. ¿En qué te ayudo hoy con tu planificación?',
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || loading) return;

    const currentTimestamp = 'Ahora';
    const msgId = `user_${messages.length}`;

    const userMessage: Message = {
      id: msgId,
      sender: 'user',
      text: messageText,
      timestamp: currentTimestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const apiKey = await getGeminiApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const recentActivities = getAllActivities().slice(0, 3);
      const recentCheckIns = getAllCheckIns().slice(0, 3);

      const contextPrompt = `
Contexto del atleta en TrAIn:
- Últimas carreras: ${JSON.stringify(recentActivities, null, 2)}
- Últimos check-ins (RPE/Dolor): ${JSON.stringify(recentCheckIns, null, 2)}

Pregunta o mensaje del atleta: "${messageText}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextPrompt,
        config: {
          systemInstruction: COACH_SYSTEM_PROMPT,
        },
      });

      const replyText = response.text || 'No pude generar una respuesta. Por favor intenta nuevamente.';
      const coachMsgId = `coach_${messages.length + 1}`;

      const coachMessage: Message = {
        id: coachMsgId,
        sender: 'coach',
        text: replyText,
        timestamp: 'Ahora',
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (err: any) {
      console.error('Error in Coach Chat:', err);
      const errId = `err_${messages.length + 1}`;
      const errorMessage: Message = {
        id: errId,
        sender: 'coach',
        text: `⚠️ Error de Configuración: ${err?.message || 'No se pudo conectar con el Coach AI. Revisa tu GEMINI_API_KEY en .env.local.'}`,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View
              style={[
                styles.messageWrapper,
                isUser ? styles.userWrapper : styles.coachWrapper,
              ]}>
              {!isUser && (
                <View style={styles.avatarCoach}>
                  <Bot size={16} color="#FFFFFF" />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.coachBubble,
                ]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
              {isUser && (
                <View style={styles.avatarUser}>
                  <User size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0A84FF" />
              <Text style={styles.loadingText}>TrAIn Coach redactando consejo...</Text>
            </View>
          ) : null
        }
      />

      {/* Quick Prompts */}
      <View style={styles.quickPromptsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_PROMPTS}
          keyExtractor={(item, index) => `prompt_${index}`}
          contentContainerStyle={styles.quickPromptsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickPromptChip}
              onPress={() => sendMessage(item)}
              disabled={loading}>
              <Sparkles size={12} color="#0A84FF" />
              <Text style={styles.quickPromptText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Pregunta a tu entrenador TrAIn..."
          placeholderTextColor="#636366"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}>
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 4,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  coachWrapper: {
    justifyContent: 'flex-start',
  },
  avatarCoach: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#0A84FF',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  quickPromptsContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  quickPromptsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  quickPromptText: {
    color: '#D4D4D8',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3A3A3C',
    opacity: 0.5,
  },
});
