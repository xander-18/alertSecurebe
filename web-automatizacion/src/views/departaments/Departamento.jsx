import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  RefreshCw,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Tag,
  CheckCircle,
  X,
  Edit,
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
import { API_URL_DEPARTAMENTOS, eliminarSwal, notificationSwal } from "../../../common/common"
// import { API_URL_DEPARTAMENTOS, editarSwal, eliminarSwal, fetchAPIAsync, notificationSwal } from "../../common/common"

const MOCK_DEPARTAMENTOS = [
  {
    id: 1,
    nombre: "HUERTAS DEL VALLE",
    direccion: "Santa Maria del Valle",
    precio: "Agotado",
    habitaciones: 1,
    banos: 1,
    area: "120m²",
    tipo: "Lote",
    estado: "Agotado",
  },
  {
    id: 2,
    nombre: "HIRAKI",
    direccion: "La Colectora, Amarilis",
    precio: 268000,
    habitaciones: 3,
    banos: 2,
    area: "62m² - 84m²",
    tipo: "Departamento",
    estado: "En Construcción",
  },
  {
    id: 3,
    nombre: "HALIT",
    direccion: "Los Portales, Amarilis",
    precio: "Próximamente",
    habitaciones: 3,
    banos: 2,
    area: "61.7m² - 94m²",
    tipo: "Departamento",
    estado: "Próximamente",
  },
]

const columns = [
  { id: "nombre", label: "Nombre", minWidth: 150, key: 1 },
  { id: "direccion", label: "Dirección", minWidth: 180, key: 2 },
  { id: "precio", label: "Precio", minWidth: 120, key: 3 },
  { id: "habitaciones", label: "Habitaciones", minWidth: 100, key: 4 },
  { id: "banos", label: "Baños", minWidth: 100, key: 5 },
  { id: "area", label: "Área", minWidth: 100, key: 6 },
  { id: "tipo", label: "Tipo", minWidth: 120, key: 7 },
  { id: "estado", label: "Estado", minWidth: 120, key: 8 },
  { id: "acciones", label: "Acciones", minWidth: 120, key: 9 },
]

