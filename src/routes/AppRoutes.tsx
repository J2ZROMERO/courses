// src/routes/AppRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
// import LoginPage from "./pages/LoginPage";
// import CoursePage from "./pages/CoursePage";
import { useAuth } from "../context//AuthContext";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/courses/:id"
          element={user ? <CoursePage /> : <Navigate to="/login" />}
        />
        {/* añade más rutas aquí */}
      </Routes>
    </BrowserRouter>
  );
}
