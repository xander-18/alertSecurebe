// src/components/Header.jsx
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteSession, getSession } from "../../common/common"

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

 useEffect(() => {
  const userName = getSession('USER_NAME')
  const userEmail = getSession('USER_EMAIL')
  const userId = getSession('USER_ID')
  const isAuth = localStorage.getItem('isAuthenticated')
  
  if (userName && userEmail && userId && isAuth === 'true') {
    setUser({
      id: userId,
      name: userName,
      email: userEmail
    })
  }
}, [])

const handleLogout = () => {
  deleteSession('USER_NAME')
  deleteSession('USER_EMAIL')
  deleteSession('USER_ID')
  deleteSession('isAuthenticated')
  
  setUser(null)
  navigate('/login')
}

  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        {/* Botón de menú para mobile */}
        <button
          className="lg:hidden text-slate-300 hover:text-emerald-400 p-2 rounded-md transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Barra de búsqueda */}
        <div className="relative ml-4 lg:ml-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors w-64"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notificaciones */}
        <button className="text-slate-300 hover:text-emerald-400 p-2 rounded-md transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></span>
        </button>

        {/* Dropdown del usuario */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-slate-300 hover:text-emerald-400 transition-colors p-2 rounded-md"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user ? getUserInitials(user.name) : 'U'}
            </div>
            <span className="hidden md:block font-medium">{user ? user.name : 'Usuario'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
              <div className="py-2">
                {/* Info del usuario */}
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user ? user.name : 'Usuario'}</p>
                  <p className="text-xs text-slate-400 truncate">{user ? user.email : 'email@ejemplo.com'}</p>
                </div>
                
                {/* Opciones del menú */}
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate('/perfil')
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400 flex items-center gap-3 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configuración
                </button>
                
                <div className="border-t border-slate-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </header>
  )
}