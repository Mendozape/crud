import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { MessageProvider } from "./components/MessageContext"; // Import the provider

const root = createRoot(document.getElementById("react-container"));

root.render(
  <MessageProvider>
    <App />
  </MessageProvider>
);