export default function Departamentos() {
  const [busqueda, setBusqueda] = useState("")
  const [searchFilter, setSearchFilter] = useState({})
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filteredRows, setFilteredRows] = useState(MOCK_DEPARTAMENTOS)
  const [totalItems, setTotalItems] = useState(MOCK_DEPARTAMENTOS.length)
  const [page, setPage] = useState(0)
  const [itemSave, setItemSave] = useState({})
  const [editedItem, setEditedItem] = useState({})
  const [openModal1, setOpenModal1] = useState(false)
  const [openModal2, setOpenModal2] = useState(false)
  const [allDepartamentos, setAllDepartamentos] = useState(MOCK_DEPARTAMENTOS)

  useEffect(() => {
    SearchFilter()
  }, [])

  async function SearchFilter(numPage) {
    const currentPage = numPage !== undefined && numPage !== null ? numPage : page
    const startIndex = currentPage * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    setFilteredRows(allDepartamentos.slice(startIndex, endIndex))
    setTotalItems(allDepartamentos.length)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  async function SaveItem() {
    const newId = Math.max(...allDepartamentos.map((d) => d.id), 0) + 1
    const newDepartamento = {
      ...itemSave,
      id: newId,
    }

    const updatedDepartamentos = [...allDepartamentos, newDepartamento]
    setAllDepartamentos(updatedDepartamentos)
    alert("¡Departamento registrado exitosamente!")
    SearchFilter(page)
    handleCloseModal1()
  }

  async function updateItem() {
    const updatedDepartamentos = allDepartamentos.map((dept) => (dept.id === editedItem.id ? editedItem : dept))
    setAllDepartamentos(updatedDepartamentos)
    alert("¡Departamento actualizado exitosamente!")
    SearchFilter(page)
    handleCloseModal2()
  }

  function handleEditar(row) {
    setEditedItem({
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      precio: row.precio,
      habitaciones: row.habitaciones,
      banos: row.banos,
      area: row.area,
      tipo: row.tipo,
      estado: row.estado,
    })
    handleOpenModal2()
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
      [name]: value,
    }))
  }

  const handleOpenModal1 = () => {
    setItemSave({})
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

//   const handleDeleteDepartamento = (departamentoId) => {
//     if (confirm("¿Estás seguro de que deseas eliminar este departamento?")) {
//       const updatedDepartamentos = allDepartamentos.filter((dept) => dept.id !== departamentoId)
//       setAllDepartamentos(updatedDepartamentos)
//       alert("Departamento eliminado exitosamente")
//       SearchFilter(page)
//     }
//   }
  const handleDeleteDepartamento = (departamentoId) => {
  eliminarSwal(departamentoId, API_URL_DEPARTAMENTOS, () => {
    notificationSwal("success", "Departamento eliminado exitosamente");
    const updatedDepartamentos = allDepartamentos.filter((dept) => dept.id !== departamentoId);
    setAllDepartamentos(updatedDepartamentos);
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
              <div className="p-2 bg-blue-600 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Departamentos</h1>
                <p className="text-slate-400">Administra el inventario de propiedades disponibles</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenModal1}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Nuevo Departamento
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
              <h3 className="text-lg font-semibold text-white">Lista de Departamentos</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  placeholder="Buscar por nombre, dirección o estado..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors w-full sm:w-80"
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
                            if (column.id === "nombre") {
                              return (
                                <TableCell key={column.id}>
                                  <span className="font-semibold text-blue-400">{row.nombre}</span>
                                </TableCell>
                              )
                            }
                            if (column.id === "precio") {
                              const precioDisplay =
                                typeof row.precio === "number" ? `S/${Number(row.precio).toLocaleString()}` : row.precio
                              return <TableCell key={column.id}>{precioDisplay}</TableCell>
                            }
                            if (column.id === "area") {
                              return <TableCell key={column.id}>{row.area}</TableCell>
                            }
                            if (column.id === "estado") {
                              return (
                                <TableCell key={column.id}>
                                  <span
                                    className={`px-3 py-1 text-white text-sm rounded-md ${
                                      row.estado === "Disponible"
                                        ? "bg-green-600"
                                        : row.estado === "Vendido" || row.estado === "Agotado"
                                          ? "bg-red-600"
                                          : row.estado === "Reservado"
                                            ? "bg-yellow-600"
                                            : row.estado === "En Construcción"
                                              ? "bg-blue-600"
                                              : "bg-gray-600"
                                    }`}
                                  >
                                    {row.estado}
                                  </span>
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
                                      title="Editar Departamento"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDepartamento(row.id)}
                                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                                      title="Eliminar Departamento"
                                    >
                                      <Trash className="w-4 h-4" />
                                    </button>
                                  </div>
                                </TableCell>
                              )
                            }
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {row[column.id]}
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

          {/* Modal para Crear Departamento */}
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
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Registrar Nuevo Departamento</h2>
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
                      <Home className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Información General</h3>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nombre" className="block text-sm font-medium text-slate-300">
                        Nombre del Proyecto *
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                          name="nombre"
                          id="nombre"
                          placeholder="Ej: HIRAKI, HALIT, etc."
                          onChange={handleSaveChange}
                          value={itemSave.nombre || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de Ubicación */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Ubicación</h3>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="direccion" className="block text-sm font-medium text-slate-300">
                        Dirección *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <textarea
                          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                          name="direccion"
                          id="direccion"
                          rows="2"
                          placeholder="Ingrese la dirección completa del departamento"
                          onChange={handleSaveChange}
                          value={itemSave.direccion || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de Precio y Características */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Precio y Características</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="precio" className="block text-sm font-medium text-slate-300">
                          Precio *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                            name="precio"
                            id="precio"
                            placeholder="Ej: 268000 o 'Próximamente'"
                            onChange={handleSaveChange}
                            value={itemSave.precio || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="area" className="block text-sm font-medium text-slate-300">
                          Área *
                        </label>
                        <div className="relative">
                          <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                            name="area"
                            id="area"
                            placeholder="Ej: 62m² - 84m²"
                            onChange={handleSaveChange}
                            value={itemSave.area || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="habitaciones" className="block text-sm font-medium text-slate-300">
                          Habitaciones *
                        </label>
                        <div className="relative">
                          <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                            name="habitaciones"
                            id="habitaciones"
                            placeholder="0"
                            onChange={handleSaveChange}
                            value={itemSave.habitaciones || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="banos" className="block text-sm font-medium text-slate-300">
                          Baños *
                        </label>
                        <div className="relative">
                          <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none transition-colors"
                            name="banos"
                            id="banos"
                            placeholder="0"
                            onChange={handleSaveChange}
                            value={itemSave.banos || ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Tipo y Estado */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <Tag className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Clasificación</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="tipo" className="block text-sm font-medium text-slate-300">
                          Tipo de Propiedad *
                        </label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <select
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none transition-colors"
                            name="tipo"
                            id="tipo"
                            onChange={handleSaveChange}
                            value={itemSave.tipo || ""}
                          >
                            <option value="">Seleccionar tipo...</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Lote">Lote</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="Estudio">Estudio</option>
                            <option value="Loft">Loft</option>
                            <option value="Dúplex">Dúplex</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="estado" className="block text-sm font-medium text-slate-300">
                          Estado *
                        </label>
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <select
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none transition-colors"
                            name="estado"
                            id="estado"
                            onChange={handleSaveChange}
                            value={itemSave.estado || ""}
                          >
                            <option value="">Seleccionar estado...</option>
                            <option value="Disponible">Disponible</option>
                            <option value="Reservado">Reservado</option>
                            <option value="Vendido">Vendido</option>
                            <option value="Agotado">Agotado</option>
                            <option value="En Construcción">En Construcción</option>
                            <option value="Próximamente">Próximamente</option>
                          </select>
                        </div>
                      </div>
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
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Departamento
                </button>
              </div>
            </div>
          </Modal>

          {/* Modal para Editar Departamento */}
          <Modal
            open={openModal2}
            onClose={handleCloseModal2}
            aria-labelledby="edit-modal-title"
            className="flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Editar Departamento</h2>
                </div>
                <button
                  onClick={handleCloseModal2}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <Home className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Información General</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">Nombre del Proyecto *</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                          name="nombre"
                          onChange={(event) => {
                            const { name, value } = event.target
                            handleEditChange(name, value)
                          }}
                          value={editedItem.nombre || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de Ubicación */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Ubicación</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">Dirección *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <textarea
                          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none resize-none"
                          name="direccion"
                          rows="2"
                          onChange={(event) => {
                            const { name, value } = event.target
                            handleEditChange(name, value)
                          }}
                          value={editedItem.direccion || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de Precio y Características */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <DollarSign className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Precio y Características</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Precio *</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                            name="precio"
                            onChange={(event) => {
                              const { name, value } = event.target
                              handleEditChange(name, value)
                            }}
                            value={editedItem.precio || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Área *</label>
                        <div className="relative">
                          <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                            name="area"
                            onChange={(event) => {
                              const { name, value } = event.target
                              handleEditChange(name, value)
                            }}
                            value={editedItem.area || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Habitaciones *</label>
                        <div className="relative">
                          <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                            name="habitaciones"
                            onChange={(event) => {
                              const { name, value } = event.target
                              handleEditChange(name, value)
                            }}
                            value={editedItem.habitaciones || ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Baños *</label>
                        <div className="relative">
                          <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input
                            type="number"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                            name="banos"
                            onChange={(event) => {
                              const { name, value } = event.target
                              handleEditChange(name, value)
                            }}
                            value={editedItem.banos || ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Tipo y Estado */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                      <Tag className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Clasificación</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Tipo de Propiedad *</label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <select
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                            name="tipo"
                            onChange={(event) => {
                              const { name, value } = event.target
                              handleEditChange(name, value)
                            }}
                            value={editedItem.tipo || ""}
                          >
                            <option value="">Seleccionar tipo...</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Lote">Lote</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="Estudio">Estudio</option>
                            <option value="Loft">Loft</option>
                            <option value="Dúplex">Dúplex</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Estado *</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <select
                            className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-blue-400 focus:outline-none"
                            name="estado"
                            onChange={(event) => {
                              const { name, value } = event.target
                              handleEditChange(name, value)
                            }}
                            value={editedItem.estado || ""}
                          >
                            <option value="">Seleccionar estado...</option>
                            <option value="Disponible">Disponible</option>
                            <option value="Reservado">Reservado</option>
                            <option value="Vendido">Vendido</option>
                            <option value="Agotado">Agotado</option>
                            <option value="En Construcción">En Construcción</option>
                            <option value="Próximamente">Próximamente</option>
                          </select>
                        </div>
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
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Actualizar Departamento
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}
