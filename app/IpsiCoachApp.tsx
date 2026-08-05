"use client";

import { useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "first-step-study-v1";
const FOCUS_SECONDS = 25 * 60;

type TabId = "home" | "roadmap" | "study" | "records";
type SubjectKey = "korean" | "english" | "math";
type WordStatus = "unknown" | "fuzzy" | "mastered";

type StudyTask = {
  id: string;
  title: string;
  duration: number;
  subjectKey: SubjectKey;
  subjectLabel: string;
};

type RoadmapStep = {
  id: string;
  subjectKey: SubjectKey;
  subjectLabel: string;
  stageLabel: string;
  description: string;
};

type ConceptCard = {
  id: string;
  subjectKey: SubjectKey;
  subjectLabel: string;
  title: string;
  summary: string;
  points: string[];
};

type Flashcard = {
  id: string;
  word: string;
  meaning: string;
  example: string;
};

type ExternalLinkCard = {
  id: string;
  title: string;
  description: string;
  href: string;
};

type AppState = {
  schemaVersion: 1;
  userName: string;
  dailyGoal: string;
  taskDate: string;
  completedTasks: string[];
  roadmapCompleted: string[];
  wordStatuses: Record<string, WordStatus>;
  studyLog: Record<string, number>;
};

type SheetState =
  | { kind: "timer" }
  | { kind: "concept"; conceptId: string }
  | null;

const TODAY_TASKS: StudyTask[] = [
  {
    id: "korean-skeleton",
    title: "국어 문장의 뼈대 20분",
    duration: 20,
    subjectKey: "korean",
    subjectLabel: "국어",
  },
  {
    id: "english-vocab",
    title: "영어 필수 어휘 10개 15분",
    duration: 15,
    subjectKey: "english",
    subjectLabel: "영어",
  },
  {
    id: "math-basics",
    title: "수학 수와 식 다시 보기 25분",
    duration: 25,
    subjectKey: "math",
    subjectLabel: "수학",
  },
];

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    id: "korean-foundation",
    subjectKey: "korean",
    subjectLabel: "국어",
    stageLabel: "기초",
    description: "문장 성분, 핵심어, 지문 구조 잡기",
  },
  {
    id: "korean-core",
    subjectKey: "korean",
    subjectLabel: "국어",
    stageLabel: "기본",
    description: "비문학 독해 루틴과 문학 기본 개념 연결",
  },
  {
    id: "korean-ebs",
    subjectKey: "korean",
    subjectLabel: "국어",
    stageLabel: "EBS 연계",
    description: "EBS 지문 요약과 오답 근거 체크",
  },
  {
    id: "english-foundation",
    subjectKey: "english",
    subjectLabel: "영어",
    stageLabel: "기초",
    description: "기본 어휘와 문장 해석 순서 익히기",
  },
  {
    id: "english-core",
    subjectKey: "english",
    subjectLabel: "영어",
    stageLabel: "기본",
    description: "구문 독해와 빈칸 추론 기본 패턴 반복",
  },
  {
    id: "english-ebs",
    subjectKey: "english",
    subjectLabel: "영어",
    stageLabel: "EBS 연계",
    description: "EBS 지문 표현을 수능형 문항으로 전환",
  },
  {
    id: "math-foundation",
    subjectKey: "math",
    subjectLabel: "수학",
    stageLabel: "기초",
    description: "수와 식, 문자 계산, 식의 구조 복습",
  },
  {
    id: "math-core",
    subjectKey: "math",
    subjectLabel: "수학",
    stageLabel: "기본",
    description: "개념 예제와 대표 유형 1회독",
  },
  {
    id: "math-ebs",
    subjectKey: "math",
    subjectLabel: "수학",
    stageLabel: "EBS 연계",
    description: "EBS 문항의 풀이 흐름과 실수 지점 정리",
  },
];

