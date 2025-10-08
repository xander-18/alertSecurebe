
import { useState } from "react"
import "./sensores.css"
const Sensores = () => {
  const [sensors, setSensors] = useState([
    {
      id: "PIR-001",
      name: "Sensor Entrada Principal",
      type: "PIR",
      location: "Entrada Principal",
      status: "active",
      lastActivity: "2025-10-03 11:32:42",
    },
    {
      id: "PIR-002",
      name: "Sensor Pasillo",
      type: "PIR",
      location: "Pasillo Central",
      status: "inactive",
      lastActivity: "2025-10-02 08:15:30",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSensor, setEditingSensor] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "PIR",
    location: "",
    status: "active",
  })

  const activeSensors = sensors.filter((s) => s.status === "active").length
  const inactiveSensors = sensors.filter((s) => s.status === "inactive").length

  const handleOpenDialog = (sensor = null) => {
    if (sensor) {
      setEditingSensor(sensor)
      setFormData(sensor)
    } else {
      setEditingSensor(null)
      setFormData({
        id: "",
        name: "",
        type: "PIR",
        location: "",
        status: "active",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSensor(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingSensor) {
      setSensors((prev) =>
        prev.map((s) =>
          s.id === editingSensor.id
            ? { ...formData, lastActivity: new Date().toISOString().slice(0, 19).replace("T", " ") }
            : s,
        ),
      )
    } else {
      setSensors((prev) => [
        ...prev,
        {
          ...formData,
          lastActivity: new Date().toISOString().slice(0, 19).replace("T", " "),
        },
      ])
    }

    handleCloseDialog()
  }

  const handleDelete = (sensorId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este sensor?")) {
      setSensors((prev) => prev.filter((s) => s.id !== sensorId))
    }
  }

  return (
    <div className="sensors-container">
      <div className="sensors-header">
        <div>
          <h1 className="sensors-title">Gestión de Sensores</h1>
          <p className="sensors-subtitle">Administra todos los sensores del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenDialog()}>
          + Nuevo Sensor
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Sensores</p>
            <p className="stat-value">{sensors.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Sensores Activos</p>
            <p className="stat-value">{activeSensors}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Sensores Inactivos</p>
            <p className="stat-value">{inactiveSensors}</p>
          </div>
        </div>
      </div>

      <div className="sensors-table-card">
        <h2 className="table-title">Lista de Sensores</h2>
        <div className="table-container">
          <table className="sensors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Última Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td className="sensor-id">{sensor.id}</td>
                  <td>{sensor.name}</td>
                  <td>
                    <span className="sensor-type-badge">{sensor.type}</span>
                  </td>
                  <td>{sensor.location}</td>
                  <td>
                    <span
                      className={`status-badge ${sensor.status === "active" ? "status-active" : "status-inactive"}`}
                    >
                      {sensor.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="last-activity">{sensor.lastActivity}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleOpenDialog(sensor)} title="Editar">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(sensor.id)} title="Eliminar">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>{editingSensor ? "Editar Sensor" : "Nuevo Sensor"}</h2>
              <button className="dialog-close" onClick={handleCloseDialog}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="id">ID del Sensor</label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="PIR-003"
                  required
                  disabled={editingSensor !== null}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Sensor Jardín Trasero"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Tipo</label>
                <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="form-input">
                  <option value="PIR">PIR</option>
                  <option value="Ultrasónico">Ultrasónico</option>
                  <option value="Magnético">Magnético</option>
                  <option value="Infrarrojo">Infrarrojo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Jardín Trasero"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div className="dialog-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseDialog}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingSensor ? "Guardar Cambios" : "Crear Sensor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sensores
