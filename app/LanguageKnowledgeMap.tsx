"use client";

import { useId, useState, type CSSProperties } from "react";

import {
  LANGUAGE_KNOWLEDGE_CURRICULA,
  type LanguageConceptNode,
  type LanguageCurriculum,
  type LanguageCurriculumChapter,
  type LanguageCurriculumUnit,
  type LanguageSelfCheckQuestion,
  type LanguageSubject,
} from "./language-curriculum";

export type LanguageKnowledgeMapValue = {
  completedConceptIds: string[];
  correctQuestionIds: string[];
};

export type LanguageKnowledgeMapProps = {
  subject: LanguageSubject;
  curriculumMap?: Record<LanguageSubject, LanguageCurriculum>;
  value: LanguageKnowledgeMapValue;
  onChange: (nextValue: LanguageKnowledgeMapValue) => void;
  ariaLabel?: string;
  className?: string;
};

type QuestionFeedback = {
  isCorrect: boolean;
  message: string;
};

type SubjectTheme = {
  accent: string;
  accentSoft: string;
  accentStrong: string;
  surface: string;
  border: string;
  title: string;
};

const subjectLabel: Record<LanguageSubject, string> = {
  korean: "국어",
  english: "영어",
};

const subjectTheme: Record<LanguageSubject, SubjectTheme> = {
  korean: {
    accent: "#b05d1e",
    accentSoft: "#fff2e6",
    accentStrong: "#8c4410",
    surface: "linear-gradient(180deg, #fffaf5 0%, #f8efe6 100%)",
    border: "#ead9c7",
    title: "#3b2818",
  },
  english: {
    accent: "#2062a3",
    accentSoft: "#ebf5ff",
    accentStrong: "#184a7d",
    surface: "linear-gradient(180deg, #f7fbff 0%, #eef5fb 100%)",
    border: "#d5e3f0",
    title: "#12212f",
  },
};

const rootStyle = (theme: SubjectTheme): CSSProperties => ({
  width: "100%",
  maxWidth: 960,
  margin: "0 auto",
  padding: 16,
  display: "grid",
  gap: 16,
  color: theme.title,
  background: theme.surface,
  borderRadius: 24,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});

const cardStyle = (theme: SubjectTheme): CSSProperties => ({
  backgroundColor: "#ffffff",
  border: `1px solid ${theme.border}`,
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 10px 24px rgba(18, 33, 47, 0.06)",
});

const accordionButtonStyle = (theme: SubjectTheme, open: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 16,
  border: open ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
  background: open ? theme.accentSoft : "#ffffff",
  color: theme.title,
  fontWeight: 700,
  cursor: "pointer",
});

const unitButtonStyle = (theme: SubjectTheme, open: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: 14,
  border: open ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
  background: open ? "#fbfdff" : "#ffffff",
  color: theme.title,
  fontWeight: 600,
  cursor: "pointer",
});

const conceptButtonStyle = (theme: SubjectTheme, selected: boolean, completed: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: 14,
  border: selected ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
  background: selected ? theme.accentSoft : "#ffffff",
  color: theme.title,
  cursor: "pointer",
  boxSizing: "border-box",
  boxShadow: completed ? "inset 0 0 0 1px rgba(38, 131, 81, 0.22)" : undefined,
});

