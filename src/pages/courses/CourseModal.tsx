import React, { useState } from "react";

import { Card, Button, Row, Col, Modal, Form } from "react-bootstrap";
import { ICourse } from "./types";

interface CourseModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (course: ICourse) => void;
  course?: ICourse | null;
}

export function CourseModal({
  show,
  onClose,
  onSave,
  course,
}: CourseModalProps) {
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: course?.id ?? 0, title, description });
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{course ? "Editar Curso" : "Nuevo Curso"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
