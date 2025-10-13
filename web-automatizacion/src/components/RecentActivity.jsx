export default function RecentActivity() {
  const activities = [
    { action: "Nuevo usuario registrado", time: "Hace 2 minutos" },
    { action: "Venta completada", time: "Hace 15 minutos" },
    { action: "Reporte generado", time: "Hace 1 hora" },
    { action: "Configuración actualizada", time: "Hace 2 horas" },
  ]
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-2">Actividad Reciente</h3>
      <p className="text-slate-400 text-sm mb-4">Últimas acciones en el sistema</p>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-white">{activity.action}</p>
              <p className="text-xs text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}