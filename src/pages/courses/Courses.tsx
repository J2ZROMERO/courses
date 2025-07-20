// src/pages/courses/Courses.tsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse,
} from "./services/courseService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Course {
  id?: number;
  title: string;
  description: string;
  created_by: number;
}

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Course>({
    title: "",
    description: "",
    created_by: 1,
  });
  const { user, userIs } = useAuth();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getCourses();
      setCourses(res?.data?.data?.data);
    } catch (err) {
      toast.error("Error cargando cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.id) {
        const { title, description } = formData;
        await updateCourse(formData.id, { title, description });
        toast.success("Curso actualizado correctamente");
      } else {
        await createCourse({ ...formData, created_by: user?.id });
        toast.success("Curso creado correctamente");
      }
      setShowModal(false);
      setFormData({ title: "", description: "", created_by: user?.id });
      await fetchCourses();
    } catch {
      toast.error("Error guardando curso");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setFormData(course);
    setShowModal(true);
  };

  const confirmDeleteCourse = async () => {
    if (courseToDelete) {
      setLoading(true);
      try {
        await deleteCourse(courseToDelete.id!);
        toast.success("Curso eliminado correctamente");
        await fetchCourses();
      } catch {
        toast.error("Error al eliminar el curso");
      } finally {
        setLoading(false);
        setCourseToDelete(null);
      }
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Cursos</h2>
        {userIs("teacher") && (
          <Button onClick={() => setShowModal(true)}>Nuevo Curso</Button>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {courses.map((course) => (
            <Col key={course.id} md={4} className="mb-4">
              <Card
                onClick={() => navigate(`/courses/${course.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Title>{course.title}</Card.Title>
                  <Card.Text>{course.description}</Card.Text>
                  {userIs("teacher") && (
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="outline-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(course);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete(course);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.id ? "Editar Curso" : "Nuevo Curso"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : formData.id ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal show={!!courseToDelete} onHide={() => setCourseToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el curso "
          <strong>{courseToDelete?.title}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCourseToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteCourse}
            disabled={loading}
          >
            {loading ? (
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
