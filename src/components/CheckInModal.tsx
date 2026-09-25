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
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { insertCheckIn } from '../database/queries';
import { Activity, AlertTriangle, Zap, HeartPulse, CheckCircle2, X } from 'lucide-react-native';

interface CheckInModalProps {
  visible: boolean;
  activityId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_PAIN_ZONES = ['Rodilla', 'Sóleo / Gemelo', 'Tendón de Aquiles', 'Isquiotibiales', 'Cadera', 'Fascitis / Pie'];

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  activityId = null,
  onClose,
  onSuccess,
}) => {
  const [rpe, setRpe] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(3); // 1-5
  const [hasPain, setHasPain] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [painLevel, setPainLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  const getRpeLabel = (val: number) => {
    if (val <= 2) return '1-2 - Muy suave (Recuperación)';
    if (val <= 4) return '3-4 - Moderado (Zona 2 / Base)';
    if (val <= 6) return '5-6 - Algo Duro (Tempo / Umbral)';
    if (val <= 8) return '7-8 - Duro (Series / VO2Max)';
    return '9-10 - Esfuerzo Máximo (Agotamiento)';
  };

  const handleSubmit = () => {
    try {
      insertCheckIn({
        activityId,
        date: new Date().toISOString(),
        rpe,
        energyLevel,
        hasPain: hasPain ? 1 : 0,
        painLocation: hasPain ? selectedZone || 'General' : null,
        painLevel: hasPain ? painLevel : null,
        notes: notes.trim() ? notes.trim() : null,
      });

      Alert.alert('¡Check-in Guardado!', 'TrAIn ha registrado tus sensaciones para adaptar tu entrenamiento.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving check-in:', error);
      Alert.alert('Error', 'No se pudo guardar el check-in.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Activity size={22} color="#0A84FF" />
              <Text style={styles.title}>Check-In Post Entrenamiento</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              TrAIn analiza tu RPE, energía y molestias para adaptar la carga y prevenir lesiones.
            </Text>

            {/* RPE Slider (1-10) */}
            <View style={styles.cardSection}>
              <View style={styles.labelRow}>
                <HeartPulse size={18} color="#FF3B30" />
                <Text style={styles.labelTitle}>Esfuerzo Percibido (RPE)</Text>
              </View>
              <Text style={styles.rpeBadge}>{getRpeLabel(rpe)}</Text>
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={rpe}
                onValueChange={setRpe}
                minimumTrackTintColor="#0A84FF"
                maximumTrackTintColor="#3A3A3C"
                thumbTintColor="#0A84FF"
              />
              <View style={styles.sliderLimits}>
                <Text style={styles.limitText}>1 - Muy Suave</Text>
                <Text style={styles.limitText}>10 - Máximo</Text>
              </View>
            </View>

            {/* Energy Level Selector (1-5) */}
            <View style={styles.cardSection}>
              <View style={styles.labelRow}>
                <Zap size={18} color="#FFCC00" />
                <Text style={styles.labelTitle}>Nivel de Energía: {energyLevel}/5</Text>
              </View>
              <View style={styles.energyButtonsRow}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.energyBtn,
                      energyLevel === lvl && styles.energyBtnSelected,
                    ]}
                    onPress={() => setEnergyLevel(lvl)}>
                    <Text
                      style={[
                        styles.energyBtnText,
                        energyLevel === lvl && styles.energyBtnTextSelected,
                      ]}>
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Has Pain Switch */}
            <View style={styles.cardSection}>
              <View style={styles.switchSection}>
                <View style={styles.labelRow}>
                  <AlertTriangle size={18} color={hasPain ? '#FF9500' : '#8E8E93'} />
                  <Text style={styles.labelTitle}>¿Sientes dolor o molestia?</Text>
                </View>
                <Switch
                  value={hasPain}
                  onValueChange={setHasPain}
                  trackColor={{ false: '#3A3A3C', true: '#FF9500' }}
                />
              </View>

              {hasPain && (
                <View style={styles.painContainer}>
                  <Text style={styles.subLabel}>Zona de la molestia:</Text>
                  <View style={styles.chipsRow}>
                    {COMMON_PAIN_ZONES.map((zone) => (
                      <TouchableOpacity
                        key={zone}
                        style={[
                          styles.chip,
                          selectedZone === zone && styles.chipSelected,
                        ]}
                        onPress={() => setSelectedZone(zone)}>
                        <Text
                          style={[
                            styles.chipText,
                            selectedZone === zone && styles.chipTextSelected,
                          ]}>
                          {zone}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.subLabel, { marginTop: 10 }]}>
                    Intensidad del dolor: <Text style={styles.boldWarning}>{painLevel}/10</Text>
                  </Text>
                  <Slider
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={painLevel}
                    onValueChange={setPainLevel}
                    minimumTrackTintColor="#FF9500"
                    maximumTrackTintColor="#3A3A3C"
                    thumbTintColor="#FF9500"
                  />
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.cardSection}>
              <Text style={styles.labelTitle}>Notas adicionales</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Escribe sensaciones adicionales, clima, terreno..."
                placeholderTextColor="#636366"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Guardar Check-in</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
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
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 16,
    lineHeight: 18,
  },
  content: {
    gap: 14,
    paddingBottom: 20,
  },
  cardSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  rpeBadge: {
    fontSize: 13,
    color: '#0A84FF',
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  limitText: {
    fontSize: 11,
    color: '#71717A',
  },
  energyButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  energyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
  },
  energyBtnSelected: {
    backgroundColor: '#FFCC00',
  },
  energyBtnText: {
    color: '#E5E5EA',
    fontWeight: '700',
    fontSize: 15,
  },
  energyBtnTextSelected: {
    color: '#000000',
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  painContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  subLabel: {
    fontSize: 13,
    color: '#D4D4D8',
    marginBottom: 8,
  },
  boldWarning: {
    fontWeight: 'bold',
    color: '#FF9500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
  },
  chipSelected: {
    backgroundColor: '#FF9500',
  },
  chipText: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginTop: 8,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#E5E5EA',
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
