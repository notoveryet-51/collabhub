import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Updated: Added .js extension
import App from "./App.js";

import "./index.css";
import "./styles/theme.css";

// Updated: Added .jsx extension
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Find root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create root ONCE
const root = ReactDOM.createRoot(rootElement);

// Render ONCE
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);