import React, { useEffect, useState } from "react";
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

  // If user data was not passed from Blade, fetch it from API
  useEffect(() => {
    if (!user) {
      axios
        .get("/api/user")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error("Failed to fetch user:", err));
    }
  }, [user]);

  // Handle changes in profile info form
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle changes in password form
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Submit updated profile info
  const updateProfile = async (e) => {
    e.preventDefault();
    setError(""); // reset errors
    try {
      await axios.put("/user/profile-information", profile);
      setStatus("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setStatus("");
      if (err.response?.data?.errors) {
        // Laravel validation errors
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        setError(messages);
      } else {
        setError("Error updating profile.");
      }
    }
  };

  // Submit updated password
  const updatePassword = async (e) => {
    e.preventDefault();
    setError(""); // reset errors
    try {
      await axios.put("/user/password", passwords);
      setStatus("Password updated successfully.");
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      console.error(err);
      setStatus("");
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        setError(messages);
      } else {
        setError("Error updating password.");
      }
    }
  };

  if (!profile) return <div>Loading user info...</div>;

  return (
    <div className="container mt-3">
      <h1>My Profile</h1>

      {/* Success Message */}
      {status && <div className="alert alert-success">{status}</div>}

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Profile Information Form */}
      <div className="card p-3 mb-3">
        <h5>Update Profile Information</h5>
        <form onSubmit={updateProfile}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={profile.name || ""}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={profile.email || ""}
              onChange={handleProfileChange}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-2">
            Update Profile
          </button>
        </form>
      </div>

      {/* Password Update Form */}
      <div className="card p-3 mb-3">
        <h5>Update Password</h5>
        <form onSubmit={updatePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="current_password"
              className="form-control"
              value={passwords.current_password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={passwords.password}
              onChange={handlePasswordChange}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="password_confirmation"
              className="form-control"
              value={passwords.password_confirmation}
              onChange={handlePasswordChange}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-2">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
