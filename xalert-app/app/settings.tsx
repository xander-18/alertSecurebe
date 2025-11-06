import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '@/services/auth-context';

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState(true); 
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('https://alertsecurebe.onrender.com/sensor');
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error('Error fetching sensor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: () => logout(), style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Ajustes del sistema y cuenta</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Profile */}
        <View style={styles.card}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={32} color="#000" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Administrador</Text>
              <Text style={styles.profileEmail}>{user?.email || 'admin@blackrock.com'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </View>
        </View>

        {/* Notifications Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="notifications-outline" size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Notificaciones</Text>
            </View>
            <Text style={styles.cardDescription}>Gestiona las alertas del sistema</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notificaciones Push</Text>
                <Text style={styles.settingDescription}>Recibe alertas en tiempo real</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Alertas Sonoras</Text>
                <Text style={styles.settingDescription}>Sonido para intrusiones</Text>
              </View>
              <Switch
                value={soundAlerts}
                onValueChange={setSoundAlerts}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
        {/* About */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.aboutButton}>
            <View style={styles.menuButtonContent}>
              <Feather name="info" size={20} color="#10B981" />
              <View style={styles.menuButtonInfo}>
                <Text style={styles.menuButtonTitle}>Acerca de</Text>
                <Text style={styles.menuButtonSubtitle}>Versión 1.0.0</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Black Rock S.A.C.</Text>
          <Text style={styles.footerText}>Todos los derechos reservados</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#10B981',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuButtonInfo: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  menuButtonSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 16,
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
});