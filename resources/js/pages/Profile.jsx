import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(user || {});
  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch user info if not passed from Blade
  useEffect(() => {
    if (!user) {
      axios
        .get("/api/user")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Failed to fetch user:", err));
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // 🔹 Update profile (name, email, photo)
  const updateProfile = async (e) => {
    e.preventDefault();
    setStatus("");
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      if (photo) formData.append("photo", photo);
      formData.append("_method", "PUT");

      const response = await axios.post("/user/profile-information", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus(response.data.message);

      // Refresh user photo
      const res = await axios.get("/api/user");
      setProfile(res.data);
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Error updating profile." });
      }
    }
  };

  // 🔹 Update password
  const updatePassword = async (e) => {
    e.preventDefault();
    setStatus("");
    setErrors({});

    try {
      await axios.put("/user/password", passwords);
      setStatus("Password updated successfully.");
      setPasswords({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Error updating password." });
      }
    }
  };

  if (!profile) return <div>Loading user info...</div>;

  return (
    <div className="container mt-3">
      <h1 className="mb-4">My Profile</h1>

      {status && <div className="alert alert-success">{status}</div>}
      {errors.general && <div className="alert alert-danger">{errors.general}</div>}

      {/* Profile Form */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <h5 className="mb-3">Update Profile Information</h5>

        <form onSubmit={updateProfile}>
          {/* Profile Image */}
          <div className="text-center mb-3">
            <img
              src={preview || profile.profile_photo_url || "/default-avatar.png"}
              alt="Profile"
              className="rounded-circle border shadow-sm"
              style={{
                width: "130px",
                height: "130px",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Custom File Input */}
          <div className="mb-4 text-center">
            <label
              htmlFor="photo"
              className="btn btn-outline-primary btn-sm px-4 py-2 rounded-pill"
              style={{ cursor: "pointer", fontWeight: "500" }}
            >
              <i className="bi bi-camera me-2"></i>
              {photo ? "Change Photo" : "Choose Photo"}
            </label>
            <input
              id="photo"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="d-none"
            />
            {errors.photo && (
              <div className="text-danger small mt-1">{errors.photo[0]}</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={profile.name || ""}
              onChange={handleProfileChange}
            />
            {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
          </div>

          <div className="form-group mb-4">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={profile.email || ""}
              onChange={handleProfileChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
          </div>

          {/* 🌈 Stylish Update Button */}
          <button
            type="submit"
            className="btn w-100 py-2 fw-bold"
            style={{
              background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0, 123, 255, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            <i className="bi bi-cloud-upload me-2"></i>
            Update Profile
          </button>
        </form>
      </div>

      {/* Password Form */}
      <div className="card p-4 shadow-sm border-0">
        <h5 className="mb-3">Change Password</h5>
        <form onSubmit={updatePassword}>
          <div className="form-group mb-2">
            <label>Current Password</label>
            <input
              type="password"
              name="current_password"
              className={`form-control ${errors.current_password ? "is-invalid" : ""}`}
              value={passwords.current_password}
              onChange={handlePasswordChange}
            />
            {errors.current_password && (
              <div className="invalid-feedback">{errors.current_password[0]}</div>
            )}
          </div>

          <div className="form-group mb-2">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={passwords.password}
              onChange={handlePasswordChange}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password[0]}</div>
            )}
          </div>

          <div className="form-group mb-4">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="password_confirmation"
              className="form-control"
              value={passwords.password_confirmation}
              onChange={handlePasswordChange}
            />
          </div>

          <button type="submit" className="btn btn-outline-primary w-100 fw-bold">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
