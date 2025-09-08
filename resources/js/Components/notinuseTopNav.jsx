import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TopNav = () => {
  const navigate = useNavigate();
  const laravel = window.Laravel || {};
  const user = laravel.user || {};
  const logoutUrl = laravel.logout_url || "/logout";

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleNotificationsClick = () => navigate("/notificationsList");
  const handleProfileClick = () => navigate("/profile");

  const handleLogout = (e) => {
    e.preventDefault();
    const form = document.createElement("form");
    form.method = "POST";
    form.action = logoutUrl;
    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "_token";
    csrfInput.value = laravel.csrfToken || "";
    form.appendChild(csrfInput);
    document.body.appendChild(form);
    form.submit();
  };

  const toggleSidebar = () => {
    if (typeof window.toggleAdminSidebar === 'function') {
      window.toggleAdminSidebar();
    } else {
      document.body.classList.toggle('sidebar-collapse');
      document.body.classList.toggle('sidebar-open');
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      {/* BURGER ICON - SOLO A LA IZQUIERDA */}
      <button
        onClick={toggleSidebar}
        className="burger-button"
        title="Toggle Sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* CONTENEDOR DERECHO - TODO ESTO VA A LA DERECHA GRACIAS AL CSS */}
      <div className="nav-right-container">
        
        {/* Fullscreen */}
        <button
          onClick={toggleFullScreen}
          className="nav-right-button"
          title="Pantalla completa"
        >
          <i className="fas fa-expand-arrows-alt"></i>
        </button>

        {/* Notifications */}
        <button
          onClick={handleNotificationsClick}
          className="nav-right-button"
          title="Notificaciones"
        >
          <i className="fas fa-bell text-warning"></i>
        </button>

        {/* User Dropdown */}
        <div className="user-dropdown" style={{ position: "relative" }}>
          <button
            onClick={toggleDropdown}
            style={{
              border: "1px solid #dee2e6",
              background: "#f8f9fa",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "120px"
            }}
          >
            {user.image ? (
              <img
                src={user.image}
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
                alt="User"
              />
            ) : (
              <i className="fas fa-user-circle"></i>
            )}
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              {user.name || "Usuario"}
            </span>
          </button>

          {dropdownOpen && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "45px",
              backgroundColor: "white",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "8px 0",
              minWidth: "140px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1040
            }}>
              <button
                onClick={handleProfileClick}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <i className="fas fa-user text-primary"></i>
                <span>Perfil</span>
              </button>
              
              <div style={{ height: "1px", backgroundColor: "#eee", margin: "5px 0" }}></div>
              
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <i className="fas fa-sign-out-alt text-danger"></i>
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopNav;