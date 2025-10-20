import { useState, useEffect } from "react"
import { Users, Plus, Edit2, Trash2, Search, UserPlus, RefreshCw, X } from 'lucide-react'
import { API_URL_USERS, eliminarSwal, fetchAPIAsync, notificationSwal } from "../../../common/common"
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TableRow from '@mui/material/TableRow';
import Modal from '@mui/material/Modal';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


const columns = [
  // { id: 'id', label: 'ID', minWidth: 10, key: 1 },
  { id: 'nombre', label: 'Nombre', minWidth: 10, key: 2 },
  { id: 'email', label: 'Email', minWidth: 10, key: 3 },
]
export default function Usuarios() {
  const [nuevo, setNuevo] = useState({
    name: "",
    email: "",
    phone: "",
    dni: "",
    password: "",
    is_active: true
  })

  const [editedItem, setEditedItem] = useState(0);
  const [busqueda, setBusqueda] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchFilter, setSearchFilter] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredRows, setFilteredRows] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [itemSave, setItemSave] = useState({});

  useEffect(() => {
    SearchFilter()
  }, [])

  async function SearchFilter(numPage) {
    let filter = searchFilter;
    filter.page = numPage + 1;
    filter.paginate = rowsPerPage;
    if (numPage === undefined || numPage === null) {
      filter.page = page + 1;
    }
    try {
      const result = await fetchAPIAsync(API_URL_USERS, filter, 'GET');
    //   setFilteredRows(result?.data);
    //   setTotalItems(result?.total);
      setFilteredRows(result);
      setTotalItems(result.length);
    } catch (error) {
      notificationSwal('error', error);
    }
  }

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setNuevo({ ...nuevo, [e.target.name]: value })
  }

  const SaveItem = async (e) => {
    try {
      const result = await fetchAPIAsync(API_URL_USERS, itemSave, 'POST');
      notificationSwal('success', '¡Se registró  de forma exitosa!');
      handleCloseModal1();
      SearchFilter(page);
      console.log(result);
    } catch (_) {
      notificationSwal('error', 'No se pudo registrar.');
      handleCloseModal1();
    }
  }

  const handleSaveChange = (event) => {
    const { name, value } = event.target;
    setItemSave((prevSearch) => ({
      ...prevSearch,
      [name]: value
    }));
  };

  const handleEditChange = (name, value) => {
    setEditedItem((prevEditedItem) => ({
      ...prevEditedItem,
      [name]: value
    }));
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await SearchFilter(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

   function handleEditar(row) {
    setEditedItem({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      phone: row.phone,
      dni: row.dni,
      is_active: row.is_active,
    });
    handleOpenModal2();
  }
 async function updateItem() {
    const elementoId = editedItem.id;
    await editarSwal(API_URL_USERS, elementoId, editedItem, SearchFilter);
    handleCloseModal2();
  }

  // Eliminar usuario
  const handleDeleteUser = (userId) => {
  eliminarSwal(userId, API_URL_USERS, () => {
    notificationSwal("success", "Usuario eliminado exitosamente");
    SearchFilter(page);
  });
};

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };


  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-slate-400">Administra los usuarios del sistema</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
             <button
                onClick={handleOpenModal1}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </button>

              <button
                onClick={SearchFilter}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 px-4 py-2 rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Búsqueda y Lista */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          {/* Header de la tabla con búsqueda */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">
                Lista de Usuarios
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  placeholder="Buscar por nombre, email, teléfono o DNI..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-400 focus:border-emerald-400 focus:outline-none transition-colors w-full sm:w-80"
                />
              </div>
            </div>
          </div>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                      {/* Columna adicional para botones de acción */}
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {columns.map((column) => (
                            <TableCell key={column.id} align={column.align}>
                              {row[column.id]}
                            </TableCell>
                          ))}
                          <TableCell>
                              <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditar(row)}
                              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                              title="Editar Usuario"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                           <button
      onClick={() => handleDeleteUser(row.id)}
      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
      title="Eliminar Usuario"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
                          </TableCell>
                        </TableRow>
                      );
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

          <Modal
            open={openModal1}
            onClose={handleCloseModal1}
            aria-labelledby="registration-modal-title"
            aria-describedby="registration-modal-description"
            className="flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Registrar Nuevo Usuario</h2>
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
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                        name="name"
                        id="name"
                        placeholder="Ingrese el nombre"
                        onChange={handleSaveChange}
                        value={itemSave.name || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                        Email *
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                        name="email"
                        id="email"
                        placeholder="Ingrese el email"
                        onChange={handleSaveChange}
                        value={itemSave.email || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                        name="password"
                        id="password"
                        placeholder="Ingrese la contraseña"
                        onChange={handleSaveChange}
                        value={itemSave.password || ""}
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
                  Registrar Usuario
                </button>
              </div>
            </div>
          </Modal>
        </div>
        <Modal
          open={openModal2}
          onClose={handleCloseModal2}
          aria-labelledby="edit-modal-title"
          className="flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Editar Usuario</h2>
              </div>
              <button
                onClick={handleCloseModal2}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nombre" className="block text-sm font-medium text-slate-300">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                      name="nombre"
                      id="nombre"
                      placeholder="Ingrese el nombre"
                      onChange={e => handleEditChange("nombre", e.target.value)}
                      value={editedItem.nombre || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                      name="email"
                      id="email"
                      placeholder="Ingrese el email"
                      onChange={e => handleEditChange("email", e.target.value)}
                      value={editedItem.email || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                      Password *
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 focus:border-emerald-400 focus:outline-none"
                      name="password"
                      id="password"
                      placeholder="Ingrese el password"
                      onChange={e => handleEditChange("password", e.target.value)}
                      value={editedItem.password || ""}
                    />
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
                <Edit2 className="w-4 h-4" />
                Actualizar Usuario
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}