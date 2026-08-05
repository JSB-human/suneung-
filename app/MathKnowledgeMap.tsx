"use client";

import { useId, useState, type CSSProperties } from "react";

import {
  MATH_KNOWLEDGE_CURRICULUM,
  type MathConceptNode,
  type MathCurriculum,
  type MathCurriculumChapter,
  type MathCurriculumUnit,
  type MathPracticeQuestion,
} from "./math-curriculum";

export type MathKnowledgeMapValue = {
  completedConceptIds: string[];
  correctQuestionIds: string[];
};

export type MathKnowledgeMapProps = {
  curriculum?: MathCurriculum;
  value: MathKnowledgeMapValue;
  onChange: (nextValue: MathKnowledgeMapValue) => void;
  ariaLabel?: string;
  className?: string;
};

type QuestionFeedback = {
  isCorrect: boolean;
  message: string;
};

const rootStyle: CSSProperties = {
  width: "100%",
  maxWidth: 960,
  margin: "0 auto",
  padding: 16,
  display: "grid",
  gap: 16,
  color: "#12212f",
  background: "linear-gradient(180deg, #f7fbff 0%, #eef5fb 100%)",
  borderRadius: 24,
  border: "1px solid #d6e4f0",
  boxSizing: "border-box",
};

const cardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #dbe6ef",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 10px 24px rgba(18, 33, 47, 0.06)",
};

const chapterButtonStyle = (open: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 16,
  border: open ? "1px solid #2d6fb7" : "1px solid #d5e2ec",
  background: open ? "#edf5ff" : "#ffffff",
  color: "#13324b",
  fontWeight: 700,
  cursor: "pointer",
});

const unitButtonStyle = (open: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: 14,
  border: open ? "1px solid #2d6fb7" : "1px solid #d5e2ec",
  background: open ? "#f5f9ff" : "#fbfdff",
  color: "#16354d",
  fontWeight: 600,
  cursor: "pointer",
});

const conceptButtonStyle = (selected: boolean, completed: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: 14,
  border: selected ? "1px solid #2d6fb7" : "1px solid #d5e2ec",
  background: selected ? "#e8f2ff" : "#ffffff",
  color: "#12212f",
  cursor: "pointer",
  position: "relative",
  boxSizing: "border-box",
  boxShadow: completed ? "inset 0 0 0 1px rgba(38, 131, 81, 0.22)" : undefined,
});

const pillStyle = (tone: "blue" | "green" | "slate"): CSSProperties => {
  const colors: Record<typeof tone, CSSProperties> = {
    blue: { backgroundColor: "#e7f1ff", color: "#205c98" },
    green: { backgroundColor: "#e8f7ee", color: "#1f7a4f" },
    slate: { backgroundColor: "#eef3f7", color: "#42586b" },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    ...colors[tone],
  };
};

const actionButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 12,
  backgroundColor: "#2062a3",
  color: "#ffffff",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  ...actionButtonStyle,
  backgroundColor: "#eef3f7",
  color: "#18354d",
};

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #c9d8e5",
  padding: "10px 12px",
  fontSize: 15,
  color: "#12212f",
  boxSizing: "border-box",
  backgroundColor: "#ffffff",
};

const normalizeAnswer = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, "");

const createUnique = (values: string[]): string[] => Array.from(new Set(values));

const getFirstUnitIdByChapter = (chapter: MathCurriculumChapter): string | null =>
  chapter.units[0]?.id ?? null;

const getFirstConceptIdByChapter = (chapter: MathCurriculumChapter): string | null =>
  chapter.units[0]?.concepts[0]?.id ?? null;

export const createEmptyMathKnowledgeMapValue = (): MathKnowledgeMapValue => ({
  completedConceptIds: [],
  correctQuestionIds: [],
});

