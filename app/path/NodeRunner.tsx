"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PracticeRunner from "../practice/PracticeRunner";
import type { PracticeOutcomeReport } from "../practice/PracticeRunner";
import { createRng, hashString } from "../practice/rng.ts";
import { resolveNodeContent } from "./node-content.ts";

export type NodeRunnerProps = {
  nodeId: string;
  onComplete: (correctCount: number, totalCount: number) => void;
  onClose: () => void;
  onOutcome?: (report: PracticeOutcomeReport) => void;
  /**
   * 다음 칸으로 바로 이어 가기. 없으면 그리지 않는다.
   *
   * 칸을 끝낼 때마다 길로 돌아가 다음 칸을 다시 찾게 하면, 한 번에 두 칸을
   * 할 마음이 있어도 도중에 끊긴다.
   */
  onNextNode?: () => void;
  /** 다음 칸 제목. 무엇으로 이어지는지 보이면 누르기가 쉬워진다. */
  nextNodeTitle?: string;
};

type Stage = "read" | "check" | "done";

// 생성기 칸은 문제가 무한하므로 최소 몇 문제를 풀어야 칸이 끝나는지 정한다.
// 스펙의 "확인 3문제"와 같은 수다.
const REQUIRED_GENERATOR_QUESTIONS = 3;

