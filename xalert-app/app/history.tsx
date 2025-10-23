// history.tsx
import React, { useState } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from "react-native"
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome5 } from "@expo/vector-icons"
import { mockEventos } from "@/lib/mock-data"

interface Evento {
  id: number
  tipo: string
  sensor: string
  ubicacion: string
  fecha: string
}

export default function HistoryScreen() {
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSensor, setFilterSensor] = useState<string>("all")

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case "Intrusión":
        return <MaterialCommunityIcons name="alert-octagram" size={24} color="#ef4444" />
      case "Falso positivo":
        return <Entypo name="warning" size={24} color="#facc15" />
      default:
        return <Ionicons name="checkmark-circle" size={24} color="#10B981" />
    }
  }

  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case "Intrusión":
        return { backgroundColor: "rgba(239,68,68,0.2)", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }
      case "Falso positivo":
        return { backgroundColor: "rgba(250,204,21,0.2)", color: "#facc15", borderColor: "rgba(250,204,21,0.3)" }
      default:
        return { backgroundColor: "rgba(16,185,129,0.2)", color: "#10B981", borderColor: "rgba(16,185,129,0.3)" }
    }
  }

  const filteredEvents = mockEventos.filter((evento) => {
    const typeMatch = filterType === "all" || evento.tipo === filterType
    const sensorMatch = filterSensor === "all" || evento.sensor === filterSensor
    return typeMatch && sensorMatch
  })

  const uniqueSensors = Array.from(new Set(mockEventos.map((e) => e.sensor)))

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Eventos</Text>
        <Text style={styles.subtitle}>Registro completo de actividad</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Filtros */}
        <View style={styles.filtersHeader}>
          <FontAwesome5 name="filter" size={18} color="#10B981" />
          <Text style={styles.filtersText}>Filtros</Text>
        </View>

        {/* Tipo */}
        <Text style={styles.label}>Tipo de Evento</Text>
        <View style={styles.filterOptions}>
          {["all", "Intrusión", "Falso positivo", "Normal"].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              onPress={() => setFilterType(tipo)}
              style={[
                styles.filterButton,
                filterType === tipo && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === tipo && styles.filterButtonTextActive,
                ]}
              >
                {tipo === "all" ? "Todos" : tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sensor */}
        <Text style={styles.label}>Sensor</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            onPress={() => setFilterSensor("all")}
            style={[
              styles.filterButton,
              filterSensor === "all" && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterSensor === "all" && styles.filterButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          {uniqueSensors.map((sensor) => (
            <TouchableOpacity
              key={sensor}
              onPress={() => setFilterSensor(sensor)}
              style={[
                styles.filterButton,
                filterSensor === sensor && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterSensor === sensor && styles.filterButtonTextActive,
                ]}
              >
                {sensor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteo */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filteredEvents.length} {filteredEvents.length === 1 ? "evento encontrado" : "eventos encontrados"}
          </Text>
          {(filterType !== "all" || filterSensor !== "all") && (
            <TouchableOpacity
              onPress={() => {
                setFilterType("all")
                setFilterSensor("all")
              }}
            >
              <Text style={styles.clearFilters}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de eventos */}
        {filteredEvents.length === 0 ? (
          <View style={styles.noEventsCard}>
            <Ionicons name="calendar-outline" size={40} color="#6b7280" />
            <Text style={styles.noEventsText}>No se encontraron eventos</Text>
            <Text style={styles.noEventsSubText}>Intenta ajustar los filtros</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const colorStyle = getEventColor(item.tipo)
              return (
                <View style={[styles.card, { borderColor: colorStyle.borderColor }]}>
                  <View style={styles.cardRow}>
                    {getEventIcon(item.tipo)}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sensor}>{item.sensor}</Text>
                      <Text style={styles.location}>{item.ubicacion}</Text>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: colorStyle.backgroundColor,
                              borderColor: colorStyle.borderColor,
                            },
                          ]}
                        >
                          <Text style={[styles.badgeText, { color: colorStyle.color }]}>
                            {item.tipo}
                          </Text>
                        </View>
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar" size={14} color="#9ca3af" />
                          <Text style={styles.dateText}>{item.fecha}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            }}
          />
        )}

        {/* Botón Ver más */}
        {filteredEvents.length > 0 && (
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Ver más eventos</Text>
          </TouchableOpacity>
        )}
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
    borderBottomColor: "rgba(16,185,129,0.2)",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
  },
  scroll: {
    padding: 16,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  filtersText: {
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },
  filterButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  filterButtonActive: {
    backgroundColor: "rgba(16,185,129,0.2)",
    borderColor: "#10B981",
  },
  filterButtonText: {
    color: "#d1d5db",
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: "#10B981",
    fontWeight: "600",
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  resultsText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  clearFilters: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
  },
  noEventsCard: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 12,
    marginTop: 10,
  },
  noEventsText: {
    color: "#9ca3af",
    marginTop: 8,
  },
  noEventsSubText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
  },
  sensor: {
    color: "#fff",
    fontWeight: "600",
  },
  location: {
    color: "#9ca3af",
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  loadMoreButton: {
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
    backgroundColor: "#1F2937",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  loadMoreText: {
    color: "#10B981",
    fontWeight: "600",
  },
})