// src/components/Layout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <>
      {/* Tu barra superior */}
      <Navbar />

      {/* Aquí van las páginas hijas */}
      <main className="mainContainer mt-2">
        <Outlet />
      </main>

      {/* Pie de página */}
      <Footer />
    </>
  );
}
