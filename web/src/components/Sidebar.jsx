import { Settings, Activity, User, X, History, Satellite, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || 'usuario@xalert.com';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Activity className="icon-lg" />
            <span>XALERT</span>
          </div>
          <button onClick={onClose} className="sidebar-close" aria-label="Cerrar menú">
            <X className="icon-md" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Activity className="icon" />
            <span>Monitoreo</span>
          </NavLink>

          <NavLink 
            to="/history" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <History className="icon" />
            <span>Historial</span>
          </NavLink>

          <NavLink 
            to="/sensores" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Satellite className="icon" />
            <span>Sensores</span>
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings className="icon" />
            <span>Configuración</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">
              <User className="icon-md" />
            </div>
            <div className="sidebar-user-details">
              <p className="sidebar-user-name">{userName}</p>
              <p className="sidebar-user-email">{userEmail}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-logout">
            <LogOut className="icon" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;