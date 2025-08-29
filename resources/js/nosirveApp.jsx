import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./nosirveAppRouter";
import TopNav from "./components/TopNav";

// Renderizar TopNav en el contenedor específico
const topnavContainer = document.getElementById('react-topnav');
if (topnavContainer) {
  ReactDOM.createRoot(topnavContainer).render(
    <React.StrictMode>
      <TopNav />
    </React.StrictMode>
  );
}

// Main App
const App = () => {
  const authenticated = !!window.Laravel?.user;
  if (!authenticated) return <div>Session not started</div>;
  return <AppRouter />;
};

ReactDOM.createRoot(document.getElementById("App")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);