import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { api, Sensor, Medicion } from "@/services/api";

export default function HomeScreen(): React.JSX.Element {
  const [ultimaMedicion, setUltimaMedicion] = useState<any>(null);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // Cargar sensores
      const sensoresData = await api.getSensores();
      setSensores(sensoresData);

      // Cargar todas las mediciones
      const medicionesData = await api.getMediciones();
      setMediciones(medicionesData);

      // Obtener la última medición general (primera del array porque viene ordenada desc)
      if (medicionesData.length > 0) {
        const ultimaGeneral = medicionesData[0];
        // Buscar el sensor correspondiente
        const sensor = sensoresData.find((s: Sensor) => s.id === ultimaGeneral.sensorId);
        
        setUltimaMedicion({
          sensor: sensor?.name || "Sensor desconocido",
          ubicacion: sensor?.location || "Sin ubicación",
          tipo: ultimaGeneral.movimiento || "Normal",
          timestamp: formatFecha(ultimaGeneral.fecha),
          valor: ultimaGeneral.valor
        });
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatFecha = (fecha: any) => {
    if (!fecha) return "Sin fecha";
    
    // Si es un Timestamp de Firestore
    if (fecha._seconds) {
      const date = new Date(fecha._seconds * 1000);
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    // Si es un objeto Date
    if (fecha.toDate) {
      return fecha.toDate().toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    // Si es un string
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case "Intrusión":
      case "se ha detectado un movimiento inusual":
        return <MaterialCommunityIcons name="alert-circle" size={32} color="#EF4444" />;
      case "Falso positivo":
        return <Ionicons name="warning" size={32} color="#FACC15" />;
      default:
        return <Ionicons name="checkmark-circle" size={32} color="#10B981" />;
    }
  };

  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case "Intrusión":
      case "se ha detectado un movimiento inusual":
        return { backgroundColor: "rgba(239,68,68,0.2)", color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" };
      case "Falso positivo":
        return { backgroundColor: "rgba(250,204,21,0.2)", color: "#FACC15", borderColor: "rgba(250,204,21,0.3)" };
      default:
        return { backgroundColor: "rgba(16,185,129,0.2)", color: "#10B981", borderColor: "rgba(16,185,129,0.3)" };
    }
  };

  const getTipoDisplay = (tipo: string) => {
    if (tipo === "se ha detectado un movimiento inusual") return "Intrusión";
    return tipo;
  };

  // Calcular estadísticas
  const sensoresActivos = sensores.filter(s => s.status === "active").length;
  const intrusiones = mediciones.filter(m => 
    m.movimiento === "Intrusión" || m.movimiento === "se ha detectado un movimiento inusual"
  ).length;
  const falsosPositivos = mediciones.filter(m => m.movimiento === "Falso positivo").length;

  // Eventos recientes (últimas 3 mediciones)
  const eventosRecientes = mediciones.slice(0, 3).map(medicion => {
    const sensor = sensores.find(s => s.id === medicion.sensorId);
    return {
      id: medicion.id,
      sensor: sensor?.name || "Sensor desconocido",
      ubicacion: sensor?.location || "Sin ubicación",
      tipo: medicion.movimiento || "Normal",
      fecha: formatFecha(medicion.fecha)
    };
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: '#9ca3af', marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield" size={24} color="black" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Monitoreo IoT</Text>
            <Text style={styles.headerSubtitle}>Black Rock S.A.C.</Text>
          </View>
        </View>
        <View style={styles.bellContainer}>
          <Ionicons name="notifications" size={24} color="#10B981" />
          <View style={styles.notificationDot}>
            <Text style={styles.notificationText}>{intrusiones}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
        }
      >
        {/* Última Medición */}
        {ultimaMedicion && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield" size={18} color="#10B981" />
              <Text style={styles.cardTitle}>Última Medición</Text>
            </View>
            <Text style={styles.cardDescription}>Estado actual del sistema</Text>

            <View style={styles.sensorRow}>
              <View>
                <Text style={styles.sensorLabel}>Sensor Activo</Text>
                <Text style={styles.sensorName}>{ultimaMedicion.sensor}</Text>
              </View>
              {getEventIcon(ultimaMedicion.tipo)}
            </View>

            <View style={styles.grid}>
              <View>
                <Text style={styles.gridLabel}>Ubicación</Text>
                <Text style={styles.gridValue}>{ultimaMedicion.ubicacion}</Text>
              </View>
              <View>
                <Text style={styles.gridLabel}>Estado</Text>
                <View style={[styles.badge, getEventColor(ultimaMedicion.tipo)]}>
                  <Text style={[styles.badgeText, { color: getEventColor(ultimaMedicion.tipo).color }]}>
                    {getTipoDisplay(ultimaMedicion.tipo)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.footerLabel}>Última detección</Text>
            <Text style={styles.footerValue}>{ultimaMedicion.timestamp}</Text>
          </View>
        )}

        {/* Eventos recientes */}
        <Text style={styles.sectionTitle}>Eventos Recientes</Text>
        {eventosRecientes.length === 0 ? (
          <View style={styles.card}>
            <Text style={{ color: '#9ca3af', textAlign: 'center' }}>No hay eventos recientes</Text>
          </View>
        ) : (
          eventosRecientes.map((evento) => (
            <View key={evento.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <View style={{ marginTop: 4 }}>{getEventIcon(evento.tipo)}</View>
                <View style={{ flex: 1 }}>
                  <View style={styles.eventHeader}>
                    <View>
                      <Text style={styles.eventName}>{evento.sensor}</Text>
                      <Text style={styles.eventLocation}>{evento.ubicacion}</Text>
                    </View>
                    <View style={[styles.badge, getEventColor(evento.tipo)]}>
                      <Text style={[styles.badgeText, { color: getEventColor(evento.tipo).color }]}>
                        {getTipoDisplay(evento.tipo)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.eventDate}>{evento.fecha}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Estadísticas rápidas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderColor: "rgba(16,185,129,0.2)" }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>{sensoresActivos}</Text>
            <Text style={styles.statLabel}>Sensores Activos</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "rgba(239,68,68,0.2)" }]}>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>{intrusiones}</Text>
            <Text style={styles.statLabel}>Intrusiones</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "rgba(250,204,21,0.2)" }]}>
            <Text style={[styles.statValue, { color: "#FACC15" }]}>{falsosPositivos}</Text>
            <Text style={styles.statLabel}>Falsos Positivos</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#0a0f1e",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  bellContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cardDescription: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 20,
  },
  sensorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sensorLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  sensorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  grid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  gridLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.1)",
    marginBottom: 16,
  },
  footerLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  eventRow: {
    flexDirection: "row",
    gap: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: "#9ca3af",
  },
  eventDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});