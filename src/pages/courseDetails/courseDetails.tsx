// src/pages/courses/SectionManager.tsx
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Maximize, Minimize } from "react-bootstrap-icons"; // o cualquier librería de iconos
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "./services/courseDetailsService"; // el servicio que definimos antes
import { toast } from "react-toastify";
import { toEmbedUrl } from "../../utils";
interface Video {
  id: number;
  title: string;
  url: string;
}

interface Section {
  id: number;
  title: string;
  position: number;
  course_id: number;
  created_at: string;
}

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(0);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [videoToPlay, setVideoToPlay] = useState<Video | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await getSections(Number(id));
      setSections(res?.data?.data.data);
    } catch (err) {
      toast.error("Error cargando subsecciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [id]);

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setPosition(sections.length);
    setShowModal(true);
  };
  const openEdit = (sec: Section) => {
    setEditing(sec);
    setTitle(sec.title);
    setPosition(sec.position);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateSection(editing.id, { title, position });
        toast.success("Sección actualizada");
      } else {
        await createSection({ title, position, course_id: id });
        toast.success("Sección creada");
      }
      setShowModal(false);
      fetchSections();
    } catch {
      toast.error("Error guardando sección");
    }
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    try {
      await deleteSection(sectionToDelete.id);
      toast.success("Sección eliminada");
      fetchSections();
    } catch {
      toast.error("Error eliminando sección");
    } finally {
      setSectionToDelete(null);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Subsecciones</h3>
        <Button onClick={openNew}>+ Nueva Sección</Button>
      </div>
      {/* Modal de confirmación de borrado */}
      <Modal show={!!sectionToDelete} onHide={() => setSectionToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la sección{" "}
          <strong>{sectionToDelete?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSectionToDelete(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDeleteSection}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <div className="table-responsive">
          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Posición</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sections?.map((sec, idx) => (
                <tr key={sec.id}>
                  <td>{idx + 1}</td>
                  <td>{sec.title}</td>
                  <td>{sec.position}</td>
                  <td>{new Date(sec.created_at).toLocaleString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => openEdit(sec)}
                      className="me-2"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setSectionToDelete(sec)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      {/* Listado tipo “timeline” de subsecciones */}
      <div className="mt-5">
        {[
          {
            id: 1,
            title: "Introducción al módulo",
            url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          },
          {
            id: 2,
            title: "Ejemplo práctico",
            url: toEmbedUrl(
              "https://www.loom.com/share/42fbf3616982457ba3dd01e1b1d26b83?sid=6928ce21-193e-4382-aca9-42378bd12ea0"
            ),
          },
        ]?.map((vid) => (
          <div key={vid.id} className="mb-4">
            <h4>{vid.title}</h4>
            <ul className="list-unstyled ps-3">
              <li key={vid.id} className="mb-2">
                <Button variant="link" onClick={() => setVideoToPlay(vid)}>
                  ▶ {vid.title}
                </Button>
              </li>
            </ul>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Editar Sección" : "Nueva Sección"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Introducción a Laravel"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Posición</Form.Label>
              <Form.Control
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
              />
              <Form.Text className="text-muted">
                Indica el orden en que aparece esta sección.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {editing ? "Guardar cambios" : "Crear sección"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal de reproducción de vídeo */}
      <Modal
        show={!!videoToPlay}
        onHide={() => setVideoToPlay(null)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{videoToPlay?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          {videoToPlay && (
            <div style={{ width: "75vw", height: "75vh" }}>
              <iframe
                title={videoToPlay.title}
                src={videoToPlay.url}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