const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: "korean-core-sentence",
    subjectKey: "korean",
    subjectLabel: "국어",
    title: "문장의 뼈대 먼저 찾기",
    summary: "주어, 서술어, 핵심 연결어를 먼저 잡으면 지문 읽는 속도가 올라갑니다.",
    points: [
      "한 문장에 핵심 성분 세 개만 남긴다고 생각하고 읽습니다.",
      "접속어와 지시어를 함께 보면 문단 흐름이 덜 끊깁니다.",
      "오답 선지의 근거도 같은 방식으로 문장 뼈대에서 찾습니다.",
    ],
  },
  {
    id: "english-decode-order",
    subjectKey: "english",
    subjectLabel: "영어",
    title: "영어는 짧게 끊어 해석하기",
    summary: "노베이스일수록 앞에서 뒤로 짧게 끊어 읽는 순서가 중요합니다.",
    points: [
      "주어, 동사, 목적어를 먼저 체크하고 수식어는 뒤에서 붙입니다.",
      "모르는 단어가 있어도 문장 역할이 보이면 해석이 무너지지 않습니다.",
      "예문 한 줄을 직접 소리 내어 읽으면 구조 기억이 오래 갑니다.",
    ],
  },
  {
    id: "math-number-expression",
    subjectKey: "math",
    subjectLabel: "수학",
    title: "수와 식은 계산보다 구조",
    summary: "식의 모양을 먼저 읽으면 불필요한 계산을 줄일 수 있습니다.",
    points: [
      "동류항, 분배법칙, 괄호 구조를 먼저 표시합니다.",
      "숫자를 바로 대입하지 말고 식을 한 번 정리한 뒤 계산합니다.",
      "실수한 식은 왜 실수했는지 한 줄 메모를 남기는 편이 효과적입니다.",
    ],
  },
];

const FLASHCARDS: Flashcard[] = [
  {
    id: "essential-derive",
    word: "derive",
    meaning: "끌어내다, 유래하다",
    example: "We can derive the main idea from the first paragraph.",
  },
  {
    id: "essential-distinct",
    word: "distinct",
    meaning: "뚜렷한, 구별되는",
    example: "The two solutions have distinct advantages.",
  },
  {
    id: "essential-factor",
    word: "factor",
    meaning: "요인",
    example: "Sleep is a major factor in steady study habits.",
  },
  {
    id: "essential-context",
    word: "context",
    meaning: "맥락",
    example: "The sentence makes sense only in its full context.",
  },
  {
    id: "essential-infer",
    word: "infer",
    meaning: "추론하다",
    example: "You can infer the writer's attitude from the final paragraph.",
  },
];

const EBS_LINKS: ExternalLinkCard[] = [
  {
    id: "ebs-2027-concept",
    title: "2027 EBS 수능개념",
    description: "기초 개념을 과목별 공식 시리즈로 바로 시작합니다.",
    href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveSeriesSubjectList.ebs?seriesGrpId=PKG_0109&seriesId=PRO_1019",
  },
  {
    id: "ebs-buildup",
    title: "EBS 수능 빌드업",
    description: "기초 이후 기본 문제 감각을 끌어올리는 공식 시리즈입니다.",
    href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveSeriesSubjectList.ebs?seriesGrpId=PKG_0385&seriesId=PRO_1918",
  },
  {
    id: "ebs-light",
    title: "EBS 수능특강 Light",
    description: "연계 감각을 가볍게 올리기 좋은 공식 시리즈입니다.",
    href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveSeriesSubjectList.ebs?seriesGrpId=PKG_0118&seriesId=PRO_1944",
  },
];

const NAV_ITEMS: Array<{ id: TabId; label: string }> = [
  { id: "home", label: "홈" },
  { id: "roadmap", label: "로드맵" },
  { id: "study", label: "공부" },
  { id: "records", label: "기록" },
];

const SUBJECT_CLASS: Record<SubjectKey, string> = {
  korean: "subject-korean",
  english: "subject-english",
  math: "subject-math",
};

const SUBJECT_LABEL: Record<SubjectKey, string> = {
  korean: "국어",
  english: "영어",
  math: "수학",
};

const WORD_STATUS_LABEL: Record<WordStatus, string> = {
  unknown: "모름",
  fuzzy: "애매",
  mastered: "암기",
};

