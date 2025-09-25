import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MessageContext } from "./MessageContext";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(""); // will store role ID
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/usuarios/${id}`);
        setUser(res.data);

        // Set selectedRole as the first role's ID (if exists)
        setSelectedRole(res.data.roles?.[0]?.id || "");
      } catch (err) {
        setErrorMessage("Error loading user data.");
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles");
        setRoles(res.data);
      } catch {
        setErrorMessage("Error loading roles.");
      }
    };

    fetchUser();
    fetchRoles();
  }, [id, setErrorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/usuarios/${id}`, {
        ...user,
        roles: [selectedRole], // send role ID
      });
      setSuccessMessage("User updated successfully.");
      navigate("/users");
    } catch {
      setErrorMessage("Error updating user.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          className="form-control mb-2"
          value={user.name || ""}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-2"
          value={user.email || ""}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />

        <select
          className="form-control mb-3"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select a role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <button type="submit" className="btn btn-primary">Actualizar</button>
      </form>
    </div>
  );
};

export default EditUser;
