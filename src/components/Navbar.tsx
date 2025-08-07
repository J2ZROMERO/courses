// src/components/Navbar.tsx
import React from "react";
import { Navbar as BsNavbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Import the context

export default function Navbar() {
  const { user, logout, userIs } = useAuth(); // ✅ Access user and logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect after logout
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="md">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          Bienvenido!
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/certifications">
              Certificaciones
            </Nav.Link>
            {/* <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link> */}
            {userIs("teacher") && (
              <Nav.Link as={Link} to="/courses">
                Cursos
              </Nav.Link>
            )}
            {userIs("teacher") && (
              <Nav.Link as={Link} to="/users">
                Usuarios
              </Nav.Link>
            )}
            {user ? (
              <>
                {/* <span className="text-white me-2">Hola, {user.name}</span> */}
                <Button
                  variant="outline-light"
                  size="sm"
                  className="ms-2"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">
                Iniciar sesión
              </Nav.Link>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
