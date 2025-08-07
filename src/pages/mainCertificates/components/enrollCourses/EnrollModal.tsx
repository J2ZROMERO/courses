// src/components/enrollUsers/EnrollUsersModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";

import { enrollCourseInCertification } from "./services/EnrollModalService";
import { getCourses } from "../../../courses/services/courseService";
import { getCertification } from "../../services/certificationService";

interface Props {
  show: boolean;
  certification: { id?: number; title: string };
  onHide: () => void;
}

type FormValues = {
  course_ids: number[];
};

export function EnrollModal({ show, certification, onHide }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      course_ids: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState(false);

  // 1) Load all users when modal opens
  useEffect(() => {
    if (!show) return;
    setLoading(true);
    getCourses()
      .then((res) => setCourses(res.data.data || res.data))
      .catch(() => toast.error("No se pudieron cargar los cursos"))
      .finally(() => setLoading(false));
  }, [show]);

  // 2) Pre‑selecciono en el form los cursos donde ya está inscrito
  useEffect(() => {
    if (!show) return;
    getCertification(certification?.id)
      .then((res) => {
        const enrolledIds = res.data?.data?.courses?.map((c) => c.id);
        reset({ course_ids: enrolledIds });
      })
      .catch(() => {
        toast.error("No se pudieron cargar inscripciones");
      });
  }, [show, certification?.id, reset, setValue]);

  const onSubmit = async () => {
    const payload = getValues();
    try {
      await enrollCourseInCertification(certification.id, {
        certification_id: certification?.id,
        ...payload,
      });
      toast.success("Cursos agregados correctamente");
      onHide();
    } catch {
      toast.error("Error al inscribir Curso");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Inscribir usuarios en “{certification.title}”
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Cursos</Form.Label>
              <Controller
                name="course_ids"
                control={control}
                render={({ field }) => {
                  // map field.value → react-select format
                  const value = field.value
                    .map((id) => {
                      const u = courses?.data?.find((u) => u.id === id);
                      return u ? { value: u.id, label: u.title } : null;
                    })
                    .filter(Boolean) as { value: number; label: string }[];

                  return (
                    <Select
                      options={courses?.data?.map((u) => ({
                        value: u.id,
                        label: u.title,
                      }))}
                      isMulti
                      closeMenuOnSelect={false}
                      classNamePrefix="react-select"
                      placeholder="Selecciona uno o varios usuarios…"
                      value={value}
                      onChange={(selected) => {
                        const ids = (selected as { value: number }[]).map(
                          (o) => o.value
                        );
                        field.onChange(ids);
                      }}
                    />
                  );
                }}
              />
            </Form.Group>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Guardar"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
