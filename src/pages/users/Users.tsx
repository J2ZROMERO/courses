// src/pages/users/Users.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Table,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "./services/userService";
import { toast } from "react-toastify";

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const [form, setForm] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
  });

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
    setForm({ name: "", email: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing?.id) {
        await updateUser(editing.id, {
          name: form.name!,
          email: form.email!,
        });
        toast.success("Usuario actualizado");
      } else {
        await createUser({
          name: form.name!,
          email: form.email!,
          password: form.password!,
        });
        toast.success("Usuario creado");
      }
      setShowModal(false);
      fetch();
    } catch {
      toast.error("Error al guardar usuario");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Confirmas que deseas eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      toast.success("Usuario eliminado");
      fetch();
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between mb-4">
        <h2>Usuarios</h2>
        <Button onClick={openNew}>+ Nuevo Usuario</Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
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
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => openEdit(u)}
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(u.id!)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Crear / Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Editar Usuario" : "Nuevo Usuario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@example.com"
              />
            </Form.Group>
            {!editing && (
              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="12345678"
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
