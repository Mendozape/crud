import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const axiosOptions = { withCredentials: true };

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        comments: ""
    });

    // Roles and selection
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");

    // Password fields
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    // Validation and permission UI states
    const [errors, setErrors] = useState({});
    const [rolesError, setRolesError] = useState(false);

    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);

    /**
     * Initial data load: Fetches the user details and the roles catalog.
     */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`/api/usuarios/${id}`, axiosOptions);
                const userData = res.data;
                setUser({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    comments: userData.comments || ""
                });
                // Assuming roles is an array, we take the ID of the first one
                setSelectedRole(userData.roles?.[0]?.id || "");
            } catch {
                setErrorMessage("Error al cargar los datos del usuario.");
            }
        };

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

    /**
     * Form submission handler
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setErrorMessage(null);

        // --- FRONTEND VALIDATIONS ---
        if (!selectedRole) {
            setErrors({ roles: ["Debes seleccionar un rol"] });
            return;
        }

        if (password && password !== passwordConfirmation) {
            setErrors({
                password_confirmation: ["La confirmación de la contraseña no coincide."]
            });
            return;
        }

        // --- API REQUEST ---
        try {
            await axios.put(
                `/api/usuarios/${id}`,
                {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    comments: user.comments,
                    roles: [selectedRole],
                    password: password || undefined, // Send only if filled
                    password_confirmation: password ? passwordConfirmation : undefined,
                },
                axiosOptions
            );

            setSuccessMessage("Usuario/Residente actualizado correctamente.");
            navigate("/users");

        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                setErrorMessage(err.response.data?.error || "No tienes permisos.");
            } else if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrorMessage("Error al actualizar el usuario.");
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                    <h2 className="mb-0 h4">Editar Usuario o Residente</h2>
                </div>
                <div className="card-body">
                    {/* Global Messages */}
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    {rolesError && <div className="alert alert-warning">No tienes permisos para modificar roles.</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            {/* Full Name */}
                            <div className="col-md-6">
                                <label className="form-label">Nombre Completo</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    value={user.name}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    required
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                            </div>

                            {/* Email Address */}
                            <div className="col-md-6">
                                <label className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    required
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                            </div>
                        </div>

                        <div className="row mb-3">
                            {/* Phone Number */}
                            <div className="col-md-6">
                                <label className="form-label">Teléfono de Contacto</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user.phone}
                                    onChange={(e) => setUser({ ...user, phone: e.target.value.replace(/[^0-9]/g, "") })}
                                    placeholder="10 dígitos"
                                />
                            </div>

                            {/* Roles Selection */}
                            <div className="col-md-6">
                                <label className="form-label">Rol del Sistema</label>
                                <select
                                    className={`form-control ${errors.roles ? "is-invalid" : ""}`}
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
                                {errors.roles && <div className="invalid-feedback">{errors.roles[0]}</div>}
                            </div>
                        </div>

                        <div className="row mb-3">
                            {/* Password Update */}
                            <div className="col-md-6">
                                <label className="form-label">Nueva Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                            </div>

                            {/* Confirm Password */}
                            <div className="col-md-6">
                                <label className="form-label">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password_confirmation && (
                                    <div className="invalid-feedback">{errors.password_confirmation[0]}</div>
                                )}
                            </div>
                        </div>

                        {/* Internal Comments */}
                        <div className="mb-4">
                            <label className="form-label">Comentarios / Notas Internas</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={user.comments}
                                onChange={(e) => setUser({ ...user, comments: e.target.value })}
                                placeholder="Notas adicionales..."
                            ></textarea>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary px-5"
                                disabled={rolesError || !selectedRole}
                            >
                                <i className="fas fa-sync-alt me-1"></i> Actualizar
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary px-4"
                                onClick={() => navigate("/users")}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUser;