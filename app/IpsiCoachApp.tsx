"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import EncouragementCoach from "./EncouragementCoach";
import LanguageKnowledgeMap, {
  createEmptyLanguageKnowledgeMapValue,
  type LanguageKnowledgeMapValue,
} from "./LanguageKnowledgeMap";
import MathKnowledgeMap, {
  createEmptyMathKnowledgeMapValue,
  type MathKnowledgeMapValue,
} from "./MathKnowledgeMap";
import { LANGUAGE_KNOWLEDGE_CURRICULA, type LanguageSubject } from "./language-curriculum";
import RoadmapView from "./RoadmapView";
import StudyHub from "./StudyHub";
import VocabTrainer, {
  type VocabTrainerState,
  type VocabWordProgress,
} from "./VocabTrainer";
import { MATH_KNOWLEDGE_CURRICULUM } from "./math-curriculum";
import { VOCAB_WORDS } from "./vocab-data";
import {
  ROADMAPS,
  SUBJECT_GUIDES,
  SUBJECT_KEYS,
  TODAY_TASKS,
  type StudyTask,
  type SubjectKey,
} from "./study-content";

const STORAGE_KEY = "first-step-study-v2";
const LEGACY_STORAGE_KEY = "first-step-study-v1";
const DEFAULT_FOCUS_MINUTES = 25;
const CSAT_2028_DATE = { year: 2027, monthIndex: 10, day: 18 } as const;

type TabId = "today" | "roadmap" | "notes" | "vocab" | "records";

type AppState = {
  schemaVersion: 2;
  userName: string;
  dailyGoal: string;
  taskDate: string;
  completedTasks: string[];
  completedUnitIds: string[];
  bookmarkedNoteIds: string[];
  studyLog: Record<string, number>;
  vocab: VocabTrainerState;
  language: Record<LanguageSubject, LanguageKnowledgeMapValue>;
  math: MathKnowledgeMapValue;
};

type LegacyWordStatus = "unknown" | "fuzzy" | "mastered";

type LegacyState = {
  userName?: unknown;
  dailyGoal?: unknown;
  taskDate?: unknown;
  completedTasks?: unknown;
  roadmapCompleted?: unknown;
  wordStatuses?: unknown;
  studyLog?: unknown;
};

const EMPTY_VOCAB_STATE: VocabTrainerState = {
  progressById: {},
  lastSessionCompletedAt: null,
};

const DEFAULT_APP_STATE: AppState = {
  schemaVersion: 2,
  userName: "인1이",
  dailyGoal: "완벽보다 오늘의 한 칸",
  taskDate: "",
  completedTasks: [],
  completedUnitIds: [],
  bookmarkedNoteIds: [],
  studyLog: {},
  vocab: EMPTY_VOCAB_STATE,
  language: {
    korean: createEmptyLanguageKnowledgeMapValue(),
    english: createEmptyLanguageKnowledgeMapValue(),
  },
  math: createEmptyMathKnowledgeMapValue(),
};

const NAV_ITEMS: Array<{ id: TabId; label: string }> = [
  { id: "today", label: "오늘" },
  { id: "roadmap", label: "로드맵" },
  { id: "notes", label: "개념학습" },
  { id: "vocab", label: "단어" },
  { id: "records", label: "기록" },
];

const LEGACY_ROADMAP_MAP: Record<string, string> = {
  "korean-foundation": "ko-01",
  "korean-core": "ko-04",
  "korean-ebs": "ko-12",
  "english-foundation": "en-01",
  "english-core": "en-06",
  "english-ebs": "en-12",
  "math-foundation": "ma-01",
  "math-core": "ma-06",
  "math-ebs": "ma-12",
};

const SUBJECT_CLASS: Record<SubjectKey, string> = {
  korean: "subject-korean",
  english: "subject-english",
  math: "subject-math",
};

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysUntil2028Csat(date = new Date()): number {
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const examDay = Date.UTC(
    CSAT_2028_DATE.year,
    CSAT_2028_DATE.monthIndex,
    CSAT_2028_DATE.day,
  );
  return Math.round((examDay - today) / 86_400_000);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeUserName(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_APP_STATE.userName;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "첫칸 학생") {
    return DEFAULT_APP_STATE.userName;
  }

  return value;
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return Boolean(
    value &&
      typeof value === "object" &&
      Object.values(value).every((item) => typeof item === "number" && Number.isFinite(item)),
  );
}

