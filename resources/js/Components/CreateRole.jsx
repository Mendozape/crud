import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function CreateRole() {
const [name, setName] = useState("");
const [roles, setRoles] = useState([]);
const [permissions, setPermissions] = useState([]);
const [selectedPermissions, setSelectedPermissions] = useState([]);
const [nameError, setNameError] = useState(""); // Message below the input
const [permissionError, setPermissionError] = useState(""); // Message below the checkboxes

const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(MessageContext);
const navigate = useNavigate();

const axiosOptions = {
    withCredentials: true,
    headers: { Accept: "application/json" },
};

useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles", axiosOptions);
        setRoles(res.data);
      } catch {
        setErrorMessage("Error al cargar los roles existentes.");
      }
    };
    fetchRoles();

    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/permisos", axiosOptions);
        setPermissions(res.data);
      } catch {
        setErrorMessage("Error al cargar los permisos.");
      }
    };
    fetchPermissions();
}, []);

const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
};

const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset inline errors
    setNameError("");
    setPermissionError("");

    // Inline and global validations
    if (!name.trim()) {
      setNameError("El nombre del rol es obligatorio."); // Below the input
      setErrorMessage("Debe ingresar un nombre de rol."); // Global
      return;
    }

    if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setNameError("El nombre del rol ya existe."); // Below the input
      setErrorMessage("El nombre del rol ya existe."); // Global
      return;
    }

    if (selectedPermissions.length === 0) {
      setPermissionError("Debe seleccionar al menos un permiso."); // Below the checkboxes
      setErrorMessage("Debe seleccionar al menos un permiso."); // Global
      return;
    }

    try {
      await axios.post(
        "/api/roles",
        { name, permission: selectedPermissions },
        axiosOptions
      );
      setSuccessMessage("Rol creado exitosamente.");
      setErrorMessage(null);
      setName("");
      setSelectedPermissions([]);
      navigate("/roles");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Error al crear el rol.");
    }
};

// Auto-clear global messages
useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
}, [successMessage]);

useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
}, [errorMessage]);

return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-center mb-4 text-2xl font-bold">Crear Rol</h2>

          {/* Global messages */}
          {successMessage && (
            <div className="alert alert-success text-center">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          )}

          {/* Role name */}
          <div className="mb-3">
            <label className="form-label font-semibold">Nombre del Rol</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-control ${nameError ? "is-invalid" : ""}`}
              placeholder="Ingrese el nombre del rol"
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>

          {/* Existing roles */}
          {roles.length > 0 && (
            <div className="mb-3">
              <label className="form-label font-semibold">Roles Existentes</label>
              <ul className="list-group">
                {roles.map((r) => (
                  <li key={r.id} className="list-group-item">{r.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Permissions */}
          <div className="mb-3">
            <label className="form-label font-semibold">Permisos</label>
            {permissions.map((p) => (
              <div key={p.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`perm-${p.id}`}
                  value={p.id}
                  checked={selectedPermissions.includes(p.id)}
                  onChange={() => togglePermission(p.id)}
                />
                <label className="form-check-label" htmlFor={`perm-${p.id}`}>
                  {p.name}
                </label>
              </div>
            ))}
            {permissionError && <div className="text-danger mt-1">{permissionError}</div>}
          </div>

          {/* Save button */}
          <div className="d-flex justify-content-end">
            <button onClick={handleSubmit} className="btn btn-success text-white">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
);
}