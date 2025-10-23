import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { mockUltimaMedicion, mockEventos } from "@/lib/mock-data";

export default function HomeScreen(): React.JSX.Element {
  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case "Intrusión":
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
        return { backgroundColor: "rgba(239,68,68,0.2)", color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" };
      case "Falso positivo":
        return { backgroundColor: "rgba(250,204,21,0.2)", color: "#FACC15", borderColor: "rgba(250,204,21,0.3)" };
      default:
        return { backgroundColor: "rgba(16,185,129,0.2)", color: "#10B981", borderColor: "rgba(16,185,129,0.3)" };
    }
  };

  const recentEvents = mockEventos.slice(0, 3);

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
            <Text style={styles.notificationText}>3</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Última Medición */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield" size={18} color="#10B981" />
            <Text style={styles.cardTitle}>Última Medición</Text>
          </View>
          <Text style={styles.cardDescription}>Estado actual del sistema</Text>

          <View style={styles.sensorRow}>
            <View>
              <Text style={styles.sensorLabel}>Sensor Activo</Text>
              <Text style={styles.sensorName}>{mockUltimaMedicion.sensor}</Text>
            </View>
            {getEventIcon(mockUltimaMedicion.tipo)}
          </View>

          <View style={styles.grid}>
            <View>
              <Text style={styles.gridLabel}>Ubicación</Text>
              <Text style={styles.gridValue}>{mockUltimaMedicion.ubicacion}</Text>
            </View>
            <View>
              <Text style={styles.gridLabel}>Estado</Text>
              <View style={[styles.badge, getEventColor(mockUltimaMedicion.tipo)]}>
                <Text style={[styles.badgeText, { color: getEventColor(mockUltimaMedicion.tipo).color }]}>
                  {mockUltimaMedicion.tipo}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.footerLabel}>Última detección</Text>
          <Text style={styles.footerValue}>{mockUltimaMedicion.timestamp}</Text>
        </View>

        {/* Eventos recientes */}
        <Text style={styles.sectionTitle}>Eventos Recientes</Text>
        {recentEvents.map((evento) => (
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
                      {evento.tipo}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventDate}>{evento.fecha}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Estadísticas rápidas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderColor: "rgba(16,185,129,0.2)" }]}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>6</Text>
            <Text style={styles.statLabel}>Sensores Activos</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "rgba(239,68,68,0.2)" }]}>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>2</Text>
            <Text style={styles.statLabel}>Intrusiones</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "rgba(250,204,21,0.2)" }]}>
            <Text style={[styles.statValue, { color: "#FACC15" }]}>3</Text>
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
    backgroundColor: "black",
  },
  header: {
    backgroundColor: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16,185,129,0.2)",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#10B981",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bellContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 6,
  },
  cardDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  sensorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  sensorLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  sensorName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  gridLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  gridValue: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(16,185,129,0.1)",
    marginTop: 12,
    marginBottom: 8,
  },
  footerLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  footerValue: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: "row",
    gap: 10,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventName: {
    color: "white",
    fontWeight: "600",
  },
  eventLocation: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  eventDate: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});