function normalizeVocabState(value: unknown): VocabTrainerState {
  if (!value || typeof value !== "object") {
    return EMPTY_VOCAB_STATE;
  }

  const candidate = value as Partial<VocabTrainerState>;
  return {
    progressById:
      candidate.progressById && typeof candidate.progressById === "object"
        ? candidate.progressById
        : {},
    lastSessionCompletedAt:
      typeof candidate.lastSessionCompletedAt === "string"
        ? candidate.lastSessionCompletedAt
        : null,
  };
}

function normalizeMathState(value: unknown): MathKnowledgeMapValue {
  if (!value || typeof value !== "object") {
    return createEmptyMathKnowledgeMapValue();
  }

  const candidate = value as Partial<MathKnowledgeMapValue>;
  return {
    completedConceptIds: isStringArray(candidate.completedConceptIds)
      ? candidate.completedConceptIds
      : [],
    correctQuestionIds: isStringArray(candidate.correctQuestionIds)
      ? candidate.correctQuestionIds
      : [],
  };
}

function normalizeLanguageState(
  value: unknown,
): Record<LanguageSubject, LanguageKnowledgeMapValue> {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<Record<LanguageSubject, unknown>>)
      : {};
  return {
    korean: normalizeMathState(candidate.korean),
    english: normalizeMathState(candidate.english),
  };
}

function normalizeStoredState(value: unknown, todayKey: string): AppState {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_APP_STATE, taskDate: todayKey };
  }

  const candidate = value as Partial<AppState>;
  const storedTaskDate = typeof candidate.taskDate === "string" ? candidate.taskDate : todayKey;
  return {
    schemaVersion: 2,
    userName: normalizeUserName(candidate.userName),
    dailyGoal:
      typeof candidate.dailyGoal === "string" ? candidate.dailyGoal : DEFAULT_APP_STATE.dailyGoal,
    taskDate: todayKey,
    completedTasks:
      storedTaskDate === todayKey && isStringArray(candidate.completedTasks)
        ? candidate.completedTasks
        : [],
    completedUnitIds: isStringArray(candidate.completedUnitIds) ? candidate.completedUnitIds : [],
    bookmarkedNoteIds: isStringArray(candidate.bookmarkedNoteIds)
      ? candidate.bookmarkedNoteIds
      : [],
    studyLog: isNumberRecord(candidate.studyLog) ? candidate.studyLog : {},
    vocab: normalizeVocabState(candidate.vocab),
    math: normalizeMathState(candidate.math),
    language: normalizeLanguageState(candidate.language),
  };
}

function migrateLegacyState(value: LegacyState, todayKey: string): AppState {
  const legacyTaskDate = typeof value.taskDate === "string" ? value.taskDate : todayKey;
  const completedUnitIds = isStringArray(value.roadmapCompleted)
    ? value.roadmapCompleted.map((id) => LEGACY_ROADMAP_MAP[id]).filter(Boolean)
    : [];

  const progressById: Record<string, VocabWordProgress> = {};
  if (value.wordStatuses && typeof value.wordStatuses === "object") {
    for (const [wordId, rawStatus] of Object.entries(value.wordStatuses)) {
      if (!["unknown", "fuzzy", "mastered"].includes(String(rawStatus))) {
        continue;
      }
      const status = rawStatus as LegacyWordStatus;
      if (status === "unknown") {
        continue;
      }
      progressById[wordId.replace(/^essential-/, "")] = {
        status: status === "mastered" ? "completed" : "learning",
        dueDate: todayKey,
        lastReviewedAt: null,
        intervalDays: status === "mastered" ? 7 : 0,
        reviewCount: 1,
        streak: status === "mastered" ? 1 : 0,
        favorite: false,
        ease: 2.3,
        mastery: status === "mastered" ? 70 : 25,
      };
    }
  }

  return {
    ...DEFAULT_APP_STATE,
    schemaVersion: 2,
    userName: normalizeUserName(value.userName),
    dailyGoal: typeof value.dailyGoal === "string" ? value.dailyGoal : DEFAULT_APP_STATE.dailyGoal,
    taskDate: todayKey,
    completedTasks:
      legacyTaskDate === todayKey && isStringArray(value.completedTasks) ? value.completedTasks : [],
    completedUnitIds,
    studyLog: isNumberRecord(value.studyLog) ? value.studyLog : {},
    vocab: {
      progressById,
      lastSessionCompletedAt: null,
    },
  };
}

