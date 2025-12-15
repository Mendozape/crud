import React, { useEffect, useState, useContext } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

const endpoint = "/api/usuarios";
const axiosOptions = { withCredentials: true };

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const {
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
  } = useContext(MessageContext);

  const navigate = useNavigate();

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(endpoint, axiosOptions);
      const data = res.data.data || res.data;
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);

      let errorMsg = "Fallo al cargar los usuarios";

      if (err.response) {
        errorMsg =
          err.response.data.error ||
          err.response.data.message ||
          errorMsg;
      }

      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search
  useEffect(() => {
    const result = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(result);
  }, [search, users]);

  // Prepare delete modal
  const confirmDelete = (id) => {
    setUserToDelete(id);
    setShowModal(true);
  };

  // Delete user
  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`${endpoint}/${userToDelete}`, axiosOptions);
      setShowModal(false);
      setUserToDelete(null);
      fetchUsers();
      setSuccessMessage("Usuario eliminado exitosamente");
    } catch (err) {
      console.error(err);

      // Close modal so error message can be seen
      setShowModal(false);
      setUserToDelete(null);

      let errorMsg = "Error al eliminar usuario";

      if (err.response) {
        errorMsg =
          err.response.data.error ||
          err.response.data.message ||
          errorMsg;
      }

      setErrorMessage(errorMsg);
    }
  };

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  // Auto-clear error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  // DataTable columns
  const columns = [
    {
      name: "Nombre",
      selector: (u) => u.name,
      sortable: true,
      width: "150px",
    },
    {
      name: "Email",
      selector: (u) => u.email || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Roles",
      cell: (u) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {u.roles && u.roles.length > 0
            ? u.roles.map((r, idx) => (
                <span
                  key={idx}
                  className="btn btn-primary btn-sm"
                  style={{ cursor: "default" }}
                >
                  {r.name}
                </span>
              ))
            : "-"}
        </div>
      ),
      grow: 1,
      minWidth: "200px",
    },
    {
      name: "Permisos",
      cell: (u) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {u.permissions && u.permissions.length > 0
            ? u.permissions.map((p, idx) => (
                <span
                  key={idx}
                  className="btn btn-info btn-sm"
                  style={{ cursor: "default" }}
                >
                  {p.name}
                </span>
              ))
            : "-"}
        </div>
      ),
      grow: 2,
    },
    {
      name: "Acciones",
      right: true,
      cell: (u) => (
        <div
          className="d-flex gap-2 justify-content-end"
          style={{ whiteSpace: "nowrap" }}
        >
          <button
            className="btn btn-info btn-sm"
            onClick={() => navigate(`/users/edit/${u.id}`)}
          >
            Editar
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => confirmDelete(u.id)}
          >
            Eliminar
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  return (
    <div className="mb-4 border border-primary rounded p-3">
      {/* Top controls */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className="btn btn-warning btn-sm"
          onClick={() => navigate("/users/create")}
        >
          Crear usuario
        </button>
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="form-control w-25 form-control-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success text-center">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger text-center">
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <DataTable
        title="Lista de Usuarios"
        columns={columns}
        data={filteredUsers}
        progressPending={loading}
        pagination
        highlightOnHover
        striped
      />

      {/* Delete modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : "d-none"}`}
        tabIndex="-1"
      >
        <div className="modal-dialog">
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
              ¿Está seguro de eliminar el usuario?
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={deleteUser}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowUsers;
