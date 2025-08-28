import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TopNav = () => {
  const navigate = useNavigate();
  const laravel = window.Laravel || {};
  const user = laravel.user || {};
  const logoutUrl = laravel.logout_url || "/logout";

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ajuste de margen/padding para body y div#App
  useEffect(() => {
    document.body.style.paddingTop = "0px";
    document.body.style.marginTop = "0px";

    const appDiv = document.getElementById("App");
    if (appDiv) {
      appDiv.style.margin = "0";
      appDiv.style.padding = "0";
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleNotificationsClick = (e) => {
    e.preventDefault();
    navigate("/notificationsList");
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

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
    document.body.classList.toggle("sidebar-collapse");
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <nav
      className="main-header navbar navbar-expand-md navbar-white navbar-light"
      style={{
        margin: 0,
        padding: 0,
        top: 0,
        position: "fixed",
        width: "100%",
        zIndex: 1030,
      }}
    >
      <div
        className="container d-flex align-items-center justify-content-between"
        style={{ paddingTop: 0, paddingBottom: 0 }}
      >
        {/* Left: Hamburger */}
        <button className="btn btn-link" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>

        {/* Right: Fullscreen, Notifications, User */}
        <ul className="navbar-nav ml-auto d-flex align-items-center">
          {/* Fullscreen */}
          <li className="nav-item">
            <button
              className="nav-link btn btn-link"
              title="Fullscreen"
              onClick={toggleFullScreen}
            >
              <i className="fas fa-expand-arrows-alt"></i>
            </button>
          </li>

          {/* Notifications */}
          <li className="nav-item">
            <button
              className="nav-link btn btn-link"
              title="Notifications"
              onClick={handleNotificationsClick}
            >
              <i className="fas fa-bell text-warning"></i>
            </button>
          </li>

          {/* User menu */}
          <li className="nav-item dropdown user-menu">
            <button
              className="nav-link btn btn-link d-flex align-items-center"
              onClick={toggleDropdown}
              style={{ maxWidth: "200px" }} // ancho máximo del botón
            >
              {user.image && (
                <img
                  src={user.image}
                  className="user-image img-circle elevation-2"
                  alt={user.name || "User"}
                />
              )}
              <span
                className="d-inline-block text-truncate"
                style={{
                  marginLeft: "5px",
                  maxWidth: "calc(100% - 40px)", // ajusta según tamaño de imagen
                }}
                title={user.name}
              >
                {user.name || "Guest"}
              </span>
            </button>

            {dropdownOpen && (
              <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <li className="user-footer d-flex justify-content-between">
                  <button
                    onClick={handleProfileClick}
                    className="btn btn-default btn-flat"
                  >
                    <i className="fa fa-fw fa-user text-lightblue"></i> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-default btn-flat"
                  >
                    <i className="fa fa-fw fa-power-off text-red"></i> Logout
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default TopNav;
