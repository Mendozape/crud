import React, { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

const endpoint = "http://localhost:8000/api/permisos";

const axiosOptions = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
};

export default function PermisosList() {
  const [permisos, setPermisos] = useState([]);
  const [filteredPermisos, setFilteredPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(MessageContext);
  const navigate = useNavigate();

  // Fetch all permisos (no server pagination)
  const fetchPermisos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(endpoint, axiosOptions);
      setPermisos(response.data);
      setFilteredPermisos(response.data);
    } catch (error) {
      console.error("Error fetching permisos:", error);
      setErrorMessage("Error al cargar los permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  // Real-time search
  useEffect(() => {
    const result = permisos.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPermisos(result);
  }, [search, permisos]);

  const deletePermiso = async (id) => {
    if (!window.confirm("¿Seguro de borrar este permiso?")) return;
    try {
      await axios.delete(`${endpoint}/${id}`, axiosOptions);
      setSuccessMessage("Permiso eliminado exitosamente.");
      fetchPermisos(); // refresh list
    } catch (error) {
      console.error(error);
      setErrorMessage("Error al eliminar el permiso.");
    }
  };

  const editPermiso = (id) => navigate(`/permissions/edit/${id}`);
  const createPermiso = () => navigate("/permissions/create");

  const columns = [
    { name: "Nombre del Permiso", selector: (row) => row.name, sortable: true },
    {
      name: "Acciones",
      right: true,
      cell: (row) => (
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-info btn-sm"
            onClick={() => editPermiso(row.id)}
          >
            Editar
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => deletePermiso(row.id)}
          >
            Borrar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-4 border border-primary rounded p-3">
      <div className="d-flex justify-content-between mb-2">
        <button
          className="btn btn-success btn-sm text-white"
          onClick={createPermiso}
        >
          Crear Permiso
        </button>
        <input
          type="text"
          className="form-control form-control-sm w-25"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {successMessage && (
        <div className="alert alert-success text-center">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="alert alert-danger text-center">{errorMessage}</div>
      )}

      <DataTable
        title="Lista de Permisos"
        columns={columns}
        data={filteredPermisos}
        progressPending={loading}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 15, 20]}
        highlightOnHover
        selectableRows
        selectableRowsHighlight
        striped
      />
    </div>
  );
}
