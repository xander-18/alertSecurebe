// src/views/auth/Login.jsx
import { useState } from "react"
import { LogIn, Eye, EyeOff, Loader2, User, Lock } from 'lucide-react'
import { API_URL_LOGIN } from "../../../common/common"

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) return

    setLoading(true)
    setError("")
    
    try {
      const loginData = new FormData()
      loginData.append('email', formData.email)
      loginData.append('password', formData.password)

      const response = await fetch(API_URL_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Request': 'true'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const result = await response.json()

      setFormData({ email: "", password: "" })
      console.log("Resultado del login:", result)
      localStorage.setItem('USER_ID', JSON.stringify(result.id))
      localStorage.setItem('USER_NAME', JSON.stringify(result.nombre))
      localStorage.setItem('USER_EMAIL', JSON.stringify(result.email))
      localStorage.setItem('isAuthenticated', 'true')

      window.location.href = '/usuarios'
      
    } catch (error) {
      setError("Credenciales incorrectas. Por favor, verifica tu email y contraseña.")
      console.error('Error logging in:', error)
      setFormData(prev => ({ ...prev, password: "" }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">BLACK HOUSE</h1>
          <p className="text-slate-400">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white py-3 rounded-md transition-colors font-medium"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            © 2025 BLACK HOUSE. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}