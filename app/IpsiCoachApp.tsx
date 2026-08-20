"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import EncouragementCoach from "./EncouragementCoach";
import OnboardingSheet from "./OnboardingSheet";
import { pickMikuLine } from "./miku/miku-lines";
import { hashString } from "./practice/rng";
import { computeMikuMood, countActiveDaysLast7, resolveGreetingEvent } from "./miku/miku-mood";
import {
  createEmptyLanguageKnowledgeMapValue,
  createEmptyMathKnowledgeMapValue,
  type LanguageKnowledgeMapValue,
  type MathKnowledgeMapValue,
} from "./knowledge-state.ts";
import TodayPractice from "./practice/TodayPractice";
import WrongNotes from "./practice/WrongNotes";
import type { PracticeOutcomeReport } from "./practice/PracticeRunner";
import { getSkillEntry } from "./practice/skill-map";
import { listDueKeys } from "./practice/review-queue";
import {
  EMPTY_PRACTICE_STATE,
  migrateVocabIntoReview,
  normalizePracticeState,
  recordOutcome,
  summarizeMistakes,
  getSkillAccuracy,
  type PracticeState,
} from "./practice/practice-state";
import type { LanguageSubject } from "./language-curriculum";
import PathView from "./path/PathView";
import {
  EMPTY_PATH_STATE,
  completeNode,
  getNextNode,
  getSubjectProgress,
  normalizePathState,
  type PathState,
} from "./path/path-state";
import VocabTrainer, {
  type VocabTrainerState,
  type VocabWordProgress,
} from "./VocabTrainer";
import { VOCAB_WORDS } from "./vocab-data";
import {
  SUBJECT_GUIDES,
  SUBJECT_KEYS,
  type SubjectKey,
} from "./study-content";

const STORAGE_KEY = "first-step-study-v2";
const LEGACY_STORAGE_KEY = "first-step-study-v1";
const DEFAULT_FOCUS_MINUTES = 25;
const CSAT_2028_DATE = { year: 2027, monthIndex: 10, day: 18 } as const;

type TabId = "today" | "korean" | "english" | "math" | "records";

type AppState = {
  schemaVersion: 4;
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
  practice: PracticeState;
  path: PathState;
  /** 마지막으로 보던 탭. 앱을 다시 열면 여기로 돌아온다. */
  lastTab: TabId;
  /** 첫 안내를 봤는지. 한 번 보면 다시 뜨지 않는다. */
  hasSeenIntro: boolean;
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
  schemaVersion: 4,
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
  practice: EMPTY_PRACTICE_STATE,
  path: EMPTY_PATH_STATE,
  lastTab: "today",
  hasSeenIntro: false,
};

