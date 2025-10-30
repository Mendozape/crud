import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const CreateUser = () => {
    // State for form data
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // State for role selection
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    // State for inline validation errors
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [roleError, setRoleError] = useState("");

    // Context for global messages and navigation
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
        useContext(MessageContext);
    const navigate = useNavigate();

    const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

    // FIX 1: Clear global messages on component mount/load
    useEffect(() => {
        setSuccessMessage("");
        setErrorMessage("");
    }, [setSuccessMessage, setErrorMessage]); 

    // Function to clear all form fields and inline errors
    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setSelectedRole("");
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setRoleError("");
    };

    // Fetch available roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axios.get("/api/roles", axiosOptions);
                setRoles(res.data);
            } catch (err) {
                setErrorMessage("Error al cargar los roles."); // Error loading roles.
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // FIX 2: Clear global messages from the previous attempt before a new submission
        setSuccessMessage(""); 
        setErrorMessage(""); 

        // Reset inline errors before validation
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setRoleError("");

        // --- Client-side Validations ---
        if (!name.trim()) {
            setNameError("El Nombre es obligatorio"); // Name is required
            return;
        }
        if (!email.trim()) {
            setEmailError("El Correo Electrónico es obligatorio"); // Email is required
            return;
        }
        if (!password) {
            setPasswordError("La Contraseña es obligatoria"); // Password is required
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Las Contraseñas no coinciden"); // Passwords do not match
            return;
        }
        if (!selectedRole) {
            setRoleError("Por favor, seleccione un rol"); // Please select a role
            return;
        }

        // --- API Submission ---
        try {
            await axios.post(
                "/api/usuarios",
                {
                    name,
                    email,
                    password,
                    password_confirmation: confirmPassword, // Key required by Laravel
                    roles: [selectedRole],
                },
                axiosOptions
            );

            setSuccessMessage("Usuario creado exitosamente."); // User created successfully.
            
            resetForm(); 
            
            navigate("/users");
            
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Error al crear el usuario.";
            
            // Set the error message
            setErrorMessage(errorMsg); 
            
            // *** FIX 3: Automatically clear the error message after 5 seconds ***
            setTimeout(() => {
                // Clear the error message to prevent it from lingering
                setErrorMessage(""); 
            }, 5000); // 5000 milliseconds = 5 seconds
        }
    };

    return (
        <div className="container mt-4">
            <h2>Crear Usuario</h2>

            {/* Global messages */}
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
                        // Disable browser autofill for name
                        autoComplete="off" 
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
                        // Disable browser autofill for email
                        autoComplete="off" 
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
                        // Use 'new-password' to hint the browser not to autofill with login credentials
                        autoComplete="new-password" 
                    />
                </div>

                <div className="mb-2">
                    <input
                        type="password"
                        placeholder="Confirmar Contraseña"
                        className={`form-control ${passwordError ? "is-invalid" : ""}`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        // Use 'new-password' to hint the browser not to autofill with login credentials
                        autoComplete="new-password" 
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