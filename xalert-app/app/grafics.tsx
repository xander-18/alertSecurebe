import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { mockGraficoMensual } from "@/lib/mock-data"
import { BarChart } from "react-native-chart-kit"

type Period = "today" | "week" | "month"

const screenWidth = Dimensions.get("window").width

export default function ChartsScreen() {
  const [period, setPeriod] = useState<Period>("month")

  const totalIntrusiones = mockGraficoMensual.intrusiones.reduce((a, b) => a + b, 0)
  const totalFalsos = mockGraficoMensual.falsos.reduce((a, b) => a + b, 0)
  const totalNormales = mockGraficoMensual.normales.reduce((a, b) => a + b, 0)
  const totalEventos = totalIntrusiones + totalFalsos + totalNormales

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
  }

  const chartData = {
    labels: mockGraficoMensual.labels,
    datasets: [
      {
        data: mockGraficoMensual.intrusiones,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      },
      {
        data: mockGraficoMensual.falsos,
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
      },
      {
        data: mockGraficoMensual.normales,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
    ],
    legend: ["Intrusiones", "Falsos Positivos", "Normales"],
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análisis y Gráficas</Text>
        <Text style={styles.headerSubtitle}>Visualización de datos del sistema</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
              {/* ✅ Cambia BarChart3 por Ionicons */}
              <Ionicons name="bar-chart" size={18} color="#10B981" />
              <Text style={styles.cardTitle}>Eventos por Día</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              {period === "today" && "Eventos de hoy"}
              {period === "week" && "Últimos 7 días"}
              {period === "month" && "Últimos 10 días del mes"}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData}
              width={Math.max(screenWidth - 64, chartData.labels.length * 50)}
              height={300}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              showBarTops={false}
              withInnerLines={true}
              fromZero={true}
              style={styles.chart}
            />
          </ScrollView>
        </View>

        {/* Summary Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconRow}>
              {/* ✅ Cambia TrendingUp por Ionicons */}
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
                  {Math.round(totalEventos / mockGraficoMensual.labels.length)}
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
                  {((totalIntrusiones / totalEventos) * 100).toFixed(1)}%
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
                  {((totalFalsos / totalEventos) * 100).toFixed(1)}%
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
                  {((totalNormales / totalEventos) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.card}>
          <View style={styles.insightContainer}>
            <View style={styles.insightIconCircle}>
              {/* ✅ Cambia TrendingUp por Ionicons */}
              <Ionicons name="trending-up" size={18} color="#10B981" />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Análisis del Sistema</Text>
              <Text style={styles.insightDescription}>
                El sistema ha registrado un{" "}
                {((totalNormales / totalEventos) * 100).toFixed(0)}% de eventos normales
                en el período seleccionado. Se recomienda revisar los sensores con mayor
                cantidad de falsos positivos para optimizar la detección.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#1F2937",
    borderBottomWidth: 1,
    borderColor: "#10B98133",
    padding: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#1F2937",
    borderColor: "#10B98133",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterButtonActive: {
    backgroundColor: "#10B981",
  },
  filterButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#1F2937",
    borderColor: "#10B98133",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  cardHeader: {
    marginBottom: 8,
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  cardBody: {
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  statValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  statHighlight: {
    color: "#10B981",
    fontSize: 28,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#10B9811A",
    marginVertical: 12,
  },
  statLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statRight: {
    alignItems: "flex-end",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statText: {
    color: "#D1D5DB",
    fontSize: 13,
  },
  statNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  statPercent: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  insightContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 8,
  },
  insightIconCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#10B98133",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  insightDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
})