const NAV_ITEMS: Array<{ id: TabId; label: string }> = [
  { id: "today", label: "오늘" },
  { id: "korean", label: "국어" },
  // "영어·단어"였는데 정작 이 탭에는 단어장이 없고, 탭 안내가 "단어는 오늘
  // 탭에서"라고 딴 데를 가리켰다. 이름이 약속한 것을 그 자리에서 못 주면
  // 찾다가 지친다. 단어는 매일 하는 것이라 오늘 탭에 두는 편이 맞으므로,
  // 이름 쪽을 내용에 맞춘다.
  { id: "english", label: "영어" },
  { id: "math", label: "수학" },
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

/**
 * 마지막으로 실제 공부한 날. 오늘은 빼고 본다.
 *
 * `taskDate`를 쓰면 안 된다 — 앱을 열 때마다 오늘로 덮어써지므로 항상 "오늘"이
 * 되어 미쿠의 "오랜만이야" 인사가 영원히 뜨지 않는다. 학습 기록이 "마지막으로
 * 공부한 날"이라는 의미에도 더 맞다.
 */
function findLastStudyDate(
  studyLog: Record<string, number>,
  todayKey: string,
): string | null {
  const days = Object.keys(studyLog)
    .filter((key) => key < todayKey && (studyLog[key] ?? 0) > 0)
    .sort();
  return days.length > 0 ? days[days.length - 1] : null;
}

const TAB_IDS: TabId[] = ["today", "korean", "english", "math", "records"];

function normalizeTabId(value: unknown): TabId {
  return TAB_IDS.includes(value as TabId) ? (value as TabId) : "today";
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
    schemaVersion: 4,
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
    // v3에는 길 진도가 없었다. 없으면 빈 길로 시작하고, 알 수 없는 칸 id는 버린다.
    path: normalizePathState((candidate as { path?: unknown }).path),
    lastTab: normalizeTabId((candidate as { lastTab?: unknown }).lastTab),
    hasSeenIntro: (candidate as { hasSeenIntro?: unknown }).hasSeenIntro === true,
    practice: (() => {
      const practice = normalizePracticeState(
        (candidate as { practice?: unknown }).practice,
      );
      // v2에는 단어 진도가 vocab.progressById에만 있었다. 복습 큐로 옮기되
      // 이미 옮겨진 항목은 건드리지 않는다.
      return {
        ...practice,
        reviewById: migrateVocabIntoReview(
          normalizeVocabState(candidate.vocab).progressById,
          practice.reviewById,
        ),
      };
    })(),
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
    schemaVersion: 4,
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

export default function IpsiCoachApp() {
  const todayKey = getLocalDateKey();
  const [, setCalendarRevision] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [appState, setAppState] = useState<AppState>(() => ({
    ...DEFAULT_APP_STATE,
    taskDate: todayKey,
  }));
  const [isReady, setIsReady] = useState(false);
  // 지역 시각은 마운트 후에 읽는다. 렌더 중에 Date를 부르면 lint가 막고,
  // 서버 렌더와 클라이언트 렌더가 달라져 하이드레이션도 어긋난다.
  const [localHour, setLocalHour] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("오늘의 첫 칸이 준비되었습니다.");
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isMikuBgmOpen, setIsMikuBgmOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const timerHeadingId = useId();
  const panelIds: Record<TabId, string> = {
    today: useId(),
    korean: useId(),
    english: useId(),
    math: useId(),
    records: useId(),
  };

  const displayName = appState.userName.trim() || "인1이";
  const displayGoal = appState.dailyGoal.trim() || "완벽보다 오늘의 한 칸";
  const weeklyStudy = getLastSevenDays().map((day) => ({
    ...day,
    minutes: appState.studyLog[day.key] ?? 0,
  }));
  const maxWeeklyMinutes = Math.max(...weeklyStudy.map((day) => day.minutes), 30);
  const weeklyTotal = weeklyStudy.reduce((sum, day) => sum + day.minutes, 0);
  const streak = getCurrentStreak(appState.studyLog);

  // 시각을 아직 못 읽었으면 낮으로 둔다. 마운트 직후 한 프레임뿐이고,
  // 이때 sleepy로 인사하면 낮에 들어온 학습자에게 엉뚱하다.
  const mikuHour = localHour ?? 12;
  const mikuMood = computeMikuMood({
    hour: mikuHour,
    activeDaysLast7: countActiveDaysLast7(appState.studyLog, todayKey),
    // 오늘의 정답률은 아직 저장하지 않는다. 표본이 3문제 미만이면
    // computeMikuMood가 정답률을 신호로 쓰지 않으므로, 기분은 지금
    // 학습량·연속일·시각으로만 정해진다.
    todayAnswered: 0,
    todayCorrect: 0,
    streakDays: streak,
    // 학습 기록이 하나도 없으면 아직 시작을 안 한 것이지 그만둔 것이 아니다.
    hasEverStudied: Object.keys(appState.studyLog).length > 0,
  });
  const mistakeSummary = summarizeMistakes(appState.practice);
  // 풀어 본 스킬만, 정답률 낮은 순으로. 안 푼 것을 0%로 보여 주면 못한다는 뜻이 된다.
  const practicedSkills = Object.keys(appState.practice.skillStats)
    .map((skillId) => ({
      skillId,
      label: getSkillEntry(skillId)?.label ?? skillId,
      accuracy: getSkillAccuracy(appState.practice, skillId) ?? 0,
      attempts: appState.practice.skillStats[skillId].attempts,
    }))
    .sort((left, right) => left.accuracy - right.accuracy);

  const mikuGreeting = pickMikuLine({
    event: resolveGreetingEvent({
      todayKey,
      lastSeenDate: findLastStudyDate(appState.studyLog, todayKey),
      hour: mikuHour,
    }),
    mood: mikuMood,
    seed: hashString(todayKey),
  });
  const completedWords = Object.values(appState.vocab.progressById).filter(
    (progress) => progress.status === "completed",
  ).length;
  // 복습은 이미 배운 것을 다시 보는 일이다. 한 번도 본 적 없는 단어까지 세면
  // 아무것도 안 한 첫날 사용자에게 "오늘 복습 1500개"라고 말하게 된다 —
  // 바로 옆 화면에서는 "오늘은 딱 한 칸만"이라고 해 놓고서다. 노베이스에게
  // 그 숫자는 격려가 아니라 그만둘 이유다.
  //
  // 단어장 화면은 하루치를 10개로 잘라 내보내므로 원래 문제가 없었고,
  // 자르지 않은 값을 그대로 보여 주던 이 통계만 문제였다.
  const dueWords = VOCAB_WORDS.filter((word) => {
    const progress = appState.vocab.progressById[word.id];
    if (!progress || progress.reviewCount <= 0) {
      return false;
    }
    return !progress.dueDate || progress.dueDate <= todayKey;
  }).length;
  const dueReviewCount = listDueKeys(appState.practice.reviewById, todayKey, "skill").length;
  const dday = getDaysUntil2028Csat();
  const completedNodeCount = appState.path.completedNodeIds.length;
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
    vocabReviewCount * 3 +
    completedNodeCount * 20;
  const level = Math.floor(points / 100) + 1;

  // 과목별 위치는 이제 길 진도가 기준이다.
  //
  // 위 points 계산에 들어가는 language·math 값은 지식 지도 화면이 채우던
  // 것인데, 그 화면이 길로 대체되면서 사라졌다. 그래서 새로 쌓이지는 않는다.
  // 그래도 항을 빼지 않는 이유는 동생의 저장 데이터에 예전 값이 남아 있을 수
  // 있어서다 — 빼면 이미 얻은 점수가 줄어든다.
  const subjectProgress = useMemo(
    () => ({
      korean: getSubjectProgress(appState.path, "korean"),
      english: getSubjectProgress(appState.path, "english"),
      math: getSubjectProgress(appState.path, "math"),
    }),
    [appState.path],
  );

  const nextSubject = SUBJECT_KEYS.slice().sort((left, right) => {
    const leftRatio = subjectProgress[left].done / subjectProgress[left].total;
    const rightRatio = subjectProgress[right].done / subjectProgress[right].total;
    return leftRatio - rightRatio;
  })[0];

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
          const restored = normalizeStoredState(JSON.parse(current), todayKey);
          setAppState(restored);
          setActiveTab(restored.lastTab);
          setIsReady(true);
          setLocalHour(new Date().getHours());
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
        setLocalHour(new Date().getHours());
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
    // 다음에 앱을 열면 여기로 돌아온다. 매번 오늘 탭에서 찾아가지 않게 한다.
    setAppState((previous) => (previous.lastTab === tab ? previous : { ...previous, lastTab: tab }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 칸 하나를 5분으로 세어 학습 기록과 연속 학습일에 반영한다.
  const handleCompleteNode = (nodeId: string, correctCount: number, totalCount: number) => {
    const currentDateKey = getLocalDateKey();
    setAppState((previous) =>
      addStudyMinutes(
        { ...previous, path: completeNode(previous.path, nodeId, correctCount, totalCount) },
        currentDateKey,
        5,
      ),
    );
    setStatusMessage("한 칸을 끝냈어요. 다음 칸이 열렸습니다.");
  };

  // 문제 하나를 1분으로 세어 학습 기록과 연속 학습일에 반영한다.
  const handlePracticeOutcome = (report: PracticeOutcomeReport) => {
    const currentDateKey = getLocalDateKey();
    const targetSeconds = getSkillEntry(report.skillId)?.targetSeconds ?? 60;
    setAppState((previous) =>
      addStudyMinutes(
        {
          ...previous,
          practice: recordOutcome(previous.practice, {
            ...report,
            targetSeconds,
            today: currentDateKey,
          }),
        },
        currentDateKey,
        1,
      ),
    );
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
      {isReady && !appState.hasSeenIntro ? (
        <OnboardingSheet
          userName={displayName}
          onDone={() => setAppState((previous) => ({ ...previous, hasSeenIntro: true }))}
        />
      ) : null}
      <header className="topbar">
        <a
          className="brand-lockup"
          href="#main-content"
          onClick={() => setActiveTab("today")}
          aria-label="수능人 x 미쿠 오늘 화면으로 이동"
        >
          <span className="brand-mark" aria-hidden="true" style={{ padding: 0, overflow: "hidden", borderRadius: "50%" }}>
            <img src="/miku_avatar.jpg" alt="미쿠 코치" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
          <span className="brand-copy"><strong style={{ color: "#00a496" }}>수능人 x 미쿠🎵</strong><span>노베이스 입시 코치</span></span>
        </a>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="primary-action"
            style={{ padding: "0 var(--space-3)", fontSize: "var(--fs-micro)", background: "#39c5bb", borderColor: "#00a496" }}
            onClick={() => setIsMikuBgmOpen(true)}
          >
            🎵 미쿠 BGM
          </button>
          <button
            type="button"
            className={`timer-pill ${isTimerRunning ? "is-running" : ""}`}
            onClick={() => setIsTimerOpen(true)}
          >
            <span className="timer-dot" aria-hidden="true" />
            {isTimerRunning ? formatTimer(timerSeconds) : "집중 타이머"}
          </button>
        </div>
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
          <div className="page-intro">
            <div>
              <p className="eyebrow">고1 기초 · 2028학년도 통합형</p>
              <h1>{displayName}님, 오늘은 딱 한 칸만.</h1>
              <p>{displayGoal}. 아래 순서대로 하나씩만 하면 됩니다.</p>
            </div>
          </div>

          <EncouragementCoach
            line={mikuGreeting}
            mood={mikuMood}
            streak={streak}
            dday={dday}
            nextSubjectLabel={SUBJECT_GUIDES[nextSubject].label}
            nextNodeTitle={getNextNode(appState.path, nextSubject)?.title}
            onOpenEasyStep={() => switchTab(nextSubject)}
          />

          {dueReviewCount > 0 ? (
            <button
              type="button"
              className="today-review-row"
              onClick={() => switchTab("records")}
            >
              <span>복습할 게 {dueReviewCount}개 있어요</span>
              <span aria-hidden="true">기록 탭에서 풀기 →</span>
            </button>
          ) : null}

          {/* 위 버튼이 오늘의 한 칸이고, 여기는 "다른 걸 하고 싶으면"이다.
              제목이 없으면 카드 셋이 위 버튼과 같은 무게의 시작 버튼 셋으로
              보여, 처음 온 사람이 뭘 눌러야 할지 모른다. */}
          <section className="today-next-list" aria-label="과목별 다음 칸">
            <h2 className="today-next-heading">다른 과목부터 할래?</h2>
            {SUBJECT_KEYS.map((subject) => {
              const next = getNextNode(appState.path, subject);
              if (!next) {
                return null;
              }
              return (
                <button
                  key={subject}
                  type="button"
                  className={`today-next-node ${SUBJECT_CLASS[subject]}`}
                  onClick={() => switchTab(subject)}
                >
                  <span className="practice-eyebrow">{SUBJECT_GUIDES[subject].label} 다음 칸</span>
                  <strong>{next.title}</strong>
                </button>
              );
            })}
          </section>

          <article
            className="panel-block"
            style={{ border: "2px solid var(--english-border)", background: "var(--surface)" }}
          >
            <div className="section-heading">
              <div>
                <h2>🔤 오늘의 단어</h2>
                <p>매일 조금씩. 오늘 볼 것만 골라 드립니다.</p>
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
          </article>
        </section>

        <section
          id={panelIds.korean}
          className={`view ${activeTab === "korean" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-korean"
          hidden={activeTab !== "korean"}
        >
          <div className="page-intro">
            <div>
              <p className="eyebrow">2028 수능 통합형 완벽 대비</p>
              <h1>국어 길</h1>
              <p>기초 문장 성분부터 비문학 독서, 문학 개념어까지 한 칸씩 순서대로 열립니다.</p>
            </div>
          </div>

          <PathView
            subject="korean"
            state={appState.path}
            todayKey={todayKey}
            onCompleteNode={handleCompleteNode}
            onOutcome={handlePracticeOutcome}
          />
        </section>

        <section
          id={panelIds.english}
          className={`view ${activeTab === "english" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-english"
          hidden={activeTab !== "english"}
        >
          <div className="page-intro">
            <div>
              <p className="eyebrow">어휘·발음부터 구문 독해까지</p>
              <h1>영어 길</h1>
              <p>단어는 오늘 탭에서, 문법과 구문 독해는 여기 길에서 한 칸씩 익힙니다.</p>
            </div>
          </div>

          <PathView
            subject="english"
            state={appState.path}
            todayKey={todayKey}
            onCompleteNode={handleCompleteNode}
            onOutcome={handlePracticeOutcome}
          />
        </section>

        <section
          id={panelIds.math}
          className={`view ${activeTab === "math" ? "is-active" : ""}`}
          role="tabpanel"
          aria-labelledby="tab-math"
          hidden={activeTab !== "math"}
        >
          <div className="page-intro">
            <div>
              <p className="eyebrow">초·중등 계통부터 고등 수학까지</p>
              <h1>수학 길</h1>
              <p>부호 계산, 일차방정식, 이차함수, 도형과 피타고라스 계통을 차근차근 익힙니다.</p>
            </div>
          </div>

          <PathView
            subject="math"
            state={appState.path}
            todayKey={todayKey}
            onCompleteNode={handleCompleteNode}
            onOutcome={handlePracticeOutcome}
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

          {/* 레벨·포인트는 첫 화면에서 빼고 여기로 옮겼다. 시작할 때는 0이 부담이지만
              기록을 보러 온 자리에서는 쌓인 것이 보이는 편이 낫다. */}
          <div className="record-score-row" aria-label="성장 포인트">
            <span>Lv.{level}</span>
            <span>성장 포인트 {points} P</span>
            <span>연속 {streak}일</span>
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

          {mistakeSummary.length > 0 ? (
            <section className="study-detail-section" aria-label="자주 하는 실수">
              <div className="content-section-heading">
                <span>WEAK SPOTS</span>
                <div>
                  <h2>자주 틀리는 것</h2>
                  <p>최근에 틀린 문제에서 반복되는 실수예요. 여기부터 고치면 가장 빨리 올라갑니다.</p>
                </div>
              </div>
              <ul className="weak-spot-list">
                {mistakeSummary.slice(0, 5).map((item) => (
                  <li key={item.tag}>
                    <strong>{item.label}</strong>
                    <span>{item.count}번</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {practicedSkills.length > 0 ? (
            <section className="study-detail-section" aria-label="개념별 정답률">
              <div className="content-section-heading">
                <span>ACCURACY</span>
                <div>
                  <h2>개념별 정답률</h2>
                  <p>풀어 본 개념만 나옵니다. 낮은 것부터 다시 보면 됩니다.</p>
                </div>
              </div>
              <ul className="accuracy-list">
                {practicedSkills.map((item) => (
                  <li key={item.skillId}>
                    <strong>{item.label}</strong>
                    <span>
                      {Math.round(item.accuracy * 100)}% · {item.attempts}문제
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="study-detail-section" aria-label="오답노트">
            <div className="content-section-heading">
              <span>WRONG NOTES</span>
              <div>
                <h2>다시 풀 문제</h2>
                <p>틀린 문제를 모아 뒀어요. 똑같은 문제로 다시 풀거나 비슷한 문제로 확인하세요.</p>
              </div>
            </div>
            <WrongNotes notes={appState.practice.wrongNotes} onOutcome={handlePracticeOutcome} />
          </section>

          <section className="study-detail-section" aria-label="복습 큐">
            <div className="content-section-heading">
              <span>REVIEW QUEUE</span>
              <div>
                <h2>복습할 것들</h2>
                <p>때가 된 단어와 문제를 다시 풀며 오래 기억에 남겨요.</p>
              </div>
            </div>
            <TodayPractice
              reviewById={appState.practice.reviewById}
              today={todayKey}
              onOutcome={handlePracticeOutcome}
            />
          </section>

          <article className="panel-block" style={{ marginBottom: 14 }}>
            <div className="section-heading"><div><h2>과목별 위치</h2><p>길에서 끝낸 칸 기준</p></div></div>
            <div className="subject-progress-list">
              {SUBJECT_KEYS.map((subject) => {
                const progress = subjectProgress[subject];
                const percent = Math.round((progress.done / progress.total) * 100);
                return (
                  <article key={subject} className={`subject-progress-card ${SUBJECT_CLASS[subject]}`}>
                    <div className="section-heading">
                      <div><h3>{SUBJECT_GUIDES[subject].label}</h3><p>{progress.done}/{progress.total} 칸 완료</p></div>
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

      {isMikuBgmOpen ? (
        <div className="sheet-layer" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button type="button" className="sheet-backdrop" aria-label="미쿠 BGM 닫기" onClick={() => setIsMikuBgmOpen(false)} />
          <div
            className="study-sheet"
            role="dialog"
            aria-modal="true"
            style={{
              maxWidth: 440,
              borderRadius: 24,
              padding: 24,
              background: "linear-gradient(135deg, #e6f9f8 0%, #ffffff 100%)",
              border: "2px solid #a0ece7",
              boxShadow: "0 16px 36px rgba(57, 197, 187, 0.25)",
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src="/miku_avatar.jpg"
                  alt="하츠네 미쿠"
                  style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", border: "2px solid #39c5bb", boxShadow: "0 2px 8px rgba(57,197,187,0.3)" }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: "var(--fs-lead)", color: "#0f172a", fontWeight: 800 }}>🎵 미쿠 BGM & 수능 공부 명곡</h3>
                  <p style={{ margin: 0, fontSize: "var(--fs-micro)", color: "#00a496", fontWeight: 700 }}>Hatsune Miku Study Playlist</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMikuBgmOpen(false)}
                style={{ minWidth: "var(--tap)", minHeight: "var(--tap)", border: "none", background: "none", fontSize: "var(--fs-title)", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "var(--fs-small)", color: "#334155", lineHeight: 1.6, marginBottom: "var(--space-4)" }}>
              공부할 때 미쿠의 대표 명곡과 집중력을 높여주는 Chill Lo-Fi BGM을 들으며 함께 열공해요! 🎵✨
            </p>

            <div style={{ display: "grid", gap: 10 }}>
              <a
                href="https://www.youtube.com/results?search_query=hatsune+miku+lofi+study+bgm"
                target="_blank"
                rel="noreferrer noopener"
                className="primary-action"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", background: "#39c5bb", borderColor: "#00a496", padding: "12px 16px" }}
              >
                <span>☕ Miku Lo-Fi Chill Study BGM ↗</span>
                <span style={{ fontSize: "var(--fs-micro)", background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 8 }}>재생 🎵</span>
              </a>

              <a
                href="https://www.youtube.com/results?search_query=Tell+Your+World+Hatsune+Miku"
                target="_blank"
                rel="noreferrer noopener"
                className="secondary-action"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", borderColor: "#a0ece7", padding: "12px 16px" }}
              >
                <span>🎵 Tell Your World - kz (livetune) ↗</span>
                <span style={{ fontSize: "var(--fs-micro)" }}>시청 ↗</span>
              </a>

              <a
                href="https://www.youtube.com/results?search_query=Hatsune+Miku+39"
                target="_blank"
                rel="noreferrer noopener"
                className="secondary-action"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", borderColor: "#a0ece7", padding: "12px 16px" }}
              >
                <span>💖 39 (Sanku) - DECO*27 x sasakure ↗</span>
                <span style={{ fontSize: "var(--fs-micro)" }}>시청 ↗</span>
              </a>

              <a
                href="https://www.youtube.com/results?search_query=Hatsune+Miku+Melt"
                target="_blank"
                rel="noreferrer noopener"
                className="secondary-action"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", borderColor: "#a0ece7", padding: "12px 16px" }}
              >
                <span>✨ Melt (메르트) - ryo (supercell) ↗</span>
                <span style={{ fontSize: "var(--fs-micro)" }}>시청 ↗</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
