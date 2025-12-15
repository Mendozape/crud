import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const axiosOptions = { withCredentials: true };

const EditUser = () => {
  const { id } = useParams();

  // User data
  const [user, setUser] = useState({});

  // Roles data
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  // Password fields
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // Validation and permission states
  const [errors, setErrors] = useState({});
  const [rolesError, setRolesError] = useState(false);

  // Messages from context
  const { setSuccessMessage, setErrorMessage, errorMessage } =
    useContext(MessageContext);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/usuarios/${id}`, axiosOptions);
        setUser(res.data);
        setSelectedRole(res.data.roles?.[0]?.id || "");
      } catch {
        setErrorMessage("Error al cargar los datos del usuario.");
      }
    };

    // Fetch roles list
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles", axiosOptions);
        setRoles(res.data);
        setRolesError(false);
      } catch (err) {
        if (err.response?.status === 403) {
          setRolesError(true);
        } else {
          setErrorMessage("Error al cargar los roles.");
        }
      }
    };

    fetchUser();
    fetchRoles();
  }, [id, setErrorMessage]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage(null);

    // Role validation
    if (!selectedRole) {
      setErrors({ roles: ["Debes seleccionar un rol"] });
      return;
    }

    // Password match validation (frontend)
    if (password && password !== passwordConfirmation) {
      setErrors({
        password_confirmation: [
          "La confirmación de la contraseña no coincide."
        ],
      });
      return;
    }

    try {
      await axios.put(
        `/api/usuarios/${id}`,
        {
          name: user.name,
          email: user.email,
          roles: [selectedRole],
          password,
          password_confirmation: passwordConfirmation,
        },
        axiosOptions
      );

      setSuccessMessage("Usuario actualizado correctamente.");
      navigate("/users");

    } catch (err) {
      console.error(err);

      // Permission denied
      if (err.response?.status === 403) {
        setErrorMessage(
          err.response.data?.error ||
          "No tienes permisos para actualizar este usuario."
        );
        return;
      }

      // Validation errors from backend
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        return;
      }

      // Generic error
      setErrorMessage("Error al actualizar el usuario.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Editar Usuario</h2>

      {/* Global error message */}
      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      {/* Permission warning */}
      {rolesError && (
        <div className="alert alert-danger">
          No tienes permisos para ver o modificar los roles.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <input
          type="text"
          placeholder="Nombre"
          className={`form-control mb-1 ${errors.name ? "is-invalid" : ""}`}
          value={user.name || ""}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name[0]}</div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Correo electrónico"
          className={`form-control mb-1 ${errors.email ? "is-invalid" : ""}`}
          value={user.email || ""}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email[0]}</div>
        )}

        {/* Roles */}
        <select
          className={`form-control mb-1 ${errors.roles ? "is-invalid" : ""}`}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={rolesError}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.roles && (
          <div className="invalid-feedback">{errors.roles[0]}</div>
        )}

        {/* Password */}
        <input
          type="password"
          placeholder="Nueva contraseña (opcional)"
          className={`form-control mb-1 ${errors.password ? "is-invalid" : ""}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <div className="invalid-feedback">{errors.password[0]}</div>
        )}

        {/* Confirm password */}
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
          <div className="invalid-feedback">
            {errors.password_confirmation[0]}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={rolesError || !selectedRole}
        >
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default EditUser;