const pillStyle = (tone: "accent" | "green" | "slate", theme: SubjectTheme): CSSProperties => {
  const colors: Record<"accent" | "green" | "slate", CSSProperties> = {
    accent: { backgroundColor: theme.accentSoft, color: theme.accentStrong },
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

const actionButtonStyle = (theme: SubjectTheme): CSSProperties => ({
  border: "none",
  borderRadius: 12,
  backgroundColor: theme.accent,
  color: "#ffffff",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
});

const secondaryButtonStyle = (theme: SubjectTheme): CSSProperties => ({
  border: "none",
  borderRadius: 12,
  backgroundColor: "#eef3f7",
  color: theme.title,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
});

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

const progressTrackStyle: CSSProperties = {
  width: "100%",
  height: 8,
  borderRadius: 999,
  backgroundColor: "#edf2f7",
  overflow: "hidden",
};

const createUnique = (values: string[]): string[] => Array.from(new Set(values));

const normalizeAnswer = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, "");

const getFirstUnitIdByChapter = (chapter: LanguageCurriculumChapter): string | null =>
  chapter.units[0]?.id ?? null;

const getFirstConceptIdByChapter = (chapter: LanguageCurriculumChapter): string | null =>
  chapter.units[0]?.concepts[0]?.id ?? null;

const getProgressPercent = (completedCount: number, totalCount: number): number =>
  totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

const getChoiceAnswerLabel = (question: LanguageSelfCheckQuestion): string => {
  if (question.type !== "multipleChoice") {
    return question.answer;
  }

  return question.choices?.find((choice) => choice.value === question.answer)?.label ?? question.answer;
};

export const createEmptyLanguageKnowledgeMapValue = (): LanguageKnowledgeMapValue => ({
  completedConceptIds: [],
  correctQuestionIds: [],
});

export function LanguageKnowledgeMap({
  subject,
  curriculumMap = LANGUAGE_KNOWLEDGE_CURRICULA,
  value,
  onChange,
  ariaLabel,
  className,
}: LanguageKnowledgeMapProps) {
  const curriculum = curriculumMap[subject];
  const theme = subjectTheme[subject];
  const resolvedAriaLabel = ariaLabel ?? `${subjectLabel[subject]} 지식 지도`;
  const baseId = useId();

  const firstChapterId = curriculum.chapters[0]?.id ?? null;
  const fallbackConceptId = curriculum.chapters[0] ? getFirstConceptIdByChapter(curriculum.chapters[0]) : null;

  const [openChapterId, setOpenChapterId] = useState<string | null>(firstChapterId);
  const [openUnitIdByChapter, setOpenUnitIdByChapter] = useState<Record<string, string | null>>(() =>
    curriculum.chapters.reduce<Record<string, string | null>>((current, chapter) => {
      current[chapter.id] = getFirstUnitIdByChapter(chapter);
      return current;
    }, {}),
  );
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(fallbackConceptId);
  const [questionInputs, setQuestionInputs] = useState<Record<string, string>>({});
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, QuestionFeedback>>({});

  const conceptIndex: Record<string, LanguageConceptNode> = {};
  const chapterProgress: Record<
    string,
    {
      conceptCount: number;
      completedCount: number;
      questionCount: number;
      correctCount: number;
    }
  > = {};

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
        questionCount += 1;
        if (value.correctQuestionIds.includes(concept.selfCheckQuestion.id)) {
          correctCount += 1;
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
    openChapterId && curriculum.chapters.some((chapter) => chapter.id === openChapterId) ? openChapterId : firstChapterId;

  const resolvedOpenUnitIdByChapter = curriculum.chapters.reduce<Record<string, string | null>>((current, chapter) => {
    const currentUnitId = openUnitIdByChapter[chapter.id];
    current[chapter.id] = chapter.units.some((unit) => unit.id === currentUnitId)
      ? currentUnitId
      : getFirstUnitIdByChapter(chapter);
    return current;
  }, {});

  const selectedConcept =
    (selectedConceptId ? conceptIndex[selectedConceptId] : null) ??
    (fallbackConceptId ? conceptIndex[fallbackConceptId] : null) ??
    (curriculum.chapters[0]?.units[0]?.concepts[0] ?? null);

  const resolvedPrerequisites = (concept: LanguageConceptNode): string[] =>
    concept.prerequisites.map((item) => {
      if (!item.conceptId) {
        return item.label;
      }

      return conceptIndex[item.conceptId]?.title ?? item.label;
    });

  const updateValue = (nextValue: LanguageKnowledgeMapValue) => {
    onChange({
      completedConceptIds: createUnique(nextValue.completedConceptIds),
      correctQuestionIds: createUnique(nextValue.correctQuestionIds),
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

  const submitQuestion = (question: LanguageSelfCheckQuestion) => {
    const currentInput = normalizeAnswer(questionInputs[question.id] ?? "");
    const isCorrect = question.acceptableAnswers.some((answer) => normalizeAnswer(answer) === currentInput);
    const answerLabel = getChoiceAnswerLabel(question);
    const message = isCorrect
      ? `정답입니다. ${answerLabel}까지 정확히 잡았습니다. ${question.explanation}`
      : `괜찮아요. 지금 발견해서 이득이에요. 정답은 ${answerLabel}입니다. ${question.explanation}`;

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

  const selectChapter = (chapter: LanguageCurriculumChapter) => {
    const nextOpenChapterId = resolvedOpenChapterId === chapter.id ? null : chapter.id;
    setOpenChapterId(nextOpenChapterId);

    if (!nextOpenChapterId) {
      return;
    }

    const nextUnitId = resolvedOpenUnitIdByChapter[chapter.id] ?? getFirstUnitIdByChapter(chapter);
    setOpenUnitIdByChapter((current) => ({
      ...current,
      [chapter.id]: nextUnitId,
    }));
    setSelectedConceptId(getFirstConceptIdByChapter(chapter));
  };

  const selectUnit = (chapter: LanguageCurriculumChapter, unit: LanguageCurriculumUnit) => {
    setOpenChapterId(chapter.id);
    setOpenUnitIdByChapter((current) => ({
      ...current,
      [chapter.id]: current[chapter.id] === unit.id ? null : unit.id,
    }));
    setSelectedConceptId(unit.concepts[0]?.id ?? null);
  };

  return (
    <section aria-label={resolvedAriaLabel} className={className} style={rootStyle(theme)}>
      <header style={cardStyle(theme)}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pillStyle("accent", theme)}>{subjectLabel[subject]}</span>
            <span style={pillStyle("slate", theme)}>고1 수준 / 2028학년도 수능 체제 기준</span>
            <span style={pillStyle("green", theme)}>모바일 360px 아코디언</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.35 }}>{curriculum.title}</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{curriculum.subtitle}</p>
          <p style={{ margin: 0, color: "#4a6175", lineHeight: 1.6 }}>{curriculum.note}</p>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            {curriculum.guideBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pillStyle("green", theme)}>완료 개념 {value.completedConceptIds.length}개</span>
            <span style={pillStyle("slate", theme)}>정답 처리 {value.correctQuestionIds.length}개</span>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gap: 12 }}>
        {curriculum.chapters.map((chapter) => {
          const isChapterOpen = resolvedOpenChapterId === chapter.id;
          const panelId = `${baseId}-${chapter.id}-panel`;
          const progress = chapterProgress[chapter.id];
          const progressPercent = getProgressPercent(progress.completedCount, progress.conceptCount);

          return (
            <section key={chapter.id} style={cardStyle(theme)}>
              <button
                type="button"
                aria-expanded={isChapterOpen}
                aria-controls={panelId}
                onClick={() => selectChapter(chapter)}
                style={accordionButtonStyle(theme, isChapterOpen)}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span>{chapter.title}</span>
                    <span style={pillStyle(progress.completedCount === progress.conceptCount ? "green" : "slate", theme)}>
                      {progress.completedCount}/{progress.conceptCount} 개념
                    </span>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{chapter.objective}</span>
                  <span style={{ fontSize: 13, color: "#4d6478", fontWeight: 600 }}>3분 시작: {chapter.starterAction}</span>
                  <div
                    role="progressbar"
                    aria-label={`${chapter.title} 대단원 진도`}
                    aria-valuemin={0}
                    aria-valuemax={progress.conceptCount}
                    aria-valuenow={progress.completedCount}
                    style={{ display: "grid", gap: 6 }}
                  >
                    <div style={progressTrackStyle}>
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: "100%",
                          backgroundColor: theme.accent,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: "#5a7185" }}>
                      대단원 진도 {progressPercent}% · 자가진단 정답 {progress.correctCount}/{progress.questionCount}
                    </span>
                  </div>
                </div>
              </button>

              {chapter.note ? <p style={{ margin: "10px 0 0", color: "#496276", lineHeight: 1.55 }}>{chapter.note}</p> : null}

              {isChapterOpen ? (
                <div id={panelId} style={{ display: "grid", gap: 12, marginTop: 14 }}>
                  {chapter.units.map((unit) => {
                    const isUnitOpen = resolvedOpenUnitIdByChapter[chapter.id] === unit.id;
                    const unitPanelId = `${baseId}-${unit.id}-panel`;

                    return (
                      <section key={unit.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 16, padding: 12 }}>
                        <button
                          type="button"
                          aria-expanded={isUnitOpen}
                          aria-controls={unitPanelId}
                          onClick={() => selectUnit(chapter, unit)}
                          style={unitButtonStyle(theme, isUnitOpen)}
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
                              const isSolved = value.correctQuestionIds.includes(concept.selfCheckQuestion.id);

                              return (
                                <button
                                  key={concept.id}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => setSelectedConceptId(concept.id)}
                                  style={conceptButtonStyle(theme, isSelected, isCompleted)}
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
                                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                        {isCompleted ? <span style={pillStyle("green", theme)}>완료</span> : null}
                                        {isSolved ? <span style={pillStyle("slate", theme)}>진단 정답</span> : null}
                                      </div>
                                    </div>
                                    <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4e6478" }}>{concept.summary}</span>
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
        <section style={cardStyle(theme)} aria-live="polite">
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <span style={pillStyle("accent", theme)}>세부 개념</span>
                <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.35 }}>{selectedConcept.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.65 }}>{selectedConcept.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleConceptComplete(selectedConcept.id)}
                style={value.completedConceptIds.includes(selectedConcept.id) ? secondaryButtonStyle(theme) : actionButtonStyle(theme)}
              >
                {value.completedConceptIds.includes(selectedConcept.id) ? "완료 해제" : "개념 완료 표시"}
              </button>
            </div>

            <section>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>선수 개념</h4>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {resolvedPrerequisites(selectedConcept).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>핵심 포인트</h4>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {selectedConcept.corePoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>추천 30~60분 루틴</h4>
              <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {selectedConcept.recommendedRoutine.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>

            <section>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>통과 기준</h4>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                {selectedConcept.passCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>짧은 자가진단</h4>
              {(() => {
                const question = selectedConcept.selfCheckQuestion;
                const inputId = `${baseId}-${question.id}-input`;
                const resultId = `${baseId}-${question.id}-result`;
                const feedback = questionFeedback[question.id];
                const answerValue = questionInputs[question.id] ?? "";
                const solved = value.correctQuestionIds.includes(question.id);

                return (
                  <article
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: 16,
                      padding: 14,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <strong>{question.prompt}</strong>
                      {solved ? <span style={pillStyle("green", theme)}>정답 기록됨</span> : null}
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
                                border: `1px solid ${theme.border}`,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                id={choiceId}
                                name={inputId}
                                type="radio"
                                value={choice.value}
                                checked={answerValue === choice.value}
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
                          value={answerValue}
                          placeholder={question.placeholder}
                          aria-describedby={resultId}
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
                      <button type="button" onClick={() => submitQuestion(question)} style={actionButtonStyle(theme)}>
                        제출
                      </button>
                      <span style={{ fontSize: 13, color: "#5a7185" }}>제출하면 정오답과 해설이 바로 보입니다.</span>
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
                      }}
                    >
                      {feedback?.message ?? ""}
                    </div>
                  </article>
                );
              })()}
            </section>

            <section>
              <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>EBSi 공식 링크</h4>
              <div style={{ display: "grid", gap: 10 }}>
                {selectedConcept.resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: 14,
                      padding: 14,
                      textDecoration: "none",
                      color: theme.title,
                      backgroundColor: "#fbfdff",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={pillStyle("accent", theme)}>{resource.label}</span>
                      <strong>{resource.title}</strong>
                    </div>
                    <span style={{ lineHeight: 1.6 }}>{resource.note}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default LanguageKnowledgeMap;
