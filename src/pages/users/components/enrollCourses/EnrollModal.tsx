// src/components/EnrollModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";

import { getCourses } from "../../../courses/services/courseService";
import { getUserById, User } from "../../services/userService";
import { enrollUserToCertifications } from "./services/EnrollModalService";
import { getCertifications } from "../../../mainCertificates/services/certificationService";

interface Props {
  show: boolean;
  user: User;
  onHide: () => void;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

type FormValues = {
  certification_ids: number[];
  user_id: number | null;
};

export function EnrollModal({ show, user, onHide }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { certification_ids: [], user_id: null },
  });

  const [certifications, setCertifications] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) Cuando abra el modal, cargo el catálogo de cursos
  useEffect(() => {
    if (!show) return;
    setLoading(true);
    getCertifications()
      .then((res) => setCertifications(res.data.data?.data || []))
      .catch(() => toast.error("No se pudieron cargar cursos"))
      .finally(() => setLoading(false));
  }, [show]);

  // 2) Pre‑selecciono en el form los cursos donde ya está inscrito
  useEffect(() => {
    if (!show || !user?.id) return;

    setValue("user_id", user.id);
    getUserById(user.id)
      .then((res) => {
        const data = res?.data?.certifications;
        const enrolledIds = Array.isArray(data) ? data.map((c) => c.id) : [];
        console.log(enrolledIds);

        reset({ certification_ids: enrolledIds, user_id: user.id });
      })
      .catch((err) => {
        toast.error("No se pudieron cargar inscripciones");
      });
  }, [show, user?.id, reset, setValue]);

  const onSubmit = async () => {
    const payload = getValues();
    try {
      await enrollUserToCertifications(payload);
      toast.success("Inscripción guardada");
      onHide();
    } catch {
      toast.error("Error al inscribir");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Inscribir usuario: {user?.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Form.Group className="mb-5">
              <Form.Label>Certificaciones</Form.Label>
              <Controller
                control={control}
                name="certification_ids"
                render={({ field }) => {
                  // a partir de field.value (array de IDs), generamos el value de React‑Select
                  console.log(field);

                  const value = field.value
                    .map((id) => {
                      const opt = certifications?.find((c) => c.id === id);
                      return opt ? { value: opt.id, label: opt.title } : null;
                    })
                    .filter(Boolean) as { value: number; label: string }[];
                  console.log(certifications);

                  return (
                    <Select
                      options={certifications?.map((c) => ({
                        value: c.id,
                        label: c.title,
                      }))}
                      isMulti
                      closeMenuOnSelect={false}
                      classNamePrefix="react-select"
                      placeholder="Selecciona uno o varios certificados"
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
