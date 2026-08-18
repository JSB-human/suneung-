"use client";

import { useId, useMemo, useState } from "react";
import { VOCAB_WORDS, type VocabWordEntry } from "./vocab-data";
import {
  applyRating,
  getLocalDateKey,
  isDue,
  type ReviewProgress,
} from "./practice/review-queue";

export type VocabRating = "again" | "hard" | "good" | "easy";
export type VocabStage = "new" | "learning" | "review" | "completed";
export type VocabFilter = "all" | "new" | "learning" | "review" | "completed" | "due" | "favorite";

export type VocabWordProgress = ReviewProgress;

export type VocabTrainerState = {
  progressById: Record<string, VocabWordProgress>;
  lastSessionCompletedAt: string | null;
};

export type VocabSessionSummary = {
  completedAt: string;
  reviewedCount: number;
  ratings: Record<VocabRating, number>;
  completedWordIds: string[];
  remainingDueCount: number;
};

export type VocabTrainerProps = {
  words?: readonly VocabWordEntry[];
  value?: VocabTrainerState;
  defaultValue?: VocabTrainerState;
  onChange?: (nextState: VocabTrainerState) => void;
  onSessionComplete?: (summary: VocabSessionSummary, nextState: VocabTrainerState) => void;
  sessionSize?: number;
  today?: string;
  className?: string;
  title?: string;
};

const DEFAULT_STATE: VocabTrainerState = {
  progressById: {},
  lastSessionCompletedAt: null,
};

const FILTER_LABEL: Record<VocabFilter, string> = {
  all: "전체",
  new: "새 단어",
  learning: "학습중",
  review: "복습예정",
  completed: "완료",
  due: "오늘 복습",
  favorite: "즐겨찾기",
};

const STAGE_LABEL: Record<VocabStage, string> = {
  new: "새 단어",
  learning: "학습중",
  review: "복습예정",
  completed: "완료",
};

const RATING_LABEL: Record<VocabRating, string> = {
  again: "다시",
  hard: "어려움",
  good: "알겠음",
  easy: "쉬움",
};

const RATING_HINT: Record<VocabRating, string> = {
  again: "오늘 한 번 더 보면 됩니다.",
  hard: "짧게 다시 확인해 두면 됩니다.",
  good: "며칠 뒤 다시 보면 더 단단해집니다.",
  easy: "조금 더 긴 간격으로 보내도 괜찮습니다.",
};

const TOUCH_TARGET_STYLE = { minHeight: 44, minWidth: 44 };

/** 목록을 펼쳤을 때 한 번에 그리는 단어 수. "더 보기"로 늘린다. */
const LIBRARY_PAGE_SIZE = 30;

function normalizeState(state?: VocabTrainerState): VocabTrainerState {
  if (!state) {
    return DEFAULT_STATE;
  }

  return {
    progressById: state.progressById ?? {},
    lastSessionCompletedAt: state.lastSessionCompletedAt ?? null,
  };
}

function getProgress(state: VocabTrainerState, wordId: string): VocabWordProgress | null {
  return state.progressById[wordId] ?? null;
}

function resolveStage(progress: VocabWordProgress | null): VocabStage {
  return progress?.status ?? "new";
}

function formatDueDate(progress: VocabWordProgress | null): string {
  if (!progress) {
    return "오늘 바로 시작";
  }

  if (!progress.dueDate) {
    return progress.status === "completed" ? "복습 간격 계산 중" : "오늘 복습";
  }

  return progress.dueDate;
}

