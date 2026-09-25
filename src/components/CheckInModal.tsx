import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { CheckIn } from '../types';

interface CheckInModalProps {
  visible: boolean;
  activityId?: string | null;
  onClose: () => void;
  onSubmit: (checkIn: Omit<CheckIn, 'id'>) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  activityId = null,
  onClose,
  onSubmit,
}) => {
  const [rpe, setRpe] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [hasPain, setHasPain] = useState<boolean>(false);
  const [painLocation, setPainLocation] = useState<string>('');
  const [painLevel, setPainLevel] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = () => {
    onSubmit({
      activityId,
      date: new Date().toISOString(),
      rpe,
      energyLevel,
      hasPain: hasPain ? 1 : 0,
      painLocation: hasPain ? painLocation : null,
      painLevel: hasPain ? painLevel : null,
      notes: notes.trim() ? notes.trim() : null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Check-In Post Entrenamiento</Text>
            <Text style={styles.subtitle}>
              TrAIn evalúa tu nivel de fatiga y dolor para ajustar tu plan anti-lesiones.
            </Text>

            {/* RPE Slider */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Esfuerzo Percibido (RPE): <Text style={styles.boldValue}>{rpe}/10</Text>
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={rpe}
                onValueChange={setRpe}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#D1D1D6"
              />
            </View>

            {/* Energy Slider */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Nivel de Energía: <Text style={styles.boldValue}>{energyLevel}/10</Text>
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={energyLevel}
                onValueChange={setEnergyLevel}
                minimumTrackTintColor="#34C759"
                maximumTrackTintColor="#D1D1D6"
              />
            </View>

            {/* Has Pain Switch */}
            <View style={styles.switchSection}>
              <Text style={styles.label}>¿Sientes alguna molestia o dolor?</Text>
              <Switch value={hasPain} onValueChange={setHasPain} />
            </View>

            {hasPain && (
              <View style={styles.painDetails}>
                <Text style={styles.label}>Ubicación del dolor / molestia</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Rodilla derecha, Tendón de Aquiles..."
                  placeholderTextColor="#8E8E93"
                  value={painLocation}
                  onChangeText={setPainLocation}
                />

                <Text style={styles.label}>
                  Intensidad del dolor: <Text style={styles.boldValue}>{painLevel}/10</Text>
                </Text>
                <Slider
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={painLevel}
                  onValueChange={setPainLevel}
                  minimumTrackTintColor="#FF3B30"
                  maximumTrackTintColor="#D1D1D6"
                />
              </View>
            )}

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notas adicionales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observaciones de la sesión..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
  },
  content: {
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#E5E5EA',
    marginBottom: 6,
  },
  boldValue: {
    fontWeight: 'bold',
    color: '#0A84FF',
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  painDetails: {
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
  },
  cancelText: {
    color: '#E5E5EA',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
