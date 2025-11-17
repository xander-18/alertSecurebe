import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import History from './view/history/History';
import Sensores from './view/sensor/Sensores';
import Login from './view/auth/Login'
import ProtectedRoute from './components/ProtectedRoute';
import Configuración from './view/configuracion/Config.jsx'; 
import ChatBot from './components/AgentIa.jsx';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } 
        />
        
        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="main-content">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/sensores" element={<Sensores />} />
                    <Route path="/settings" element={<Configuración/>} />
                  </Routes>
                </div>
                {/* ChatBot solo dentro de rutas protegidas */}
                <ChatBot/>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;