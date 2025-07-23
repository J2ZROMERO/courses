import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  Modal,
  Spinner,
  Table,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createSection,
  updateSection,
  deleteSection,
  markElementAsSeen,
} from "./services/courseDetailsService";
import { getCourse } from "../courses/services/courseService";
import { toast } from "react-toastify";
import { ContentByCourseDetails } from "../contentByCourseDetails/contentByCourseDetails";
import { Questionnaire } from "./questionnaire/Questionnaire";
import { useForm, SubmitHandler } from "react-hook-form";

interface Element {
  id: number;
  section_id: number;
  title: string;
  url: string;
  position: number;
  status_progress: boolean;
}

interface Section {
  id: number;
  title: string;
  position: number;
  created_at: string;
}

interface CourseFull {
  id: number;
  sections: (Section & { elements: Element[] })[];
}

type QuizAnswers = Record<number, number>; // questionId → optionId

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const { userIs, user } = useAuth();
  const [course, setCourse] = useState<CourseFull | null>(null);
  const [loading, setLoading] = useState(false);

  // — CRUD subsecciones (teacher) —
  const [showSecModal, setShowSecModal] = useState(false);
  const [editingSec, setEditingSec] = useState<Section | null>(null);
  const [secTitle, setSecTitle] = useState("");
  const [secPos, setSecPos] = useState(0);
  const [savingSec, setSavingSec] = useState(false);
  const [deletingSecId, setDeletingSecId] = useState<number | null>(null);
  const [secToDelete, setSecToDelete] = useState<Section | null>(null);

  // — estado para el modal de contenidos —
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

  // — Vídeo modal —
  const [videoModal, setVideoModal] = useState<{
    element: Element | null;
    show: boolean;
  }>({ element: null, show: false });

  // — Spinner para marcar visto —
  const [markingId, setMarkingId] = useState<number | null>(null);
  const {
    control,
    handleSubmit: handleQuizSubmit,
    reset: resetQuiz,
    formState: { errors: quizErrors },
  } = useForm<QuizAnswers>();
  // load full course
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await getCourse(Number(id));
      setCourse(res.data.data);
    } catch {
      toast.error("No se pudo cargar el curso");
    } finally {
      setLoading(false);
    }
  };
  const onQuizSubmitInternal: SubmitHandler<QuizAnswers> = (answers) => {
    // no hacemos nada: dejamos que el padre dispare esto
  };
  useEffect(() => {
    fetchCourse();
  }, [id]);

  // save or update section
  const handleSaveSection = async () => {
    if (!course) return;
    setSavingSec(true);
    try {
      if (editingSec) {
        await updateSection(editingSec.id, {
          title: secTitle,
          position: secPos,
        });
        toast.success("Sección actualizada");
      } else {
        await createSection({
          title: secTitle,
          position: secPos,
          course_id: course.id,
        });
        toast.success("Sección creada");
      }
      setShowSecModal(false);
      fetchCourse();
    } catch {
      toast.error("Error guardando sección");
    } finally {
      setSavingSec(false);
    }
  };

  // delete section
  const confirmDeleteSection = async () => {
    if (!secToDelete) return;
    setDeletingSecId(secToDelete.id);
    try {
      await deleteSection(secToDelete.id);
      toast.success("Sección eliminada");
      fetchCourse();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setDeletingSecId(null);
      setSecToDelete(null);
    }
  };

  // mark as seen con spinner
  const handleMarkSeen = async () => {
    if (!videoModal.element) return;
    const elId = videoModal.element.id;
    setMarkingId(elId);
    try {
      await markElementAsSeen({ element_id: elId, user_id: user?.user?.id! });
      setVideoModal({ element: null, show: false });
      fetchCourse();
    } catch {
      toast.error("No se pudo actualizar progreso");
    } finally {
      setMarkingId(null);
    }
  };

  const markSeenWithQuiz = handleQuizSubmit(async (answers) => {
    if (!videoModal.element) return;
    setMarkingId(videoModal.element.id);
    try {
      await markElementAsSeen({
        element_id: videoModal.element.id,
        user_id: user?.user?.id!,
        // si tu endpoint espera algo con el quiz, lo pasas aquí:
        quiz_answers: answers,
      });
      toast.success("Tema completado");
      setVideoModal({ element: null, show: false });
      fetchCourse();
    } catch {
      toast.warning("Respuestas incorrectas vuelve a intentarlo.");
    } finally {
      setMarkingId(null);
      resetQuiz();
    }
  });
  if (loading || !course) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const openItemModal = (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setItemModalOpen(true);
  };
  return (
    <Container className="my-5">
      {/* Teacher-only: subsection CRUD */}
      {userIs("teacher") && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Modulos de {course?.title}</h3>
            <Button
              onClick={() => {
                setEditingSec(null);
                setSecTitle("");
                setSecPos(course.sections.length);
                setShowSecModal(true);
              }}
            >
              + Nuevo Modulo
            </Button>
          </div>
          {/* Modal Crear / Editar Sección */}
          <Modal show={showSecModal} onHide={() => setShowSecModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>
                {editingSec ? "Editar Sección" : "Nueva Sección"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    value={secTitle}
                    onChange={(e) => setSecTitle(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Posición</Form.Label>
                  <Form.Control
                    type="number"
                    value={secPos}
                    onChange={(e) => setSecPos(+e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowSecModal(false)}
                disabled={savingSec}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveSection} disabled={savingSec}>
                {savingSec ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : editingSec ? (
                  "Guardar cambios"
                ) : (
                  "Crear sección"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          <Table bordered hover responsive>
            <thead>
              <tr>
                {/* <th>#</th> */}
                <th>Título</th>
                <th>Posicion</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {course?.sections?.map((sec) => (
                <tr key={sec.id}>
                  {/* <td>{i + 1}</td> */}
                  <td>{sec.title}</td>
                  <td>{sec.position}</td>
                  <td>{new Date(sec.created_at).toLocaleString()}</td>
                  <td className="d-flex">
                    {/* Editar */}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      disabled={deletingSecId === sec.id}
                      onClick={() => {
                        setEditingSec(sec);
                        setSecTitle(sec.title);
                        setSecPos(sec.position);
                        setShowSecModal(true);
                      }}
                    >
                      {deletingSecId === sec.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Editar"
                      )}
                    </Button>
                    {/* Eliminar */}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="me-2"
                      disabled={deletingSecId === sec.id}
                      onClick={() => setSecToDelete(sec)}
                    >
                      {deletingSecId === sec.id ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                    {/* Agregar contenido */}
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() => openItemModal(sec.id)}
                    >
                      Temas
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Video timeline */}
      <h2 className="mt-5 mb-1">{course?.title}</h2>
      <p className="mb-5">{course?.description}</p>

      {course?.sections?.map((sec) => (
        <div key={sec.id} className="mb-4">
          <h5 className="text-secondary">{sec.title}</h5>
          <Row className="d-flex flex-column">
            {sec?.elements?.map((el) => (
              <Col
                key={el.id}
                xs={12}
                className="d-flex align-items-center mb-2"
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: el.status_progress ? "#28a745" : "#ccc",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  {el?.position}
                </div>

                {/* Make this wrapper position:relative so we can absolutely position the lock */}
                <div style={{ position: "relative", flex: 1 }}>
                  <Card
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      el.unlock
                        ? setVideoModal({ element: el, show: true })
                        : null
                    }
                    className={!el.unlock ? "opacity-75" : undefined}
                  >
                    <Card.Body className="py-2">{el.title}</Card.Body>
                  </Card>

                  {/* Overlay lock icon when not unlocked */}
                  {!el.unlock && (
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        fontSize: 24,
                        color: "rgba(0,0,0,0.4)",
                        lineHeight: 1,
                      }}
                      aria-label="locked"
                      role="img"
                    >
                      🔒
                    </span>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
      {/* Video player modal */}
      <Modal
        show={videoModal.show}
        size="xl"
        centered
        onHide={() => setVideoModal({ ...videoModal, show: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{videoModal.element?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          {videoModal?.element && (
            <div className="w-100 d-flex flex-column">
              <div style={{ width: "100%", height: "75vh" }}>
                <iframe
                  src={videoModal.element.url}
                  title={videoModal.element.title}
                  width="100%"
                  height="80%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {
                // @ts-ignore: asume que preguntas vienen anidadas en el elemento
                ((videoModal.element as any).questions as Question[])?.length >
                  0 && (
                  <div className="">
                    <h5>Cuestionario</h5>
                    <Questionnaire
                      questions={videoModal.element.questions}
                      control={control}
                      errors={quizErrors}
                      onSubmit={onQuizSubmitInternal}
                    />
                  </div>
                )
              }
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          {/* Botón de “Marcar como visto” con spinner */}
          <Button
            variant={
              videoModal.element?.status_progress ? "success" : "primary"
            }
            onClick={markSeenWithQuiz} // ④ disparamos QUIZ + API
            disabled={markingId === videoModal.element?.id}
          >
            {markingId === videoModal.element?.id ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : videoModal.element?.status_progress ? (
              "✔ Completado"
            ) : (
              "Enviar questionario"
            )}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setVideoModal({ ...videoModal, show: false });
              resetQuiz();
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm delete section */}
      <Modal show={!!secToDelete} onHide={() => setSecToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar borrado</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Eliminar la sección “{secToDelete?.title}”?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSecToDelete(null)}
            disabled={deletingSecId === secToDelete?.id}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteSection}
            disabled={deletingSecId === secToDelete?.id}
          >
            {deletingSecId === secToDelete?.id ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Contenidos (componente externo) */}
      <ContentByCourseDetails
        modalTitle={`Temas modulo ${secTitle}`}
        show={itemModalOpen}
        sectionId={currentSectionId}
        onHide={() => {
          setItemModalOpen(false);
          fetchCourse();
        }}
      />
    </Container>
  );
}
