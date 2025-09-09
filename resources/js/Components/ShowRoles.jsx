import React, { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

const endpoint = "/api/roles";

export default function ShowRoles() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate();
  const location = useLocation(); // <-- capturamos state del navigate

  const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

  // Mostrar mensaje de éxito enviado por EditRole (si existe)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Limpiamos el state para que no se repita
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, setSuccessMessage, navigate, location.pathname]);

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(endpoint, axiosOptions);
      setRoles(res.data);
      setFilteredRoles(res.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setErrorMessage("Error al cargar los roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  useEffect(() => {
    const result = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    setFilteredRoles(result);
  }, [search, roles]);

  const deleteRole = async (id) => {
    if (!window.confirm("¿Seguro de borrar este rol?")) return;
    try {
      await axios.delete(`${endpoint}/${id}`, axiosOptions);
      setSuccessMessage("Rol eliminado exitosamente.");
      fetchRoles();
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al eliminar el rol.");
    }
  };

  const columns = [
    { name: "Rol", selector: r => r.name, sortable: true },
    {
      name: "Acciones",
      right: true,
      cell: r => (
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/roles/edit/${r.id}`)}>Editar</button>
          <button className="btn btn-danger btn-sm" onClick={() => deleteRole(r.id)}>Borrar</button>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-4 border border-primary rounded p-3">
      <div className="d-flex justify-content-between mb-2">
        <button className="btn btn-success btn-sm text-white" onClick={() => navigate("/roles/create")}>
          Nuevo Rol
        </button>
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="form-control w-25 form-control-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        title="Lista de Roles"
        columns={columns}
        data={filteredRoles}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
      />
    </div>
  );
}
