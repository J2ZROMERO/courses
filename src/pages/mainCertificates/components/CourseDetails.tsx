// src/pages/courses/Courses.tsx
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
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getCertification } from "../services/certificationService";

interface Course {
  id?: number;
  title: string;
  description: string;
  created_by: number;
}

type FormValues = {
  title: string;
  description: string;
};

export function CourseDetails() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect((e) => {
    setLoading(true);
    getCertification(certification?.id)
      .then((e) => setCourses(e?.data?.data))
      .finally(setLoading(false));
  }, []);

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Cursos</h2>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {courses.map((c) => (
            <Col key={c.id} md={4} className="mb-4">
              <Card
                onClick={() => navigate(`/courses/${c.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Card.Body>
                  <Card.Title>{c.title}</Card.Title>
                  <Card.Text>{c.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
