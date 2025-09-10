import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageContext } from "./MessageContext";

export default function CreateRole() {
  const [name, setName] = useState("");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [nameError, setNameError] = useState(""); // Message below the input
  const [permissionError, setPermissionError] = useState(""); // Message below the checkboxes

  const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } =
    useContext(MessageContext);
  const navigate = useNavigate();

  const axiosOptions = {
    withCredentials: true,
    headers: { Accept: "application/json" },
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("/api/roles", axiosOptions);
        setRoles(res.data);
      } catch {
        setErrorMessage("Error loading existing roles.");
      }
    };
    fetchRoles();

    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/permisos", axiosOptions);
        setPermissions(res.data);
      } catch {
        setErrorMessage("Error loading permissions.");
      }
    };
    fetchPermissions();
  }, []);

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset inline errors
    setNameError("");
    setPermissionError("");

    // Inline and global validations
    if (!name.trim()) {
      setNameError("Role name is required."); // Below the input
      setErrorMessage("You must enter a role name."); // Global
      return;
    }

    if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setNameError("Role name already exists."); // Below the input
      setErrorMessage("Role name already exists."); // Global
      return;
    }

    if (selectedPermissions.length === 0) {
      setPermissionError("At least one permission must be selected."); // Below the checkboxes
      setErrorMessage("At least one permission must be selected."); // Global
      return;
    }

    try {
      await axios.post(
        "/api/roles",
        { name, permission: selectedPermissions },
        axiosOptions
      );
      setSuccessMessage("Role created successfully.");
      setErrorMessage(null);
      setName("");
      setSelectedPermissions([]);
      navigate("/roles");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Error creating role.");
    }
  };

  // Auto-clear global messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="row mb-4">
      <div className="col-md-8 offset-md-2">
        <div className="border rounded p-4 bg-white shadow-sm">
          <h2 className="text-center mb-4 text-2xl font-bold">Create Role</h2>

          {/* Global messages */}
          {successMessage && (
            <div className="alert alert-success text-center">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          )}

          {/* Role name */}
          <div className="mb-3">
            <label className="form-label font-semibold">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-control ${nameError ? "is-invalid" : ""}`}
              placeholder="Enter the role name"
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>

          {/* Existing roles */}
          {roles.length > 0 && (
            <div className="mb-3">
              <label className="form-label font-semibold">Existing Roles</label>
              <ul className="list-group">
                {roles.map((r) => (
                  <li key={r.id} className="list-group-item">{r.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Permissions */}
          <div className="mb-3">
            <label className="form-label font-semibold">Permissions</label>
            {permissions.map((p) => (
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
            {permissionError && <div className="text-danger mt-1">{permissionError}</div>}
          </div>

          {/* Save button */}
          <div className="d-flex justify-content-end">
            <button onClick={handleSubmit} className="btn btn-success text-white">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
