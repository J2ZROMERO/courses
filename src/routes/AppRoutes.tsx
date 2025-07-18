// src/routes/AppRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/login/LoginPage";
// import CoursePage from "./pages/CoursePage";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />

        {/* Todas las demás rutas van dentro de Layout */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/courses/:id" element={<CoursePage />} /> */}
          {/* aquí más rutas protegidas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
