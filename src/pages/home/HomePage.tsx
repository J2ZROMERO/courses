// src/pages/HomePage.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="container py-5">
      <h2>Bienvenido, {user.name}!</h2>
      <button className="btn btn-danger" onClick={logout}>
        Cerrar sesión
      </button>
      {/* aquí tu listado de cursos, etc. */}
    </div>
  );
}
