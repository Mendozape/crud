import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App2"; // Your main SPA component
// Render the SPA inside Laravel Blade container
const root = createRoot(document.getElementById("react-container"));
root.render(<App />);

