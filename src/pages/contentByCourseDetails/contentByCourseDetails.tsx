// src/pages/courses/SectionItemModal.tsx
import React, { useEffect, useState } from "react";
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
import { toEmbedUrl } from "../../utils";
import { useForm } from "react-hook-form";

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
  const [itemToDelete, setItemToDelete] = useState<SectionItem | null>(null);
  const [editing, setEditing] = useState<SectionItem | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { title: "", url: "", position: 0, type: 1 },
  });

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
    if (show) {
      fetch();
      resetForm(); // 👈 Esto asegura que el formulario se muestre limpio siempre al abrir
    }
  }, [show, sectionId]);

  const resetForm = () => {
    setEditing(null);
    reset({ title: "", url: "", position: items.length, type: 1 });
  };

  const onSubmit = async (data: any) => {
    if (!sectionId) return;
    setSaving(true);
    const payload: SectionItemPayload = {
      ...data,
      url: toEmbedUrl(data.url),
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

  // Esta función sólo abre el modal de confirmación
  const askDelete = (it: SectionItem) => {
    setItemToDelete(it);
  };

  // Esta función sí elimina realmente
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete.id);
    try {
      await deleteContentBySectionItem(itemToDelete.id);
      toast.success("Elemento eliminado");
      await fetch();
    } catch {
      toast.error("Error eliminando elemento");
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Elementos sección #{sectionId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-2">
              <Form.Label>Título</Form.Label>
              <Form.Control
                {...register("title", { required: true })}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                Este campo es requerido.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>URL</Form.Label>
              <Form.Control
                {...register("url", { required: true })}
                isInvalid={!!errors.url}
              />
              <Form.Control.Feedback type="invalid">
                Este campo es requerido.
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex gap-4">
              <Form.Group className="mb-2 w-50">
                <Form.Label>Posición</Form.Label>
                <Form.Control
                  type="number"
                  {...register("position", { required: true })}
                  isInvalid={!!errors.position}
                />
                <Form.Control.Feedback type="invalid">
                  Este campo es requerido.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 w-50">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  {...register("type", { required: true })}
                  isInvalid={!!errors.type}
                >
                  <option value={1}>Vídeo</option>
                  <option value={2}>Documento</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Este campo es requerido.
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="text-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : editing ? (
                  "Guardar"
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </Form>

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
                {items?.data?.data.map((it, i) => (
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
                          setValue("title", it.title);
                          setValue("url", it.url);
                          setValue("position", it.position);
                          setValue("type", it.type);
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
                        onClick={() => askDelete(it)}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal show={!!itemToDelete} onHide={() => setItemToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que quieres eliminar <strong>{itemToDelete?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setItemToDelete(null)}
            disabled={deletingId === itemToDelete?.id}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deletingId === itemToDelete?.id}
          >
            {deletingId === itemToDelete?.id ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
