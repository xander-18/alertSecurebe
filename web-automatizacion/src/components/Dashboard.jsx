import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
// import StatsCards from "./StatsCard"
import StatsCards from "./StatsCards"
import SalesAnalysis from "./SalesAnalysis"
import RecentActivity from "./RecentActivity"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:ml-64">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 lg:p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-slate-400">Bienvenido de vuelta, aquí tienes un resumen de tu actividad.</p>
          </div>
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesAnalysis />
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  )
}