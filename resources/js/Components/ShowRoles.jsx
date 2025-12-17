import React, { useEffect, useState, useContext, useMemo } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";
// 🚨 Import the hook
import usePermission from "../hooks/usePermission"; 

const endpoint = "/api/roles";

// 🚨 Receive 'user' as a prop
export default function ShowRoles({ user }) {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // 🚨 Initialize the permission hook
  const { can } = usePermission(user);

  // 🛡️ EXTRACTION TO CONSTANTS: Evaluated safely if user exists
  const canCreate = user ? can('Crear-roles') : false;
  const canEdit = user ? can('Editar-roles') : false;
  const canDelete = user ? can('Eliminar-roles') : false;

  const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(MessageContext);

  const navigate = useNavigate();
  const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

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

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const result = roles.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRoles(result);
  }, [search, roles]);

  const deleteRole = async (id) => {
    try {
      await axios.delete(`${endpoint}/${id}`, axiosOptions);
      setSuccessMessage("Rol eliminado exitosamente.");
      fetchRoles();
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al eliminar el rol.");
    }
  };

  // 🚨 UseMemo for columns to handle dynamic permissions correctly
  const columns = useMemo(() => [
    { name: "Rol", selector: (r) => r.name, sortable: true },
    {
      name: "Acciones",
      right: true,
      cell: (r) => (
        <div className="d-flex gap-2 justify-content-end">
          {/* 🛡️ canEdit Check */}
          {canEdit && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/roles/edit/${r.id}`)}
            >
              Editar
            </button>
          )}
          
          {/* 🛡️ canDelete Check */}
          {canDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                setRoleToDelete(r.id);
                setShowModal(true);
              }}
            >
              Eliminar
            </button>
          )}
        </div>
      ),
    },
  ], [canEdit, canDelete, navigate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  // 🛑 GUARD REMOVED: We don't block the whole component with "Cargando permisos".
  // If user is not yet loaded, canCreate/canEdit/canDelete will simply be false 
  // until App.jsx updates the state and re-renders this component.

  return (
    <div className="mb-4 border border-primary rounded p-3">
      <div className="d-flex justify-content-between mb-2">
        {/* 🛡️ canCreate Check */}
        {canCreate ? (
          <button
            className="btn btn-success btn-sm text-white"
            onClick={() => navigate("/roles/create")}
          >
            Nuevo Role
          </button>
        ) : (
          <div /> // Spacer
        )}
        
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="form-control w-25 form-control-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="col-md-12 mt-4">
        {successMessage && (
          <div className="alert alert-success text-center">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger text-center">{errorMessage}</div>
        )}
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

      {/* Bootstrap Modal Confirm */}
      <div
        className={`modal fade ${showModal ? "show d-block" : "d-none"}`}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmar Eliminación</h5>
              <button
                type="button"
                className="close"
                onClick={() => setShowModal(false)}
              >
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              ¿Está seguro de que desea eliminar este rol?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deleteRole(roleToDelete);
                  setShowModal(false);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}