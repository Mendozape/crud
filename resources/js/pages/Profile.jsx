import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(user || {});
  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState(""); // store error messages

  // Si los datos de usuario no se pasaron desde Blade, obtenerlos desde la API
  useEffect(() => {
    if (!user) {
      axios
        .get("/api/user")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Failed to fetch user:", err));
    }
  }, [user]);

  // Maneja los cambios en el formulario de información de perfil
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Maneja los cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Envía la información de perfil actualizada
  const updateProfile = async (e) => {
    e.preventDefault();
    setError(""); // reset errors
    try {
      await axios.put("/user/profile-information", profile);
      setStatus("Perfil actualizado exitosamente.");
    } catch (err) {
      console.error(err);
      setStatus("");
      if (err.response?.data?.errors) {
        // Errores de validación de Laravel
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        setError(messages);
      } else {
        setError("Error al actualizar el perfil.");
      }
    }
  };

  // Envía la contraseña actualizada
  const updatePassword = async (e) => {
    e.preventDefault();
    setError(""); // reset errors
    try {
      await axios.put("/user/password", passwords);
      setStatus("Contraseña actualizada exitosamente.");
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      console.error(err);
      setStatus("");
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        setError(messages);
      } else {
        setError("Error al actualizar la contraseña.");
      }
    }
  };

  if (!profile) return <div>Cargando información del usuario...</div>;

  return (
    <div className="container mt-3">
      <h1>Mi Perfil</h1>

      {/* Mensaje de Éxito */}
      {status && <div className="alert alert-success">{status}</div>}

      {/* Mensaje de Error */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Formulario de Información de Perfil */}
      <div className="card p-3 mb-3">
        <h5>Actualizar Información de Perfil</h5>
        <form onSubmit={updateProfile}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={profile.name || ""}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={profile.email || ""}
              onChange={handleProfileChange}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-2">
            Actualizar Perfil
          </button>
        </form>
      </div>

      {/* Formulario de Actualización de Contraseña */}
      <div className="card p-3 mb-3">
        <h5>Actualizar Contraseña</h5>
        <form onSubmit={updatePassword}>
          <div className="form-group">
            <label>Contraseña Actual</label>
            <input
              type="password"
              name="current_password"
              className="form-control"
              value={passwords.current_password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={passwords.password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              name="password_confirmation"
              className="form-control"
              value={passwords.password_confirmation}
              onChange={handlePasswordChange}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-2">
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;