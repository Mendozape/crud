import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Stats from "./pages/Stats";
import NotiPage from "./pages/Notfications/NotiPage";
import NotiProfile from "./pages/Notfications/NotiProfile";
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";

// Axios setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadAttempted, setReloadAttempted] = useState(false);

  useEffect(() => {
    axios
      .get("/sanctum/csrf-cookie")
      .then(() => axios.get("/api/user"))
      .then(() => {
        setAuthenticated(true);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 419 && !reloadAttempted) {
          setReloadAttempted(true);
          window.location.reload();
        } else {
          setAuthenticated(false);
          setLoading(false);
        }
      });
  }, [reloadAttempted]);

  if (loading) return <div>Loading...</div>;

  if (!authenticated) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Session not started</h2>
        <button
          onClick={async () => {
            try {
              await axios.get("/sanctum/csrf-cookie");
              window.location.href = "http://localhost:8000";
            } catch (error) {
              console.error("CSRF init failed:", error);
            }
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <>
      <NotificationBadgeUpdater />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Main routes */}
          <Route path="/home" element={<Stats />} />
          <Route path="/notificationsList" element={<NotiPage />}>
            <Route path=":id" element={<NotiProfile />} />
          </Route>

          {/* Catch-all: redirect everything else to /home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
