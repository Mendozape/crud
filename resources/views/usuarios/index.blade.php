import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { MessageContext } from "./MessageContext";

const endpoint = "http://localhost:8000/api/usuarios"; // Cambia según tu API
const axiosOptions = { withCredentials: true };

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const { setErrorMessage } = useContext(MessageContext);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(endpoint, axiosOptions);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("No se pudieron cargar los usuarios");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h3>Usuarios</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ display: "none" }}>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Permisos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ display: "none" }}>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email || "-"}</td>
              <td>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, idx) => (
                    <span key={idx} style={{ marginRight: "5px", padding: "2px 6px", backgroundColor: "#007bff", color: "#fff", borderRadius: "3px", display: "inline-block", marginBottom: "2px" }}>
                      {role}
                    </span>
                  ))
                ) : (
                  "-"
                )}
              </td>
              <td>
                {user.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((perm, idx) => (
                    <span key={idx} style={{ marginRight: "5px", padding: "2px 6px", backgroundColor: "#17a2b8", color: "#fff", borderRadius: "3px", display: "inline-block", marginBottom: "2px" }}>
                      {perm}
                    </span>
                  ))
                ) : (
                  "-"
                )}
              </td>
              <td>
                <button style={{ marginRight: "5px", backgroundColor: "#17a2b8", color: "#fff", padding: "5px 10px", border: "none", borderRadius: "3px" }}>Editar</button>
                <button style={{ backgroundColor: "#dc3545", color: "#fff", padding: "5px 10px", border: "none", borderRadius: "3px" }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShowUsers;
