// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
// import CoursePage from "./pages/CoursePage";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Courses } from "../pages/courses/Courses";
import { CourseDetails } from "../pages/courseDetails/courseDetails";
import { Users } from "../pages/users/Users";
import { Certification } from "../pages/mainCertificates/Certificate";
import { CertificationDetails } from "../pages/mainCertificates/components/CertificationDetails";
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
          <Route path="/" element={<Certification />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/users" element={<Users />} />
          <Route path="/certifications" element={<Certification />} />
          <Route
            path="/certifications/:id"
            element={<CertificationDetails />}
          />
          <Route
            path="/certifications/:id/courses/:id"
            element={<CourseDetails />}
          />

          {/* aquí más rutas protegidas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