export function MathKnowledgeMap({
  curriculum = MATH_KNOWLEDGE_CURRICULUM,
  value,
  onChange,
  ariaLabel = "수학 지식 지도",
  className,
}: MathKnowledgeMapProps) {
  const firstChapterId = curriculum.chapters[0]?.id ?? null;
  const fallbackChapterId = firstChapterId;
  const fallbackConceptId = curriculum.chapters[0] ? getFirstConceptIdByChapter(curriculum.chapters[0]) : null;
  const [openChapterId, setOpenChapterId] = useState<string | null>(firstChapterId);
  const [openUnitIdByChapter, setOpenUnitIdByChapter] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(curriculum.chapters.map((chapter) => [chapter.id, getFirstUnitIdByChapter(chapter)])),
  );
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(fallbackConceptId);
  const [questionInputs, setQuestionInputs] = useState<Record<string, string>>({});
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, QuestionFeedback>>({});
  const baseId = useId();

  const conceptIndex: Record<string, MathConceptNode> = {};
  const chapterProgress: Record<string, { conceptCount: number; completedCount: number; questionCount: number; correctCount: number }> = {};

  for (const chapter of curriculum.chapters) {
    let conceptCount = 0;
    let completedCount = 0;
    let questionCount = 0;
    let correctCount = 0;

    for (const unit of chapter.units) {
      for (const concept of unit.concepts) {
        conceptIndex[concept.id] = concept;
        conceptCount += 1;
        if (value.completedConceptIds.includes(concept.id)) {
          completedCount += 1;
        }
        questionCount += concept.practiceQuestions.length;
        for (const question of concept.practiceQuestions) {
          if (value.correctQuestionIds.includes(question.id)) {
            correctCount += 1;
          }
        }
      }
    }

    chapterProgress[chapter.id] = {
      conceptCount,
      completedCount,
      questionCount,
      correctCount,
    };
  }

  const resolvedOpenChapterId =
    openChapterId && curriculum.chapters.some((chapter) => chapter.id === openChapterId) ? openChapterId : fallbackChapterId;

  const selectedConcept =
    (selectedConceptId ? conceptIndex[selectedConceptId] : null) ??
    (fallbackConceptId ? conceptIndex[fallbackConceptId] : null) ??
    (curriculum.chapters[0]?.units[0]?.concepts[0] ?? null);

  const updateValue = (next: MathKnowledgeMapValue) => {
    onChange({
      completedConceptIds: createUnique(next.completedConceptIds),
      correctQuestionIds: createUnique(next.correctQuestionIds),
    });
  };

  const toggleConceptComplete = (conceptId: string) => {
    const alreadyCompleted = value.completedConceptIds.includes(conceptId);
    updateValue({
      ...value,
      completedConceptIds: alreadyCompleted
        ? value.completedConceptIds.filter((id) => id !== conceptId)
        : [...value.completedConceptIds, conceptId],
    });
  };

  const submitQuestion = (question: MathPracticeQuestion) => {
    const currentInput = normalizeAnswer(questionInputs[question.id] ?? "");
    const isCorrect = question.acceptableAnswers.some((answer) => normalizeAnswer(answer) === currentInput);
    const message = isCorrect
      ? `좋아요. 식의 구조와 계산 기준을 정확히 읽었어요. ${question.explanation}`
      : `괜찮아요. 지금 발견해서 이득이에요. ${question.explanation}` + "`n다음에는 핵심 규칙 한 줄만 다시 보고 바로 다시 풀어 보세요.";

    setQuestionFeedback((current) => ({
      ...current,
      [question.id]: {
        isCorrect,
        message,
      },
    }));

    if (isCorrect && !value.correctQuestionIds.includes(question.id)) {
      updateValue({
        ...value,
        correctQuestionIds: [...value.correctQuestionIds, question.id],
      });
    }
  };

  const selectChapter = (chapter: MathCurriculumChapter) => {
    const nextOpen = resolvedOpenChapterId === chapter.id ? null : chapter.id;
    setOpenChapterId(nextOpen);
    if (!nextOpen) {
      return;
    }

    const nextUnitId = openUnitIdByChapter[chapter.id] ?? getFirstUnitIdByChapter(chapter);
    setOpenUnitIdByChapter((current) => ({
      ...current,
      [chapter.id]: nextUnitId,
    }));

    setSelectedConceptId(getFirstConceptIdByChapter(chapter));
  };

  const selectUnit = (chapter: MathCurriculumChapter, unit: MathCurriculumUnit) => {
    setOpenChapterId(chapter.id);
    setOpenUnitIdByChapter((current) => ({
      ...current,
      [chapter.id]: current[chapter.id] === unit.id ? null : unit.id,
    }));
    setSelectedConceptId(unit.concepts[0]?.id ?? null);
  };

  const resolvedPrerequisites = (concept: MathConceptNode) =>
    concept.prerequisites.map((prerequisite) => {
      if (!prerequisite.conceptId) {
        return prerequisite.label;
      }

      return conceptIndex[prerequisite.conceptId]?.title ?? prerequisite.label;
    });

  return (
    <section aria-label={ariaLabel} className={className} style={rootStyle}>
      <header style={cardStyle}>
        <div style={{ display: "grid", gap: 10 }}>
          <span style={pillStyle("blue")}>고1 기초 · 2028 수능 기준</span>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.35 }}>{curriculum.title}</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{curriculum.subtitle}</p>
          <p style={{ margin: 0, color: "#4a6175", lineHeight: 1.6 }}>{curriculum.note}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pillStyle("green")}>완료 개념 {value.completedConceptIds.length}개</span>
            <span style={pillStyle("slate")}>정답 처리 문제 {value.correctQuestionIds.length}개</span>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gap: 12 }}>
        {curriculum.chapters.map((chapter) => {
          const chapterPanelId = `${baseId}-${chapter.id}-panel`;
          const isChapterOpen = resolvedOpenChapterId === chapter.id;
          const progress = chapterProgress[chapter.id];

          return (
            <section key={chapter.id} style={cardStyle}>
              <button
                type="button"
                aria-expanded={isChapterOpen}
                aria-controls={chapterPanelId}
                onClick={() => selectChapter(chapter)}
                style={chapterButtonStyle(isChapterOpen)}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <span>{chapter.title}</span>
                    <span style={pillStyle(progress.completedCount === progress.conceptCount ? "green" : "slate")}>
                      {progress.completedCount}/{progress.conceptCount} 개념
                    </span>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{chapter.objective}</span>
                  <span style={{ fontSize: 13, color: "#4d6478", fontWeight: 500 }}>
                    문제 정답 {progress.correctCount}/{progress.questionCount}
                  </span>
                </div>
              </button>

              {chapter.note ? (
                <p style={{ margin: "10px 0 0", color: "#496276", lineHeight: 1.55 }}>{chapter.note}</p>
              ) : null}

              {isChapterOpen ? (
                <div id={chapterPanelId} style={{ display: "grid", gap: 12, marginTop: 14 }}>
                  {chapter.units.map((unit) => {
                    const isUnitOpen = openUnitIdByChapter[chapter.id] === unit.id;
                    const unitPanelId = `${baseId}-${unit.id}-panel`;

                    return (
                      <section key={unit.id} style={{ border: "1px solid #e1ebf3", borderRadius: 16, padding: 12 }}>
                        <button
                          type="button"
                          aria-expanded={isUnitOpen}
                          aria-controls={unitPanelId}
                          onClick={() => selectUnit(chapter, unit)}
                          style={unitButtonStyle(isUnitOpen)}
                        >
                          <div style={{ display: "grid", gap: 6 }}>
                            <span>{unit.title}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#4d6478" }}>{unit.objective}</span>
                          </div>
                        </button>

                        {isUnitOpen ? (
                          <div id={unitPanelId} style={{ display: "grid", gap: 10, marginTop: 12 }}>
                            {unit.concepts.map((concept) => {
                              const isSelected = concept.id === selectedConcept?.id;
                              const isCompleted = value.completedConceptIds.includes(concept.id);
                              const solvedCount = concept.practiceQuestions.filter((question) =>
                                value.correctQuestionIds.includes(question.id),
                              ).length;

                              return (
                                <button
                                  key={concept.id}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedConceptId(concept.id)}
                                  style={conceptButtonStyle(isSelected, isCompleted)}
                                >
                                  <div style={{ display: "grid", gap: 8 }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 8,
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <strong style={{ fontSize: 15 }}>{concept.title}</strong>
                                      {isCompleted ? <span style={pillStyle("green")}>완료</span> : null}
                                    </div>
                                    <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4e6478" }}>{concept.summary}</span>
                                    <span style={{ fontSize: 12, color: "#5a7185" }}>
                                      문제 정답 {solvedCount}/{concept.practiceQuestions.length}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {selectedConcept ? (
        <section style={cardStyle} aria-live="polite">
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <span style={pillStyle("blue")}>세부 개념</span>
                <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.35 }}>{selectedConcept.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.65 }}>{selectedConcept.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleConceptComplete(selectedConcept.id)}
                style={value.completedConceptIds.includes(selectedConcept.id) ? secondaryButtonStyle : actionButtonStyle}
              >
                {value.completedConceptIds.includes(selectedConcept.id) ? "완료 해제" : "개념 완료 표시"}
              </button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <section>
                <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>선수 개념</h4>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                  {resolvedPrerequisites(selectedConcept).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>핵심 공식·원리</h4>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                  {selectedConcept.corePrinciples.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>대표 예제</h4>
                <div style={{ border: "1px solid #dde8f1", borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
                  <strong>{selectedConcept.workedExample.prompt}</strong>
                  <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                    {selectedConcept.workedExample.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <span style={{ fontWeight: 700, color: "#1d5d96" }}>{selectedConcept.workedExample.answer}</span>
                </div>
              </section>

              <section>
                <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>직접 풀어 보기</h4>
                <div style={{ display: "grid", gap: 12 }}>
                  {selectedConcept.practiceQuestions.map((question, index) => {
                    const inputId = `${baseId}-${question.id}-input`;
                    const resultId = `${baseId}-${question.id}-result`;
                    const feedback = questionFeedback[question.id];
                    const valueFromInput = questionInputs[question.id] ?? "";
                    const alreadySolved = value.correctQuestionIds.includes(question.id);

                    return (
                      <article
                        key={question.id}
                        style={{
                          border: "1px solid #dde8f1",
                          borderRadius: 16,
                          padding: 14,
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                          <strong>
                            문제 {index + 1}. {question.prompt}
                          </strong>
                          {alreadySolved ? <span style={pillStyle("green")}>정답 기록됨</span> : null}
                        </div>

                        {question.type === "multipleChoice" ? (
                          <fieldset style={{ margin: 0, padding: 0, border: "none", display: "grid", gap: 8 }}>
                            <legend style={{ fontSize: 14, fontWeight: 600 }}>{question.inputLabel}</legend>
                            {question.choices?.map((choice) => {
                              const choiceId = `${inputId}-${choice.value}`;
                              return (
                                <label
                                  key={choice.value}
                                  htmlFor={choiceId}
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    border: "1px solid #d7e3ec",
                                    cursor: "pointer",
                                  }}
                                >
                                  <input
                                    id={choiceId}
                                    name={inputId}
                                    type="radio"
                                    value={choice.value}
                                    checked={valueFromInput === choice.value}
                                    onChange={(event) =>
                                      setQuestionInputs((current) => ({
                                        ...current,
                                        [question.id]: event.target.value,
                                      }))
                                    }
                                  />
                                  <span>{choice.label}</span>
                                </label>
                              );
                            })}
                          </fieldset>
                        ) : (
                          <div style={{ display: "grid", gap: 8 }}>
                            <label htmlFor={inputId} style={{ fontWeight: 600, fontSize: 14 }}>
                              {question.inputLabel}
                            </label>
                            <input
                              id={inputId}
                              type="text"
                              inputMode="text"
                              value={valueFromInput}
                              placeholder={question.placeholder}
                              onChange={(event) =>
                                setQuestionInputs((current) => ({
                                  ...current,
                                  [question.id]: event.target.value,
                                }))
                              }
                              style={inputStyle}
                            />
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <button type="button" onClick={() => submitQuestion(question)} style={actionButtonStyle}>
                            제출
                          </button>
                          <span style={{ fontSize: 13, color: "#5a7185" }}>정답 제출 후 바로 해설을 확인할 수 있습니다.</span>
                        </div>

                        <div
                          id={resultId}
                          role="status"
                          aria-live="polite"
                          style={{
                            minHeight: 24,
                            color: feedback?.isCorrect ? "#1f7a4f" : "#8a6b2f",
                            fontWeight: 600,
                            lineHeight: 1.6,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {feedback?.message ?? ""}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>EBSi 공식 강좌 연결</h4>
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedConcept.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        border: "1px solid #d8e4ee",
                        borderRadius: 14,
                        padding: 14,
                        textDecoration: "none",
                        color: "#143148",
                        backgroundColor: "#fbfdff",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={pillStyle("blue")}>{resource.label}</span>
                        <strong>{resource.title}</strong>
                      </div>
                      <span style={{ lineHeight: 1.6 }}>{resource.note}</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default MathKnowledgeMap;