const DEFAULT_APP_STATE: AppState = {
  schemaVersion: 1,
  userName: "첫칸 학생",
  dailyGoal: "오늘 60분만 흔들리지 않기",
  taskDate: "",
  completedTasks: [],
  roadmapCompleted: [],
  wordStatuses: {},
  studyLog: {},
};

function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeStoredState(value: unknown): AppState {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_APP_STATE, taskDate: getTodayKey() };
  }

  const candidate = value as Partial<AppState>;
  const todayKey = getTodayKey();

  return {
    schemaVersion: 1,
    userName:
      typeof candidate.userName === "string" && candidate.userName.trim()
        ? candidate.userName
        : DEFAULT_APP_STATE.userName,
    dailyGoal:
      typeof candidate.dailyGoal === "string" && candidate.dailyGoal.trim()
        ? candidate.dailyGoal
        : DEFAULT_APP_STATE.dailyGoal,
    taskDate:
      typeof candidate.taskDate === "string" && candidate.taskDate
        ? candidate.taskDate
        : todayKey,
    completedTasks: Array.isArray(candidate.completedTasks)
      ? candidate.completedTasks.filter((item): item is string => typeof item === "string")
      : [],
    roadmapCompleted: Array.isArray(candidate.roadmapCompleted)
      ? candidate.roadmapCompleted.filter((item): item is string => typeof item === "string")
      : [],
    wordStatuses:
      candidate.wordStatuses && typeof candidate.wordStatuses === "object"
        ? Object.fromEntries(
            Object.entries(candidate.wordStatuses).filter(
              (entry): entry is [string, WordStatus] =>
                typeof entry[0] === "string" &&
                (entry[1] === "unknown" || entry[1] === "fuzzy" || entry[1] === "mastered"),
            ),
          )
        : {},
    studyLog:
      candidate.studyLog && typeof candidate.studyLog === "object"
        ? Object.fromEntries(
            Object.entries(candidate.studyLog).filter(
              (entry): entry is [string, number] =>
                typeof entry[0] === "string" &&
                typeof entry[1] === "number" &&
                Number.isFinite(entry[1]) &&
                entry[1] >= 0,
            ),
          )
        : {},
  };
}

function addStudyMinutes(state: AppState, dateKey: string, minutes: number): AppState {
  const nextValue = Math.max(0, (state.studyLog[dateKey] ?? 0) + minutes);
  return {
    ...state,
    studyLog: {
      ...state.studyLog,
      [dateKey]: nextValue,
    },
  };
}

function formatTimer(seconds: number): string {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function getLastSevenDays(): Array<{ key: string; label: string }> {
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: getTodayKey(date),
      label: weekdayLabels[date.getDay()],
    };
  });
}