function addStudyMinutes(state: AppState, dateKey: string, minutes: number): AppState {
  return {
    ...state,
    studyLog: {
      ...state.studyLog,
      [dateKey]: Math.max(0, (state.studyLog[dateKey] ?? 0) + minutes),
    },
  };
}

function getLastSevenDays(): Array<{ key: string; label: string }> {
  const labels = ["일", "월", "화", "수", "목", "금", "토"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return { key: getLocalDateKey(date), label: labels[date.getDay()] };
  });
}

function getCurrentStreak(studyLog: Record<string, number>): number {
  const cursor = new Date();
  if ((studyLog[getLocalDateKey(cursor)] ?? 0) <= 0) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while ((studyLog[getLocalDateKey(cursor)] ?? 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getMathConceptCount(): number {
  return MATH_KNOWLEDGE_CURRICULUM.chapters.reduce(
    (chapterTotal, chapter) =>
      chapterTotal +
      chapter.units.reduce(
        (unitTotal, unit) => unitTotal + unit.concepts.length,
        0,
      ),
    0,
  );
}

function getLanguageConceptCount(subject: LanguageSubject): number {
  return LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters.reduce(
    (chapterTotal, chapter) =>
      chapterTotal +
      chapter.units.reduce((unitTotal, unit) => unitTotal + unit.concepts.length, 0),
    0,
  );
}

const LANGUAGE_CONCEPT_COUNTS = {
  korean: getLanguageConceptCount("korean"),
  english: getLanguageConceptCount("english"),
} as const;

export default function IpsiCoachApp() {
  const todayKey = getLocalDateKey();
  const [, setCalendarRevision] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [roadmapSubject, setRoadmapSubject] = useState<SubjectKey>("korean");
  const [appState, setAppState] = useState<AppState>(() => ({
    ...DEFAULT_APP_STATE,
    taskDate: todayKey,
  }));
  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("오늘의 첫 칸이 준비되었습니다.");
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const timerHeadingId = useId();
  const panelIds: Record<TabId, string> = {
    today: useId(),
    roadmap: useId(),
    notes: useId(),
    vocab: useId(),
    records: useId(),
  };

  const completedTaskCount = TODAY_TASKS.filter((task) =>
    appState.completedTasks.includes(task.id),
  ).length;
  const todayProgress = Math.round((completedTaskCount / TODAY_TASKS.length) * 100);
  const displayName = appState.userName.trim() || "인1이";
  const displayGoal = appState.dailyGoal.trim() || "완벽보다 오늘의 한 칸";
  const weeklyStudy = getLastSevenDays().map((day) => ({
    ...day,
    minutes: appState.studyLog[day.key] ?? 0,
  }));
  const maxWeeklyMinutes = Math.max(...weeklyStudy.map((day) => day.minutes), 30);
  const weeklyTotal = weeklyStudy.reduce((sum, day) => sum + day.minutes, 0);
  const streak = getCurrentStreak(appState.studyLog);
  const completedWords = Object.values(appState.vocab.progressById).filter(
    (progress) => progress.status === "completed",
  ).length;
  const dueWords = VOCAB_WORDS.filter((word) => {
    const progress = appState.vocab.progressById[word.id];
    return !progress || !progress.dueDate || progress.dueDate <= todayKey;
  }).length;
  const mathConceptCount = getMathConceptCount();
  const dday = getDaysUntil2028Csat();
  const completedLanguageConceptCount =
    appState.language.korean.completedConceptIds.length +
    appState.language.english.completedConceptIds.length;
  const correctLanguageQuestionCount = appState.language.korean.correctQuestionIds.length + appState.language.english.correctQuestionIds.length;
  const vocabReviewCount = Object.values(appState.vocab.progressById).reduce(
    (sum, progress) => sum + Math.max(0, progress.reviewCount ?? 0),
    0,
  );
  const points =
    appState.completedTasks.length * 10 +
    appState.completedUnitIds.length * 15 +
    appState.math.completedConceptIds.length * 20 +
    appState.math.correctQuestionIds.length * 5 +
    completedLanguageConceptCount * 15 +
    correctLanguageQuestionCount * 5 +
    vocabReviewCount * 3;
  const level = Math.floor(points / 100) + 1;

  const subjectProgress = useMemo(() => ({
    korean: {
      completed:
        ROADMAPS.korean.filter((unit) => appState.completedUnitIds.includes(unit.id)).length +
        appState.language.korean.completedConceptIds.length,
      total: ROADMAPS.korean.length + LANGUAGE_CONCEPT_COUNTS.korean,
    },
    english: {
      completed:
        ROADMAPS.english.filter((unit) => appState.completedUnitIds.includes(unit.id)).length +
        appState.language.english.completedConceptIds.length,
      total: ROADMAPS.english.length + LANGUAGE_CONCEPT_COUNTS.english,
    },
    math: {
      completed: appState.math.completedConceptIds.length,
      total: mathConceptCount,
    },
  }), [appState.completedUnitIds, appState.language.english.completedConceptIds.length, appState.language.korean.completedConceptIds.length, appState.math.completedConceptIds.length, mathConceptCount]);

  const nextSubject = SUBJECT_KEYS.slice().sort((left, right) => {
    const leftRatio = subjectProgress[left].completed / subjectProgress[left].total;
    const rightRatio = subjectProgress[right].completed / subjectProgress[right].total;
    return leftRatio - rightRatio;
  })[0];

  const selectedLanguageSubject: LanguageSubject = roadmapSubject === "english" ? "english" : "korean";

  const nextRoadmapTitle =
    nextSubject === "math"
      ? "수와 연산부터 수학 지식 지도 열기"
      : ROADMAPS[nextSubject].find((unit) => !appState.completedUnitIds.includes(unit.id))?.title ??
        `${SUBJECT_GUIDES[nextSubject].label} 12주 복습`;

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      50,
    );
    const rolloverTimer = window.setTimeout(
      () => setCalendarRevision((current) => current + 1),
      Math.max(1, nextMidnight.getTime() - now.getTime()),
    );
    return () => window.clearTimeout(rolloverTimer);
  }, [todayKey]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const current = window.localStorage.getItem(STORAGE_KEY);
        if (current) {
          setAppState(normalizeStoredState(JSON.parse(current), todayKey));
          setIsReady(true);
          return;
        }

        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          const migrated = migrateLegacyState(JSON.parse(legacy) as LegacyState, todayKey);
          setAppState(migrated);
          setStatusMessage("기존 학습 기록을 새 커리큘럼으로 옮겼습니다.");
        }
      } catch {
        setAppState({ ...DEFAULT_APP_STATE, taskDate: todayKey });
        setStatusMessage("저장된 기록을 읽지 못해 새 학습 기록으로 시작합니다.");
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [todayKey]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState, isReady]);

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          setIsTimerRunning(false);
          setAppState((previous) => addStudyMinutes(previous, getLocalDateKey(), focusMinutes));
          setStatusMessage(`${focusMinutes}분 집중 학습을 기록했습니다.`);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [focusMinutes, isTimerRunning]);

  useEffect(() => {
    if (!isTimerOpen) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inertTargets = Array.from(
      document.querySelectorAll<HTMLElement>(".topbar, .app-content, .bottom-nav"),
    );
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
      Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);

    inertTargets.forEach((element) => {
      element.inert = true;
    });
    (getFocusableElements()[0] ?? sheetRef.current)?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsTimerOpen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        sheetRef.current?.focus();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      window.removeEventListener("keydown", handleDialogKeyDown);
      inertTargets.forEach((element) => {
        element.inert = false;
      });
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isTimerOpen]);

  const switchTab = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openRoadmap = (subject: SubjectKey) => {
    setRoadmapSubject(subject);
    switchTab("roadmap");
  };

  const startTask = (task: StudyTask) => {
    setRoadmapSubject(task.subject);
    if (task.destination === "roadmap") {
      switchTab("roadmap");
    } else {
      switchTab(task.destination);
    }
    setStatusMessage(
      task.destination === "vocab"
        ? "오늘 복습할 단어부터 준비했습니다. 기억이 흐려도 괜찮아요."
        : `${SUBJECT_GUIDES[task.subject].label} ${task.title} 학습을 열었습니다.`,
    );
  };

  const toggleTask = (task: StudyTask) => {
    const currentDateKey = getLocalDateKey();
    const isComplete =
      appState.taskDate === currentDateKey && appState.completedTasks.includes(task.id);
    setAppState((previous) => {
      const currentDayState =
        previous.taskDate === currentDateKey
          ? previous
          : { ...previous, taskDate: currentDateKey, completedTasks: [] };
      const next = {
        ...currentDayState,
        taskDate: currentDateKey,
        completedTasks: isComplete
          ? currentDayState.completedTasks.filter((id) => id !== task.id)
          : [...currentDayState.completedTasks, task.id],
      };
      return addStudyMinutes(
        next,
        currentDateKey,
        isComplete ? -task.duration : task.duration,
      );
    });
    setStatusMessage(isComplete ? `${task.title} 완료를 해제했습니다.` : `${task.title} 완료를 기록했습니다.`);
  };

  const toggleUnit = (unitId: string) => {
    const isComplete = appState.completedUnitIds.includes(unitId);
    setAppState((previous) => ({
      ...previous,
      completedUnitIds: isComplete
        ? previous.completedUnitIds.filter((id) => id !== unitId)
        : [...previous.completedUnitIds, unitId],
    }));
    setStatusMessage(isComplete ? "로드맵 단원을 다시 학습 상태로 바꿨습니다." : "로드맵 단원을 완료했습니다.");
  };

  const toggleBookmark = (noteId: string) => {
    const isSaved = appState.bookmarkedNoteIds.includes(noteId);
    setAppState((previous) => ({
      ...previous,
      bookmarkedNoteIds: isSaved
        ? previous.bookmarkedNoteIds.filter((id) => id !== noteId)
        : [...previous.bookmarkedNoteIds, noteId],
    }));
    setStatusMessage(isSaved ? "핵심 노트 저장을 해제했습니다." : "핵심 노트를 저장했습니다.");
  };

  const setTimerPreset = (minutes: number) => {
    setFocusMinutes(minutes);
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(focusMinutes * 60);
  };

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      return;
    }

    if (timerSeconds === 0) {
      setTimerSeconds(focusMinutes * 60);
    }
    setIsTimerRunning(true);
  };

  const resetAllData = () => {
    if (!window.confirm("이 기기에 저장된 진도·단어·문제 기록을 모두 초기화할까요?")) {
      return;
    }
    const nextState = { ...DEFAULT_APP_STATE, taskDate: getLocalDateKey() };
    setAppState(nextState);
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setStatusMessage("이 기기의 학습 기록을 초기화했습니다.");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand-lockup"
          href="#main-content"
          onClick={() => setActiveTab("today")}
          aria-label="수능人 오늘 화면으로 이동"
        >
          <span className="brand-mark" aria-hidden="true">人</span>
          <span className="brand-copy"><strong>수능人</strong><span>노베이스 입시 코치</span></span>
        </a>
        <button
          type="button"
          className={`timer-pill ${isTimerRunning ? "is-running" : ""}`}
          onClick={() => setIsTimerOpen(true)}
        >
          <span className="timer-dot" aria-hidden="true" />
          {isTimerRunning ? formatTimer(timerSeconds) : "집중 타이머"}
        </button>
      </header>

      <main id="main-content" className="app-content">
        <p className="live-status" aria-live="polite">
          {isReady ? statusMessage : "저장된 학습 기록을 불러오고 있습니다."}
        </p>

        <section
          id={panelIds.today}
          className={`view ${activeTab === "today" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-today"
          hidden={activeTab !== "today"}
        >
          <article className="today-agenda">
            <header className="agenda-header">
              <div>
                <span className="hero-kicker">고1 기초 · 2028학년도 통합형</span>
                <h1>{displayName}님, 오늘은 딱 세 칸이에요.</h1>
                <p>{displayGoal}. 어려우면 가장 쉬운 것부터 시작해도 충분합니다.</p>
              </div>
              <div className="agenda-meta" aria-label="수능과 학습 현황">
                <span>수능 D-{Math.max(0, dday)}</span><span>{streak}일 연속</span><span>Lv.{level}</span>
              </div>
            </header>

            <div className="hero-progress agenda-progress">
              <strong>오늘의 60분 · {completedTaskCount}/{TODAY_TASKS.length} 완료</strong>
              <span>{todayProgress}%</span>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${todayProgress}%` }} />
              </div>
            </div>

            <div className="agenda-task-list">
              {TODAY_TASKS.map((task) => {
                const isComplete = appState.completedTasks.includes(task.id);
                return (
                  <div key={task.id} className={`agenda-task ${SUBJECT_CLASS[task.subject]} ${isComplete ? "is-complete" : ""}`}>
                    <button type="button" className="agenda-task-open" onClick={() => startTask(task)}>
                      <span className="subject-badge">{SUBJECT_GUIDES[task.subject].shortLabel}</span>
                      <span className="course-copy"><strong>{task.title}</strong><span>{task.description}</span></span>
                      <span className="course-time">{task.duration}분</span>
                    </button>
                    <button
                      type="button"
                      className="agenda-task-check"
                      aria-pressed={isComplete}
                      aria-label={`${task.title} ${isComplete ? "완료 취소" : "완료 기록"}`}
                      onClick={() => toggleTask(task)}
                    >
                      {isComplete ? "✓ 완료" : "완료"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => {
                  const nextTask = TODAY_TASKS.find((task) => !appState.completedTasks.includes(task.id));
                  if (nextTask) startTask(nextTask);
                  else openRoadmap(nextSubject);
                }}
              >
                {completedTaskCount === TODAY_TASKS.length ? "내일 로드맵 미리 보기" : "가장 쉬운 한 칸 시작"}
              </button>
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setTimerPreset(3);
                  setIsTimerOpen(true);
                }}
              >
                3분만 집중
              </button>
            </div>
          </article>

          <div className="dashboard-grid compact-dashboard">
            <article className="panel-block next-step-card">
              <div>
                <p className="eyebrow">가장 비어 있는 과목</p>
                <h3>{SUBJECT_GUIDES[nextSubject].label} 다음 칸</h3>
                <p>{nextRoadmapTitle}</p>
              </div>
              <button type="button" className="secondary-action" onClick={() => openRoadmap(nextSubject)}>
                전체 순서 확인
              </button>
            </article>
          </div>

          <EncouragementCoach
            completedCount={completedTaskCount}
            totalCount={TODAY_TASKS.length}
            streak={streak}
            dday={dday}
            points={points}
            level={level}
            onStartThreeMinutes={() => {
              setTimerPreset(3);
              setIsTimerOpen(true);
              setStatusMessage(
                "능이와 딱 3분만 시작해 봐요. 시작한 순간 이미 한 칸 전진했어요.",
              );
            }}
            onOpenEasyStep={() => {
              setRoadmapSubject(nextSubject);
              switchTab("notes");
            }}
          />

          <div className="dashboard-grid progress-dashboard">
            <article className="panel-block">
              <div className="section-heading"><div><h2>지금까지 쌓인 것</h2><p>새로고침해도 이 기기에 남습니다.</p></div></div>
              <div className="mini-stats">
                <div className="mini-stat"><span>연속 학습</span><strong>{streak}일</strong></div>
                <div className="mini-stat"><span>완료 단원</span><strong>{appState.completedUnitIds.length + appState.math.completedConceptIds.length + completedLanguageConceptCount}</strong></div>
                <div className="mini-stat"><span>외운 단어</span><strong>{completedWords}</strong></div>
                <div className="mini-stat"><span>성장 레벨</span><strong>Lv.{level}</strong></div>
              </div>
            </article>
          </div>
        </section>

        <section
          id={panelIds.roadmap}
          className={`view ${activeTab === "roadmap" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-roadmap"
          hidden={activeTab !== "roadmap"}
        >
          <RoadmapView
            selectedSubject={roadmapSubject}
            onSelectSubject={setRoadmapSubject}
            completedUnitIds={appState.completedUnitIds}
            onToggleUnit={toggleUnit}
            onOpenNotes={() => switchTab("notes")}
          />
        </section>

        <section
          id={panelIds.notes}
          className={`view ${activeTab === "notes" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-notes"
          hidden={activeTab !== "notes"}
        >
          <StudyHub
            selectedSubject={roadmapSubject}
            onSelectSubject={setRoadmapSubject}
            bookmarks={appState.bookmarkedNoteIds}
            onToggleBookmark={toggleBookmark}
            knowledgeContent={roadmapSubject === "math" ? (
              <MathKnowledgeMap
                className="math-knowledge-map"
                value={appState.math}
                onChange={(math) => setAppState((previous) => ({ ...previous, math }))}
              />
            ) : (
              <LanguageKnowledgeMap
                key={selectedLanguageSubject}
                subject={selectedLanguageSubject}
                value={appState.language[selectedLanguageSubject]}
                onChange={(languageValue) => setAppState((previous) => ({ ...previous, language: { ...previous.language, [selectedLanguageSubject]: languageValue } }))}
                className="language-knowledge-map"
              />
            )}
          />
        </section>

        <section
          id={panelIds.vocab}
          className={`view ${activeTab === "vocab" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-vocab"
          hidden={activeTab !== "vocab"}
        >
          <div className="page-intro">
            <div>
              <p className="eyebrow">외운 뒤가 진짜 복습</p>
              <h1>영어 단어장</h1>
              <p>오늘 기억한 정도에 따라 다음 복습일이 달라지고, 익힌 단어는 내 단어장에 계속 정리됩니다.</p>
            </div>
          </div>
          <VocabTrainer
            value={appState.vocab}
            onChange={(vocab) => setAppState((previous) => ({ ...previous, vocab }))}
            onSessionComplete={(summary) => {
              setAppState((previous) =>
                addStudyMinutes(
                  previous,
                  getLocalDateKey(),
                  Math.max(5, summary.reviewedCount),
                ),
              );
              setStatusMessage(`${summary.reviewedCount}개 단어 복습을 완료했습니다.`);
            }}
          />
        </section>

        <section
          id={panelIds.records}
          className={`view ${activeTab === "records" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-records"
          hidden={activeTab !== "records"}
        >
          <div className="page-intro">
            <div>
              <p className="eyebrow">작은 공부가 쌓인 자리</p>
              <h1>내 학습 기록</h1>
              <p>몇 시간을 했는지보다 어디까지 혼자 설명하고 풀 수 있게 됐는지 함께 봅니다.</p>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card"><p>연속 학습</p><strong>{streak}일</strong></article>
            <article className="stat-card"><p>최근 7일</p><strong>{weeklyTotal}분</strong></article>
            <article className="stat-card"><p>외운 단어</p><strong>{completedWords}개</strong></article>
            <article className="stat-card"><p>오늘 복습</p><strong>{dueWords}개</strong></article>
          </div>

          <article className="panel-block" style={{ marginBottom: 14 }}>
            <div className="section-heading"><div><h2>최근 7일 공부</h2><p>완료 체크와 타이머 기록을 합산합니다.</p></div></div>
            <div className="weekly-chart" aria-label="최근 7일 학습 시간 막대그래프">
              {weeklyStudy.map((day) => (
                <div key={day.key} className="chart-column">
                  <div className="chart-bar-wrap">
                    <div
                      className="chart-bar"
                      style={{ height: `${Math.max(5, (day.minutes / maxWeeklyMinutes) * 120)}px` }}
                      aria-label={`${day.label}요일 ${day.minutes}분`}
                    />
                  </div>
                  <strong>{day.label}</strong><span>{day.minutes}분</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-block" style={{ marginBottom: 14 }}>
            <div className="section-heading"><div><h2>과목별 위치</h2><p>로드맵에서 완료한 단원 기준</p></div></div>
            <div className="subject-progress-list">
              {SUBJECT_KEYS.map((subject) => {
                const progress = subjectProgress[subject];
                const percent = Math.round((progress.completed / progress.total) * 100);
                return (
                  <article key={subject} className={`subject-progress-card ${SUBJECT_CLASS[subject]}`}>
                    <div className="section-heading">
                      <div><h3>{SUBJECT_GUIDES[subject].label}</h3><p>{progress.completed}/{progress.total} 완료</p></div>
                      <strong>{percent}%</strong>
                    </div>
                    <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="panel-block profile-panel">
            <div className="section-heading"><div><h2>내 목표</h2><p>오늘 화면의 문구를 바꿀 수 있습니다.</p></div></div>
            <label className="field-label">이름
              <input className="text-field" value={appState.userName} onChange={(event) => setAppState((previous) => ({ ...previous, userName: event.target.value }))} />
            </label>
            <label className="field-label">한 줄 목표
              <input className="text-field" value={appState.dailyGoal} onChange={(event) => setAppState((previous) => ({ ...previous, dailyGoal: event.target.value }))} />
            </label>
            <div className="trust-note"><strong>기기 저장</strong><span>로그인 없이 이 브라우저의 로컬 저장소에만 기록됩니다. 다른 기기로는 자동 동기화되지 않습니다.</span></div>
            <button type="button" className="danger-action" onClick={resetAllData}>이 기기의 기록 초기화</button>
          </article>
        </section>
      </main>

      <nav className="bottom-nav" role="tablist" aria-label="수능人 주요 메뉴">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            className={`nav-tab ${activeTab === item.id ? "is-active" : ""}`}
            aria-selected={activeTab === item.id}
            aria-controls={panelIds[item.id]}
            onClick={() => switchTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {isTimerOpen ? (
        <div className="sheet-layer">
          <button type="button" className="sheet-backdrop" aria-label="집중 타이머 닫기" onClick={() => setIsTimerOpen(false)} />
          <div ref={sheetRef} className="study-sheet" role="dialog" aria-modal="true" aria-labelledby={timerHeadingId} tabIndex={-1}>
            <div className="sheet-handle" aria-hidden="true" />
            <div className="sheet-content">
              <p className="eyebrow">집중 세션</p>
              <h2 id={timerHeadingId}>한 번에 한 칸만</h2>
              <div className="timer-display">{formatTimer(timerSeconds)}</div>
              <div className="timer-presets" aria-label="집중 시간 선택">
                {[3, 15, 25, 50].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={`timer-preset ${focusMinutes === minutes ? "is-active" : ""}`}
                    aria-pressed={focusMinutes === minutes}
                    disabled={isTimerRunning}
                    onClick={() => setTimerPreset(minutes)}
                  >
                    {minutes}분
                  </button>
                ))}
              </div>
              <div className="sheet-actions">
                <button type="button" className="primary-action" onClick={handleTimerToggle}>
                  {isTimerRunning ? "잠시 멈춤" : timerSeconds === 0 ? "다시 시작" : "집중 시작"}
                </button>
                <button type="button" className="secondary-action" onClick={resetTimer}>처음부터</button>
              </div>
              <button type="button" className="quiet-action" onClick={() => setIsTimerOpen(false)}>타이머 접기</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
