// src/components/QuestionManagerModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
  deleteQuestion,
  updateQuestion,
  createQuestion,
  getQuestionsByElement,
  Question,
} from "./services/questionService"; // ajusta la ruta
import { OptionManagerModal } from "./options/OptionManagerModal";

interface Props {
  show: boolean;
  elementId: any;
  onHide: () => void;
}

interface FormData {
  question: string;
}

export function QuestionManagerModal({ show, element, onHide }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(
    null
  );
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [showOptMgr, setShowOptMgr] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const elementId = element?.id;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { question: "" } });

  // Carga preguntas
  const fetchQuestions = async () => {
    if (!elementId) return;
    setLoading(true);
    try {
      const res = await getQuestionsByElement(elementId);
      setQuestions(res.data);
    } catch {
      // manejar error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchQuestions();
      reset({ question: "" });
      setEditingQ(null);
      setQuestionToDelete(null);
    }
  }, [show, elementId]);

  const onSubmit = async (data: FormData) => {
    if (!elementId) return;
    setSaving(true);
    try {
      if (editingQ) {
        await updateQuestion(editingQ.id, {
          question: data.question,
          element_id: elementId,
        });
      } else {
        await createQuestion({
          question: data.question,
          element_id: elementId,
        });
      }
      await fetchQuestions();
      reset({ question: "" });
      setEditingQ(null);
    } catch {
      // manejar error
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (q: Question) => {
    setEditingQ(q);
    setValue("question", q.question);
  };

  const askDelete = (q: Question) => {
    setQuestionToDelete(q);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    setDeletingId(questionToDelete.id);
    try {
      await deleteQuestion(questionToDelete.id);
      await fetchQuestions();
    } catch {
      // manejar error
    } finally {
      setDeletingId(null);
      setQuestionToDelete(null);
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
          <Modal.Title>{`Preguntas para ${element?.title}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
            <Form.Group>
              <Form.Label>Pregunta</Form.Label>
              <Form.Control
                {...register("question", { required: "Pregunta requerida" })}
                isInvalid={!!errors.question}
                disabled={saving}
              />
              <Form.Control.Feedback type="invalid">
                {errors.question?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="text-end mt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Spinner animation="border" size="sm" />
                ) : editingQ ? (
                  "Actualizar"
                ) : (
                  "Crear"
                )}
              </Button>
            </div>
          </Form>

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  {/* <th>#</th> */}
                  <th>Pregunta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {questions?.data?.data?.map((q, idx) => (
                  <tr key={q.id}>
                    {/* <td>{idx + 1}</td> */}
                    <td>{q.question}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => onEdit(q)}
                          disabled={deletingId === q.id}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => askDelete(q)}
                          disabled={deletingId === q.id}
                        >
                          Eliminar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setActiveQuestionId(q);
                            setShowOptMgr(true);
                          }}
                        >
                          Opciones
                        </Button>
                      </div>
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

      {/* Modal de confirmación de eliminación */}
      <Modal show={!!questionToDelete} onHide={() => setQuestionToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que deseas eliminar la pregunta{" "}
          <strong>{questionToDelete?.question}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setQuestionToDelete(null)}
            disabled={deletingId === questionToDelete?.id}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deletingId === questionToDelete?.id}
          >
            {deletingId === questionToDelete?.id ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <OptionManagerModal
        show={showOptMgr}
        question={activeQuestionId}
        onHide={() => setShowOptMgr(false)}
      />
    </>
  );
}
