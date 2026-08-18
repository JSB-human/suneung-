"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConceptSheet from "./ConceptSheet";
import MikuPartner from "../miku/MikuPartner";
import { pickMikuLine, type MikuEvent, type MikuLine } from "../miku/miku-lines.ts";
import type { MikuMood } from "../miku/miku-mood.ts";
import { resolveConceptSource } from "./concept-source.ts";
import { gradeAnswer } from "./grading.ts";
import { hasSkill } from "./generators/registry.ts";
import { generateSafely } from "./safe-generate.ts";
import { getSkillEntry } from "./skill-map.ts";
import type { GeneratedQuestion, Level } from "./types.ts";

export type PracticeOutcomeReport = {
  skillId: string;
  seed: number;
  level: Level;
  isCorrect: boolean;
  mistakeTag: string | null;
  hintsUsed: number;
  elapsedSeconds: number;
};

export type PracticeRunnerProps = {
  skillId: string;
  level?: Level;
  initialSeed?: number;
  onOutcome?: (report: PracticeOutcomeReport) => void;
  /** 미쿠 기분. 넘기지 않으면 무난한 기본값으로 반응한다. */
  mood?: MikuMood;
};

/** 이만큼 연속으로 맞히면 미쿠가 다른 말을 한다. */
const CORRECT_STREAK_EVENT_AT = 3;