export default function NodeRunner({
  nodeId,
  onComplete,
  onClose,
  onOutcome,
  onNextNode,
  nextNodeTitle,
}: NodeRunnerProps) {
  const content = useMemo(() => resolveNodeContent(nodeId), [nodeId]);
  const [stage, setStage] = useState<Stage>("read");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  // 생성기가 붙은 칸은 PracticeRunner가 문제를 내므로 여기서 직접 센다.
  const [generatorCorrect, setGeneratorCorrect] = useState(0);
  const [generatorTotal, setGeneratorTotal] = useState(0);
  // 완료 화면은 이 값을 보여 준다. 진행 중 상태를 그대로 쓰면 생성기 칸에서
  // 방금 맞힌 문제가 0개로 표시된다.
  const [finalScore, setFinalScore] = useState<{ correct: number; total: number } | null>(
    null,
  );
  // 틀린 문제는 해설만 읽고 넘어가면 다음에 또 틀린다.
  // 해설을 본 뒤 스스로 다시 풀어야 넘어갈 수 있게 한다.
  const [retryRound, setRetryRound] = useState(0);
  // 채점 직후 결과로 포커스를 옮긴다. 눌렀던 버튼이 사라지면 포커스가
  // body로 떨어져 키보드 사용자는 매번 처음부터 Tab을 눌러야 한다.
  const resultRef = useRef<HTMLDivElement | null>(null);

  // 훅은 조기 반환보다 위에 있어야 한다. 아래로 내려가면 content가 없을 때
  // 훅 호출 순서가 달라져 React가 상태를 잘못 짝짓는다.
  useEffect(() => {
    if (checked) {
      resultRef.current?.focus();
    }
  }, [checked]);

  if (!content) {
    return (
      <p className="practice-empty" role="status">
        이 칸의 내용을 불러오지 못했어요.
      </p>
    );
  }

  const questions = content.questions;
  const question = questions[questionIndex];

  // 다시 풀 때는 선지 자리를 바꾼다. 자리를 외워서 고르면 다시 푸는 의미가 없다.
  // 같은 라운드에서는 항상 같은 순서라 화면이 흔들리지 않는다.
  const shownChoices =
    question && retryRound > 0
      ? createRng(hashString(`${question.id}:${retryRound}`)).shuffle(question.choices)
      : (question?.choices ?? []);

  const finish = (finalCorrect: number, finalTotal: number) => {
    const total = Math.max(1, finalTotal);
    setFinalScore({ correct: finalCorrect, total });
    setStage("done");
    onComplete(finalCorrect, total);
  };

  const handleGeneratorOutcome = (report: PracticeOutcomeReport) => {
    setGeneratorTotal((previous) => previous + 1);
    if (report.isCorrect) {
      setGeneratorCorrect((previous) => previous + 1);
    }
    onOutcome?.(report);
  };

  const isSubmissionCorrect =
    Boolean(question) &&
    submitted.replace(/\s+/g, "") === (question?.answer ?? "").replace(/\s+/g, "");

  const checkAnswer = () => {
    if (checked || !question) {
      return;
    }
    setChecked(true);
    if (isSubmissionCorrect) {
      // 점수는 첫 시도만 센다. 다시 풀어 맞힌 것은 학습이지 정답률이 아니다.
      if (retryRound === 0) {
        setCorrectCount((previous) => previous + 1);
      }
    }
  };

  /** 같은 문제를 선지 순서만 바꿔 다시 낸다. 자리 기억이 아니라 이유로 고르게 하려는 것이다. */
  const retrySameQuestion = () => {
    setRetryRound((previous) => previous + 1);
    setSubmitted("");
    setChecked(false);
  };

  const goNext = () => {
    if (questionIndex + 1 >= questions.length) {
      finish(correctCount, questions.length);
      return;
    }
    setQuestionIndex((previous) => previous + 1);
    setSubmitted("");
    setChecked(false);
    setRetryRound(0);
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
          {/* 각 덩어리에 이름을 붙인다. 라벨이 없으면 설명인지 공식인지
              실수인지 구분이 안 돼 어디를 봐야 할지 모른다. */}
          <section className="node-block">
            <h4 className="node-block-label">이게 뭐예요?</h4>
            <p className="node-explanation">{content.explanation}</p>
          </section>

          {content.formula ? (
            <section className="node-block">
              <h4 className="node-block-label">외워 둘 것</h4>
              <p className="concept-sheet-formula">{content.formula}</p>
            </section>
          ) : null}

          {content.keyPoints.length > 0 ? (
            <section className="node-block">
              <h4 className="node-block-label">순서대로 볼 것</h4>
              <ol className="node-key-points">
                {content.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ol>
            </section>
          ) : null}

          {content.mistake ? (
            <section className="node-block is-warning">
              <h4 className="node-block-label">여기서 자주 틀려요</h4>
              <p className="concept-sheet-mistake">{content.mistake}</p>
            </section>
          ) : null}

          <button type="button" className="practice-primary" onClick={() => setStage("check")}>
            읽었어요 · 확인 문제 풀기
          </button>
        </>
      ) : null}

      {stage === "check" && content.skillId ? (
        <>
          <PracticeRunner skillId={content.skillId} onOutcome={handleGeneratorOutcome} />
          <button
            type="button"
            className="practice-primary"
            disabled={generatorTotal < REQUIRED_GENERATOR_QUESTIONS}
            onClick={() => finish(generatorCorrect, generatorTotal)}
          >
            {generatorTotal < REQUIRED_GENERATOR_QUESTIONS
              ? `이 칸 끝내기 (${generatorTotal}/${REQUIRED_GENERATOR_QUESTIONS})`
              : "이 칸 끝내기"}
          </button>
        </>
      ) : null}

      {stage === "check" && !content.skillId && question ? (
        <div className="node-check">
          <p className="node-progress">
            {questionIndex + 1} / {questions.length}
          </p>
          <p className="practice-prompt">{question.prompt}</p>

          {shownChoices.length > 0 ? (
            <div className="practice-choices" role="group" aria-label="답 고르기">
              {shownChoices.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  className={`practice-choice${
                    checked && choice.value === question.answer
                      ? " is-answer"
                      : checked && submitted === choice.value
                        ? " is-picked-wrong"
                        : ""
                  }`}
                  aria-pressed={submitted === choice.value}
                  disabled={checked}
                  onClick={() => setSubmitted(choice.value)}
                >
                  {choice.label}
                  {checked && choice.value === question.answer ? (
                    <span className="choice-mark" aria-label="정답">
                      정답
                    </span>
                  ) : null}
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
            <div
              ref={resultRef}
              tabIndex={-1}
              className={`practice-result ${isSubmissionCorrect ? "is-correct" : "is-wrong"}`}
              role="status"
              aria-live="polite"
            >
              <strong>{isSubmissionCorrect ? "맞았어!" : "다시 한 번 보자"}</strong>
              <p>정답 · {question.answer}</p>
              <p className="node-explanation">{question.explanation}</p>
              {isSubmissionCorrect ? (
                <button type="button" className="practice-primary" onClick={goNext}>
                  {questionIndex + 1 >= questions.length ? "이 칸 끝내기" : "다음 문제"}
                </button>
              ) : (
                <button type="button" className="practice-primary" onClick={retrySameQuestion}>
                  해설 읽었으면 직접 다시 풀기
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}

      {content.links.length > 0 ? (
        <details className="node-links">
          <summary>더 보기 · 강의와 자료 {content.links.length}개</summary>
          <ul>
            {content.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer noopener">
                  {link.title}
                </a>
                {link.note ? <small>{link.note}</small> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {stage === "done" ? (
        <div className="practice-result is-correct" role="status" aria-live="polite">
          <strong>이 칸 완료!</strong>
          <p>
            맞힌 문제 {finalScore?.correct ?? 0} / {finalScore?.total ?? 1}
          </p>
          {onNextNode ? (
            <button type="button" className="practice-primary" onClick={onNextNode}>
              다음 칸 이어서 하기{nextNodeTitle ? ` · ${nextNodeTitle}` : ""}
            </button>
          ) : null}
          <button type="button" className="practice-secondary" onClick={onClose}>
            길로 돌아가기
          </button>
        </div>
      ) : null}
    </section>
  );
}