function buildSessionIds(
  words: readonly VocabWordEntry[],
  state: VocabTrainerState,
  today: string,
  sessionSize: number,
): string[] {
  return words
    .slice()
    .sort((left, right) => {
      const leftProgress = getProgress(state, left.id);
      const rightProgress = getProgress(state, right.id);
      const leftFavorite = leftProgress?.favorite ? 1 : 0;
      const rightFavorite = rightProgress?.favorite ? 1 : 0;
      if (leftFavorite !== rightFavorite) {
        return rightFavorite - leftFavorite;
      }

      const leftDueRank = isDue(leftProgress, today) ? 0 : 1;
      const rightDueRank = isDue(rightProgress, today) ? 0 : 1;
      if (leftDueRank !== rightDueRank) {
        return leftDueRank - rightDueRank;
      }

      const leftDate = leftProgress?.dueDate ?? "";
      const rightDate = rightProgress?.dueDate ?? "";
      if (leftDate !== rightDate) {
        return leftDate.localeCompare(rightDate);
      }

      return left.word.localeCompare(right.word);
    })
    .filter((word) => isDue(getProgress(state, word.id), today))
    .slice(0, sessionSize)
    .map((word) => word.id);
}

function buildRatingMessage(
  word: string,
  rating: VocabRating,
  nextProgress: VocabWordProgress,
): string {
  const nextDue = formatDueDate(nextProgress);

  if (rating === "again") {
    return `${word}: 괜찮아요. 지금 발견해서 이득이에요. ${nextDue}에 한 번 더 보면 됩니다.`;
  }

  if (rating === "hard") {
    return `${word}: 헷갈린 걸 알아챈 것도 공부예요. ${nextDue}에 짧게 다시 확인해 봅시다.`;
  }

  if (rating === "good") {
    return `${word}: 흐름을 잘 잡았습니다. ${nextDue}에 다시 보면 더 단단해집니다.`;
  }

  return `${word}: 안정적으로 기억하고 있네요. ${nextDue}에 다시 보면 충분합니다.`;
}

