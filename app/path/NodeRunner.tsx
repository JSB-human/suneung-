"use client";

import { useMemo, useState } from "react";
import PracticeRunner from "../practice/PracticeRunner";
import type { PracticeOutcomeReport } from "../practice/PracticeRunner";
import { resolveNodeContent } from "./node-content.ts";

export type NodeRunnerProps = {
  nodeId: string;
  onComplete: (correctCount: number, totalCount: number) => void;
  onClose: () => void;
  onOutcome?: (report: PracticeOutcomeReport) => void;
};

type Stage = "read" | "check" | "done";

export default function NodeRunner({
  nodeId,
  onComplete,
  onClose,
  onOutcome,
}: NodeRunnerProps) {
  const content = useMemo(() => resolveNodeContent(nodeId), [nodeId]);
  const [stage, setStage] = useState<Stage>("read");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!content) {
    return (
      <p className="practice-empty" role="status">
        이 칸의 내용을 불러오지 못했어요.
      </p>
    );
  }

  const questions = content.questions;
  const question = questions[questionIndex];

  const finish = (finalCorrect: number) => {
    setStage("done");
    onComplete(finalCorrect, Math.max(1, questions.length));
  };

  const checkAnswer = () => {
    if (checked || !question) {
      return;
    }
    setChecked(true);
    if (submitted.replace(/\s+/g, "") === question.answer.replace(/\s+/g, "")) {
      setCorrectCount((previous) => previous + 1);
    }
  };

  const goNext = () => {
    if (questionIndex + 1 >= questions.length) {
      finish(correctCount);
      return;
    }
    setQuestionIndex((previous) => previous + 1);
    setSubmitted("");
    setChecked(false);
  };

  return (
    <section className="node-runner" aria-label={`${content.title} 학습`}>
      <div className="node-runner-head">
        <h3>{content.title}</h3>
        <button type="button" className="practice-secondary" onClick={onClose}>
          닫기
        </button>
      </div>

      {stage === "read" ? (
        <>
          <p className="node-explanation">{content.explanation}</p>

          {content.formula ? <p className="concept-sheet-formula">{content.formula}</p> : null}

          {content.keyPoints.length > 0 ? (
            <ul className="concept-sheet-points">
              {content.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}

          {content.mistake ? (
            <p className="concept-sheet-mistake">자주 하는 실수 · {content.mistake}</p>
          ) : null}

          <button type="button" className="practice-primary" onClick={() => setStage("check")}>
            확인 문제 풀기
          </button>
        </>
      ) : null}

      {stage === "check" && content.skillId ? (
        <>
          <PracticeRunner skillId={content.skillId} onOutcome={onOutcome} />
          <button type="button" className="practice-primary" onClick={() => finish(3)}>
            이 칸 끝내기
          </button>
        </>
      ) : null}

      {stage === "check" && !content.skillId && question ? (
        <div className="node-check">
          <p className="node-progress">
            {questionIndex + 1} / {questions.length}
          </p>
          <p className="practice-prompt">{question.prompt}</p>

          {question.choices.length > 0 ? (
            <div className="practice-choices" role="group" aria-label="답 고르기">
              {question.choices.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  className="practice-choice"
                  aria-pressed={submitted === choice.value}
                  disabled={checked}
                  onClick={() => setSubmitted(choice.value)}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="node-input"
              type="text"
              value={submitted}
              disabled={checked}
              onChange={(event) => setSubmitted(event.target.value)}
              aria-label="답 입력"
            />
          )}

          {!checked ? (
            <button
              type="button"
              className="practice-primary"
              disabled={!submitted.trim()}
              onClick={checkAnswer}
            >
              정답 확인
            </button>
          ) : (
            <div className="practice-result" role="status" aria-live="polite">
              <p>정답 · {question.answer}</p>
              <p className="node-explanation">{question.explanation}</p>
              <button type="button" className="practice-primary" onClick={goNext}>
                {questionIndex + 1 >= questions.length ? "이 칸 끝내기" : "다음 문제"}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {stage === "done" ? (
        <div className="practice-result is-correct" role="status" aria-live="polite">
          <strong>이 칸 완료!</strong>
          <p>
            맞힌 문제 {correctCount} / {Math.max(1, questions.length)}
          </p>
          <button type="button" className="practice-primary" onClick={onClose}>
            길로 돌아가기
          </button>
        </div>
      ) : null}
    </section>
  );
}
