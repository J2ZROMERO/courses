// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client"; // ← ¡Import necesario!
import "./scss/index.scss";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
