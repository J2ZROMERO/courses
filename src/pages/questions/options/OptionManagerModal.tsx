// src/components/OptionManagerModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
  getOptionsByQuestion,
  createOption,
  updateOption,
  deleteOption,
  Option,
} from "./services/optionService"; // ajusta la ruta

interface Props {
  show: boolean;
  question: any;
  onHide: () => void;
}

interface FormData {
  option: string;
  is_correct: boolean;
}

export function OptionManagerModal({ show, question, onHide }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingOpt, setEditingOpt] = useState<Option | null>(null);
  const [optToDelete, setOptToDelete] = useState<Option | null>(null);
  const questionId = question?.id;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { option: "", is_correct: false } });

  // 1) Cargar opciones
  const fetchOptions = async () => {
    if (!questionId) return;
    setLoading(true);
    try {
      const res = await getOptionsByQuestion(questionId);
      setOptions(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchOptions();
      reset({ option: "", is_correct: false });
      setEditingOpt(null);
      setOptToDelete(null);
    }
  }, [show, questionId]);

  // 2) Crear/actualizar
  const onSubmit = async (data: FormData) => {
    if (!questionId) return;
    setSaving(true);
    try {
      if (editingOpt) {
        await updateOption(editingOpt.id, {
          option: data.option,
          question_id: questionId,
          is_correct: data.is_correct,
        });
      } else {
        await createOption({
          option: data.option,
          question_id: questionId,
          is_correct: data.is_correct,
        });
      }
      await fetchOptions();
      reset({ option: "", is_correct: false });
      setEditingOpt(null);
    } finally {
      setSaving(false);
    }
  };

  // 3) Poner en modo edición
  const onEdit = (opt: Option) => {
    setEditingOpt(opt);
    setValue("option", opt.option);
    setValue("is_correct", opt.is_correct);
  };

  // 4) Pedir confirmación para borrar
  const askDelete = (opt: Option) => {
    setOptToDelete(opt);
  };

  // 5) Eliminar
  const confirmDelete = async () => {
    if (!optToDelete) return;
    setDeletingId(optToDelete.id);
    try {
      await deleteOption(optToDelete.id);
      await fetchOptions();
    } finally {
      setDeletingId(null);
      setOptToDelete(null);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        dialogClassName="modal-full-height"
      >
        <Modal.Header closeButton>
          <Modal.Title>{question?.question}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
            <Form.Group className="mb-2">
              <Form.Label>Nombre de la opcion para pregunta</Form.Label>
              <Form.Control
                {...register("option", { required: "Opción requerida" })}
                isInvalid={!!errors.option}
                disabled={saving}
              />
              <Form.Control.Feedback type="invalid">
                {errors.option?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                label="Respuesta correcta"
                {...register("is_correct")}
                disabled={saving}
              />
            </Form.Group>
            <div className="text-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Spinner size="sm" animation="border" />
                ) : editingOpt ? (
                  "Actualizar"
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </Form>

          {loading ? (
            <div className="text-center">
              <Spinner />
            </div>
          ) : (
            <Table bordered hover>
              <thead>
                <tr>
                  {/* <th>#</th> */}
                  <th>Opción</th>
                  <th>Correcta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {options?.data?.data?.map((opt, idx) => (
                  <tr key={opt.id}>
                    {/* <td>{idx + 1}</td> */}
                    <td>{opt.option}</td>
                    <td>{opt.is_correct ? "Sí" : "No"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => onEdit(opt)}
                        disabled={deletingId === opt.id}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => askDelete(opt)}
                        disabled={deletingId === opt.id}
                      >
                        Eliminar
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
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmación de eliminación */}
      <Modal show={!!optToDelete} onHide={() => setOptToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Eliminar la opción “<strong>{optToDelete?.option}</strong>”?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setOptToDelete(null)}
            disabled={deletingId === optToDelete?.id}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deletingId === optToDelete?.id}
          >
            {deletingId === optToDelete?.id ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
