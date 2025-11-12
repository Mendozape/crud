import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/usuarios/${id}`);
        setUser(res.data);
        setSelectedRole(res.data.roles?.[0]?.id || "");
      } catch {
        setErrorMessage("Error al cargar los datos del usuario.");
      }
    };

    // Fetch roles
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles");
        setRoles(res.data);
      } catch {
        setErrorMessage("Error al cargar los roles.");
      }
    };

    fetchUser();
    fetchRoles();
  }, [id, setErrorMessage]);

  // Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await axios.put(`/api/usuarios/${id}`, {
        ...user,
        roles: [selectedRole],
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccessMessage("Usuario actualizado correctamente.");
      navigate("/users");
    } catch (err) {
      if (err.response && err.response.status === 422) {
        // Laravel validation errors
        setErrors(err.response.data.errors);
      } else {
        setErrorMessage("Error al actualizar el usuario.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Editar Usuario</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <input
          type="text"
          placeholder="Nombre"
          className={`form-control mb-1 ${errors.name ? "is-invalid" : ""}`}
          value={user.name || ""}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}

        {/* Email */}
        <input
          type="email"
          placeholder="email"
          className={`form-control mb-1 ${errors.email ? "is-invalid" : ""}`}
          value={user.email || ""}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}

        {/* Role */}
        <select
          className={`form-control mb-1 ${errors.roles ? "is-invalid" : ""}`}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {errors.roles && <div className="invalid-feedback">{errors.roles[0]}</div>}

        {/* Password */}
        <input
          type="password"
          placeholder="Nueva contraseña (opcional)"
          className={`form-control mb-1 ${errors.password ? "is-invalid" : ""}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          className={`form-control mb-3 ${
            errors.password_confirmation ? "is-invalid" : ""
          }`}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
        {errors.password_confirmation && (
          <div className="invalid-feedback">{errors.password_confirmation[0]}</div>
        )}

        <button type="submit" className="btn btn-primary w-100">
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default EditUser;
