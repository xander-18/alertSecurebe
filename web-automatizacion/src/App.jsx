import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './views/auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Usuarios from './views/usuarios/Usuarios'
import Clientes from './views/contact/Clientes'
import Departamentos from './views/departaments/Departamento'
import Ventas from './views/ventas/Ventas'

import ChatBot from './components/AgentIa'

function AppContent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <>
      {/* Solo mostrar ChatBot si NO estamos en la página de login */}
      {!isLoginPage && <ChatBot />}
      
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/usuarios" element={
          <ProtectedRoute>
            <AdminLayout>
              <Usuarios />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/clientes" element={
          <ProtectedRoute>
            <AdminLayout>
              <Clientes />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/departamentos" element={
          <ProtectedRoute>
            <AdminLayout>
              <Departamentos />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/ventas" element={
          <ProtectedRoute>
            <AdminLayout>
              <Ventas />
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App