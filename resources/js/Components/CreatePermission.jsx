import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function PermisoCreate() {
  const [name, setName] = useState("");
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate();

  // Global axios options with credentials
  const axiosOptions = {
    withCredentials: true,
    headers: { Accept: "application/json" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/permisos", { name }, axiosOptions);
      setSuccessMessage(res.data.message);
      // Navigate back to the list page
      navigate("/permissions");
    } catch (error) {
      console.error("Error creating permiso:", error);
      setErrorMessage("Error al crear el permiso.");
    }
  };

  return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Crear Permiso</h2>

          {/** Input for permission name */}
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

          {/** Submit button */}
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