export default function PracticeRunner({
  skillId,
  level = 1,
  initialSeed,
  onOutcome,
  mood = "encouraging",
}: PracticeRunnerProps) {
  const entry = getSkillEntry(skillId);
  const supported = Boolean(entry) && hasSkill(skillId);
  const hasConcept = Boolean(resolveConceptSource(skillId));

  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [conceptOpen, setConceptOpen] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  // 0으로 시작해도 안전하다: 첫 문항 마운트 이펙트가 실제 문제를 만들기 전에
  // 항상 이 값을 Date.now()로 덮어쓰므로, check()가 이 값을 읽는 시점엔
  // 이미 갱신되어 있다. useRef 초기화 인자에서 Date.now()를 바로 부르면
  // react-hooks/purity 규칙(렌더 중 impure 함수 호출 금지)에 걸린다.
  const startedAtRef = useRef<number>(0);
  // 채점 직후 결과로 포커스를 옮긴다. 안 그러면 눌렀던 버튼이 사라지면서
  // 포커스가 body로 떨어져, 키보드 사용자는 매 문제마다 처음부터 Tab을 눌러야 한다.
  const resultRef = useRef<HTMLDivElement | null>(null);

  // 미쿠 반응. 대사를 고르는 일은 순수 모듈이 하고, 여기서는 언제 부를지만 정한다.
  const [reaction, setReaction] = useState<MikuLine | null>(null);
  const correctRunRef = useRef(0);
  const wrongRunRef = useRef(0);
  // 직전에 쓴 대사는 다시 뽑지 않는다. 렌더에 쓰이지 않는 값이라 ref로 둔다.
  const lastLineIdRef = useRef<string | null>(null);

  const react = useCallback(
    (event: MikuEvent, mistakeTag: string | null = null) => {
      const line = pickMikuLine({
        event,
        mood,
        previousLineId: lastLineIdRef.current,
        seed: Date.now(),
        mistakeTag,
      });
      lastLineIdRef.current = line.id;
      setReaction(line);
    },
    [mood],
  );

  // 첫 문항은 마운트 후에 만든다. 시드가 무작위라 서버 렌더에서 만들면
  // 클라이언트와 다른 문제가 나와 하이드레이션이 어긋난다.
  useEffect(() => {
    if (!supported) {
      return;
    }
    // 무작위 시드 문제 생성은 서버 렌더와 어긋나므로 의도적으로 마운트 후 클라이언트에서만 실행한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestion(generateSafely(skillId, level, initialSeed));
    startedAtRef.current = Date.now();
    setSelected(null);
    setChecked(false);
    setHintsShown(0);
  }, [initialSeed, level, skillId, supported]);

  // 채점되면 결과로 포커스를 옮긴다.
  useEffect(() => {
    if (checked) {
      resultRef.current?.focus();
    }
  }, [checked]);

  const result = useMemo(
    () => (question && checked && selected ? gradeAnswer(question, selected) : null),
    [checked, question, selected],
  );

  const nextQuestion = useCallback(() => {
    setQuestion(generateSafely(skillId, level));
    startedAtRef.current = Date.now();
    setSelected(null);
    setChecked(false);
    setHintsShown(0);
    setReaction(null);
  }, [level, skillId]);

  const showHint = useCallback(() => {
    if (hintsShown >= 3) {
      return;
    }
    setHintsShown(hintsShown + 1);
    react("hintUsed");
  }, [hintsShown, react]);

  const check = useCallback(() => {
    if (!question || !selected || checked) {
      return;
    }
    const graded = gradeAnswer(question, selected);
    setChecked(true);
    setAttemptCount((previous) => previous + 1);
    if (graded.isCorrect) {
      setSolvedCount((previous) => previous + 1);
      correctRunRef.current += 1;
      wrongRunRef.current = 0;
      react(
        correctRunRef.current >= CORRECT_STREAK_EVENT_AT ? "correctStreak3" : "correct",
      );
    } else {
      wrongRunRef.current += 1;
      correctRunRef.current = 0;
      // 여기가 이 기능의 핵심이다. 고른 오답의 mistakeTag가 그대로 넘어가면
      // "아쉽다"가 아니라 어디서 어긋났는지가 나온다.
      react(wrongRunRef.current >= 2 ? "wrongTwice" : "wrong", graded.mistakeTag);
    }
    onOutcome?.({
      skillId: question.skillId,
      seed: question.seed,
      level: question.level,
      isCorrect: graded.isCorrect,
      mistakeTag: graded.mistakeTag,
      hintsUsed: hintsShown,
      elapsedSeconds: Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)),
    });
  }, [checked, hintsShown, onOutcome, question, react, selected]);

  if (!supported || !entry) {
    return (
      <p className="practice-empty" role="status">
        이 개념은 아직 자동 문제가 준비되지 않았어요. 아래 연습 문제로 먼저 확인해 보세요.
      </p>
    );
  }

  if (!question) {
    return (
      <p className="practice-empty" role="status">
        문제를 준비하고 있어요…
      </p>
    );
  }

  return (
    <section className="practice-runner" aria-label={`${entry.label} 무한 연습`}>
      <div className="practice-head">
        <div>
          <p className="practice-eyebrow">{entry.label} · 계속 새 문제</p>
          <p className="practice-score" role="status" aria-live="polite">
            맞힌 문제 {solvedCount} / 푼 문제 {attemptCount}
          </p>
        </div>
        {hasConcept ? (
          <button
            type="button"
            className="practice-concept-toggle"
            onClick={() => setConceptOpen((previous) => !previous)}
            aria-expanded={conceptOpen}
          >
            {conceptOpen ? "개념 닫기" : "개념 보기"}
          </button>
        ) : null}
      </div>

      <ConceptSheet skillId={skillId} open={conceptOpen} onClose={() => setConceptOpen(false)} />

      <p className="practice-prompt">{question.prompt}</p>

      <div className="practice-choices" role="group" aria-label={question.inputLabel}>
        {question.choices?.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={`practice-choice${
              checked && question.acceptableAnswers.includes(choice.value)
                ? " is-answer"
                : checked && selected === choice.value
                  ? " is-picked-wrong"
                  : ""
            }`}
            aria-pressed={selected === choice.value}
            disabled={checked}
            onClick={() => setSelected(choice.value)}
          >
            {choice.label}
            {checked && question.acceptableAnswers.includes(choice.value) ? (
              <span className="choice-mark" aria-label="정답">
                정답
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {!checked ? (
        <div className="practice-actions">
          <button type="button" className="practice-primary" disabled={!selected} onClick={check}>
            정답 확인
          </button>
          <button
            type="button"
            className="practice-secondary"
            disabled={hintsShown >= 3}
            onClick={showHint}
          >
            힌트 보기 ({hintsShown}/3)
          </button>
        </div>
      ) : null}

      {hintsShown > 0 ? (
        <ol className="practice-hints" aria-label="힌트">
          {question.hints.slice(0, hintsShown).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      ) : null}

      {reaction ? (
        <MikuPartner mood={mood} line={reaction} variant="compact" />
      ) : null}

      {result ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          className={`practice-result ${result.isCorrect ? "is-correct" : "is-wrong"}`}
          role="status"
          aria-live="polite"
        >
          <p>정답 · {question.acceptableAnswers[0]}</p>
          <ol className="practice-steps">
            {question.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {!result.isCorrect && hasConcept ? (
            <button type="button" className="practice-secondary" onClick={() => setConceptOpen(true)}>
              이 개념 요점 다시 보기
            </button>
          ) : null}
          <button type="button" className="practice-primary" onClick={nextQuestion}>
            다음 문제
          </button>
        </div>
      ) : null}
    </section>
  );
}
