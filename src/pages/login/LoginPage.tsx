// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { useAuth, User } from "../../context/AuthContext";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<LoginFormInputs> = async ({
    email,
    password,
  }) => {
    setError(null);
    try {
      // Simulación de llamada al backend
      if (email === "admin@ejemplo.com" && password === "123456") {
        const userData: User = {
          id: 1,
          name: "Admin Ejemplo",
          email,
          role: "admin",
        };
        login(userData);
        navigate("/");
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center vh-100 align-items-center pb-5"
    >
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
      >
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card>
              <Card.Body>
                <h2 className="mb-4 text-center">Iniciar Sesión</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group controlId="loginEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      isInvalid={!!errors.email}
                      {...register("email", {
                        required: "El email es obligatorio",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Formato de email no válido",
                        },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group controlId="loginPassword" className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="********"
                      isInvalid={!!errors.password}
                      {...register("password", {
                        required: "La contraseña es obligatoria",
                        minLength: {
                          value: 6,
                          message: "Mínimo 6 caracteres",
                        },
                      })}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Validando..." : "Entrar"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
