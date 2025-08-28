import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

import AppRouter from "./AppRouter";
import NotificationBadgeUpdater from "./components/NotificationBadgeUpdater";

// Axios global config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/residents", { withCredentials: true, headers: { Accept: "application/json" } })
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <div>Session not started</div>;

  return <AppRouter />;
};

export default App;

ReactDOM.createRoot(document.getElementById("App")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
