"use client"
import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  User,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Heart,
  Edit,
  MessageSquare,
  Clock,
  Trash,
} from "lucide-react"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import Modal from "@mui/material/Modal"
import { API_URL_CLIENTES, editarSwal, eliminarSwal, fetchAPIAsync, notificationSwal } from "../../../common/common"
import { useParams } from "react-router"
// API_URL_VERIFY_POTENTIAL
const columns = [
  { id: "name", label: "Nombre", minWidth: 120, key: 1 },
  { id: "apellido", label: "Apellido", minWidth: 120, key: 2 },
  { id: "phone", label: "Teléfono", minWidth: 120, key: 3 },
  { id: "email", label: "Email", minWidth: 180, key: 4 },
  { id: "profesion", label: "Profesión", minWidth: 120, key: 5 },
  { id: "presupuesto", label: "Presupuesto", minWidth: 100, key: 6 },
  { id: "fuente", label: "Fuente", minWidth: 100, key: 7 },
  { id: "is_potential", label: "Potencial", minWidth: 100, key: 8 },
  { id: "seguimiento", label: "Notas", minWidth: 120, key: 9 },
  { id: "acciones", label: "Acciones", minWidth: 120, key: 10 },
]

  export default function Clientes() {
    const {id} = useParams();
    const [busqueda, setBusqueda] = useState("")
    const [searchFilter, setSearchFilter] = useState({})
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [filteredRows, setFilteredRows] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [page, setPage] = useState(0)
    const [itemSave, setItemSave] = useState({})
    const [editedItem, setEditedItem] = useState(0)
    const [nuevo, setNuevo] = useState({})
    const [openEditModal, setOpenEditModal] = useState(false)
    const [openNotesModal, setOpenNotesModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState(null)
    const [clientNotes, setClientNotes] = useState("")


    const [openModal1, setOpenModal1] = useState(false)
    const [openModal2, setOpenModal2] = useState(false)

    useEffect(() => {
      SearchFilter()
    }, [])

      async function SearchFilter(numPage) {
        const filter = searchFilter
        filter.page = numPage + 1
        filter.paginate = rowsPerPage
        if (numPage === undefined || numPage === null) {
          filter.page = page + 1
        }
        try {
          const asesor_id = localStorage.getItem('USER_ID');
          filter.asesor_id = asesor_id;
          const result = await fetchAPIAsync(API_URL_CLIENTES, filter, "GET")
          // setFilteredRows(result?.data)
          // setTotalItems(result?.total)
          setFilteredRows(result);
          setTotalItems(result.length);
        } catch (error) {
          notificationSwal("error", error)
        }
      }

    const handleChange = (e) => {
      const value = e.target.value
      setNuevo({ ...nuevo, [e.target.name]: value })
    }

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value)
      setPage(0)
    }

    async function SaveItem() {
      try {
        await fetchAPIAsync(API_URL_CLIENTES, itemSave, 'POST');
        notificationSwal('success', '¡Registro exitoso!');
        SearchFilter(page);
      } catch (e) {
        notificationSwal('error', e);
      }
    }

    async function updateItem() {
      const elementoId = editedItem.id;

      editarSwal(API_URL_CLIENTES, elementoId, editedItem, SearchFilter);
      handleCloseModal2();
    }

    function handleEditar(row) {
      setEditedItem({
        id: row.id,
        dni: row.dni,
        name: row.name,
        apellido: row.apellido,
      });
      handleOpenModal2();
    }

    const handleChangePage = async (event, newPage) => {
      setPage(newPage)
      await SearchFilter(newPage)
    }


    const handleSaveChange = (event) => {
      const { name, value } = event.target
      setItemSave((prevSearch) => ({
        ...prevSearch,
        [name]: value,
      }))
    }
  const handleEditChange = (name, value) => {
      setEditedItem((prevEditedItem) => ({
        ...prevEditedItem,
        [name]: value
      }));
    };

    const handleOpenModal1 = () => {
      setOpenModal1(true)
    }

    const handleCloseModal1 = () => {
      setOpenModal1(false)
    }

    const handleOpenModal2 = () => {
      setOpenModal2(true)
    }

    const handleCloseModal2 = () => {
      setOpenModal2(false)
    }


  const handleTogglePotential = async (clientId, currentStatus) => {
    try {
      const newStatus = !Boolean(currentStatus)
      setFilteredRows(prevRows => 
        prevRows.map(row => 
          row.id === clientId 
            ? { ...row, is_potential: newStatus ? 1 : 0 }
            : row
        )
      )
      await fetchAPIAsync(`${API_URL_VERIFY_POTENTIAL}/${clientId}`, { 
        is_potential: newStatus 
      }, "POST")
      notificationSwal("success", `Cliente ${newStatus ? "marcado como" : "removido de"} potencial`)
    } catch (error) {
      console.error('Error:', error)
      notificationSwal("error", "Error al actualizar estado del cliente")
      // Si falla, recargar los datos
      SearchFilter(page)
    }
  }

    const handleAddNotes = (client) => {
      setSelectedClient(client)
      setClientNotes(client.observacion || "")
      setOpenNotesModal(true)
    }

    const handleSaveNotes = async () => {
      try {
        await fetchAPIAsync(`${API_URL_CLIENTES}/${selectedClient.id}`, { observacion: clientNotes }, "POST")
        notificationSwal("success", "Notas guardadas exitosamente")
        setOpenNotesModal(false)
        SearchFilter(page)
      } catch (error) {
        notificationSwal("error", "Error al guardar notas")
      }
    }

     const handleDeleteClient = (userId) => {
     eliminarSwal(userId, API_URL_CLIENTES, () => {
       notificationSwal("success", "Usuario eliminado exitosamente");
       SearchFilter(page);
     });
   };

    return (
      <div className="min-h-screen bg-slate-950 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
                  <p className="text-slate-400">Administra los contactos y clientes del sistema</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenModal1}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Cliente 
                </button>

                <button
                  onClick={SearchFilter}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 px-4 py-2 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refrescar
                </button>
              </div>
            </div>
          </div>
          {/* Búsqueda y Lista */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg">
            {/* Header de la tabla con búsqueda */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Lista de Clientes</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    placeholder="Buscar por nombre, email, teléfono o DNI..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors w-full sm:w-80"
                  />
                </div>
              </div>
            </div>
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              {totalItems > 0 ? (
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell key={column.key} align={column.align} style={{ minWidth: column.minWidth }}>
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                            {columns.map((column) => {
                              if (column.id === "is_potential") {
                                return (
                                  <TableCell key={column.id}>
                                    <button
                                      onClick={() => handleTogglePotential(row.id, row.is_potential)}
                                      className={`px-3 py-1 text-white text-sm rounded-md transition-colors ${
                                        row.is_potential
                                          ? "bg-green-600 hover:bg-green-700"
                                          : "bg-red-600 hover:bg-red-700"
                                      }`}
                                    >
                                      {row.is_potential ? "Potencial" : "Marcar"}
                                    </button>
                                  </TableCell>
                                )
                              }
                              if (column.id === "seguimiento") {
                                return (
                                  <TableCell key={column.id}>
                                    <button
                                      onClick={() => handleAddNotes(row)}
                                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
                                    >
                                      Agregar Notas
                                    </button>
                                  </TableCell>
                                )
                              }
                              if (column.id === "acciones") {
                                return (
                                  <TableCell key={column.id}>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEditar(row)}
                                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                                        title="Editar Cliente"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteClient(row.id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                                        title="Eliminar Cliente"
                                      >
                                        <Trash className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </TableCell>
                                )
                              }
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.id === "presupuesto" && row[column.id] ? `$${row[column.id]}` : row[column.id]}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="alert alert-warning" role="alert">
                  No se encontraron resultados.
                </div>
              )}

              <TablePagination
                rowsPerPageOptions={[10, 20, 30]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>

            {/* Notes Modal for client follow-up */}
            <Modal
              open={openNotesModal}
              onClose={() => setOpenNotesModal(false)}
              aria-labelledby="notes-modal-title"
              className="flex items-center justify-center p-4"
            >
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Notas de Seguimiento</h2>
                      <p className="text-sm text-slate-400">
                        {selectedClient?.name} {selectedClient?.apellido}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenNotesModal(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Última actualización: {new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="observacion" className="block text-sm font-medium text-slate-300">
                        Observaciones y Notas de Seguimiento
                      </label>
                      <textarea
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                        name="observacion"
                        id="observacion"
                        rows="8"
                        placeholder="Agregar notas sobre interacciones, intereses del cliente, próximos pasos, recordatorios, etc."
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 p-6 border-t border-slate-700">
                  <button
                    onClick={() => setOpenNotesModal(false)}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Guardar Notas
                  </button>
                </div>
              </div>
            </Modal>

            <Modal
              open={openModal1}
              onClose={handleCloseModal1}
              aria-labelledby="registration-modal-title"
              aria-describedby="registration-modal-description"
              className="flex items-center justify-center p-4"
            >
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Registrar Nuevo Cliente</h2>
                  </div>
                  <button
                    onClick={handleCloseModal1}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <form encType="multipart/form-data" className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                        <User className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Información Personal</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="dni" className="block text-sm font-medium text-slate-300">
                            DNI *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                            name="dni"
                            id="dni"
                            placeholder="Ingrese el DNI"
                            onChange={handleSaveChange}
                            value={itemSave.dni || ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                            name="name"
                            id="name"
                            placeholder="Ingrese el nombre"
                            onChange={handleSaveChange}
                            value={itemSave.name || ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="apellido" className="block text-sm font-medium text-slate-300">
                            Apellido *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                            name="apellido"
                            id="apellido"
                            placeholder="Ingrese el apellido"
                            onChange={handleSaveChange}
                            value={itemSave.apellido || ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="fecha_naci" className="block text-sm font-medium text-slate-300">
                            Fecha de Nacimiento
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="date"
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none transition-colors"
                              name="fecha_naci"
                              id="fecha_naci"
                              onChange={handleSaveChange}
                              value={itemSave.fecha_naci || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="estado_civil" className="block text-sm font-medium text-slate-300">
                            Estado Civil
                          </label>
                          <div className="relative">
                            <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none transition-colors"
                              name="estado_civil"
                              id="estado_civil"
                              onChange={handleSaveChange}
                              value={itemSave.estado_civil || ""}
                            >
                              <option value="">Seleccionar...</option>
                              <option value="Soltero">Soltero</option>
                              <option value="Casado">Casado</option>
                              <option value="Divorciado">Divorciado</option>
                              <option value="Viudo">Viudo</option>
                              <option value="Unión Libre">Unión Libre</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                        <Phone className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Información de Contacto</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                            Teléfono *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                              name="phone"
                              id="phone"
                              placeholder="Ingrese el teléfono"
                              onChange={handleSaveChange}
                              value={itemSave.phone || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="email"
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                              name="email"
                              id="email"
                              placeholder="Ingrese el email"
                              onChange={handleSaveChange}
                              value={itemSave.email || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label htmlFor="direccion" className="block text-sm font-medium text-slate-300">
                            Dirección
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <textarea
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors resize-none"
                              name="direccion"
                              id="direccion"
                              rows="2"
                              placeholder="Ingrese la dirección completa"
                              onChange={handleSaveChange}
                              value={itemSave.direccion || ""}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                        <Briefcase className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Información Comercial</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="profesion" className="block text-sm font-medium text-slate-300">
                            Profesión
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                              name="profesion"
                              id="profesion"
                              placeholder="Ej: Ingeniero, Doctor, etc."
                              onChange={handleSaveChange}
                              value={itemSave.profesion || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="presupuesto" className="block text-sm font-medium text-slate-300">
                            Presupuesto
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="number"
                              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors"
                              name="presupuesto"
                              id="presupuesto"
                              placeholder="0.00"
                              onChange={handleSaveChange}
                              value={itemSave.presupuesto || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="fuente" className="block text-sm font-medium text-slate-300">
                            Fuente de Contacto
                          </label>
                          <select
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none transition-colors"
                            name="fuente"
                            id="fuente"
                            onChange={handleSaveChange}
                            value={itemSave.fuente || ""}
                          >
                            <option value="">Seleccionar fuente...</option>
                            <option value="Referido">Referido</option>
                            <option value="Redes Sociales">Redes Sociales</option>
                            <option value="Página Web">Página Web</option>
                            <option value="Publicidad">Publicidad</option>
                            <option value="Evento">Evento</option>
                            <option value="Llamada Fría">Llamada Fría</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                        <Search className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Observaciones y Seguimiento</h3>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="observacion" className="block text-sm font-medium text-slate-300">
                          Observaciones
                        </label>
                        <textarea
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                          name="observacion"
                          id="observacion"
                          rows="4"
                          placeholder="Notas importantes sobre el cliente, intereses, preferencias, historial de contacto, etc."
                          onChange={handleSaveChange}
                          value={itemSave.observacion || ""}
                        />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-center gap-3 p-6 border-t border-slate-700">
                  <button
                    onClick={handleCloseModal1}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={SaveItem}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Contacto
                  </button>
                </div>
              </div>
            </Modal>


            <Modal
            open={openModal2}
            onClose={handleCloseModal2}
            aria-labelledby="edit-modal-title"
            className="flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Editar Cliente</h2>
                </div>
                <button
                  onClick={() => handleCloseModal2(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Same form structure as registration modal */}
                <form className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <User className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-semibold text-white">Información Personal</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">DNI *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                          name="dni"
                           onChange={(event) => {
                              const { name, value } = event.target;
                              handleEditChange(name, value);
                            }}
                          value={editedItem.dni || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Nombre *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                          name="name"
                            onChange={(event) => {
                      const { name, value } = event.target;
                      handleEditChange(name, value);
                    }}
                          value={editedItem.name || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Apellido *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                          name="apellido"
                            onChange={(event) => {
                      const { name, value } = event.target;
                      handleEditChange(name, value);
                    }}
                          value={editedItem.apellido || ""}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-center gap-3 p-6 border-t border-slate-700">
                <button
                  onClick={handleCloseModal2}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateItem}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Actualizar Cliente
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}
