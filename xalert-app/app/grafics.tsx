import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, Medicion } from "@/services/api";
import { BarChart } from "react-native-chart-kit";

type Period = "today" | "week" | "month";

const screenWidth = Dimensions.get("window").width;

export default function ChartsScreen() {
  const [period, setPeriod] = useState<Period>("month");
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getMediciones();
      setMediciones(data);
    } catch (error) {
      console.error("Error cargando mediciones:", error);
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

  // Filtrar mediciones según el período
  const getFilteredMediciones = () => {
    const now = new Date();
    const filtered = mediciones.filter((m) => {
      let fecha: Date;
      
      if (m.fecha._seconds) {
        fecha = new Date(m.fecha._seconds * 1000);
      } else if (m.fecha.toDate) {
        fecha = m.fecha.toDate();
      } else {
        fecha = new Date(m.fecha);
      }

      const diffTime = now.getTime() - fecha.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      switch (period) {
        case "today":
          return diffDays < 1;
        case "week":
          return diffDays < 7;
        case "month":
          return diffDays < 30;
        default:
          return true;
      }
    });

    return filtered;
  };

  // Normalizar tipo de evento
  const normalizarTipo = (tipo: string): "Intrusión" | "Falso positivo" | "Normal" => {
    if (!tipo) return "Normal";
    if (tipo === "se ha detectado un movimiento inusual" || tipo === "Intrusión") return "Intrusión";
    if (tipo === "Falso positivo") return "Falso positivo";
    return "Normal";
  };

  // Agrupar mediciones por día
  const agruparPorDia = () => {
    const filteredMediciones = getFilteredMediciones();
    const grupos: { [key: string]: { intrusiones: number; falsos: number; normales: number } } = {};

    filteredMediciones.forEach((m) => {
      let fecha: Date;
      
      if (m.fecha._seconds) {
        fecha = new Date(m.fecha._seconds * 1000);
      } else if (m.fecha.toDate) {
        fecha = m.fecha.toDate();
      } else {
        fecha = new Date(m.fecha);
      }

      const dia = fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });

      if (!grupos[dia]) {
        grupos[dia] = { intrusiones: 0, falsos: 0, normales: 0 };
      }

      const tipoNormalizado = normalizarTipo(m.movimiento);
      if (tipoNormalizado === "Intrusión") grupos[dia].intrusiones++;
      else if (tipoNormalizado === "Falso positivo") grupos[dia].falsos++;
      else grupos[dia].normales++;
    });

    // Ordenar por fecha y tomar últimos días según período
    const sortedDias = Object.keys(grupos).sort((a, b) => {
      const [dayA, monthA] = a.split('/').map(Number);
      const [dayB, monthB] = b.split('/').map(Number);
      return monthA === monthB ? dayA - dayB : monthA - monthB;
    });

    const limit = period === "today" ? 1 : period === "week" ? 7 : 10;
    const ultimosDias = sortedDias.slice(-limit);

    return {
      labels: ultimosDias,
      intrusiones: ultimosDias.map(dia => grupos[dia].intrusiones),
      falsos: ultimosDias.map(dia => grupos[dia].falsos),
      normales: ultimosDias.map(dia => grupos[dia].normales),
    };
  };

  const datosGrafico = agruparPorDia();

  // Calcular totales
  const totalIntrusiones = datosGrafico.intrusiones.reduce((a, b) => a + b, 0);
  const totalFalsos = datosGrafico.falsos.reduce((a, b) => a + b, 0);
  const totalNormales = datosGrafico.normales.reduce((a, b) => a + b, 0);
  const totalEventos = totalIntrusiones + totalFalsos + totalNormales;

  const chartConfig = {
    backgroundColor: "#1F2937",
    backgroundGradientFrom: "#1F2937",
    backgroundGradientTo: "#1F2937",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 8,
    },
    propsForBackgroundLines: {
      strokeDasharray: "3 3",
      stroke: "#374151",
    },
  };

  const chartData = {
    labels: datosGrafico.labels.length > 0 ? datosGrafico.labels : ["Sin datos"],
    datasets: [
      {
        data: datosGrafico.intrusiones.length > 0 ? datosGrafico.intrusiones : [0],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      },
      {
        data: datosGrafico.falsos.length > 0 ? datosGrafico.falsos : [0],
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
      },
      {
        data: datosGrafico.normales.length > 0 ? datosGrafico.normales : [0],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
    ],
    legend: ["Intrusiones", "Falsos Positivos", "Normales"],
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: '#9ca3af', marginTop: 10 }}>Cargando gráficas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análisis y Gráficas</Text>
        <Text style={styles.headerSubtitle}>Visualización de datos del sistema</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
        }
      >
        {/* Period Selector */}
        <View style={styles.filterRow}>
          {(["today", "week", "month"] as Period[]).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setPeriod(value)}
              style={[styles.filterButton, period === value && styles.filterButtonActive]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  period === value && styles.filterButtonTextActive,
                ]}
              >
                {value === "today" ? "Hoy" : value === "week" ? "Semana" : "Mes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconRow}>
              <Ionicons name="bar-chart" size={18} color="#10B981" />
              <Text style={styles.cardTitle}>Eventos por Día</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              {period === "today" && "Eventos de hoy"}
              {period === "week" && "Últimos 7 días"}
              {period === "month" && "Últimos 10 días"}
            </Text>
          </View>
          {totalEventos === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="stats-chart-outline" size={48} color="#6b7280" />
              <Text style={{ color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
                No hay datos para el período seleccionado
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={chartData}
                width={Math.max(screenWidth - 64, chartData.labels.length * 60)}
                height={300}
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                showBarTops={false}
                withInnerLines={true}
                fromZero={true}
                style={styles.chart}
              />
            </ScrollView>
          )}
        </View>

        {/* Summary Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconRow}>
              <Ionicons name="trending-up" size={18} color="#10B981" />
              <Text style={styles.cardTitle}>Resumen del Período</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Total de Eventos</Text>
                <Text style={styles.statValue}>{totalEventos}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Promedio Diario</Text>
                <Text style={styles.statHighlight}>
                  {datosGrafico.labels.length > 0 
                    ? Math.round(totalEventos / datosGrafico.labels.length)
                    : 0
                  }
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Intrusiones */}
            <View style={styles.statLine}>
              <View style={styles.statLeft}>
                <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
                <Text style={styles.statText}>Intrusiones</Text>
              </View>
              <View style={styles.statRight}>
                <Text style={styles.statNumber}>{totalIntrusiones}</Text>
                <Text style={styles.statPercent}>
                  {totalEventos > 0 ? ((totalIntrusiones / totalEventos) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            </View>

            {/* Falsos Positivos */}
            <View style={styles.statLine}>
              <View style={styles.statLeft}>
                <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.statText}>Falsos Positivos</Text>
              </View>
              <View style={styles.statRight}>
                <Text style={styles.statNumber}>{totalFalsos}</Text>
                <Text style={styles.statPercent}>
                  {totalEventos > 0 ? ((totalFalsos / totalEventos) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            </View>

            {/* Normales */}
            <View style={styles.statLine}>
              <View style={styles.statLeft}>
                <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
                <Text style={styles.statText}>Eventos Normales</Text>
              </View>
              <View style={styles.statRight}>
                <Text style={styles.statNumber}>{totalNormales}</Text>
                <Text style={styles.statPercent}>
                  {totalEventos > 0 ? ((totalNormales / totalEventos) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.card}>
          <View style={styles.insightContainer}>
            <View style={styles.insightIconCircle}>
              <Ionicons name="trending-up" size={18} color="#10B981" />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Análisis del Sistema</Text>
              <Text style={styles.insightDescription}>
                {totalEventos === 0 
                  ? "No hay eventos registrados en el período seleccionado."
                  : `El sistema ha registrado un ${totalEventos > 0 ? ((totalNormales / totalEventos) * 100).toFixed(0) : 0}% de eventos normales en el período seleccionado. ${totalFalsos > totalIntrusiones ? "Se recomienda revisar los sensores con mayor cantidad de falsos positivos para optimizar la detección." : "El sistema está funcionando correctamente."}`
                }
              </Text>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#0a0f1e",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "rgba(16,185,129,0.2)",
    borderColor: "#10B981",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  filterButtonTextActive: {
    color: "#10B981",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  cardHeader: {
    marginBottom: 16,
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  chart: {
    borderRadius: 8,
    paddingRight: 0,
  },
  cardBody: {
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statBlock: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
  },
  statHighlight: {
    fontSize: 32,
    fontWeight: "700",
    color: "#10B981",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148,163,184,0.1)",
  },
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statText: {
    fontSize: 14,
    color: "#d1d5db",
  },
  statRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statPercent: {
    fontSize: 14,
    color: "#9ca3af",
    minWidth: 50,
    textAlign: "right",
  },
  insightContainer: {
    flexDirection: "row",
    gap: 16,
  },
  insightIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16,185,129,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
  },
});