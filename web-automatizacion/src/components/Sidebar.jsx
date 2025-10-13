// src/components/Sidebar.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import menuItems from "../menu-items"

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Sidebar Desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transform transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      } hidden lg:block`}>
        
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between h-16 border-b border-slate-800 px-4">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-emerald-400">BLACK HOUSE</h1>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navegación */}
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 group ${
                isActive(item.path)
                  ? "text-emerald-400 bg-emerald-400/10 border-r-2 border-emerald-400"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800"
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              
              {/* Tooltip para modo colapsado */}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sidebar Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <h1 className="text-xl font-bold text-emerald-400">BLACK HOUSE</h1>
        </div>

        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => setSidebarOpen(false)} // Cerrar sidebar en mobile al hacer click
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-emerald-400 bg-emerald-400/10 border-r-2 border-emerald-400"
                  : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  )
}