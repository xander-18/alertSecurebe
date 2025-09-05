
import React, { useState } from 'react';
import { BarChart3, Settings, Database, Activity, Terminal, User, X, Zap, Menu, Search, Bell, Users, ChevronRight } from 'lucide-react';

// Componente Sidebar
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Zap className="icon-lg" style={{color: '#818cf8'}} />
          <span>API Hub</span>
        </div>
        <button onClick={onClose} className="sidebar-close">
          <X className="icon-lg" />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <a href="#" className="sidebar-link active">
          <Activity className="icon" /> Monitoreo
        </a>
        <a href="#" className="sidebar-link">
          <Settings className="icon" /> Configuración
        </a>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          <User className="icon-xl" style={{color: '#ffffff'}} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;