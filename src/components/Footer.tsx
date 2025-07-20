// src/components/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="text-center py-2 bg-light">
      <small>
        © {new Date().getFullYear()} Mi Plataforma. Todos los derechos
        reservados.
      </small>
    </footer>
  );
}
