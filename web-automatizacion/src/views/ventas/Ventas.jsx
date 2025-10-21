"use client"

import { useState } from "react"
import { Users, UserCheck, Home, DollarSign, TrendingUp, Plus, X, Check } from "lucide-react"

export default function Ventas() {
  const [estadisticas] = useState({
    leads: 24,
    clientes: 12,
    enNegociacion: 8,
    vendidos: 3,
    ingresosMes: 450000,
  })

  const [departamentosDisponibles] = useState([
    { id: 101, numero: "Dpto 101", precio: 120000, piso: 1, area: 65 },
    { id: 102, numero: "Dpto 102", precio: 120000, piso: 1, area: 65 },
    { id: 201, numero: "Dpto 201", precio: 150000, piso: 2, area: 75 },
    { id: 202, numero: "Dpto 202", precio: 150000, piso: 2, area: 75 },
    { id: 301, numero: "Dpto 301", precio: 180000, piso: 3, area: 85 },
    { id: 401, numero: "Dpto 401", precio: 200000, piso: 4, area: 95 },
  ])

  const [leadsRecientes, setLeadsRecientes] = useState([
    {
      id: 1,
      nombre: "Carlos Mendoza",
      telefono: "987654321",
      estado: "nuevo",
      fecha: "2025-10-10",
      origen: "Facebook",
      departamento: null,
    },
    {
      id: 2,
      nombre: "María Torres",
      telefono: "976543210",
      estado: "contactado",
      fecha: "2025-10-09",
      origen: "Referido",
      departamento: null,
    },
    {
      id: 3,
      nombre: "Juan Pérez",
      telefono: "965432109",
      estado: "calificado",
      fecha: "2025-10-08",
      origen: "Web",
      departamento: null,
    },
  ])

  const [clientesActivos, setClientesActivos] = useState([
    {
      id: 1,
      nombre: "Ana Rodríguez",
      departamento: "Dpto 301",
      estado: "negociacion",
      precio: 150000,
      fecha: "2025-10-05",
    },
    {
      id: 2,
      nombre: "Pedro Sánchez",
      departamento: "Dpto 205",
      estado: "prospecto",
      precio: 180000,
      fecha: "2025-10-07",
    },
    {
      id: 3,
      nombre: "Lucía Vega",
      departamento: "Dpto 102",
      estado: "negociacion",
      precio: 120000,
      fecha: "2025-10-06",
    },
  ])

  const [ventasCerradas] = useState([
    { id: 1, cliente: "Roberto Lima", departamento: "Dpto 401", precio: 200000, fecha: "2025-10-01", comision: 10000 },
    { id: 2, cliente: "Sofia Martínez", departamento: "Dpto 203", precio: 165000, fecha: "2025-09-28", comision: 8250 },
    { id: 3, cliente: "Diego Castro", departamento: "Dpto 304", precio: 175000, fecha: "2025-09-25", comision: 8750 },
  ])

  const [modalAsignacion, setModalAsignacion] = useState({ abierto: false, lead: null })

  const asignarDepartamento = (leadId, departamento) => {
    setLeadsRecientes((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, departamento: departamento.numero, precio: departamento.precio, estado: "calificado" }
          : lead,
      ),
    )
    setModalAsignacion({ abierto: false, lead: null })
  }

  const moverAClientes = (lead) => {
    if (!lead.departamento) return

    const nuevoCliente = {
      id: Date.now(),
      nombre: lead.nombre,
      departamento: lead.departamento,
      estado: "prospecto",
      precio: lead.precio,
      fecha: new Date().toISOString().split("T")[0],
    }

    setClientesActivos((prev) => [nuevoCliente, ...prev])
    setLeadsRecientes((prev) => prev.filter((l) => l.id !== lead.id))
  }

  const getEstadoColor = (estado) => {
    const colores = {
      nuevo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      contactado: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      calificado: "bg-green-500/20 text-green-300 border-green-500/30",
      perdido: "bg-red-500/20 text-red-300 border-red-500/30",
      prospecto: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      negociacion: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      compro: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    }
    return colores[estado] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Gestión de Ventas</h1>
        <p className="text-sm text-gray-400">Seguimiento del proceso de ventas de departamentos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Total Leads</p>
              <p className="text-2xl font-bold text-blue-400">{estadisticas.leads}</p>
            </div>
            <Users className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Clientes</p>
              <p className="text-2xl font-bold text-purple-400">{estadisticas.clientes}</p>
            </div>
            <UserCheck className="text-purple-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">En Negociación</p>
              <p className="text-2xl font-bold text-orange-400">{estadisticas.enNegociacion}</p>
            </div>
            <Home className="text-orange-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Vendidos</p>
              <p className="text-2xl font-bold text-emerald-400">{estadisticas.vendidos}</p>
            </div>
            <DollarSign className="text-emerald-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Ingresos Mes</p>
              <p className="text-xl font-bold text-green-400">${(estadisticas.ingresosMes / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">Flujo del Proceso</h2>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <Users size={24} />
              </div>
              <p className="text-xs font-semibold">Leads</p>
              <p className="text-xl font-bold text-blue-400">{estadisticas.leads}</p>
            </div>

            <div className="text-gray-600 text-2xl">→</div>

            <div className="flex flex-col items-center flex-1">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <UserCheck size={24} />
              </div>
              <p className="text-xs font-semibold">Clientes</p>
              <p className="text-xl font-bold text-purple-400">{estadisticas.clientes}</p>
            </div>

            <div className="text-gray-600 text-2xl">→</div>

            <div className="flex flex-col items-center flex-1">
              <div className="bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <Home size={24} />
              </div>
              <p className="text-xs font-semibold">Negociación</p>
              <p className="text-xl font-bold text-orange-400">{estadisticas.enNegociacion}</p>
            </div>

            <div className="text-gray-600 text-2xl">→</div>

            <div className="flex flex-col items-center flex-1">
              <div className="bg-emerald-500 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <DollarSign size={24} />
              </div>
              <p className="text-xs font-semibold">Vendido</p>
              <p className="text-xl font-bold text-emerald-400">{estadisticas.vendidos}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leads Recientes */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="p-3 border-b border-gray-700/50">
            <h3 className="font-bold text-sm flex items-center">
              <Users className="mr-2 text-blue-400" size={18} />
              Leads Recientes
            </h3>
          </div>
          <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
            {leadsRecientes.map((lead) => (
              <div key={lead.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{lead.nombre}</p>
                    <p className="text-xs text-gray-400">{lead.telefono}</p>
                  </div>
                  <span className="text-xs text-gray-500">{lead.origen}</span>
                </div>

                {lead.departamento && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-2 mb-2">
                    <p className="text-xs text-green-300 font-semibold">{lead.departamento}</p>
                    <p className="text-xs text-green-400">S/.{lead.precio?.toLocaleString()}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getEstadoColor(lead.estado)}`}>
                    {lead.estado}
                  </span>
                  <span className="text-xs text-gray-500">{lead.fecha}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  {!lead.departamento ? (
                    <button
                      onClick={() => setModalAsignacion({ abierto: true, lead })}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus size={14} />
                      Asignar Depto
                    </button>
                  ) : (
                    <button
                      onClick={() => moverAClientes(lead)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check size={14} />
                      Mover a Clientes
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="p-3 border-b border-gray-700/50">
            <h3 className="font-bold text-sm flex items-center">
              <Home className="mr-2 text-orange-400" size={18} />
              Clientes Activos
            </h3>
          </div>
          <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
            {clientesActivos.map((cliente) => (
              <div key={cliente.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <p className="font-semibold text-sm mb-1">{cliente.nombre}</p>
                <p className="text-xs text-gray-400 mb-2">{cliente.departamento}</p>
                <p className="text-base font-bold text-green-400 mb-2">S/.{cliente.precio.toLocaleString()}</p>
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getEstadoColor(cliente.estado)}`}>
                    {cliente.estado}
                  </span>
                  <span className="text-xs text-gray-500">{cliente.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ventas Cerradas */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="p-3 border-b border-gray-700/50">
            <h3 className="font-bold text-sm flex items-center">
              <DollarSign className="mr-2 text-emerald-400" size={18} />
              Ventas Cerradas
            </h3>
          </div>
          <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
            {ventasCerradas.map((venta) => (
              <div key={venta.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <p className="font-semibold text-sm mb-1">{venta.cliente}</p>
                <p className="text-xs text-gray-400 mb-2">{venta.departamento}</p>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">Precio:</span>
                  <span className="text-sm font-bold text-green-400">S/.{venta.precio.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">{venta.fecha}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalAsignacion.abierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg">Asignar Departamento a {modalAsignacion.lead?.nombre}</h3>
              <button
                onClick={() => setModalAsignacion({ abierto: false, lead: null })}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departamentosDisponibles.map((depto) => (
                  <div
                    key={depto.id}
                    onClick={() => asignarDepartamento(modalAsignacion.lead.id, depto)}
                    className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{depto.numero}</h4>
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">Piso {depto.piso}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400 mb-2">S/.{depto.precio.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">{depto.area}m²</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
