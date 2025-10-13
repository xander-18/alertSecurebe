import { useEffect, useState } from "react"
import {
  Users,
  Bell,
  Plus,
  X,
  Mail,
  Star,
  User,
  Edit2,
  Trash2,
  Target,
  AlertTriangle,
  Volume2,
  Save,
} from "lucide-react"
import "./configuracion.css"
import { API_URL_REGISTER, API_URL_USERS, confirmSwal } from "../../common/common"

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState("usuarios")
  const [usuarios, setUsuarios] = useState([])
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    password: "",
  })

  const [notificaciones, setNotificaciones] = useState({
    movimiento: true,
    alertas: true,
    email: false,
    sonido: true,
  })

  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const response = await fetch(API_URL_USERS)
        if (!response.ok) throw new Error("Error al obtener usuarios")

        const data = await response.json()
        setUsuarios(data)
      } catch (error) {
        console.error("Error:", error)
      }
    }

    obtenerUsuarios()
  }, [])

  const SaveItem = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) {
      alert("Por favor completa todos los campos.")
      return
    }
    try {
      const response = await fetch(API_URL_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      })
      if (!response.ok) throw new Error("Error al registrar usuario")
      const data = await response.json()
      console.log("Usuario registrado:", data)
      setUsuarios([...usuarios, data.user || data])
      setNuevoUsuario({ nombre: "", email: "", password: "" })
      setMostrarFormulario(false)
    } catch (error) {
      console.error("Error:", error)
      alert("No se pudo registrar el usuario.")
    }
  }

  const eliminarUsuario = (id) => {
    setUsuarios(usuarios.filter((u) => u.id !== id))
    confirmSwal(
          '¿Estás seguro?',
          'Esta acción eliminará el usuario.',
          () => {
            setSensors((prev) => prev.filter((s) => s.id !== sensorId))
            notificationSwal('success', 'Sensor eliminado')
          }
        )
  }

  const iniciarEdicion = (usuario) => {
    setEditandoId(usuario.id)
    setNuevoUsuario({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
    setMostrarFormulario(true)
  }

  const guardarEdicion = () => {
    setUsuarios(usuarios.map((u) => (u.id === editandoId ? { ...u, ...nuevoUsuario } : u)))
    setEditandoId(null)
    setNuevoUsuario({ nombre: "", email: "", rol: "Usuario" })
    setMostrarFormulario(false)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setNuevoUsuario({ nombre: "", email: "", rol: "Usuario" })
    setMostrarFormulario(false)
  }

  const toggleNotificacion = (key) => {
    setNotificaciones({ ...notificaciones, [key]: !notificaciones[key] })
  }

  return (
    <div className="settings-container">
      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === "usuarios" ? "active" : ""}`}
          onClick={() => setActiveTab("usuarios")}
        >
          <Users size={18} />
          Usuarios
        </button>
        <button
          className={`settings-tab ${activeTab === "notificaciones" ? "active" : ""}`}
          onClick={() => setActiveTab("notificaciones")}
        >
          <Bell size={18} />
          Notificaciones
        </button>
      </div>

      {/* Tab de Usuarios */}
      {activeTab === "usuarios" && (
        <div className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Gestión de Usuarios</h2>
            {!mostrarFormulario && (
              <button onClick={() => setMostrarFormulario(true)} className="btn-primary">
                <Plus size={16} />
                Nuevo Usuario
              </button>
            )}
          </div>

          {/* Formulario de usuario */}
          {mostrarFormulario && (
            <div className="user-form">
              <div className="user-form-header">
                <h3>{editandoId ? "Editar Usuario" : "Nuevo Usuario"}</h3>
                <button onClick={cancelarEdicion} className="btn-icon">
                  <X size={18} />
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={nuevoUsuario.email}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={nuevoUsuario.password}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                  />
                </div>

              </div>

              <div className="form-actions">
                <button onClick={cancelarEdicion} className="btn-secondary">
                  Cancelar
                </button>
                <button onClick={editandoId ? guardarEdicion : SaveItem} className="btn-primary">
                  {editandoId ? <Save size={16} /> : <Plus size={16} />}
                  {editandoId ? "Guardar Cambios" : "Agregar Usuario"}
                </button>
              </div>
            </div>
          )}

          {/* Lista de usuarios */}
          <div className="users-list">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="user-card">
                {/* <div className="user-avatar">{usuario.nombre.charAt(0).toUpperCase()}</div> */}
                <div className="user-avatar">{usuario.nombre?.charAt(0).toUpperCase() || "?"}</div>

                <div className="user-info">
                  <div className="user-name">{usuario.nombre}</div>
                  <div className="user-email">
                    <Mail size={14} />
                    {usuario.email}
                  </div>
                </div>

                <div className="user-actions">
                  <button onClick={() => iniciarEdicion(usuario)} className="btn-icon btn-edit" title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => eliminarUsuario(usuario.id)} className="btn-icon btn-delete" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab de Notificaciones */}
      {activeTab === "notificaciones" && (
        <div className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Preferencias de Notificaciones</h2>
          </div>

          <div className="notifications-list">
            <div className="notification-card">
              <div className="notification-header">
                <div className="notification-info">
                  <Target size={24} />
                  <h3>Detección de Movimiento</h3>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificaciones.movimiento}
                    onChange={() => toggleNotificacion("movimiento")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="notification-card">
              <div className="notification-header">
                <div className="notification-info">
                  <AlertTriangle size={24} />
                  <h3>Alertas del Sistema</h3>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificaciones.alertas}
                    onChange={() => toggleNotificacion("alertas")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-options">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Eventos críticos
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Advertencias
                </label>
              </div>
            </div>

            <div className="notification-card">
              <div className="notification-header">
                <div className="notification-info">
                  <Mail size={24} />
                  <h3>Notificaciones</h3>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notificaciones.email} onChange={() => toggleNotificacion("email")} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="notification-card">
              <div className="notification-header">
                <div className="notification-info">
                  <Volume2 size={24} />
                  <h3>Sonido de Alertas</h3>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notificaciones.sonido}
                    onChange={() => toggleNotificacion("sonido")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-options">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  Sonido en alertas críticas
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Configuracion
