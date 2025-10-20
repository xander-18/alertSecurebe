import { BarChart3 } from 'lucide-react'

export default function SalesAnalysis() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-2">Análisis de Ventas</h3>
      <p className="text-slate-400 text-sm mb-4">Rendimiento de ventas en los últimos 6 meses</p>
      <div className="h-64 bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
          <p className="text-slate-400">Gráfico de ventas</p>
        </div>
      </div>
    </div>
  )
}