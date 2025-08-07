// src/pages/courses/Certifications.tsx
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
  createCertification,
  deleteCertification,
  getCertifications,
  updateCertification,
} from "./services/certificationService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EnrollModal } from "./components/enrollCourses/EnrollModal";
import { getUserById } from "../users/services/userService";

interface ICertificate {
  id?: number;
  title: string;
  description: string;
  user_id?: number;
}

export function Certification() {
  const [certifications, setCertifications] = useState<ICertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userIs } = useAuth();

  // create/edit modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ICertificate>({
    title: "",
    description: "",
  });
  const isEditing = Boolean(formData.id);

  // delete-confirm
  const [certificationToDelete, setCertificationToDelete] =
    useState<ICertificate | null>(null);

  // enroll-users modal
  const [enrollCert, setEnrollCert] = useState<ICertificate | null>(null);

  const navigate = useNavigate();

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await (userIs("teacher")
        ? getCertifications()
        : getUserById(user?.user?.id));
      userIs("teacher")
        ? setCertifications(res?.data?.data?.data)
        : setCertifications(res?.data?.certifications);
    } catch {
      toast.error("Error cargando certificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, [user?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isEditing && formData.id) {
        await updateCertification(formData.id, {
          title: formData.title,
          description: formData.description,
          user_id: user?.id,
        });
        toast.success("Certificación actualizada correctamente");
      } else {
        await createCertification({
          title: formData.title,
          description: formData.description,
          user_id: user?.user?.id,
        });
        toast.success("Certificación creada correctamente");
      }
      setShowModal(false);
      setFormData({ title: "", description: "" });
      await fetchCertifications();
    } catch {
      toast.error("Error guardando certificación");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert: ICertificate) => {
    setFormData({
      id: cert.id,
      title: cert.title,
      description: cert.description,
      user_id: cert.user_id,
    });
    setShowModal(true);
  };

  const confirmDeleteCertification = async () => {
    if (!certificationToDelete?.id) return;
    setLoading(true);
    try {
      await deleteCertification(certificationToDelete.id);
      toast.success("Certificación eliminada correctamente");
      await fetchCertifications();
    } catch {
      toast.error("Error al eliminar la certificación");
    } finally {
      setLoading(false);
      setCertificationToDelete(null);
    }
  };

  console.log(certifications);

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {userIs("teacher") && (
          <Button
            onClick={() => {
              setFormData({ title: "", description: "" });
              setShowModal(true);
            }}
          >
            + Nueva Certificación
          </Button>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {certifications?.map((cert) => (
            <Col key={cert.id} md={4} className="mb-4">
              <Card
                onClick={() => navigate(`/certifications/${cert.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Title>{cert.title}</Card.Title>
                  <Card.Text>{cert.description}</Card.Text>
                  {userIs("teacher") && (
                    <div className="d-flex justify-content-between flex-wrap gap-3">
                      {/* Edit */}
                      <Button
                        variant="outline-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(cert);
                        }}
                      >
                        Editar
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCertificationToDelete(cert);
                        }}
                      >
                        Eliminar
                      </Button>

                      {/* Enroll Users */}
                      <Button
                        variant="outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnrollCert(cert);
                        }}
                      >
                        Agregar Cursos
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setFormData({ title: "", description: "" });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Certificación" : "Nueva Certificación"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
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
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setFormData({ title: "", description: "" });
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : isEditing ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        show={!!certificationToDelete}
        onHide={() => setCertificationToDelete(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Eliminar la certificación “
          <strong>{certificationToDelete?.title}</strong>”?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setCertificationToDelete(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteCertification}
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

      {/* Enroll Users Modal */}
      {enrollCert && (
        <EnrollModal
          show={!!enrollCert}
          certification={enrollCert}
          onHide={() => setEnrollCert(null)}
        />
      )}
    </Container>
  );
}
