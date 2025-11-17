import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from './AlertProvider';
import { useRouter } from 'expo-router';

export const AlertNotification: React.FC = () => {
  const { currentAlert, showAlert, dismissAlert } = useAlerts();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  console.log('🔔 AlertNotification RENDERIZADO');
  console.log('   - currentAlert existe:', !!currentAlert);
  console.log('   - showAlert:', showAlert);

  useEffect(() => {
    console.log('🔔 AlertNotification - Estado actual:');
    console.log('   - Alerta actual:', currentAlert?.id || 'ninguna');
    console.log('   - Mostrar:', showAlert);

    if (showAlert && currentAlert) {
      console.log('✨ Iniciando animación de entrada');
      
      // Animación de escala para la entrada
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start(() => {
        console.log('✅ Animación de entrada completada');
      });

      // Animación de pulso continuo
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Resetear animaciones cuando se oculta
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [showAlert, currentAlert]);

  const handleDismiss = () => {
    console.log('❌ Usuario cerró el modal');
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      dismissAlert();
    });
  };

  const handleViewHistory = () => {
    console.log('👆 Usuario navegó al historial');
    handleDismiss();
    router.push('/history');
  };

  if (!showAlert || !currentAlert) {
    return null;
  }

  console.log('🎨 Renderizando modal de alerta:', currentAlert.id);

  const formatTime = (fecha: any) => {
    const date = fecha?.toDate ? fecha.toDate() : new Date(fecha._seconds * 1000);
    return date.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (fecha: any) => {
    const date = fecha?.toDate ? fecha.toDate() : new Date(fecha._seconds * 1000);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Modal
      visible={showAlert}
      transparent={true}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Botón cerrar */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Icono con pulso */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.iconPulse} />
            <Ionicons name="warning" size={48} color="#EF4444" />
          </Animated.View>

          {/* Título */}
          <Text style={styles.title}>¡ALERTA DE SEGURIDAD!</Text>
          <Text style={styles.subtitle}>Movimiento Detectado</Text>

          {/* Mensaje */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{currentAlert.movimiento}</Text>
          </View>

          {/* Detalles */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="camera" size={20} color="#10B981" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Sensor</Text>
                <Text style={styles.detailValue}>
                  {currentAlert.sensorName || currentAlert.sensorId}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time" size={20} color="#10B981" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Hora</Text>
                <Text style={styles.detailValue}>{formatTime(currentAlert.fecha)}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color="#10B981" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{formatDate(currentAlert.fecha)}</Text>
              </View>
            </View>

            {currentAlert.sensorLocation && (
              <View style={styles.detailItem}>
                <Ionicons name="location" size={20} color="#10B981" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Ubicación</Text>
                  <Text style={styles.detailValue}>{currentAlert.sensorLocation}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleViewHistory}
            >
              <Ionicons name="list" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Ver Historial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleDismiss}
            >
              <Text style={styles.buttonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  iconPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    top: -16,
    left: -16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
  },
  messageContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: '#EF4444',
  },
  buttonSecondary: {
    backgroundColor: '#374151',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});