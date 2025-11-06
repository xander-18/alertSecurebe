"use client"

import { useState, useEffect } from "react"
import { Users, UserCheck, Home, DollarSign, TrendingUp, Plus, X, Check } from "lucide-react"
import { API_URL_CLIENTES, API_URL_DEPARTAMENTOS, API_URL_VENTAS, fetchAPIAsync, notificationSwal } from "../../../common/common"

// Configuración de API (ajusta según tu common.jsx)
// const API_HOST = "http://localhost:3000/api/";
// const API_URL_VENTAS = API_HOST + 'ventas';
// const API_URL_CLIENTES = API_HOST + 'clientes';
// const API_URL_DEPARTAMENTOS = API_HOST + 'departamentos';

// // Helper functions
// const fetchAPIAsync = async (url, data, method = "GET") => {
//   const options = {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };
  
//   if (method !== "GET" && data) {
//     options.body = JSON.stringify(data);
//   }
  
//   const response = await fetch(url, options);
//   if (!response.ok) {
//     throw new Error("Error en la petición");
//   }
//   return response.json();
// };

// const notificationSwal = (type, message) => {
//   alert(`${type.toUpperCase()}: ${message}`);
// };

export default function Ventas() {
  const [estadisticas, setEstadisticas] = useState({
    leads: 0,
    clientes: 0,
    enNegociacion: 0,
    vendidos: 0,
    ingresosMes: 0,
  })

  const [departamentosDisponibles, setDepartamentosDisponibles] = useState([])
  const [leadsRecientes, setLeadsRecientes] = useState([])
  const [clientesActivos, setClientesActivos] = useState([])
  const [ventasCerradas, setVentasCerradas] = useState([])
  const [modalAsignacion, setModalAsignacion] = useState({ abierto: false, lead: null })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Cargar clientes
      const clientes = await fetchAPIAsync(API_URL_CLIENTES, {}, "GET")
      
      // Cargar departamentos
      const departamentos = await fetchAPIAsync(API_URL_DEPARTAMENTOS, {}, "GET")
      
      // Cargar ventas
      const ventas = await fetchAPIAsync(API_URL_VENTAS, {}, "GET")
      
      // Filtrar departamentos disponibles (no vendidos)
      const deptosDisponibles = departamentos.filter(d => 
        d.estado === "disponible" || d.estado === "construccion" || d.estado === "proximamente"
      )
      setDepartamentosDisponibles(deptosDisponibles)
      
      // Separar clientes en leads (sin departamento asignado o is_potential)
      const leads = clientes.filter(c => !c.departamento_id || c.is_potential === 1)
      setLeadsRecientes(leads.map(lead => {
        let fechaFormateada = new Date().toISOString().split('T')[0]
        try {
          if (lead.created_at) {
            // Si es un Timestamp de Firebase
            if (lead.created_at._seconds) {
              fechaFormateada = new Date(lead.created_at._seconds * 1000).toISOString().split('T')[0]
            } else {
              fechaFormateada = new Date(lead.created_at).toISOString().split('T')[0]
            }
          }
        } catch (e) {
          console.log("Error parseando fecha:", e)
        }
        
        return {
          id: lead.id,
          nombre: `${lead.name} ${lead.apellido || ''}`,
          telefono: lead.phone,
          estado: lead.is_potential ? "calificado" : "nuevo",
          fecha: fechaFormateada,
          origen: lead.fuente || "Directo",
          departamento: null,
          precio: null,
        }
      }))
      
      // Clientes activos (con ventas en proceso)
      const ventasActivas = ventas.filter(v => 
        v.estado_venta === "reservado" || v.estado_venta === "negociacion" || v.estado_venta === "prospecto"
      )
      
      const clientesActivosList = await Promise.all(
        ventasActivas.map(async (venta) => {
          const cliente = clientes.find(c => c.id === venta.cliente_id)
          const depto = departamentos.find(d => d.id === venta.departamento_id)
          return {
            id: venta.id,
            nombre: cliente ? `${cliente.name} ${cliente.apellido || ''}` : 'Cliente Desconocido',
            departamento: depto ? depto.direccion : 'Depto N/A',
            estado: venta.estado_venta,
            precio: venta.precio,
            fecha: venta.fecha_venta ? new Date(venta.fecha_venta).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          }
        })
      )
      setClientesActivos(clientesActivosList)
      
      // Ventas cerradas (vendido o cerrado)
      const ventasCerradasList = ventas.filter(v => v.estado_venta === "vendido" || v.estado_venta === "cerrado")
      const ventasCerradasData = await Promise.all(
        ventasCerradasList.map(async (venta) => {
          const cliente = clientes.find(c => c.id === venta.cliente_id)
          const depto = departamentos.find(d => d.id === venta.departamento_id)
          return {
            id: venta.id,
            cliente: cliente ? `${cliente.name} ${cliente.apellido || ''}` : 'Cliente Desconocido',
            departamento: depto ? depto.direccion : 'Depto N/A',
            precio: venta.precio,
            fecha: venta.fecha_venta ? new Date(venta.fecha_venta).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            comision: venta.precio * 0.05, // 5% de comisión
          }
        })
      )
      setVentasCerradas(ventasCerradasData)
      
      // Calcular estadísticas
      const ingresosMes = ventasCerradasList
        .filter(v => {
          const fechaVenta = new Date(v.fecha_venta || v.created_at)
          const hoy = new Date()
          return fechaVenta.getMonth() === hoy.getMonth() && fechaVenta.getFullYear() === hoy.getFullYear()
        })
        .reduce((sum, v) => sum + (v.precio || 0), 0)
      
      setEstadisticas({
        leads: leads.length,
        clientes: clientesActivosList.length,
        enNegociacion: ventasActivas.filter(v => v.estado_venta === "negociacion").length,
        vendidos: ventasCerradasList.length,
        ingresosMes: ingresosMes,
      })
      
    } catch (error) {
      console.error("Error al cargar datos:", error)
      notificationSwal("error", "Error al cargar los datos")
    }
  }

  const asignarDepartamento = async (leadId, departamento) => {
    try {
      // Crear una venta con estado "reservado"
      const ventaData = {
        cliente_id: leadId,
        departamento_id: departamento.id,
        precio: departamento.precio,
        estado_venta: "reservado",
        metodo_pago: "contado",
        fecha_venta: new Date().toISOString(),
      }
      
      await fetchAPIAsync(API_URL_VENTAS, ventaData, "POST")
      notificationSwal("success", "Departamento asignado exitosamente")
      
      // Actualizar el lead localmente
      setLeadsRecientes((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? { ...lead, departamento: departamento.direccion, precio: departamento.precio, estado: "calificado" }
            : lead,
        ),
      )
      
      setModalAsignacion({ abierto: false, lead: null })
      
      // Recargar datos
      cargarDatos()
    } catch (error) {
      console.error("Error al asignar departamento:", error)
      notificationSwal("error", "Error al asignar el departamento")
    }
  }

  const moverAClientes = (lead) => {
    if (!lead.departamento) {
      notificationSwal("warning", "Debe asignar un departamento primero")
      return
    }

    // El lead ya tiene una venta creada, solo actualizamos el estado local
    setLeadsRecientes((prev) => prev.filter((l) => l.id !== lead.id))
    cargarDatos()
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
      reservado: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      vendido: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      cerrado: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
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
            {leadsRecientes.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No hay leads disponibles</p>
            ) : (
              leadsRecientes.map((lead) => (
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
              ))
            )}
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
            {clientesActivos.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No hay clientes activos</p>
            ) : (
              clientesActivos.map((cliente) => (
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
              ))
            )}
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
            {ventasCerradas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No hay ventas cerradas</p>
            ) : (
              ventasCerradas.map((venta) => (
                <div key={venta.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                  <p className="font-semibold text-sm mb-1">{venta.cliente}</p>
                  <p className="text-xs text-gray-400 mb-2">{venta.departamento}</p>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Precio:</span>
                    <span className="text-sm font-bold text-green-400">S/.{venta.precio.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">{venta.fecha}</p>
                </div>
              ))
            )}
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
              {departamentosDisponibles.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No hay departamentos disponibles</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {departamentosDisponibles.map((depto) => (
                    <div
                      key={depto.id}
                      onClick={() => asignarDepartamento(modalAsignacion.lead.id, depto)}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all hover:scale-105"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{depto.direccion}</h4>
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">{depto.tipo}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400 mb-2">S/.{depto.precio.toLocaleString()}</p>
                      <div className="flex gap-2 text-sm text-gray-400">
                        <span>{depto.area_m2}m²</span>
                        <span>•</span>
                        <span>{depto.habitaciones} hab</span>
                        <span>•</span>
                        <span>{depto.banos} baños</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}