// src/components/Navbar.tsx
import React from "react";
import { Navbar as BsNavbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <BsNavbar bg="dark" variant="dark" expand="md">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          Mi Plataforma
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-nav" />
        <BsNavbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/courses">
              Cursos
            </Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