export function VocabTrainer({
  words = VOCAB_WORDS,
  value,
  defaultValue,
  onChange,
  onSessionComplete,
  sessionSize = 10,
  today = getLocalDateKey(),
  className,
  title = "수능人 단어 트레이너",
}: VocabTrainerProps) {
  const [internalState, setInternalState] = useState<VocabTrainerState>(() =>
    normalizeState(defaultValue),
  );
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [isMeaningVisible, setIsMeaningVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<VocabFilter>("all");
  const [sessionRatings, setSessionRatings] = useState<Record<string, VocabRating>>({});
  const [statusMessage, setStatusMessage] = useState(
    "단어 세션은 틀려도 괜찮습니다. 지금 확인하는 것 자체가 이미 공부입니다.",
  );

  const headingId = useId();
  const searchId = useId();

  const trainerState = value ? normalizeState(value) : internalState;
  const isControlled = value !== undefined;

  const wordsById = useMemo(() => {
    return new Map(words.map((word) => [word.id, word]));
  }, [words]);

  const summary = useMemo(() => {
    return words.reduce(
      (accumulator, word) => {
        const progress = getProgress(trainerState, word.id);
        const stage = resolveStage(progress);
        const due = isDue(progress, today);

        accumulator.total += 1;
        accumulator[stage] += 1;
        if (due) {
          accumulator.due += 1;
        }
        if (progress?.favorite) {
          accumulator.favorite += 1;
        }
        return accumulator;
      },
      {
        total: 0,
        new: 0,
        learning: 0,
        review: 0,
        completed: 0,
        due: 0,
        favorite: 0,
      },
    );
  }, [today, trainerState, words]);

  // 단어 목록은 접혀 있어도 <details> 자식이 DOM에 전부 만들어진다.
  // 1500장을 늘 그리면 문서가 1MB를 넘고 폰에서 스크롤이 끊긴다.
  // 펼쳤을 때만 그리고, 그때도 한 번에 다 그리지 않는다.
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [renderLimit, setRenderLimit] = useState(LIBRARY_PAGE_SIZE);

  const visibleWords = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase();

    return words.filter((word) => {
      const progress = getProgress(trainerState, word.id);
      const stage = resolveStage(progress);
      const due = isDue(progress, today);
      const favorite = progress?.favorite ?? false;

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "due" && due) ||
        (activeFilter === "favorite" && favorite) ||
        (activeFilter !== "due" && activeFilter !== "favorite" && stage === activeFilter);

      if (!matchesFilter) {
        return false;
      }

      if (!loweredSearch) {
        return true;
      }

      return [word.word, word.meaning, word.example, word.exampleTranslation]
        .join(" ")
        .toLowerCase()
        .includes(loweredSearch);
    });
  }, [activeFilter, searchTerm, today, trainerState, words]);

  const currentWord = sessionIds.length > 0 ? wordsById.get(sessionIds[sessionIndex]) ?? null : null;

  const updateTrainerState = (
    updater: (currentState: VocabTrainerState) => VocabTrainerState,
  ): VocabTrainerState => {
    const nextState = updater(trainerState);
    if (!isControlled) {
      setInternalState(nextState);
    }
    onChange?.(nextState);
    return nextState;
  };

  const startSession = () => {
    const nextSessionIds = buildSessionIds(words, trainerState, today, sessionSize);
    if (nextSessionIds.length === 0) {
      setStatusMessage(
        "오늘 바로 볼 단어는 비워 두었습니다. 괜찮아요. 내 단어장에서 복습 예정 단어를 천천히 확인해 보세요.",
      );
      return;
    }

    setSessionIds(nextSessionIds);
    setSessionIndex(0);
    setSessionRatings({});
    setIsMeaningVisible(false);
    setStatusMessage(
      `${nextSessionIds.length}개 복습을 시작합니다. 전부 맞히는 것보다 끝까지 보는 쪽이 더 중요합니다.`,
    );
  };

  const completeSession = (
    nextState: VocabTrainerState,
    nextRatings: Record<string, VocabRating>,
  ) => {
    const ratingsSummary: Record<VocabRating, number> = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    };

    for (const rating of Object.values(nextRatings)) {
      ratingsSummary[rating] += 1;
    }

    const remainingDueCount = words.filter((word) =>
      isDue(getProgress(nextState, word.id), today),
    ).length;

    const summaryPayload: VocabSessionSummary = {
      completedAt: today,
      reviewedCount: sessionIds.length,
      ratings: ratingsSummary,
      completedWordIds: sessionIds,
      remainingDueCount,
    };

    setSessionIds([]);
    setSessionIndex(0);
    setSessionRatings({});
    setIsMeaningVisible(false);
    setStatusMessage(
      `${sessionIds.length}개 복습을 마쳤습니다. 흔들린 단어도 지금 체크했으니 남은 복습 ${remainingDueCount}개가 더 분명해졌습니다.`,
    );
    onSessionComplete?.(summaryPayload, nextState);
  };

  const rateCurrentWord = (rating: VocabRating) => {
    if (!currentWord) {
      return;
    }

    let nextProgressForMessage: VocabWordProgress | null = null;
    const nextState = updateTrainerState((currentState) => {
      const previous = getProgress(currentState, currentWord.id);
      const nextProgress = applyRating(previous, rating, today);
      nextProgressForMessage = nextProgress;
      return {
        progressById: {
          ...currentState.progressById,
          [currentWord.id]: nextProgress,
        },
        lastSessionCompletedAt:
          sessionIndex === sessionIds.length - 1 ? today : currentState.lastSessionCompletedAt,
      };
    });

    const nextRatings = {
      ...sessionRatings,
      [currentWord.id]: rating,
    };
    setSessionRatings(nextRatings);

    if (sessionIndex >= sessionIds.length - 1) {
      completeSession(nextState, nextRatings);
      return;
    }

    setSessionIndex((currentIndex) => currentIndex + 1);
    setIsMeaningVisible(false);
    if (nextProgressForMessage) {
      setStatusMessage(buildRatingMessage(currentWord.word, rating, nextProgressForMessage));
    }
  };

  const toggleFavorite = (wordId: string) => {
    updateTrainerState((currentState) => {
      const previous = getProgress(currentState, wordId);
      const nextProgress: VocabWordProgress =
        previous ?? {
          status: "new",
          dueDate: today,
          lastReviewedAt: null,
          intervalDays: 0,
          reviewCount: 0,
          streak: 0,
          favorite: false,
          ease: 2.3,
          mastery: 0,
        };

      return {
        ...currentState,
        progressById: {
          ...currentState.progressById,
          [wordId]: {
            ...nextProgress,
            favorite: !nextProgress.favorite,
          },
        },
      };
    });

    const favoriteNow = !(getProgress(trainerState, wordId)?.favorite ?? false);
    setStatusMessage(
      favoriteNow
        ? "즐겨찾기에 담았습니다. 다시 보고 싶은 단어를 한곳에 모아 두면 복습이 훨씬 편해집니다."
        : "즐겨찾기에서 뺐습니다. 필요할 때 다시 담아도 괜찮습니다.",
    );
  };

  return (
    <section className={className ? `vocab-trainer ${className}` : "vocab-trainer"} aria-labelledby={headingId}>
      <header className="trainer-header">
        <div>
          <p className="trainer-eyebrow">수능人 영어</p>
          <h2 id={headingId}>{title}</h2>
          <p>하루 10개씩, 오늘 볼 것만 골라 드립니다.</p>
        </div>
        <button
          type="button"
          className="trainer-start-button"
          style={TOUCH_TARGET_STYLE}
          onClick={startSession}
        >
          10개 복습 시작
        </button>
      </header>

      <p className="trainer-live-status" aria-live="polite">
        {statusMessage}
      </p>

      <div className="trainer-summary-grid">
        <article className="trainer-summary-card">
          <p>새 단어</p>
          <strong>{summary.new}</strong>
        </article>
        <article className="trainer-summary-card">
          <p>학습중</p>
          <strong>{summary.learning}</strong>
        </article>
        <article className="trainer-summary-card">
          <p>복습예정</p>
          <strong>{summary.review}</strong>
        </article>
        <article className="trainer-summary-card">
          <p>완료</p>
          <strong>{summary.completed}</strong>
        </article>
      </div>

      {/* 안 본 단어가 전부 "오늘 복습"으로 잡히면 첫날에 1500개가 뜬다.
          실제로 오늘 할 양(한 세션)만 보여 준다. */}
      <div className="trainer-summary-strip">
        <span>오늘 할 단어 {Math.min(sessionSize, summary.due)}개</span>
        <span>익힌 단어 {summary.completed}개</span>
      </div>

      <section className="trainer-session-card" aria-label="단어 복습 세션">
        {currentWord ? (
          <>
            <div className="trainer-session-head">
              <p>
                {sessionIndex + 1}/{sessionIds.length} 복습
              </p>
              <p>다음 복습일 {formatDueDate(getProgress(trainerState, currentWord.id))}</p>
            </div>

            <div className="trainer-word-face">
              <span className="trainer-stage-chip">
                {STAGE_LABEL[resolveStage(getProgress(trainerState, currentWord.id))]}
              </span>
              <h3>{currentWord.word}</h3>
              <p>{currentWord.example}</p>
              <p>{currentWord.exampleTranslation}</p>
            </div>

            {isMeaningVisible ? (
              <div className="trainer-answer-panel">
                <strong>{currentWord.meaning}</strong>
                <p>SRS 다음 복습일: {formatDueDate(getProgress(trainerState, currentWord.id))}</p>
                <div className="trainer-rating-grid" role="group" aria-label="단어 평가">
                  {(["again", "hard", "good", "easy"] as VocabRating[]).map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`trainer-rating-button trainer-rating-${rating}`}
                      style={TOUCH_TARGET_STYLE}
                      onClick={() => rateCurrentWord(rating)}
                    >
                      <strong>{RATING_LABEL[rating]}</strong>
                      <span>{RATING_HINT[rating]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="trainer-reveal-button"
                style={TOUCH_TARGET_STYLE}
                onClick={() => setIsMeaningVisible(true)}
              >
                뜻 보기
              </button>
            )}
          </>
        ) : (
          <div className="trainer-empty-session">
            <h3>복습 세션 대기 중</h3>
            <p>오늘 볼 단어를 10개까지 자동으로 묶어 세션을 시작합니다.</p>
            <p>틀리는 단어가 있어도 괜찮습니다. 그 단어를 오늘 발견하는 것이 이 세션의 목적입니다.</p>
          </div>
        )}
      </section>

      {/* 단어 목록 전체를 늘 펼쳐 두면 화면이 수십 배로 길어진다. 접어 둔다. */}
      <details
        className="trainer-library"
        open={isLibraryOpen}
        onToggle={(event) => setIsLibraryOpen(event.currentTarget.open)}
      >
        <summary className="trainer-library-summary">내 단어장 전체 보기 · {words.length}개</summary>
        {isLibraryOpen ? (
        <>
        <div className="trainer-library-head">
          <div>
            <p>검색과 필터로 새 단어, 학습중, 복습예정, 완료 상태를 빠르게 확인합니다.</p>
          </div>
          <label className="trainer-search-field" htmlFor={searchId}>
            검색
            <input
              id={searchId}
              type="search"
              value={searchTerm}
              placeholder="단어, 뜻, 예문 검색"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="trainer-filter-row" role="group" aria-label="단어장 필터">
          {(["all", "new", "learning", "review", "completed", "due", "favorite"] as VocabFilter[]).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                className={`trainer-filter-chip ${activeFilter === filter ? "is-active" : ""}`}
                style={TOUCH_TARGET_STYLE}
                aria-pressed={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {FILTER_LABEL[filter]}
              </button>
            ),
          )}
        </div>

        <div className="trainer-word-list">
          {visibleWords.slice(0, renderLimit).map((word) => {
            const progress = getProgress(trainerState, word.id);
            const stage = resolveStage(progress);
            const due = isDue(progress, today);
            const reviewed = progress?.reviewCount ?? 0;
            const favorite = progress?.favorite ?? false;

            return (
              <article key={word.id} className="trainer-word-card">
                <div className="trainer-word-topline">
                  <div>
                    <span className={`trainer-stage trainer-stage-${stage}`}>{STAGE_LABEL[stage]}</span>
                    {due ? <span className="trainer-due-chip">오늘 복습</span> : null}
                  </div>
                  <button
                    type="button"
                    className={`trainer-favorite-button ${favorite ? "is-active" : ""}`}
                    style={TOUCH_TARGET_STYLE}
                    aria-pressed={favorite}
                    onClick={() => toggleFavorite(word.id)}
                  >
                    {favorite ? "★" : "☆"}
                    <span className="trainer-favorite-label">
                      {favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                    </span>
                  </button>
                </div>

                <h4>{word.word}</h4>
                <p className="trainer-word-meaning">{word.meaning}</p>
                <p className="trainer-word-example">{word.example}</p>
                <p className="trainer-word-translation">{word.exampleTranslation}</p>

                <div className="trainer-word-meta">
                  <span>다음 복습일 {formatDueDate(progress)}</span>
                  <span>복습 {reviewed}회</span>
                  <span>숙련도 {progress?.mastery ?? 0}</span>
                </div>
              </article>
            );
          })}

          {visibleWords.length === 0 ? (
            <div className="trainer-empty-library">
              <p>조건에 맞는 단어가 없습니다.</p>
              <p>검색어를 지우거나 다른 필터를 선택하세요.</p>
            </div>
          ) : null}
        </div>

        {visibleWords.length > renderLimit ? (
          <button
            type="button"
            className="trainer-more-button"
            style={TOUCH_TARGET_STYLE}
            onClick={() => setRenderLimit((previous) => previous + LIBRARY_PAGE_SIZE)}
          >
            더 보기 ({renderLimit} / {visibleWords.length})
          </button>
        ) : null}
        </>
        ) : null}
      </details>
    </section>
  );
}

export default VocabTrainer;
