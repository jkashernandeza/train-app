import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { garminClient } from '../services/garminClient';
import { ShieldCheck, LogIn, ExternalLink, X } from 'lucide-react-native';

interface GarminLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GarminLoginModal: React.FC<GarminLoginModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Datos Incompletos', 'Por favor ingresa tu correo y contraseña de Garmin Connect.');
      return;
    }

    setLoading(true);
    try {
      await garminClient.login(email.trim(), password);
      Alert.alert('Sesión Iniciada', 'Tu cuenta de Garmin Connect ha sido vinculada exitosamente.');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error de Inicio de Sesión', error?.message || 'No se pudo verificar la cuenta de Garmin.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWebGarmin = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://connect.garmin.com/signin');
    } catch (error) {
      console.error('Error opening browser:', error);
      Alert.alert('Error', 'No se pudo abrir el navegador web.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <ShieldCheck size={22} color="#0A84FF" />
              <Text style={styles.title}>Conectar Garmin Connect</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Ingresa las credenciales de tu cuenta de Garmin Connect para sincronizar automáticamente tus actividades y enviar tus entrenamientos prescritos por TrAIn.
          </Text>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Correo Electrónico / Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="tu_email@ejemplo.com"
              placeholderTextColor="#636366"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#636366"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Direct Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <LogIn size={18} color="#FFFFFF" />
                <Text style={styles.loginBtnText}>Iniciar Sesión y Vincular</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Web Browser Alternative */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o autenticar en web</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.webBtn} onPress={handleOpenWebGarmin}>
            <ExternalLink size={18} color="#0A84FF" />
            <Text style={styles.webBtnText}>Abrir Garmin Connect en Navegador</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
  },
  description: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E5EA',
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  dividerText: {
    fontSize: 12,
    color: '#636366',
  },
  webBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    borderRadius: 12,
  },
  webBtnText: {
    color: '#0A84FF',
    fontWeight: '600',
    fontSize: 14,
  },
});
