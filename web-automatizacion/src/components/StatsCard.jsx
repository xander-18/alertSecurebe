import { TrendingUp } from 'lucide-react'

export default function StatsCard({ title, value, change, Icon }) {
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <Icon className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <p className="text-xs text-emerald-400 flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" />
        {change} desde el mes pasado
      </p>
    </div>
  )
}