// src/pages/courses/SectionItemModal.tsx
import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
  deleteContentBySectionItem,
  updateContentBySectionItem,
  createContentBySectionItem,
  getContentBySectionItems,
  SectionItem,
  SectionItemPayload,
} from "./services/contentBycourseDetailsService";
import { toast } from "react-toastify";

interface Props {
  show: boolean;
  sectionId: number | null;
  onHide: () => void;
}

export function ContentByCourseDetails({ show, sectionId, onHide }: Props) {
  const [items, setItems] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editing, setEditing] = useState<SectionItem | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [position, setPosition] = useState(0);
  const [type, setType] = useState(1);

  const fetch = async () => {
    if (!sectionId) return;
    setLoading(true);
    try {
      const res = await getContentBySectionItems(sectionId);
      setItems(res.data);
    } catch {
      toast.error("Error cargando elementos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) fetch();
  }, [show, sectionId]);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setUrl("");
    setPosition(items.length);
    setType(1);
  };

  const handleSave = async () => {
    if (!sectionId) return;
    setSaving(true);
    const payload: SectionItemPayload = {
      title,
      url,
      position,
      type,
      section_id: sectionId,
    };
    try {
      if (editing) {
        await updateContentBySectionItem(editing.id, payload);
        toast.success("Elemento actualizado");
      } else {
        await createContentBySectionItem(payload);
        toast.success("Elemento creado");
      }
      await fetch();
      resetForm();
    } catch {
      toast.error("Error guardando elemento");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteContentBySectionItem(id);
      toast.success("Elemento eliminado");
      await fetch();
    } catch {
      toast.error("Error eliminando elemento");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Elementos sección #{sectionId}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>URL</th>
                <th>Pos.</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[items]?.map((it, i) => (
                <tr key={it.id}>
                  <td>{i + 1}</td>
                  <td>{it.title}</td>
                  <td>
                    <a href={it.url} target="_blank" rel="noreferrer">
                      Ver
                    </a>
                  </td>
                  <td>{it.position}</td>
                  <td>{it.type}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => {
                        setEditing(it);
                        setTitle(it.title);
                        setUrl(it.url);
                        setPosition(it.position);
                        setType(it.type);
                      }}
                      disabled={deletingId === it.id}
                    >
                      {deletingId === it.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Editar"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(it.id)}
                      disabled={deletingId === it.id}
                    >
                      {deletingId === it.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Form crear/editar */}
        <Form className="mt-3">
          <Form.Group className="mb-2">
            <Form.Label>Título</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>URL</Form.Label>
            <Form.Control
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Posición</Form.Label>
            <Form.Control
              type="number"
              value={position}
              onChange={(e) => setPosition(+e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(+e.target.value)}
            >
              <option value={1}>Vídeo</option>
              <option value={2}>Documento</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : editing ? (
            "Guardar"
          ) : (
            "Crear"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
