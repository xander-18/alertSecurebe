import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="header">
      <button onClick={onMenuClick} className="header-menu-btn">
        <Menu className="icon-lg" />
      </button>
      
      <div className="header-search">
        <div className="header-search-icon">
          <Search className="icon" />
        </div>
        <input
          type="text"
          placeholder="Buscar..."
        />
      </div>
      
      <div className="header-actions">
        <button className="header-notification">
          <Bell className="icon-lg" />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
};

// Componente API Service Card
const ApiServiceCard = ({ service }) => {
  const { name, requests, responseTime, icon: Icon, color, status = 'active' } = service;

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'warning': return 'Advertencia';
      default: return 'Activo';
    }
  };

  return (
    <div className="api-card">
      <div className="api-card-header">
        <div className={`api-card-icon ${color}`}>
          <Icon className="icon-lg" />
        </div>
        <span className={`api-card-status ${status}`}>{getStatusText(status)}</span>
      </div>
      
      <div className="api-card-body">
        <h3 className="api-card-title">{name}</h3>
        <div className="api-card-stats">
          <p><strong>{requests.toLocaleString()}</strong> Requests</p>
          <p><strong>{responseTime}ms</strong> Tiempo resp</p>
        </div>
      </div>
      
      <div className="api-card-footer">
        <a href="#" className="api-card-link">
          Ver detalles <ChevronRight className="icon" />
        </a>
      </div>
    </div>
  );
};

export default Header;