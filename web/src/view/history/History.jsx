"use client"

import { useState, useEffect } from "react"
import { Clock, TrendingUp, AlertTriangle, CheckCircle, Calendar, RefreshCw } from 'lucide-react'
import { fetchAPI, notificationSwal, API_URL_HISTORICO } from "../../common/common"
import "./history.css"

const History = () => {
  const [sensorData, setSensorData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [activeFilter, setActiveFilter] = useState("hoy")
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" })
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [stats, setStats] = useState({ total: 0, alerts: 0, normal: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedSensor, setSelectedSensor] = useState("PIR-001")

  useEffect(() => {
    fetchData()
  }, [selectedSensor])

  useEffect(() => {
    applyFilter()
  }, [activeFilter, sensorData, customDateRange])

 const fetchData = async () => {
    try {
      setLoading(true)
      const data = await fetchAPI(API_URL_HISTORICO + selectedSensor, 'GET')
      
      if (Array.isArray(data)) {
        setSensorData(data)
      } else if (data && data.msg === "Sin datos") {
        setSensorData([])
        notificationSwal('info', 'Sin datos', `No hay mediciones para el sensor ${selectedSensor}`)
      } else if (data && typeof data === "object") {
        setSensorData([data])
      } else {
        setSensorData([])
      }
    } catch (error) {
      console.error("❌ Error al cargar datos:", error)
      setSensorData([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilter = () => {
    const now = new Date()
    let filtered = []

    switch (activeFilter) {
      case "hoy":
        filtered = sensorData.filter((item) => {
          const itemDate = getDateFromItem(item)
          return itemDate.toDateString() === now.toDateString()
        })
        break

      case "ayer":
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        filtered = sensorData.filter((item) => {
          const itemDate = getDateFromItem(item)
          return itemDate.toDateString() === yesterday.toDateString()
        })
        break

      case "semana":
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = sensorData.filter((item) => {
          const itemDate = getDateFromItem(item)
          return itemDate >= weekAgo && itemDate <= now
        })
        break

      case "mes":
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        filtered = sensorData.filter((item) => {
          const itemDate = getDateFromItem(item)
          return itemDate >= monthAgo && itemDate <= now
        })
        break

      case "personalizado":
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start)
          const endDate = new Date(customDateRange.end)
          endDate.setHours(23, 59, 59, 999)
          filtered = sensorData.filter((item) => {
            const itemDate = getDateFromItem(item)
            return itemDate >= startDate && itemDate <= endDate
          })
        } else {
          filtered = sensorData
        }
        break

      default:
        filtered = sensorData
    }

    setFilteredData(filtered)

    const alerts = filtered.filter((item) => item.valor === 1).length
    setStats({
      total: filtered.length,
      alerts: alerts,
      normal: filtered.length - alerts,
    })
  }

  const getDateFromItem = (item) => {
    if (item.fecha?._seconds) {
      return new Date(item.fecha._seconds * 1000)
    }
    if (item.fecha?.seconds) {
      return new Date(item.fecha.seconds * 1000)
    }
    return new Date(item.fecha)
  }

  const getHourlyData = () => {
    const hourly = Array(24).fill(0)
    filteredData.forEach((item) => {
      const date = getDateFromItem(item)
      const hour = date.getHours()
      if (item.valor === 1) {
        hourly[hour]++
      }
    })
    return hourly
  }

  const formatDate = (item) => {
    const date = getDateFromItem(item)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (item) => {
    const date = getDateFromItem(item)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const hourlyData = getHourlyData()
  const maxValue = Math.max(...hourlyData, 1)

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando historial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="header-content">
          <div className="header-icon">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="history-title">Historial de Eventos</h1>
            <p className="history-subtitle">Análisis temporal de detecciones</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="refresh-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            color: '#60a5fa',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.2)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.1)'
            e.target.style.transform = 'scale(1)'
          }}
        >
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeFilter === "hoy" ? "active" : ""}`}
            onClick={() => {
              setActiveFilter("hoy")
              setShowCustomPicker(false)
            }}
          >
            Hoy
          </button>
          <button
            className={`filter-btn ${activeFilter === "ayer" ? "active" : ""}`}
            onClick={() => {
              setActiveFilter("ayer")
              setShowCustomPicker(false)
            }}
          >
            Ayer
          </button>
          <button
            className={`filter-btn ${activeFilter === "semana" ? "active" : ""}`}
            onClick={() => {
              setActiveFilter("semana")
              setShowCustomPicker(false)
            }}
          >
            Esta Semana
          </button>
          <button
            className={`filter-btn ${activeFilter === "mes" ? "active" : ""}`}
            onClick={() => {
              setActiveFilter("mes")
              setShowCustomPicker(false)
            }}
          >
            Este Mes
          </button>
          <button
            className={`filter-btn ${activeFilter === "personalizado" ? "active" : ""}`}
            onClick={() => {
              setActiveFilter("personalizado")
              setShowCustomPicker(!showCustomPicker)
            }}
          >
            <Calendar size={16} />
            Personalizado
          </button>
        </div>

        {showCustomPicker && (
          <div className="custom-date-picker">
            <div className="date-input-group">
              <label>Desde</label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="date-input-group">
              <label>Hasta</label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Eventos</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Alertas</div>
            <div className="stat-value">{stats.alerts}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Estado Normal</div>
            <div className="stat-value">{stats.normal}</div>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h2 className="chart-title">Distribución por Hora</h2>
          <span className="chart-subtitle">Alertas detectadas en el período seleccionado</span>
        </div>
        <div className="chart-container">
          <div className="chart-bars">
            {hourlyData.map((value, index) => (
              <div key={index} className="bar-wrapper">
                <div
                  className="bar"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                  title={`${index}:00 - ${value} alertas`}
                >
                  {value > 0 && <span className="bar-value">{value}</span>}
                </div>
                <span className="bar-label">{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="events-section">
        <div className="events-header">
          <h2 className="events-title">Registro de Eventos</h2>
          <span className="events-count">{filteredData.length} eventos</span>
        </div>
        <div className="events-list">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No hay eventos en este período</p>
              <button 
                onClick={fetchData}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#60a5fa',
                  cursor: 'pointer'
                }}
              >
                Recargar datos
              </button>
            </div>
          ) : (
            filteredData.map((event, index) => (
              <div key={event.id || index} className={`event-item ${event.valor === 1 ? "alert" : "normal"}`}>
                <div className="event-icon">
                  {event.valor === 1 ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                </div>
                <div className="event-content">
                  <div className="event-message">{event.movimiento || "Sin descripción"}</div>
                  <div className="event-meta">
                    <span className="event-sensor">{event.sensorId}</span>
                    <span className="event-separator">•</span>
                    <span className="event-date">{formatDate(event)}</span>
                  </div>
                </div>
                <div className="event-time">{formatTime(event)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default History