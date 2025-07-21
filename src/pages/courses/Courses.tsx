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
import { useForm, SubmitHandler } from "react-hook-form";
import {
  getCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  getCoursesByUser,
  UserCourseResponse,
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

type FormValues = {
  title: string;
  description: string;
};

export function Courses() {
  const { user, userIs } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Este estado contendrá el curso que editamos (o vacío para crear)
  const [formData, setFormData] = useState<Course>({
    title: "",
    description: "",
    created_by: user?.id ?? 0,
  });

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { title: "", description: "" },
  });

  // Carga de cursos
  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (userIs("teacher")) {
        const res = await getCourses();
        setCourses(res.data.data.data);
      } else {
        const res = await getCoursesByUser(user?.user?.id);
        setCourses(res.data.data as Course[]);
      }
    } catch {
      toast.error("Error cargando cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  // Cuando abrimos el modal para editar, precargamos valores
  const openEdit = (course: Course) => {
    setFormData(course);
    reset({
      title: course.title,
      description: course.description,
    });
    setShowModal(true);
  };

  // Abrir modal en modo "Nuevo"
  const openNew = () => {
    console.log(user?.user?.id);
    console.log(user);

    setFormData({ title: "", description: "", created_by: user?.user?.id });
    reset({ title: "", description: "" });
    setShowModal(true);
  };

  // Guardar o actualizar
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      if (formData.id) {
        await updateCourse(formData.id, data);
        toast.success("Curso actualizado correctamente");
      } else {
        await createCourse({ ...data, created_by: user?.user?.id });
        toast.success("Curso creado correctamente");
      }
      setShowModal(false);
      await fetchCourses();
    } catch {
      toast.error("Error guardando curso");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar y eliminar
  const confirmDeleteCourse = async () => {
    if (!courseToDelete?.id) return;
    setLoading(true);
    try {
      await deleteCourse(courseToDelete.id);
      toast.success("Curso eliminado correctamente");
      await fetchCourses();
    } catch {
      toast.error("Error al eliminar curso");
    } finally {
      setLoading(false);
      setCourseToDelete(null);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Cursos</h2>
        {userIs("teacher") && <Button onClick={openNew}>+ Nuevo Curso</Button>}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {courses.map((c) => (
            <Col key={c.id} md={4} className="mb-4">
              <Card
                onClick={() => navigate(`/courses/${c.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Title>{c.title}</Card.Title>
                  <Card.Text>{c.description}</Card.Text>
                  {userIs("teacher") && (
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(c);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete(c);
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
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {formData.id ? "Editar Curso" : "Nuevo Curso"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="courseTitle">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el título"
                isInvalid={!!errors.title}
                {...register("title", {
                  required: "El título es obligatorio",
                })}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="courseDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingresa la descripción"
                isInvalid={!!errors.description}
                {...register("description", {
                  required: "La descripción es obligatoria",
                })}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
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
            <Button type="submit" variant="primary">
              {isSubmitting ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : formData.id ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </Modal.Footer>
        </Form>
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