function getCurrentStreak(studyLog: Record<string, number>): number {
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = getTodayKey(cursor);
    if ((studyLog[key] ?? 0) <= 0) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function IpsiCoachApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [appState, setAppState] = useState<AppState>({
    ...DEFAULT_APP_STATE,
    taskDate: getTodayKey(),
  });
  const [isReady, setIsReady] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(FOCUS_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetState>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("첫칸 준비 완료");

  const timerHeadingId = useId();
  const conceptHeadingId = useId();
  const homePanelId = useId();
  const roadmapPanelId = useId();
  const studyPanelId = useId();
  const recordsPanelId = useId();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const panelIds: Record<TabId, string> = {
    home: homePanelId,
    roadmap: roadmapPanelId,
    study: studyPanelId,
    records: recordsPanelId,
  };

  const touchTargetStyle = { minHeight: 44, minWidth: 44 };
  const todayKey = getTodayKey();
  const displayName = appState.userName.trim() || "첫칸 학생";
  const displayGoal = appState.dailyGoal.trim() || "오늘 60분만 흔들리지 않기";
  const completedTaskCount = TODAY_TASKS.filter((task) =>
    appState.completedTasks.includes(task.id),
  ).length;
  const progressPercent = Math.round((completedTaskCount / TODAY_TASKS.length) * 100);
  const activeFlashcard = FLASHCARDS[flashcardIndex] ?? FLASHCARDS[0];
  const activeWordStatus = appState.wordStatuses[activeFlashcard.id] ?? "unknown";
  const activeConcept =
    activeSheet?.kind === "concept"
      ? CONCEPT_CARDS.find((concept) => concept.id === activeSheet.conceptId) ?? null
      : null;
  const weeklyStudy = getLastSevenDays().map((day) => ({
    ...day,
    minutes: appState.studyLog[day.key] ?? 0,
  }));
  const maxWeeklyMinutes = Math.max(...weeklyStudy.map((entry) => entry.minutes), 25);
  const streakCount = getCurrentStreak(appState.studyLog);
  const masteredWords = FLASHCARDS.filter(
    (card) => appState.wordStatuses[card.id] === "mastered",
  ).length;

  useEffect(() => {
    const hydrationTimerId = window.setTimeout(() => {
      try {
        const rawState = window.localStorage.getItem(STORAGE_KEY);
        if (!rawState) {
          setIsReady(true);
          return;
        }

        const parsedState = normalizeStoredState(JSON.parse(rawState));
        setAppState({
          ...parsedState,
          schemaVersion: 1,
          taskDate: parsedState.taskDate === todayKey ? parsedState.taskDate : todayKey,
          completedTasks: parsedState.taskDate === todayKey ? parsedState.completedTasks : [],
        });
      } catch {
        setAppState({ ...DEFAULT_APP_STATE, taskDate: todayKey });
        setStatusMessage("저장 데이터를 읽지 못해 새로 시작합니다.");
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimerId);
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
          setStatusMessage("25분 집중을 완료했습니다.");
          setAppState((previous) => addStudyMinutes(previous, getTodayKey(), 25));
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!activeSheet) {
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const inertTargets = Array.from(
      document.querySelectorAll<HTMLElement>(".topbar, .app-content, .bottom-nav"),
    );
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = (): HTMLElement[] =>
      Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []).filter(
        (element) =>
          !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
      );

    inertTargets.forEach((element) => {
      element.inert = true;
    });

    const focusableElements = getFocusableElements();
    (focusableElements[0] ?? sheetRef.current)?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActiveSheet(null);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const nextFocusableElements = getFocusableElements();
      if (nextFocusableElements.length === 0) {
        event.preventDefault();
        sheetRef.current?.focus();
        return;
      }

      const firstElement = nextFocusableElements[0];
      const lastElement = nextFocusableElements[nextFocusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement || activeElement === sheetRef.current)
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
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
  }, [activeSheet]);

  const toggleTask = (task: StudyTask) => {
    const isCompleted = appState.completedTasks.includes(task.id);

    setAppState((previous) => {
      const nextCompletedTasks = isCompleted
        ? previous.completedTasks.filter((taskId) => taskId !== task.id)
        : [...previous.completedTasks, task.id];

      return addStudyMinutes(
        {
          ...previous,
          schemaVersion: 1,
          taskDate: todayKey,
          completedTasks: nextCompletedTasks,
        },
        todayKey,
        isCompleted ? -task.duration : task.duration,
      );
    });

    setStatusMessage(
      isCompleted
        ? `${task.title} 체크를 해제했습니다.`
        : `${task.title} 체크를 완료했습니다.`,
    );
  };

  const toggleRoadmapStep = (stepId: string) => {
    const isCompleted = appState.roadmapCompleted.includes(stepId);
    setAppState((previous) => ({
      ...previous,
      schemaVersion: 1,
      roadmapCompleted: isCompleted
        ? previous.roadmapCompleted.filter((item) => item !== stepId)
        : [...previous.roadmapCompleted, stepId],
    }));
    setStatusMessage(
      isCompleted ? "로드맵 단계를 다시 열어두었습니다." : "로드맵 단계를 완료했습니다.",
    );
  };

  const setWordStatus = (cardId: string, status: WordStatus) => {
    setAppState((previous) => ({
      ...previous,
      schemaVersion: 1,
      wordStatuses: {
        ...previous.wordStatuses,
        [cardId]: status,
      },
    }));
    setStatusMessage(`단어 상태를 ${WORD_STATUS_LABEL[status]}로 저장했습니다.`);
  };

  const completeFocusSession = () => {
    setIsTimerRunning(false);
    setTimerSeconds(FOCUS_SECONDS);
    setAppState((previous) => addStudyMinutes(previous, getTodayKey(), 25));
    setStatusMessage("집중 학습 25분을 기록했습니다.");
  };

  const resetAllData = () => {
    if (!window.confirm("학습 기록과 설정을 모두 초기화할까요?")) {
      return;
    }

    setAppState({
      ...DEFAULT_APP_STATE,
      taskDate: getTodayKey(),
    });
    setTimerSeconds(FOCUS_SECONDS);
    setIsTimerRunning(false);
    setFlashcardIndex(0);
    setIsFlashcardOpen(false);
    setActiveSheet(null);
    setStatusMessage("저장된 데이터를 초기화했습니다.");
  };

  const updateProfile = (field: "userName" | "dailyGoal", value: string) => {
    setAppState((previous) => ({
      ...previous,
      schemaVersion: 1,
      [field]: value,
    }));
  };

  const moveFlashcard = (direction: "prev" | "next") => {
    setFlashcardIndex((current) => {
      if (direction === "prev") {
        return current === 0 ? FLASHCARDS.length - 1 : current - 1;
      }
      return (current + 1) % FLASHCARDS.length;
    });
    setIsFlashcardOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand-mark">첫칸</p>
          <h1>노베이스 수능생의 첫 칸을 채우는 공부 루틴</h1>
        </div>
        <button
          type="button"
          className="timer-chip"
          style={touchTargetStyle}
          onClick={() => setActiveSheet({ kind: "timer" })}
        >
          {isTimerRunning ? "집중 중" : "25분 타이머"}
        </button>
      </header>

      <main className="app-content">
        <section className="hero-card">
          <p className="hero-label">오늘의 시작</p>
          <h2>{displayName}님, 오늘 목표는 {displayGoal}</h2>
          <p>
            오늘 할 일 {completedTaskCount}개 완료, 진행률 {progressPercent}%입니다.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-action"
              style={touchTargetStyle}
              onClick={() => setActiveSheet({ kind: "timer" })}
            >
              25분 타이머 시작
            </button>
            <button
              type="button"
              className="secondary-action"
              style={touchTargetStyle}
              onClick={() => setActiveTab("study")}
            >
              바로 공부하기
            </button>
          </div>
        </section>

        <p className="live-status" aria-live="polite">
          {isReady ? statusMessage : "저장된 학습 데이터를 불러오는 중입니다."}
        </p>

        <section
          className={`view ${activeTab === "home" ? "is-active" : ""}`}
          id={homePanelId}
          role="tabpanel"
          aria-labelledby="tab-home"
          hidden={activeTab !== "home"}
        >
          <article className="panel-block">
            <div className="section-heading">
              <h2>오늘 할 일</h2>
              <p>
                {completedTaskCount}/{TODAY_TASKS.length} 완료
              </p>
            </div>
            <div className="task-list">
              {TODAY_TASKS.map((task) => {
                const isCompleted = appState.completedTasks.includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    className={`task-card ${SUBJECT_CLASS[task.subjectKey]} ${
                      isCompleted ? "is-complete" : ""
                    }`}
                    style={touchTargetStyle}
                    aria-pressed={isCompleted}
                    onClick={() => toggleTask(task)}
                  >
                    <span className="task-subject">{task.subjectLabel}</span>
                    <strong>{task.title}</strong>
                    <span>{isCompleted ? "완료됨" : "터치해서 완료 체크"}</span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="panel-block progress-card">
            <div className="section-heading">
              <h2>오늘 진행률</h2>
              <p>{progressPercent}%</p>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p>홈 할 일을 모두 체크하면 오늘 루틴이 정리됩니다.</p>
          </article>

          <article className="panel-block timer-card">
            <div className="section-heading">
              <h2>집중 세션</h2>
              <p>{formatTimer(timerSeconds)}</p>
            </div>
            <p>25분만 집중하고 쉬는 흐름을 반복해 공부 감각을 되찾습니다.</p>
            <button
              type="button"
              className="primary-action"
              style={touchTargetStyle}
              onClick={() => setActiveSheet({ kind: "timer" })}
            >
              타이머 열기
            </button>
          </article>

          <article className="panel-block roadmap-preview">
            <div className="section-heading">
              <h2>주간 로드맵</h2>
              <p>기초 → 기본 → EBS 연계</p>
            </div>
            <div className="roadmap-grid">
              {(["korean", "english", "math"] as SubjectKey[]).map((subjectKey) => {
                const subjectSteps = ROADMAP_STEPS.filter((step) => step.subjectKey === subjectKey);
                const completedCount = subjectSteps.filter((step) =>
                  appState.roadmapCompleted.includes(step.id),
                ).length;

                return (
                  <article
                    key={subjectKey}
                    className={`roadmap-card ${SUBJECT_CLASS[subjectKey]}`}
                  >
                    <h3>{SUBJECT_LABEL[subjectKey]}</h3>
                    <p>
                      {completedCount}/{subjectSteps.length} 단계 완료
                    </p>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="panel-block recommendation-card">
            <div className="section-heading">
              <h2>EBS 추천</h2>
              <p>오늘 바로 보기</p>
            </div>
            <a
              className="external-card"
              href={EBS_LINKS[0].href}
              target="_blank"
              rel="noreferrer noopener"
              style={touchTargetStyle}
            >
              <strong>{EBS_LINKS[0].title}</strong>
              <span>{EBS_LINKS[0].description}</span>
              <span>공식 사이트 새 탭 열기</span>
            </a>
          </article>
        </section>

        <section
          className={`view ${activeTab === "roadmap" ? "is-active" : ""}`}
          id={roadmapPanelId}
          role="tabpanel"
          aria-labelledby="tab-roadmap"
          hidden={activeTab !== "roadmap"}
        >
          <div className="section-heading">
            <h2>과목별 로드맵</h2>
            <p>기초부터 EBS 연계까지 한 칸씩 체크합니다.</p>
          </div>
          <div className="roadmap-list">
            {(["korean", "english", "math"] as SubjectKey[]).map((subjectKey) => (
              <article key={subjectKey} className={`subject-panel ${SUBJECT_CLASS[subjectKey]}`}>
                <h3>{SUBJECT_LABEL[subjectKey]}</h3>
                <div className="roadmap-steps">
                  {ROADMAP_STEPS.filter((step) => step.subjectKey === subjectKey).map((step) => {
                    const isCompleted = appState.roadmapCompleted.includes(step.id);
                    return (
                      <button
                        key={step.id}
                        type="button"
                        className={`roadmap-step ${isCompleted ? "is-complete" : ""}`}
                        style={touchTargetStyle}
                        aria-pressed={isCompleted}
                        onClick={() => toggleRoadmapStep(step.id)}
                      >
                        <strong>{step.stageLabel}</strong>
                        <span>{step.description}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`view ${activeTab === "study" ? "is-active" : ""}`}
          id={studyPanelId}
          role="tabpanel"
          aria-labelledby="tab-study"
          hidden={activeTab !== "study"}
        >
          <article className="panel-block">
            <div className="section-heading">
              <h2>개념 카드</h2>
              <p>핵심만 먼저 잡는 카드</p>
            </div>
            <div className="concept-grid">
              {CONCEPT_CARDS.map((concept) => (
                <button
                  key={concept.id}
                  type="button"
                  className={`concept-card ${SUBJECT_CLASS[concept.subjectKey]}`}
                  style={touchTargetStyle}
                  onClick={() => setActiveSheet({ kind: "concept", conceptId: concept.id })}
                >
                  <span>{concept.subjectLabel}</span>
                  <strong>{concept.title}</strong>
                  <span>{concept.summary}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="panel-block flashcard-panel">
            <div className="section-heading">
              <h2>단어 플래시카드</h2>
              <p>
                {flashcardIndex + 1}/{FLASHCARDS.length} 카드, 암기 완료 {masteredWords}개
              </p>
            </div>
            <div className="flashcard-card subject-english">
              <p className="flashcard-word">{activeFlashcard.word}</p>
              <p className="flashcard-status">현재 상태: {WORD_STATUS_LABEL[activeWordStatus]}</p>
              {isFlashcardOpen ? (
                <div className="flashcard-answer">
                  <strong>{activeFlashcard.meaning}</strong>
                  <p>{activeFlashcard.example}</p>
                </div>
              ) : (
                <p>뜻과 예문을 눌러서 확인하세요.</p>
              )}
              <div className="flashcard-actions">
                <button
                  type="button"
                  className="secondary-action"
                  style={touchTargetStyle}
                  onClick={() => moveFlashcard("prev")}
                >
                  이전
                </button>
                <button
                  type="button"
                  className="primary-action"
                  style={touchTargetStyle}
                  aria-expanded={isFlashcardOpen}
                  onClick={() => setIsFlashcardOpen((current) => !current)}
                >
                  {isFlashcardOpen ? "가리기" : "뜻/예문 보기"}
                </button>
                <button
                  type="button"
                  className="secondary-action"
                  style={touchTargetStyle}
                  onClick={() => moveFlashcard("next")}
                >
                  다음
                </button>
              </div>
              <div className="status-actions" role="group" aria-label="단어 기억 상태">
                {(["unknown", "fuzzy", "mastered"] as WordStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`status-chip ${activeWordStatus === status ? "is-active" : ""}`}
                    style={touchTargetStyle}
                    aria-pressed={activeWordStatus === status}
                    onClick={() => setWordStatus(activeFlashcard.id, status)}
                  >
                    {WORD_STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="panel-block">
            <div className="section-heading">
              <h2>EBS 공식 링크</h2>
              <p>검증된 자료만 바로 연결</p>
            </div>
            <div className="external-list">
              {EBS_LINKS.map((link) => (
                <a
                  key={link.id}
                  className="external-card"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={touchTargetStyle}
                >
                  <strong>{link.title}</strong>
                  <span>{link.description}</span>
                  <span>EBS 공식 사이트 열기</span>
                </a>
              ))}
            </div>
          </article>
        </section>

        <section
          className={`view ${activeTab === "records" ? "is-active" : ""}`}
          id={recordsPanelId}
          role="tabpanel"
          aria-labelledby="tab-records"
          hidden={activeTab !== "records"}
        >
          <article className="panel-block stats-grid">
            <div className="stat-card">
              <p>연속 학습</p>
              <strong>{streakCount}일</strong>
            </div>
            <div className="stat-card">
              <p>이번 주 누적</p>
              <strong>{weeklyStudy.reduce((sum, day) => sum + day.minutes, 0)}분</strong>
            </div>
            <div className="stat-card">
              <p>영단어 암기</p>
              <strong>{masteredWords}개</strong>
            </div>
          </article>

          <article className="panel-block">
            <div className="section-heading">
              <h2>주간 바 차트</h2>
              <p>최근 7일 공부 시간</p>
            </div>
            <div className="weekly-chart" aria-label="최근 7일 공부 시간 막대 차트">
              {weeklyStudy.map((day) => (
                <div key={day.key} className="chart-column">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(16, (day.minutes / maxWeeklyMinutes) * 120)}px`,
                    }}
                    aria-label={`${day.label}요일 ${day.minutes}분`}
                  />
                  <strong>{day.label}</strong>
                  <span>{day.minutes}분</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-block">
            <div className="section-heading">
              <h2>과목별 진도</h2>
              <p>로드맵 완료 비율 기준</p>
            </div>
            <div className="subject-progress-list">
              {(["korean", "english", "math"] as SubjectKey[]).map((subjectKey) => {
                const subjectSteps = ROADMAP_STEPS.filter((step) => step.subjectKey === subjectKey);
                const completedCount = subjectSteps.filter((step) =>
                  appState.roadmapCompleted.includes(step.id),
                ).length;
                const subjectPercent = Math.round((completedCount / subjectSteps.length) * 100);

                return (
                  <article
                    key={subjectKey}
                    className={`subject-progress-card ${SUBJECT_CLASS[subjectKey]}`}
                  >
                    <div className="section-heading">
                      <h3>{SUBJECT_LABEL[subjectKey]}</h3>
                      <p>{subjectPercent}%</p>
                    </div>
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${subjectPercent}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="panel-block profile-panel">
            <div className="section-heading">
              <h2>이름 / 일일 목표</h2>
              <p>홈 화면 문구가 바로 바뀝니다.</p>
            </div>
            <label className="field-label">
              이름
              <input
                className="text-field"
                value={appState.userName}
                onChange={(event) => updateProfile("userName", event.target.value)}
              />
            </label>
            <label className="field-label">
              일일 목표
              <input
                className="text-field"
                value={appState.dailyGoal}
                onChange={(event) => updateProfile("dailyGoal", event.target.value)}
              />
            </label>
            <button
              type="button"
              className="danger-action"
              style={touchTargetStyle}
              onClick={resetAllData}
            >
              데이터 초기화
            </button>
          </article>
        </section>
      </main>

      <nav className="bottom-nav" role="tablist" aria-label="첫칸 하단 탭">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            className={`nav-tab ${activeTab === item.id ? "is-active" : ""}`}
            style={touchTargetStyle}
            aria-selected={activeTab === item.id}
            aria-controls={panelIds[item.id]}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {activeSheet ? (
        <div className="sheet-layer">
          <button
            type="button"
            className="sheet-backdrop"
            aria-label="학습 시트 닫기"
            onClick={() => setActiveSheet(null)}
          />
          <div
            ref={sheetRef}
            className="study-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={activeSheet.kind === "timer" ? timerHeadingId : conceptHeadingId}
            tabIndex={-1}
          >
            {activeSheet.kind === "timer" ? (
              <div className="sheet-content">
                <div className="section-heading">
                  <h2 id={timerHeadingId}>25분 집중 타이머</h2>
                  <button
                    type="button"
                    className="sheet-close"
                    style={touchTargetStyle}
                    onClick={() => setActiveSheet(null)}
                  >
                    닫기
                  </button>
                </div>
                <p className="timer-display">
                  {formatTimer(timerSeconds)}
                </p>
                <p>시작, 일시정지, 초기화, 학습완료로 루틴을 끊김 없이 관리합니다.</p>
                <div className="sheet-actions">
                  <button
                    type="button"
                    className="primary-action"
                    style={touchTargetStyle}
                    onClick={() => {
                      setIsTimerRunning(true);
                      setStatusMessage("집중 타이머를 시작했습니다.");
                    }}
                  >
                    시작
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    style={touchTargetStyle}
                    onClick={() => {
                      setIsTimerRunning(false);
                      setStatusMessage("집중 타이머를 일시정지했습니다.");
                    }}
                  >
                    일시정지
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    style={touchTargetStyle}
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(FOCUS_SECONDS);
                      setStatusMessage("집중 타이머를 초기화했습니다.");
                    }}
                  >
                    초기화
                  </button>
                  <button
                    type="button"
                    className="primary-action"
                    style={touchTargetStyle}
                    onClick={completeFocusSession}
                  >
                    학습완료
                  </button>
                </div>
              </div>
            ) : activeConcept ? (
              <div className="sheet-content">
                <div className="section-heading">
                  <h2 id={conceptHeadingId}>{activeConcept.title}</h2>
                  <button
                    type="button"
                    className="sheet-close"
                    style={touchTargetStyle}
                    onClick={() => setActiveSheet(null)}
                  >
                    닫기
                  </button>
                </div>
                <p className={SUBJECT_CLASS[activeConcept.subjectKey]}>{activeConcept.summary}</p>
                <ul className="concept-points">
                  {activeConcept.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
