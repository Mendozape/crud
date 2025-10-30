import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(MessageContext);
  const navigate = useNavigate();

  const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles", axiosOptions);
        setRoles(res.data);
      } catch (err) {
        setErrorMessage("Error al cargar los roles.");
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset inline errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");

    // Validations
    if (!name.trim()) {
      setNameError("El Nombre es obligatorio");
      return;
    }
    if (!email.trim()) {
      setEmailError("El Correo Electrónico es obligatorio");
      return;
    }
    if (!password) {
      setPasswordError("La Contraseña es obligatoria");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Las Contraseñas no coinciden");
      return;
    }
    if (!selectedRole) {
      setRoleError("Por favor, seleccione un rol");
      return;
    }

    try {
      await axios.post(
        "/api/usuarios",
        {
          name,
          email,
          password,
          password_confirmation: confirmPassword, // Correct key for Laravel
          roles: [selectedRole],
        },
        axiosOptions
      );

      setSuccessMessage("Usuario creado exitosamente.");
      navigate("/users");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Error al crear el usuario.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Usuario</h2>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Nombre"
            className={`form-control ${nameError ? "is-invalid" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <div className="invalid-feedback">{nameError}</div>}
        </div>

        <div className="mb-2">
          <input
            type="email"
            placeholder="Correo Electrónico"
            className={`form-control ${emailError ? "is-invalid" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>

        <div className="mb-2">
          <input
            type="password"
            placeholder="Contraseña"
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
        </div>

        <div className="mb-3">
          <select
            className={`form-control ${roleError ? "is-invalid" : ""}`}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Seleccione un rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          {roleError && <div className="invalid-feedback">{roleError}</div>}
        </div>

        <button type="submit" className="btn btn-success">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default CreateUser;