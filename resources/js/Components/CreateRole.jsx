import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function CreateRole() {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate();

  const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/permisos", axiosOptions);
        setPermissions(res.data);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setErrorMessage("Error al cargar los permisos.");
      }
    };
    fetchPermissions();
  }, []);

  const togglePermission = (id) => {
    setSelectedPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/roles", { name, permission: selectedPermissions }, axiosOptions);
      setSuccessMessage("Rol creado exitosamente.");
      navigate("/roles");
    } catch (err) {
      console.error(err);
      setErrorMessage("Error al crear el rol.");
    }
  };

  return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-center mb-4 text-2xl font-bold">Crear Rol</h2>

          <div className="mb-3">
            <label className="form-label font-semibold">Nombre del Rol</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-control" placeholder="Ingrese el nombre del rol" />
          </div>

          <div className="mb-3">
            <label className="form-label font-semibold">Permisos:</label>
            {permissions.map(p => (
              <div key={p.id} className="form-check">
                <input type="checkbox" className="form-check-input" id={`perm-${p.id}`} value={p.id}
                  checked={selectedPermissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
                <label className="form-check-label" htmlFor={`perm-${p.id}`}>{p.name}</label>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end">
            <button className="btn btn-success text-white" onClick={handleSubmit}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
