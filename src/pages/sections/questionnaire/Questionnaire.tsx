// Questionnaire.tsx
import React from "react";
import { Accordion, Form, Button } from "react-bootstrap";
import {
  Controller,
  Control,
  FieldErrors,
  SubmitHandler,
} from "react-hook-form";

export interface Option {
  id: number;
  option: string;
  is_correct: boolean;
}
export interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Props {
  questions: Question[];
  control: Control<Record<number, number>>;
  errors: FieldErrors<Record<number, number>>;
  onSubmit: SubmitHandler<Record<number, number>>;
}

export function Questionnaire({ questions, control, errors, onSubmit }: Props) {
  return (
    <Form onSubmit={onSubmit}>
      <Accordion defaultActiveKey="0">
        {questions?.map((q, idx) => (
          <Accordion.Item eventKey={String(idx)} key={q.id}>
            <Accordion.Header>{q.question}</Accordion.Header>
            <Accordion.Body>
              <Controller
                name={`question_${q.id}` as any}
                control={control}
                rules={{ required: "Selecciona una opción" }}
                render={({ field }) => (
                  <Form.Group>
                    {q.options.map((opt) => (
                      <Form.Check
                        key={opt.id}
                        {...field}
                        type="radio"
                        id={`q${q.id}_opt${opt.id}`}
                        label={opt.option}
                        value={opt.id}
                        checked={field.value === opt.id}
                        onChange={() => field.onChange(opt.id)}
                      />
                    ))}
                    {errors[q.id] && (
                      <Form.Text className="text-danger">
                        {errors[q.id]?.message}
                      </Form.Text>
                    )}
                  </Form.Group>
                )}
              />
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      {/* Nota: ya no hace falta botón “Enviar” aquí,
                pues lo disparas con “markSeenWithQuiz” */}
    </Form>
  );
}
