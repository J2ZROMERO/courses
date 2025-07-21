// src/pages/users/Users.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Table,
  Modal,
  Spinner,
  Form,
} from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "./services/userService";
import { toast } from "react-toastify";
import { EnrollModal } from "./components/enrollCourses/EnrollModal";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [enrollUser, setEnrollUser] = useState<User | null>(null);

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // Modal de confirmación de borrado
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.data || res.data);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openNew = () => {
    setEditing(null);
    reset({ name: "", email: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    reset({ name: u.name, email: u.email, password: "" });
    setShowModal(true);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (editing?.id) {
      try {
        await updateUser(editing.id, {
          name: data.name,
          email: data.email,
          password: data.password || undefined, // solo si se llenó
        });
        toast.success("Usuario actualizado");
      } catch (error) {
        toast.error("No se pudo actualizar.");
      }
    } else {
      await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Usuario creado");
    }
    setShowModal(false);
    await fetch();
  };

  const confirmDelete = (u: User) => {
    setUserToDelete(u);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeletingId(userToDelete.id);
    try {
      await deleteUser(userToDelete.id);
      toast.success("Usuario eliminado");
      await fetch();
    } catch {
      toast.error("Error al eliminar usuario");
    } finally {
      setDeletingId(null);
      setUserToDelete(null);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between mb-4">
        <h2>Usuarios</h2>
        <Button onClick={openNew}>+ Nuevo Usuario</Button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th style={{ width: 180 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.data?.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <div className="d-flex">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => openEdit(u)}
                      className="me-2"
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Editar"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => confirmDelete(u)}
                      disabled={deletingId === u.id}
                    >
                      {deletingId === u.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="ms-2"
                      onClick={() => setEnrollUser(u)}
                    >
                      Inscribir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {enrollUser && (
        <EnrollModal
          show={!!enrollUser}
          user={enrollUser}
          onHide={() => setEnrollUser(null)}
        />
      )}
      {/* Modal Crear / Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editing ? "Editar Usuario" : "Nuevo Usuario"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                {...register("name", { required: "Requerido" })}
                isInvalid={!!errors.name}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                {...register("email", {
                  required: "Requerido",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email inválido",
                  },
                })}
                isInvalid={!!errors.email}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                {...register("password", {
                  required: !editing && "Requerido",
                })}
                isInvalid={!!errors.password}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Crear usuario"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal show={!!userToDelete} onHide={() => setUserToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar al usuario{" "}
          <strong>{userToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setUserToDelete(null)}
            disabled={deletingId === userToDelete?.id}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deletingId === userToDelete?.id}
          >
            {deletingId === userToDelete?.id ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
