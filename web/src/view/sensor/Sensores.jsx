import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, RefreshCw, X, Activity } from 'lucide-react'
import { fetchAPI, notificationSwal, confirmSwal, API_URL_SENSORES, API_URL_STORE_SENSOR } from "../../common/common"
import "./sensores.css"

const Sensores = () => {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSensor, setEditingSensor] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "PIR",
    location: "",
    status: "active",
  })

  useEffect(() => {
    fetchSensors()
  }, [])

  const fetchSensors = async () => {
    try {
      setLoading(true)
      const data = await fetchAPI(API_URL_SENSORES, 'GET')
      setSensors(data || [])
    } catch (error) {
      console.error("Error:", error)
      setSensors([])
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const sensorData = {
        ...formData,
        lastActivity: new Date().toISOString().slice(0, 19).replace("T", " "),
      }

      const result = await fetchAPI(API_URL_STORE_SENSOR, 'POST', sensorData)
      
      if (result.status === "ok") {
        notificationSwal(
          'success', 
          editingSensor ? 'Sensor actualizado correctamente' : 'Sensor creado correctamente'
        )
        handleCloseDialog()
        fetchSensors()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

 const handleDelete = async (sensorId) => {
  confirmSwal(
    "¿Estás seguro?",
    "Esta acción eliminará el sensor del sistema.",
    async () => {

      try {
        // 🔥 1. Eliminar en BACKEND
        const res = await fetch(`${API_URL_SENSORES}/${sensorId}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          notificationSwal("error", data.error || "Error al eliminar sensor");
          return;
        }

        // 🧹 2. Eliminar LOCALMENTE
        setSensors((prev) => prev.filter((s) => s.id !== sensorId));

        notificationSwal("success", "Sensor eliminado correctamente");

      } catch (error) {
        notificationSwal("error", "No se pudo eliminar el sensor");
        console.error(error);
      }

    }
  );
};

  if (loading) {
    return (
      <div className="sensors-container">
        <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
          <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
          <p>Cargando sensores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sensors-container">
      <div className="sensors-header">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="sensors-title">Gestión de Sensores</h1>
            <p className="sensors-subtitle">Administra todos los sensores del sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="btn-primary" 
            onClick={() => handleOpenDialog()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            Nuevo Sensor
          </button>
          <button 
            className="btn-secondary" 
            onClick={fetchSensors}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(71, 85, 105, 0.8)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(51, 65, 85, 0.8)'}
          >
          </button>
        </div>
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
              {sensors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    No hay sensores registrados
                  </td>
                </tr>
              ) : (
                sensors
                  .filter((sensor) => sensor.id && sensor.name)
                  .map((sensor) => (
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
                      <td className="last-activity">{sensor.lastActivity || "N/A"}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleOpenDialog(sensor)} 
                            title="Editar"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDelete(sensor.id)} 
                            title="Eliminar"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  padding: '0.5rem', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '0.5rem'
                }}>
                  {editingSensor ? <Edit2 size={20} color="white" /> : <Plus size={20} color="white" />}
                </div>
                <h2>{editingSensor ? "Editar Sensor" : "Nuevo Sensor"}</h2>
              </div>
              <button className="dialog-close" onClick={handleCloseDialog}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="id">ID del Sensor *</label>
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
                  <label htmlFor="name">Nombre *</label>
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
                  <label htmlFor="type">Tipo *</label>
                  <select 
                    id="type" 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange} 
                    className="form-input"
                  >
                    <option value="PIR">PIR</option>
                    <option value="Ultrasónico">Ultrasónico</option>
                    <option value="Magnético">Magnético</option>
                    <option value="Infrarrojo">Infrarrojo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Ubicación *</label>
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
                  <label htmlFor="status">Estado *</label>
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
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={handleCloseDialog}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    className="btn-submit"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                  >
                    {editingSensor ? <Edit2 size={18} /> : <Plus size={18} />}
                    {editingSensor ? "Guardar Cambios" : "Crear Sensor"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sensores