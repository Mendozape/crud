import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const CreateUser = () => {
    // --- STATE FOR FORM DATA ---
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // NEW: Unified fields for residents/users
    const [phone, setPhone] = useState("");
    const [comments, setComments] = useState("");

    // --- STATE FOR ROLE SELECTION ---
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    // --- STATE FOR INLINE VALIDATION ERRORS ---
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [roleError, setRoleError] = useState("");

    // Context for global messages and navigation
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
        useContext(MessageContext);
    const navigate = useNavigate();

    const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

    // Clear global messages on component mount
    useEffect(() => {
        setSuccessMessage("");
        setErrorMessage("");
    }, [setSuccessMessage, setErrorMessage]);

    /**
     * Resets all form fields and error states to initial values
     */
    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setComments("");
        setSelectedRole("");
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setRoleError("");
    };

    /**
     * Fetches available roles from the API to populate the select dropdown
     */
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

    /**
     * Handles the form submission logic
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous messages
        setSuccessMessage("");
        setErrorMessage("");
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setRoleError("");

        // --- CLIENT-SIDE VALIDATIONS ---
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

        // --- API SUBMISSION ---
        try {
            await axios.post(
                "/api/usuarios",
                {
                    name,
                    email,
                    password,
                    password_confirmation: confirmPassword,
                    phone,
                    comments,
                    roles: [selectedRole], // Laravel expects an array of role names or IDs
                },
                axiosOptions
            );

            setSuccessMessage("Usuario/Residente creado exitosamente.");
            resetForm();
            navigate("/users");

        } catch (err) {
            console.error(err);
            let errorMsg = "Error al crear el usuario.";

            if (err.response) {
                // Priority: Backend custom error -> Laravel message -> Fallback
                errorMsg = err.response.data.error || err.response.data.message || errorMsg;
            }

            setErrorMessage(errorMsg);
            // Auto-hide error after 5 seconds
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0 h4">Crear Nuevo Usuario o Residente</h2>
                </div>
                <div className="card-body">
                    {/* Global messages */}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            {/* Full Name */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Nombre Completo</label>
                                <input
                                    type="text"
                                    className={`form-control ${nameError ? "is-invalid" : ""}`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="off"
                                    placeholder="Ej. Juan Pérez"
                                />
                                {nameError && <div className="invalid-feedback">{nameError}</div>}
                            </div>

                            {/* Email Address */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className={`form-control ${emailError ? "is-invalid" : ""}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    placeholder="correo@ejemplo.com"
                                />
                                {emailError && <div className="invalid-feedback">{emailError}</div>}
                            </div>
                        </div>

                        <div className="row">
                            {/* Phone Number - NEW UNIFIED FIELD */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Teléfono de Contacto</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                                    placeholder="10 dígitos"
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Rol del Sistema</label>
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
                        </div>

                        <div className="row">
                            {/* Password */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className={`form-control ${passwordError ? "is-invalid" : ""}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className={`form-control ${passwordError ? "is-invalid" : ""}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                            </div>
                        </div>

                        {/* Comments - NEW UNIFIED FIELD */}
                        <div className="mb-3">
                            <label className="form-label">Comentarios / Notas Internas</label>
                            <textarea
                                className="form-control"
                                rows="2"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Notas adicionales sobre el usuario o residente..."
                            ></textarea>
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-success px-4">
                                <i className="fas fa-save me-1"></i> Guardar
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate("/users")}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateUser;