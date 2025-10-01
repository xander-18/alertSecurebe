import { Settings, Activity, User, X, History } from "lucide-react"

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <X className="icon-lg" />
            <span>XALERT</span>
          </div>
          <button onClick={onClose} className="sidebar-close" aria-label="Cerrar menú">
            <X className="icon-md" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="sidebar-link active">
            <Activity className="icon" />
            <span>Monitoreo</span>
          </a>

          <a href="#" className="sidebar-link">
            <History className="icon" />
            <span>Historial</span>
          </a>

          <a href="#" className="sidebar-link">
            <Settings className="icon" />
            <span>Configuración</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              <User className="icon-md" />
            </div>
            <div className="sidebar-user-details">
              <p className="sidebar-user-name">Usuario</p>
              <p className="sidebar-user-email">usuario@xalert.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
