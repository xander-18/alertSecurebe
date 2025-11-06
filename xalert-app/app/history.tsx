"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Ionicons, MaterialCommunityIcons, Entypo, FontAwesome5 } from "@expo/vector-icons"
import { api, type Sensor, type Medicion } from "@/services/api"

interface EventoFormateado {
  id: string
  tipo: string
  sensor: string
  ubicacion: string
  fecha: string
}

export default function HistoryScreen() {
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSensor, setFilterSensor] = useState<string>("all")
  const [mediciones, setMediciones] = useState<Medicion[]>([])
  const [sensores, setSensores] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [eventosFormateados, setEventosFormateados] = useState<EventoFormateado[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventoFormateado[]>([])
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showSensorDropdown, setShowSensorDropdown] = useState(false)

  const getTipoDisplay = (tipo: string) => {
    if (tipo === "se ha detectado un movimiento inusual") return "Intrusión"
    if (!tipo) return "Normal"
    return tipo
  }

  const getEventColor = (tipo: string) => {
    if (tipo === "se ha detectado un movimiento inusual")
      return { backgroundColor: "#ff0000", borderColor: "#ff0000", color: "white" }
    if (tipo === "Falso positivo") return { backgroundColor: "#ffff00", borderColor: "#ffff00", color: "black" }
    return { backgroundColor: "#00ff00", borderColor: "#00ff00", color: "white" }
  }

  const getEventIcon = (tipo: string) => {
    if (tipo === "se ha detectado un movimiento inusual")
      return <MaterialCommunityIcons name="alert" size={24} color="#ff0000" />
    if (tipo === "Falso positivo") return <Entypo name="warning" size={24} color="#ffff00" />
    return <Ionicons name="checkmark" size={24} color="#00ff00" />
  }

  const formatearFecha = (fecha: any) => {
    try {
      let date;
      if (fecha?.toDate) {
        date = fecha.toDate();
      } else if (fecha?._seconds) {
        date = new Date(fecha._seconds * 1000);
      } else {
        date = new Date(fecha);
      }
      
      return date.toLocaleString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha no disponible";
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const fetchData = async () => {
    try {
      // Obtener mediciones y sensores del backend
      const [medicionesData, sensoresData] = await Promise.all([
        api.getMediciones(),
        api.getSensores()
      ]);
      
      setMediciones(medicionesData)
      setSensores(sensoresData)
      
      // Formatear eventos en el frontend
      const eventos = medicionesData.map((medicion: Medicion) => {
        const sensor = sensoresData.find((s: Sensor) => s.id === medicion.sensorId);
        
        return {
          id: medicion.id,
          tipo: medicion.movimiento || "",
          sensor: sensor?.name || "Sensor desconocido",
          ubicacion: sensor?.location || "Ubicación desconocida",
          fecha: formatearFecha(medicion.fecha),
        };
      });
      
      setEventosFormateados(eventos)
      setFilteredEvents(eventos)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let newFilteredEvents = eventosFormateados
    if (filterType !== "all") {
      newFilteredEvents = newFilteredEvents.filter((event) => getTipoDisplay(event.tipo) === filterType)
    }
    if (filterSensor !== "all") {
      newFilteredEvents = newFilteredEvents.filter((event) => event.sensor === filterSensor)
    }
    setFilteredEvents(newFilteredEvents)
  }, [filterType, filterSensor, eventosFormateados])

  const uniqueSensors = Array.from(new Set(eventosFormateados.map((e) => e.sensor)))

  const eventTypes = [
    { label: "Todos", value: "all" },
    { label: "Intrusión", value: "Intrusión" },
    { label: "Falso positivo", value: "Falso positivo" },
    { label: "Normal", value: "Normal" },
  ]

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ color: "#9ca3af", marginTop: 10 }}>Cargando historial...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Eventos</Text>
        <Text style={styles.subtitle}>Registro completo de actividad</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />}
      >
        {/* Filtros */}
        <View style={styles.filtersHeader}>
          <FontAwesome5 name="filter" size={18} color="#10B981" />
          <Text style={styles.filtersText}>Filtros</Text>
        </View>

        <View style={styles.filtersRow}>
          {/* Tipo de Evento */}
          <View style={styles.filterContainer}>
            <Text style={styles.label}>Tipo de Evento</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowTypeDropdown(!showTypeDropdown)
                setShowSensorDropdown(false)
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {eventTypes.find((t) => t.value === filterType)?.label || "Todos"}
              </Text>
              <Ionicons
                name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {showTypeDropdown && (
              <View style={styles.dropdownList}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.dropdownItem,
                      filterType === type.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setFilterType(type.value)
                      setShowTypeDropdown(false)
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        filterType === type.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                    {filterType === type.value && (
                      <Ionicons name="checkmark" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Sensor */}
          <View style={styles.filterContainer}>
            <Text style={styles.label}>Sensor</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setShowSensorDropdown(!showSensorDropdown)
                setShowTypeDropdown(false)
              }}
            >
              <Text style={styles.dropdownButtonText}>
                {filterSensor === "all" ? "Todos" : filterSensor}
              </Text>
              <Ionicons
                name={showSensorDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
            {showSensorDropdown && (
              <View style={styles.dropdownList}>
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    filterSensor === "all" && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setFilterSensor("all")
                    setShowSensorDropdown(false)
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      filterSensor === "all" && styles.dropdownItemTextSelected,
                    ]}
                  >
                    Todos
                  </Text>
                  {filterSensor === "all" && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
                {uniqueSensors.map((sensor) => (
                  <TouchableOpacity
                    key={sensor}
                    style={[
                      styles.dropdownItem,
                      filterSensor === sensor && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setFilterSensor(sensor)
                      setShowSensorDropdown(false)
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        filterSensor === sensor && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {sensor}
                    </Text>
                    {filterSensor === sensor && (
                      <Ionicons name="checkmark" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const tipoDisplay = getTipoDisplay(item.tipo)
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
                          <Text style={[styles.badgeText, { color: colorStyle.color }]}>{tipoDisplay}</Text>
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
      </ScrollView>
    </View>
  )
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filtersText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  filterContainer: {
    flex: 1,
    position: "relative",
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownButtonText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  dropdownList: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.1)",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  dropdownItemText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  dropdownItemTextSelected: {
    color: "#10B981",
    fontWeight: "600",
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  clearFilters: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  noEventsCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  noEventsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginTop: 12,
  },
  noEventsSubText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  sensor: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
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
    fontSize: 12,
    color: "#9ca3af",
  },
})