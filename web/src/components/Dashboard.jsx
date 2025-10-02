"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Activity, Clock, Filter, AlertTriangle, CheckCircle2, Camera, TrendingUp } from "lucide-react"
import "../assets/style/dashboard.css"
export default function Dashboard() {
  const [sensorData, setSensorData] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [historicalData, setHistoricalData] = useState([])

  useEffect(() => {
    const fetchLastSensorData = async () => {
      try {
        const sensorId = "PIR-001"
        const response = await fetch(`https://alertsecurebe.onrender.com/ultima/${sensorId}`)

        if (!response.ok) {
          throw new Error("La respuesta de la red no fue correcta")
        }

        const data = await response.json()

        if (data.msg === "Sin datos") {
          console.log("No se encontraron datos para este sensor.")
          return
        }

        setSensorData(data)
        setHistoricalData((prev) => [data, ...prev].slice(0, 10))
      } catch (error) {
        console.error("Error al obtener los últimos datos del sensor:", error)
      }
    }

    fetchLastSensorData()
    const intervalId = setInterval(fetchLastSensorData, 10000)
    return () => clearInterval(intervalId)
  }, [])

  const getStatusColor = (valor) => {
    return valor === 1 ? "status-alert" : "status-normal"
  }

  const getStatusText = (valor) => {
    return valor === 1 ? "MOVIMIENTO DETECTADO" : "SIN ACTIVIDAD"
  }

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (seconds) => {
    const date = new Date(seconds * 1000)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const filteredData = historicalData.filter((data) => {
    if (filterStatus === "all") return true
    if (filterStatus === "active") return data.valor === 1
    if (filterStatus === "inactive") return data.valor === 0
    return true
  })

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title-section">
            <div className="header-icon">
              <ShieldAlert className="icon-lg" />
            </div>
            <div>
              <h1 className="header-title">Sistema de Monitoreo</h1>
              <p className="header-subtitle">Panel de Control de Seguridad</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="filter-group">
              <Filter className="icon-sm" />
              <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="active">Solo alertas</option>
                <option value="inactive">Sin actividad</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {sensorData && (
          <div className={`alert-panel ${getStatusColor(sensorData.valor)}`}>
            <div className="alert-panel-header">
              <div className="alert-status-badge">
                {sensorData.valor === 1 ? <AlertTriangle className="icon-md" /> : <CheckCircle2 className="icon-md" />}
                <span>{getStatusText(sensorData.valor)}</span>
              </div>
              <div className="alert-time">
                <Clock className="icon-sm" />
                <span>{formatTime(sensorData.fecha._seconds)}</span>
              </div>
            </div>

            <div className="alert-panel-body">
              <div className="alert-main-info">
                <div className="alert-sensor-id">
                  <Camera className="icon-lg" />
                  <div>
                    <p className="sensor-label">Sensor ID</p>
                    <p className="sensor-value">{sensorData.sensorId}</p>
                  </div>
                </div>

                <div className="alert-divider"></div>

                <div className="alert-details">
                  <div className="detail-item">
                    <span className="detail-label">Estado</span>
                    <span className="detail-value">{sensorData.movimiento}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha</span>
                    <span className="detail-value">{formatDate(sensorData.fecha._seconds)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Valor</span>
                    <span className={`detail-value ${sensorData.valor === 1 ? "value-alert" : "value-normal"}`}>
                      {sensorData.valor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert-panel-footer">
              <div className="status-indicator">
                <div className={`pulse-dot ${sensorData.valor === 1 ? "pulse-alert" : "pulse-normal"}`}></div>
                <span>Sistema activo</span>
              </div>
              <div className="last-update">Última actualización: {formatTime(sensorData.fecha._seconds)}</div>
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <Activity />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Eventos</p>
              <p className="stat-value">{historicalData.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-red">
              <AlertTriangle />
            </div>
            <div className="stat-content">
              <p className="stat-label">Alertas Activas</p>
              <p className="stat-value">{historicalData.filter((d) => d.valor === 1).length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <CheckCircle2 />
            </div>
            <div className="stat-content">
              <p className="stat-label">Estado Normal</p>
              <p className="stat-value">{historicalData.filter((d) => d.valor === 0).length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <p className="stat-label">Sensores Activos</p>
              <p className="stat-value">1</p>
            </div>
          </div>
        </div>

        <div className="history-section">
          <h2 className="section-title">Historial Reciente</h2>
          <div className="history-list">
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => (
                <div key={index} className={`history-item ${getStatusColor(data.valor)}`}>
                  <div className="history-icon">
                    {data.valor === 1 ? <AlertTriangle className="icon-sm" /> : <CheckCircle2 className="icon-sm" />}
                  </div>
                  <div className="history-content">
                    <p className="history-status">{getStatusText(data.valor)}</p>
                    <p className="history-sensor">{data.sensorId}</p>
                  </div>
                  <div className="history-time">
                    <p className="history-date">{formatDate(data.fecha._seconds)}</p>
                    <p className="history-hour">{formatTime(data.fecha._seconds)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Activity className="icon-lg" />
                <p>Esperando datos del sensor...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
