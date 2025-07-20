// src/pages/courses/SectionManager.tsx
import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "./services/courseDetailsService";
import { toast } from "react-toastify";
import { toEmbedUrl } from "../../utils";
import { ContentByCourseDetails } from "../contentByCourseDetails/contentByCourseDetails"; // <-- tu componente

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

  // --- estado para CRUD de secciones ---
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(0);

  // --- spinners individuales ---
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  // --- estado para abrir/ cerrar el modal de contenido ---
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await getSections(Number(id));
      setSections(res.data.data.data);
    } catch {
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
    setSaving(true);
    try {
      if (editing) {
        await updateSection(editing.id, { title, position });
        toast.success("Sección actualizada");
      } else {
        await createSection({ title, position, course_id: Number(id) });
        toast.success("Sección creada");
      }
      setShowModal(false);
      await fetchSections();
    } catch {
      toast.error("Error guardando sección");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    setDeletingId(sectionToDelete.id);
    try {
      await deleteSection(sectionToDelete.id);
      toast.success("Sección eliminada");
      await fetchSections();
    } catch {
      toast.error("Error eliminando sección");
    } finally {
      setSectionToDelete(null);
      setDeletingId(null);
    }
  };

  // ---> apertura del modal de contenidos para una sección concreta
  const openItemModal = (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setItemModalOpen(true);
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Subsecciones</h3>
        <Button onClick={openNew}>+ Nueva Sección</Button>
      </div>

      {/* Confirmación de borrado */}
      <Modal show={!!sectionToDelete} onHide={() => setSectionToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que deseas eliminar la sección{" "}
          <strong>{sectionToDelete?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSectionToDelete(null)}
            disabled={deletingId === sectionToDelete?.id}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteSection}
            disabled={deletingId === sectionToDelete?.id}
          >
            {deletingId === sectionToDelete?.id ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tabla de secciones */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" />
        </div>
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
              {sections.map((sec, idx) => (
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
                      disabled={deletingId === sec.id}
                    >
                      {deletingId === sec.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Editar"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setSectionToDelete(sec)}
                      className="me-2"
                      disabled={deletingId === sec.id}
                    >
                      {deletingId === sec.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                    {/* Botón para abrir el modal de contenidos */}
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => openItemModal(sec.id)}
                    >
                      Agregar{" "}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal Crear / Editar Sección */}
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
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Posición</Form.Label>
              <Form.Control
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : editing ? (
              "Guardar cambios"
            ) : (
              "Crear sección"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Contenidos (tu componente extraído) */}
      <ContentByCourseDetails
        show={itemModalOpen}
        sectionId={currentSectionId}
        onHide={() => setItemModalOpen(false)}
      />
    </Container>
  );
}
