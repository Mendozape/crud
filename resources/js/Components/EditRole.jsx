import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function EditRole() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const { setSuccessMessage, setErrorMessage } = useContext(MessageContext); // include success
  const navigate = useNavigate();
  const axiosOptions = { withCredentials: true, headers: { Accept: "application/json" } };

  // Fetch role and permissions on mount
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const resRole = await axios.get(`/api/roles/${id}`, axiosOptions);
        setName(resRole.data.name);
        setSelectedPermissions(resRole.data.permissions.map(p => p.id));

        const resPerms = await axios.get("/api/permisos", axiosOptions);
        setPermissions(resPerms.data);
      } catch (err) {
        console.error("Error fetching role:", err);
        setErrorMessage("Failed to load role.");
      }
    };
    fetchRole();
  }, [id, setErrorMessage]);

  // Toggle permission selection
  const togglePermission = (id) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send PUT request to backend
      const res = await axios.put(
        `/api/roles/${id}`,
        { name, permission: selectedPermissions },
        axiosOptions
      );

      // Save backend success message in context
      setSuccessMessage(res.data.message);

      // Navigate back to roles list
      navigate("/roles");
    } catch (err) {
      console.error("Error updating role:", err);
      setErrorMessage(err.response?.data?.message || "Failed to update role.");
    }
  };

  return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-center mb-4 text-2xl font-bold">Edit Role</h2>

          {/* Role name input */}
          <div className="mb-3">
            <label className="form-label font-semibold">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Permissions checkboxes */}
          <div className="mb-3">
            <label className="form-label font-semibold">Permissions:</label>
            {permissions.map(p => (
              <div key={p.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`perm-${p.id}`}
                  value={p.id}
                  checked={selectedPermissions.includes(p.id)}
                  onChange={() => togglePermission(p.id)}
                />
                <label className="form-check-label" htmlFor={`perm-${p.id}`}>
                  {p.name}
                </label>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary text-white" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
