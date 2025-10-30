import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function PermisoEdit() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate();

  // Global axios options with credentials
  const axiosOptions = {
    withCredentials: true,
    headers: { Accept: "application/json" },
  };

  useEffect(() => {
    const fetchPermiso = async () => {
      try {
        const res = await axios.get(`/api/permisos/${id}`, axiosOptions);
        console.log("Permiso API response:", res.data); // <<== check what it returns
        setName(res.data.name);
      } catch (error) {
        console.error("Error fetching permiso:", error);
        setErrorMessage("Fallo al cargar el permiso.");
      }
    };
    fetchPermiso();
  }, [id, setErrorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/permisos/${id}`, { name }, axiosOptions);
      setSuccessMessage("Permiso actualizado exitosamente.");
      navigate("/permissions");
    } catch (error) {
      console.error("Error updating permiso:", error);
      setErrorMessage("Error al actualizar el permiso.");
    }
  };

  return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Editar Permiso</h2>

          {/** Input for the permission name */}
          <div className="mb-3">
            <label className="form-label font-semibold">Nombre del Permiso</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Ingrese el nombre del permiso"
            />
          </div>

          {/** Update button */}
          <div className="d-flex justify-content-end">
            <button
              onClick={handleSubmit}
              className="btn btn-primary text-white"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}