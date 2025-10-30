import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function PermisoCreate() {
const [name, setName] = useState("");
const [permissions, setPermissions] = useState([]);
const [nameError, setNameError] = useState(""); // Para validación debajo del input
const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(MessageContext);
const navigate = useNavigate();

const axiosOptions = {
    withCredentials: true,
    headers: { Accept: "application/json" },
};

// Fetch existing permissions
useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/permisos", axiosOptions);
        setPermissions(res.data);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setErrorMessage("Error al cargar los permisos existentes.");
      }
    };
    fetchPermissions();
}, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError(""); // Reset local validation error

    if (!name.trim()) {
      setNameError("El nombre del permiso es obligatorio."); // Mensaje debajo del input
      setErrorMessage("Debe ingresar un nombre de permiso."); // Mensaje global
      return;
    }

    if (permissions.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setNameError("Este nombre de permiso ya existe."); // Mensaje debajo del input
      setErrorMessage("El nombre de permiso ya existe."); // Mensaje global
      return;
    }

    try {
      const res = await axios.post("/api/permisos", { name }, axiosOptions);
      setSuccessMessage(res.data.message || "Permiso creado exitosamente.");
      setErrorMessage(null);
      navigate("/permissions");
    } catch (error) {
      console.error("Error creating permiso:", error);
      setErrorMessage(error.response?.data?.message || "Error al crear el permiso.");
      setSuccessMessage(null);
    }
};

return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Crear Permiso</h2>

          {/* Show success/error messages */}
          <div className="col-md-12 mb-3">
            {successMessage && (
              <div className="alert alert-success text-center">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="alert alert-danger text-center">{errorMessage}</div>
            )}
          </div>

          {/* Input for permission name */}
          <div className="mb-3">
            <label className="form-label font-semibold">Nombre del Permiso</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-control ${nameError ? "is-invalid" : ""}`}
              placeholder="Ingrese el nombre del permiso"
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>

          {/* Existing permissions below input */}
          {permissions.length > 0 && (
            <div className="mb-3">
              <label className="form-label font-semibold">Permisos existentes</label>
              <ul className="list-group">
                {permissions.map((p) => (
                  <li key={p.id} className="list-group-item">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit button */}
          <div className="d-flex justify-content-end">
            <button onClick={handleSubmit} className="btn btn-success text-white">
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
);
}