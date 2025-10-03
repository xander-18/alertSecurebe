"use client"

import { useState, useEffect } from "react"
import "./history.css"

const History = () => {
  const [sensorData, setSensorData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [activeFilter, setActiveFilter] = useState("hoy")
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" })
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [stats, setStats] = useState({ total: 0, alerts: 0, normal: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [activeFilter, sensorData, customDateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://alertsecurebe.onrender.com/historico/PIR-001")

      if (!response.ok) {
        throw new Error("Error al cargar datos")
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setSensorData(data)
      } else if (data && typeof data === "object") {
        setSensorData([data])
      } else {
        setSensorData([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="history-title">Historial de Eventos</h1>
            <p className="history-subtitle">Análisis temporal de detecciones</p>
          </div>
        </div>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Eventos</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Alertas</div>
            <div className="stat-value">{stats.alerts}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            </div>
          ) : (
            filteredData.map((event, index) => (
              <div key={index} className={`event-item ${event.valor === 1 ? "alert" : "normal"}`}>
                <div className="event-icon">
                  {event.valor === 1 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="event-content">
                  <div className="event-message">{event.movimiento}</div>
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
