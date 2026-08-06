# 학습 루프 Part 2 — 복습 큐와 오답노트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 틀린 문제가 오답노트에 쌓이고, 복습 예정일이 되면 다시 돌아오며, 오늘 탭에서 한 번의 탭으로 그날 볼 것을 시작할 수 있게 한다.

**Architecture:** `VocabTrainer` 안에 갇혀 있던 SM-2 계열 스케줄러를 `review-queue.ts`로 추출해 단어와 스킬이 같은 큐를 쓰게 한다. id 접두사(`vocab:` / `skill:`)로 종류를 구분한다. 오답은 문제 전문이 아니라 `{skillId, seed, level}`만 저장해 재현한다. 상태 변경은 전부 순수 함수로 분리해 테스트하고, `IpsiCoachApp`은 그 함수를 호출하기만 한다.

**Tech Stack:** TypeScript, React 19, Next.js 16 (vinext + Turbopack), `node --test` + `--experimental-strip-types`

**참조 스펙:** `docs/superpowers/specs/2026-08-06-study-loop-design.md`
**선행 계획:** `docs/superpowers/plans/2026-08-06-study-loop-part1-math.md` (완료, main에 병합됨)

---

## 이 계획의 범위

**포함:** 공용 복습 큐, `VocabTrainer` 리팩터링, 상태 v2→v3 마이그레이션, 오답노트 기록과 UI, 오늘 탭 진입점.

**제외 (다음 계획):**
- 3/10/20분 코스 편성기와 세션 러너 UI — 이번에는 "오늘 복습할 것"만 보여주고 바로 풀게 한다
- 영어·국어 생성기와 뱅크 집필
- 미쿠 반응 (`mistakeTag`는 이번에 저장까지만, 대사 연결은 다음)
- 레벨 2·3 자동 조정 — `skillLevels`는 저장하되 항상 1을 쓴다

---

## 검증된 사전 조건

Part 1에서 확인된 것들이다. 다시 조사하지 말 것.

- `npm run test:unit` = `node --experimental-strip-types --test tests/unit/**/*.test.mjs`. 현재 79개 통과.
- `npm test` = 위 + `npm run build` + `node --test tests/rendered-html.test.mjs` (5개). 전부 초록.
- **확장자 규칙:** `app/practice/` 안의 `.ts` 모듈끼리는 `.ts` 확장자를 붙여 import한다. `.tsx` 컴포넌트는 확장자 없이 import한다. `app/IpsiCoachApp.tsx`·`app/VocabTrainer.tsx` 같은 기존 앱 파일에서 practice 모듈을 부를 때는 관례대로 확장자를 생략한다.
- Node 타입 스트리핑은 `enum`·`namespace`·생성자 파라미터 프로퍼티를 지원하지 않는다. 타입만 가져올 때는 `import type`.
- **Node 테스트는 `.tsx`를 import할 수 없다.** JSX를 처리하지 못한다. 그래서 테스트해야 할 로직은 반드시 `.ts`에 둔다.
- `npm run lint` 기준선: 경고 4개, 에러 0개.
- localStorage 키는 `first-step-study-v2`를 계속 쓴다. 내부 `schemaVersion` 숫자로 구분한다. 새 키를 만들면 동생의 기존 진도를 잃는다.

---

## 파일 구조

| 파일 | 책임 |
| --- | --- |
| `app/practice/review-queue.ts` | 신규. SM-2 계열 스케줄러, due 판정, 키 접두사 |
| `app/practice/practice-state.ts` | 신규. 연습 상태 정규화·마이그레이션·오답노트 링버퍼 |
| `app/practice/WrongNotes.tsx` | 신규. 오답노트 목록 UI |
| `app/practice/TodayPractice.tsx` | 신규. 오늘 탭 진입점 |
| `app/practice/types.ts` | `Rating` 타입을 여기로 이동 |
| `app/practice/grading.ts` | `Rating`을 types에서 가져와 재수출 |
| `app/practice/PracticeRunner.tsx` | 결과를 위로 알리는 `onOutcome` 프롭 추가 |
| `app/VocabTrainer.tsx` | 자체 스케줄러 삭제, `review-queue` 사용 |
| `app/IpsiCoachApp.tsx` | v3 상태 배선, 오늘 탭·기록 탭에 새 UI 연결 |

---

### Task 1: `Rating` 타입 이동

**Files:**
- Modify: `app/practice/types.ts`
- Modify: `app/practice/grading.ts`

복습 큐와 채점이 같은 `Rating`을 써야 한다. 지금은 `grading.ts`가 소유하고 있는데, 스케줄러가 채점 모듈에 의존하는 것은 방향이 거꾸로다. 공용 타입 파일로 옮긴다.

- [ ] **Step 1: `app/practice/types.ts` 끝에 추가**

```ts
export type Rating = "again" | "hard" | "good" | "easy";
```

- [ ] **Step 2: `app/practice/grading.ts` 수정**

맨 위의 `export type Rating = ...` 줄을 지우고, 기존 import 줄을 아래로 바꾼다.

```ts
import type { GeneratedQuestion, Rating } from "./types.ts";

export type { Rating };
```

`export type { Rating }`를 남기는 이유는 기존 테스트와 앞으로의 소비자가 `grading.ts`에서 계속 가져올 수 있게 하기 위해서다.

- [ ] **Step 3: 회귀 없음 확인**

Run: `npm run test:unit`
Expected: 79 pass, 0 fail

- [ ] **Step 4: 타입체크**

Run: `npx tsc --noEmit --incremental false`
Expected: 출력 없음, 종료 코드 0

- [ ] **Step 5: 커밋**

```bash
git add app/practice/types.ts app/practice/grading.ts
git commit -m "refactor(practice): Rating 타입을 공용 types로 이동"
```

---

### Task 2: 공용 복습 큐

**Files:**
- Create: `app/practice/review-queue.ts`
- Create: `tests/unit/review-queue.test.mjs`

`app/VocabTrainer.tsx`의 `buildNextProgress`(142~226행), `addDays`(92~97행), `getLocalDateKey`(85~90행), `isDue`(114~124행)를 옮겨 온다. **스케줄 규칙은 한 글자도 바꾸지 않는다.** 동생의 기존 단어 진도가 그대로 이어져야 한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/review-queue.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  applyRating,
  createInitialProgress,
  isDue,
  listDueKeys,
  parseKey,
  skillKey,
  vocabKey,
} from "../../app/practice/review-queue.ts";

test("addDays walks the calendar correctly", () => {
  assert.equal(addDays("2026-08-06", 1), "2026-08-07");
  assert.equal(addDays("2026-08-31", 1), "2026-09-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  assert.equal(addDays("2026-08-06", 0), "2026-08-06");
});

test("a brand new item starts unseen and is due immediately", () => {
  const fresh = createInitialProgress();
  assert.equal(fresh.status, "new");
  assert.equal(fresh.reviewCount, 0);
  assert.equal(fresh.dueDate, null);
  assert.equal(isDue(null, "2026-08-06"), true);
  assert.equal(isDue(fresh, "2026-08-06"), true);
});

test("again resets the interval and schedules for today", () => {
  const next = applyRating(null, "again", "2026-08-06");
  assert.equal(next.status, "learning");
  assert.equal(next.dueDate, "2026-08-06");
  assert.equal(next.intervalDays, 0);
  assert.equal(next.streak, 0);
  assert.equal(next.reviewCount, 1);
});

test("good and easy push the due date further out than hard", () => {
  const hard = applyRating(null, "hard", "2026-08-06");
  const good = applyRating(null, "good", "2026-08-06");
  const easy = applyRating(null, "easy", "2026-08-06");
  assert.ok(hard.intervalDays < good.intervalDays, `${hard.intervalDays} < ${good.intervalDays}`);
  assert.ok(good.intervalDays < easy.intervalDays, `${good.intervalDays} < ${easy.intervalDays}`);
  assert.equal(hard.dueDate, addDays("2026-08-06", hard.intervalDays));
  assert.equal(easy.dueDate, addDays("2026-08-06", easy.intervalDays));
});

test("repeated easy ratings eventually complete the item", () => {
  let progress = null;
  for (let round = 0; round < 4; round += 1) {
    progress = applyRating(progress, "easy", "2026-08-06");
  }
  assert.equal(progress.status, "completed");
  assert.ok(progress.mastery >= 60);
});

test("intervals stay inside their documented caps", () => {
  let progress = null;
  for (let round = 0; round < 40; round += 1) {
    progress = applyRating(progress, "easy", "2026-08-06");
  }
  assert.ok(progress.intervalDays <= 45, `easy interval exceeded cap: ${progress.intervalDays}`);
  assert.ok(progress.ease <= 3.2, `ease exceeded cap: ${progress.ease}`);
  assert.ok(progress.mastery <= 100, `mastery exceeded cap: ${progress.mastery}`);

  let hardProgress = null;
  for (let round = 0; round < 40; round += 1) {
    hardProgress = applyRating(hardProgress, "hard", "2026-08-06");
  }
  assert.ok(hardProgress.intervalDays <= 10, `hard interval exceeded cap: ${hardProgress.intervalDays}`);
  assert.ok(hardProgress.ease >= 1.4, `ease fell below floor: ${hardProgress.ease}`);
});

test("again never drops ease or mastery below the floor", () => {
  let progress = null;
  for (let round = 0; round < 40; round += 1) {
    progress = applyRating(progress, "again", "2026-08-06");
  }
  assert.ok(progress.ease >= 1.3, `ease fell below floor: ${progress.ease}`);
  assert.equal(progress.mastery, 0);
});

test("favorite survives a rating", () => {
  const favorited = { ...createInitialProgress(), favorite: true };
  assert.equal(applyRating(favorited, "good", "2026-08-06").favorite, true);
});

test("isDue compares against the due date", () => {
  const progress = applyRating(null, "good", "2026-08-06");
  assert.equal(isDue(progress, "2026-08-06"), false);
  assert.equal(isDue(progress, progress.dueDate), true);
  assert.equal(isDue(progress, addDays(progress.dueDate, 5)), true);
});

test("keys carry their kind", () => {
  assert.equal(vocabKey("assume"), "vocab:assume");
  assert.equal(skillKey("ma-factor"), "skill:ma-factor");
  assert.deepEqual(parseKey("vocab:assume"), { kind: "vocab", id: "assume" });
  assert.deepEqual(parseKey("skill:ma-factor"), { kind: "skill", id: "ma-factor" });
  assert.equal(parseKey("nonsense"), null);
  assert.equal(parseKey("other:thing"), null);
});

test("parseKey keeps colons that belong to the id", () => {
  assert.deepEqual(parseKey("skill:ma:weird"), { kind: "skill", id: "ma:weird" });
});

test("listDueKeys returns only due entries of the requested kind", () => {
  const today = "2026-08-10";
  const progressById = {
    "skill:ma-factor": applyRating(null, "again", today),
    "skill:ma-linear-eq": applyRating(null, "easy", today),
    "vocab:assume": applyRating(null, "again", today),
  };

  assert.deepEqual(listDueKeys(progressById, today, "skill"), ["skill:ma-factor"]);
  assert.deepEqual(listDueKeys(progressById, today, "vocab"), ["vocab:assume"]);
  assert.deepEqual(listDueKeys(progressById, today).sort(), ["skill:ma-factor", "vocab:assume"]);
});

test("listDueKeys orders by due date, oldest first", () => {
  const progressById = {
    "skill:b": { ...createInitialProgress(), status: "review", dueDate: "2026-08-09" },
    "skill:a": { ...createInitialProgress(), status: "review", dueDate: "2026-08-01" },
    "skill:c": { ...createInitialProgress(), status: "review", dueDate: "2026-08-05" },
  };
  assert.deepEqual(listDueKeys(progressById, "2026-08-10", "skill"), ["skill:a", "skill:c", "skill:b"]);
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/review-queue.ts`

- [ ] **Step 3: `app/practice/review-queue.ts` 구현**

```ts
import type { Rating } from "./types.ts";

export type ReviewStage = "new" | "learning" | "review" | "completed";

export type ReviewProgress = {
  status: ReviewStage;
  dueDate: string | null;
  lastReviewedAt: string | null;
  intervalDays: number;
  reviewCount: number;
  streak: number;
  favorite: boolean;
  ease: number;
  mastery: number;
};

export type ReviewKind = "vocab" | "skill";

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(baseDateKey: string, days: number): string {
  const [year, month, day] = baseDateKey.split("-").map((value) => Number(value));
  const nextDate = new Date(year, month - 1, day);
  nextDate.setDate(nextDate.getDate() + days);
  return getLocalDateKey(nextDate);
}

export function createInitialProgress(): ReviewProgress {
  return {
    status: "new",
    dueDate: null,
    lastReviewedAt: null,
    intervalDays: 0,
    reviewCount: 0,
    streak: 0,
    favorite: false,
    ease: 2.3,
    mastery: 0,
  };
}

export function isDue(progress: ReviewProgress | null, today: string): boolean {
  if (!progress) {
    return true;
  }
  if (!progress.dueDate) {
    return progress.status !== "completed";
  }
  return progress.dueDate <= today;
}

export function vocabKey(wordId: string): string {
  return `vocab:${wordId}`;
}

export function skillKey(skillId: string): string {
  return `skill:${skillId}`;
}

export function parseKey(key: string): { kind: ReviewKind; id: string } | null {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex <= 0) {
    return null;
  }
  const prefix = key.slice(0, separatorIndex);
  const id = key.slice(separatorIndex + 1);
  if (!id) {
    return null;
  }
  if (prefix !== "vocab" && prefix !== "skill") {
    return null;
  }
  return { kind: prefix, id };
}

export function applyRating(
  previous: ReviewProgress | null,
  rating: Rating,
  today: string,
): ReviewProgress {
  const baseline = previous ?? createInitialProgress();
  const reviewCount = baseline.reviewCount + 1;
  const favorite = baseline.favorite;

  if (rating === "again") {
    return {
      ...baseline,
      status: "learning",
      dueDate: today,
      lastReviewedAt: today,
      intervalDays: 0,
      reviewCount,
      streak: 0,
      favorite,
      ease: Math.max(1.3, baseline.ease - 0.2),
      mastery: Math.max(0, baseline.mastery - 15),
    };
  }

  if (rating === "hard") {
    const intervalDays = baseline.intervalDays <= 0 ? 1 : Math.min(baseline.intervalDays + 1, 10);
    const mastery = Math.min(100, baseline.mastery + 8);
    return {
      ...baseline,
      status: reviewCount >= 2 ? "review" : "learning",
      dueDate: addDays(today, intervalDays),
      lastReviewedAt: today,
      intervalDays,
      reviewCount,
      streak: baseline.streak + 1,
      favorite,
      ease: Math.max(1.4, baseline.ease - 0.05),
      mastery,
    };
  }

  if (rating === "good") {
    const intervalDays =
      baseline.intervalDays <= 0 ? 3 : Math.min(Math.max(baseline.intervalDays + 3, 3), 21);
    const mastery = Math.min(100, baseline.mastery + 16);
    return {
      ...baseline,
      status: mastery >= 70 || reviewCount >= 4 ? "completed" : "review",
      dueDate: addDays(today, intervalDays),
      lastReviewedAt: today,
      intervalDays,
      reviewCount,
      streak: baseline.streak + 1,
      favorite,
      ease: Math.min(3.0, baseline.ease + 0.05),
      mastery,
    };
  }

  const intervalDays =
    baseline.intervalDays <= 0 ? 7 : Math.min(Math.max(baseline.intervalDays * 2, 7), 45);
  const mastery = Math.min(100, baseline.mastery + 24);
  return {
    ...baseline,
    status: mastery >= 60 || reviewCount >= 3 ? "completed" : "review",
    dueDate: addDays(today, intervalDays),
    lastReviewedAt: today,
    intervalDays,
    reviewCount,
    streak: baseline.streak + 1,
    favorite,
    ease: Math.min(3.2, baseline.ease + 0.15),
    mastery,
  };
}

export function listDueKeys(
  progressById: Record<string, ReviewProgress>,
  today: string,
  kind?: ReviewKind,
): string[] {
  return Object.entries(progressById)
    .filter(([key, progress]) => {
      const parsed = parseKey(key);
      if (!parsed) {
        return false;
      }
      if (kind && parsed.kind !== kind) {
        return false;
      }
      return isDue(progress, today);
    })
    .sort(([, left], [, right]) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))
    .map(([key]) => key);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: 79 + 13 = 92 pass, 0 fail

- [ ] **Step 5: 커밋**

```bash
git add app/practice/review-queue.ts tests/unit/review-queue.test.mjs
git commit -m "feat(practice): 단어와 스킬이 함께 쓰는 공용 복습 큐 추가"
```

---

### Task 3: `VocabTrainer`가 공용 큐를 쓰게 하기

**Files:**
- Modify: `app/VocabTrainer.tsx`
- Modify: `tests/rendered-html.test.mjs`

동작은 하나도 바뀌면 안 된다. 중복된 스케줄러를 지우는 것이 전부다. 두 벌이 남아 있으면 나중에 한쪽만 고쳐서 단어와 스킬의 복습 간격이 어긋난다.

- [ ] **Step 1: import 추가**

`app/VocabTrainer.tsx` 상단, `vocab-data` import 다음 줄에 넣는다. 기존 앱 파일이므로 확장자를 생략한다.

```ts
import {
  addDays,
  applyRating,
  createInitialProgress,
  getLocalDateKey,
  isDue,
  type ReviewProgress,
} from "./practice/review-queue";
```

- [ ] **Step 2: 로컬 중복 함수 삭제**

아래 네 개를 파일에서 **삭제**한다. 이제 import한 것이 대신 쓰인다.

- `getLocalDateKey` (85~90행 근처)
- `addDays` (92~97행 근처)
- `isDue` (114~124행 근처)
- `buildNextProgress` (142~226행 근처)

`buildNextProgress(previous, rating, today)`를 호출하던 자리는 전부 `applyRating(previous, rating, today)`로 바꾼다. 인자 순서와 의미가 같다.

- [ ] **Step 3: 진행도 타입을 별칭으로 바꾸기**

`export type VocabWordProgress = { ... }` 정의를 지우고 아래로 대체한다.

```ts
export type VocabWordProgress = ReviewProgress;
```

`VocabRating`은 그대로 둔다 — 이 파일의 UI가 쓰는 라벨과 묶여 있다.

`app/IpsiCoachApp.tsx`가 `VocabWordProgress`를 import하고 있으므로 이름은 반드시 유지해야 한다.

- [ ] **Step 4: 기본값 초기화 자리 정리**

파일 안에서 `{ status: "new", dueDate: null, ... ease: 2.3, mastery: 0 }` 형태의 객체 리터럴을 만들던 곳이 있으면 `createInitialProgress()`로 바꾼다. 없으면 이 스텝은 건너뛴다.

- [ ] **Step 5: 회귀 테스트 보강**

`tests/rendered-html.test.mjs`의 세 번째 테스트에서 `assert.match(trainer, /intervalDays/);` 다음 줄에 추가한다.

```js
  assert.match(trainer, /from "\.\/practice\/review-queue"/);
  assert.doesNotMatch(trainer, /function buildNextProgress/);
```

두 번째 줄이 핵심이다. 나중에 누군가 스케줄러를 이 파일에 다시 만들면 실패한다.

- [ ] **Step 6: 전체 검증**

Run: `npm test`
Expected: 92 단위 + 5 회귀 전부 통과

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

- [ ] **Step 7: 사람 눈으로 확인**

Run: `npm run dev`

영어·단어 탭 → 단어 복습 세션을 시작해 `다시 / 어려움 / 알겠음 / 쉬움`을 각각 한 번씩 눌러 본다. 카드가 넘어가고 상태 배지(새 단어/학습중/복습예정/완료)와 복습 예정일이 이전과 같은 방식으로 바뀌는지 본다. 콘솔에 에러가 없어야 한다.

- [ ] **Step 8: 커밋**

```bash
git add app/VocabTrainer.tsx tests/rendered-html.test.mjs
git commit -m "refactor(vocab): 중복 스케줄러를 지우고 공용 복습 큐 사용"
```

---

### Task 4: 연습 상태와 오답노트

**Files:**
- Create: `app/practice/practice-state.ts`
- Create: `tests/unit/practice-state.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/practice-state.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  EMPTY_PRACTICE_STATE,
  MAX_WRONG_NOTES,
  migrateVocabIntoReview,
  normalizePracticeState,
  recordOutcome,
} from "../../app/practice/practice-state.ts";

const TODAY = "2026-08-06";

function outcome(overrides = {}) {
  return {
    skillId: "ma-factor",
    seed: 4242,
    level: 1,
    isCorrect: false,
    mistakeTag: "one-sign",
    hintsUsed: 0,
    elapsedSeconds: 20,
    targetSeconds: 70,
    today: TODAY,
    ...overrides,
  };
}

test("normalizePracticeState fills in a usable shape from junk", () => {
  assert.deepEqual(normalizePracticeState(undefined), EMPTY_PRACTICE_STATE);
  assert.deepEqual(normalizePracticeState(null), EMPTY_PRACTICE_STATE);
  assert.deepEqual(normalizePracticeState(42), EMPTY_PRACTICE_STATE);
  assert.deepEqual(normalizePracticeState({ wrongNotes: "nope" }).wrongNotes, []);
  assert.deepEqual(normalizePracticeState({ reviewById: "nope" }).reviewById, {});
});

test("normalizePracticeState drops review entries with unrecognised keys", () => {
  const normalized = normalizePracticeState({
    reviewById: {
      "skill:ma-factor": { status: "review", dueDate: TODAY, intervalDays: 3 },
      "garbage": { status: "review" },
    },
  });
  assert.deepEqual(Object.keys(normalized.reviewById), ["skill:ma-factor"]);
});

test("a wrong answer is recorded in the notebook and schedules a review", () => {
  const next = recordOutcome(EMPTY_PRACTICE_STATE, outcome());
  assert.equal(next.wrongNotes.length, 1);
  assert.deepEqual(next.wrongNotes[0], {
    skillId: "ma-factor",
    seed: 4242,
    level: 1,
    mistakeTag: "one-sign",
    at: TODAY,
  });
  assert.equal(next.reviewById["skill:ma-factor"].status, "learning");
  assert.equal(next.reviewById["skill:ma-factor"].dueDate, TODAY);
});

test("a correct answer schedules a later review and adds no note", () => {
  const next = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, mistakeTag: null }));
  assert.equal(next.wrongNotes.length, 0);
  assert.ok(next.reviewById["skill:ma-factor"].dueDate > TODAY);
});

test("hints downgrade a correct answer to hard", () => {
  const withoutHints = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, hintsUsed: 0, elapsedSeconds: 60 }));
  const withHints = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ isCorrect: true, hintsUsed: 2, elapsedSeconds: 60 }));
  assert.ok(
    withHints.reviewById["skill:ma-factor"].intervalDays <
      withoutHints.reviewById["skill:ma-factor"].intervalDays,
  );
});

test("the newest wrong note comes first", () => {
  let state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ seed: 1 }));
  state = recordOutcome(state, outcome({ seed: 2 }));
  assert.deepEqual(state.wrongNotes.map((note) => note.seed), [2, 1]);
});

test("re-missing the same question moves it to the front instead of duplicating", () => {
  let state = recordOutcome(EMPTY_PRACTICE_STATE, outcome({ seed: 1 }));
  state = recordOutcome(state, outcome({ seed: 2 }));
  state = recordOutcome(state, outcome({ seed: 1 }));
  assert.deepEqual(state.wrongNotes.map((note) => note.seed), [1, 2]);
});

test("the notebook is capped and drops the oldest", () => {
  let state = EMPTY_PRACTICE_STATE;
  for (let seed = 0; seed < MAX_WRONG_NOTES + 20; seed += 1) {
    state = recordOutcome(state, outcome({ seed }));
  }
  assert.equal(state.wrongNotes.length, MAX_WRONG_NOTES);
  assert.equal(state.wrongNotes[0].seed, MAX_WRONG_NOTES + 19);
  assert.ok(state.wrongNotes.every((note) => note.seed >= 20));
});

test("recordOutcome does not mutate the state it was given", () => {
  const before = JSON.stringify(EMPTY_PRACTICE_STATE);
  recordOutcome(EMPTY_PRACTICE_STATE, outcome());
  assert.equal(JSON.stringify(EMPTY_PRACTICE_STATE), before);
});

test("migrateVocabIntoReview moves v2 word progress under the vocab prefix", () => {
  const legacy = {
    assume: { status: "review", dueDate: "2026-08-09", intervalDays: 3, ease: 2.3, mastery: 40, reviewCount: 2, streak: 2, favorite: true, lastReviewedAt: "2026-08-06" },
  };
  const migrated = migrateVocabIntoReview(legacy, {});
  assert.deepEqual(Object.keys(migrated), ["vocab:assume"]);
  assert.equal(migrated["vocab:assume"].mastery, 40);
  assert.equal(migrated["vocab:assume"].favorite, true);
});

test("migration never overwrites an entry that already exists", () => {
  const existing = { "vocab:assume": { ...EMPTY_PRACTICE_STATE.reviewById, mastery: 99, status: "completed", dueDate: null, intervalDays: 9, ease: 2.5, reviewCount: 9, streak: 9, favorite: false, lastReviewedAt: null } };
  const migrated = migrateVocabIntoReview({ assume: { status: "new", mastery: 0 } }, existing);
  assert.equal(migrated["vocab:assume"].mastery, 99);
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/practice-state.ts`

- [ ] **Step 3: 구현**

```ts
import { mapOutcomeToRating } from "./grading.ts";
import {
  applyRating,
  createInitialProgress,
  parseKey,
  skillKey,
  vocabKey,
  type ReviewProgress,
} from "./review-queue.ts";
import type { Level } from "./types.ts";

export const MAX_WRONG_NOTES = 100;

export type WrongNote = {
  skillId: string;
  seed: number;
  level: Level;
  mistakeTag: string | null;
  at: string;
};

export type PracticeState = {
  reviewById: Record<string, ReviewProgress>;
  wrongNotes: WrongNote[];
  skillLevels: Record<string, Level>;
};

export const EMPTY_PRACTICE_STATE: PracticeState = {
  reviewById: {},
  wrongNotes: [],
  skillLevels: {},
};

export type PracticeOutcome = {
  skillId: string;
  seed: number;
  level: Level;
  isCorrect: boolean;
  mistakeTag: string | null;
  hintsUsed: number;
  elapsedSeconds: number;
  targetSeconds: number;
  today: string;
};

function isLevel(value: unknown): value is Level {
  return value === 1 || value === 2 || value === 3;
}

function normalizeProgress(value: unknown): ReviewProgress | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Partial<ReviewProgress>;
  const fallback = createInitialProgress();
  return {
    status:
      candidate.status === "learning" ||
      candidate.status === "review" ||
      candidate.status === "completed"
        ? candidate.status
        : fallback.status,
    dueDate: typeof candidate.dueDate === "string" ? candidate.dueDate : null,
    lastReviewedAt:
      typeof candidate.lastReviewedAt === "string" ? candidate.lastReviewedAt : null,
    intervalDays: Number.isFinite(candidate.intervalDays)
      ? Number(candidate.intervalDays)
      : fallback.intervalDays,
    reviewCount: Number.isFinite(candidate.reviewCount)
      ? Number(candidate.reviewCount)
      : fallback.reviewCount,
    streak: Number.isFinite(candidate.streak) ? Number(candidate.streak) : fallback.streak,
    favorite: candidate.favorite === true,
    ease: Number.isFinite(candidate.ease) ? Number(candidate.ease) : fallback.ease,
    mastery: Number.isFinite(candidate.mastery) ? Number(candidate.mastery) : fallback.mastery,
  };
}

function normalizeWrongNote(value: unknown): WrongNote | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Partial<WrongNote>;
  if (typeof candidate.skillId !== "string" || !candidate.skillId) {
    return null;
  }
  if (!Number.isFinite(candidate.seed)) {
    return null;
  }
  return {
    skillId: candidate.skillId,
    seed: Number(candidate.seed),
    level: isLevel(candidate.level) ? candidate.level : 1,
    mistakeTag: typeof candidate.mistakeTag === "string" ? candidate.mistakeTag : null,
    at: typeof candidate.at === "string" ? candidate.at : "",
  };
}

export function normalizePracticeState(value: unknown): PracticeState {
  if (!value || typeof value !== "object") {
    return EMPTY_PRACTICE_STATE;
  }

  const candidate = value as Partial<PracticeState>;

  const reviewById: Record<string, ReviewProgress> = {};
  if (candidate.reviewById && typeof candidate.reviewById === "object") {
    for (const [key, rawProgress] of Object.entries(candidate.reviewById)) {
      if (!parseKey(key)) {
        continue;
      }
      const progress = normalizeProgress(rawProgress);
      if (progress) {
        reviewById[key] = progress;
      }
    }
  }

  const wrongNotes = Array.isArray(candidate.wrongNotes)
    ? candidate.wrongNotes
        .map(normalizeWrongNote)
        .filter((note): note is WrongNote => note !== null)
        .slice(0, MAX_WRONG_NOTES)
    : [];

  const skillLevels: Record<string, Level> = {};
  if (candidate.skillLevels && typeof candidate.skillLevels === "object") {
    for (const [skillId, level] of Object.entries(candidate.skillLevels)) {
      if (isLevel(level)) {
        skillLevels[skillId] = level;
      }
    }
  }

  return { reviewById, wrongNotes, skillLevels };
}

export function migrateVocabIntoReview(
  vocabProgressById: Record<string, unknown>,
  existing: Record<string, ReviewProgress>,
): Record<string, ReviewProgress> {
  const merged: Record<string, ReviewProgress> = { ...existing };
  for (const [wordId, rawProgress] of Object.entries(vocabProgressById ?? {})) {
    const key = vocabKey(wordId);
    if (merged[key]) {
      continue;
    }
    const progress = normalizeProgress(rawProgress);
    if (progress) {
      merged[key] = progress;
    }
  }
  return merged;
}

export function recordOutcome(state: PracticeState, outcome: PracticeOutcome): PracticeState {
  const key = skillKey(outcome.skillId);
  const rating = mapOutcomeToRating({
    isCorrect: outcome.isCorrect,
    hintsUsed: outcome.hintsUsed,
    elapsedSeconds: outcome.elapsedSeconds,
    targetSeconds: outcome.targetSeconds,
  });

  const reviewById = {
    ...state.reviewById,
    [key]: applyRating(state.reviewById[key] ?? null, rating, outcome.today),
  };

  if (outcome.isCorrect) {
    return { ...state, reviewById };
  }

  const note: WrongNote = {
    skillId: outcome.skillId,
    seed: outcome.seed,
    level: outcome.level,
    mistakeTag: outcome.mistakeTag,
    at: outcome.today,
  };

  const withoutDuplicate = state.wrongNotes.filter(
    (existing) => !(existing.skillId === note.skillId && existing.seed === note.seed),
  );

  return {
    ...state,
    reviewById,
    wrongNotes: [note, ...withoutDuplicate].slice(0, MAX_WRONG_NOTES),
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: 92 + 11 = 103 pass, 0 fail

- [ ] **Step 5: 커밋**

```bash
git add app/practice/practice-state.ts tests/unit/practice-state.test.mjs
git commit -m "feat(practice): 연습 상태와 오답노트 링버퍼 추가"
```

---

### Task 5: `PracticeRunner`가 결과를 위로 알리게 하기

**Files:**
- Modify: `app/practice/PracticeRunner.tsx`
- Modify: `tests/rendered-html.test.mjs`

지금 러너는 결과를 자기 안에만 갖고 있다. 오답노트가 쌓이려면 위로 보내야 한다.

- [ ] **Step 1: 프롭 타입 확장**

```ts
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
};
```

`initialSeed`는 오답노트에서 "똑같은 문제 다시 풀기"를 눌렀을 때 쓴다.

- [ ] **Step 2: 시작 시각을 기록**

컴포넌트 안에 추가한다.

```ts
const startedAtRef = useRef<number>(Date.now());
```

`useRef`를 React import에 추가한다. 문항이 바뀔 때마다 갱신해야 하므로, 첫 문항을 만드는 `useEffect`와 `nextQuestion` 안에서 `setQuestion(...)` 직후에 `startedAtRef.current = Date.now();`를 넣는다.

첫 문항 생성 `useEffect`는 `initialSeed`도 반영해야 한다.

```ts
    setQuestion(generateSafely(skillId, level, initialSeed));
```

의존성 배열에 `initialSeed`를 추가한다.

- [ ] **Step 3: `check`에서 결과를 보고**

`check` 콜백을 아래로 교체한다.

```ts
  const check = useCallback(() => {
    if (!question || !selected || checked) {
      return;
    }
    const graded = gradeAnswer(question, selected);
    setChecked(true);
    setAttemptCount((previous) => previous + 1);
    if (graded.isCorrect) {
      setSolvedCount((previous) => previous + 1);
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
  }, [checked, hintsShown, onOutcome, question, selected]);
```

`gradeAnswer`를 두 번 부르던 중복도 이 참에 사라진다.

- [ ] **Step 4: 회귀 어서션 추가**

`tests/rendered-html.test.mjs`의 `wires the infinite practice engine into the math tab` 테스트 안, `assert.match(runner, /useEffect/, ...)` 다음 줄에 추가한다.

```js
  assert.match(runner, /onOutcome\?\.\(/, "풀이 결과를 위로 보고해야 오답노트가 쌓인다");
  assert.match(runner, /startedAtRef/);
```

- [ ] **Step 5: 검증**

Run: `npm test`
Expected: 102 단위 + 5 회귀 통과

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

- [ ] **Step 6: 커밋**

```bash
git add app/practice/PracticeRunner.tsx tests/rendered-html.test.mjs
git commit -m "feat(practice): 풀이 결과를 상위로 보고하는 onOutcome 추가"
```

---

### Task 6: 오답노트 UI

**Files:**
- Create: `app/practice/WrongNotes.tsx`
- Modify: `app/visual-refresh.css`

- [ ] **Step 1: 구현**

```tsx
"use client";

import { useState } from "react";
import PracticeRunner from "./PracticeRunner";
import { getSkillEntry } from "./skill-map.ts";
import type { PracticeOutcomeReport } from "./PracticeRunner";
import type { WrongNote } from "./practice-state.ts";

export type WrongNotesProps = {
  notes: WrongNote[];
  onOutcome: (report: PracticeOutcomeReport) => void;
};

type RetryTarget = {
  skillId: string;
  seed?: number;
  key: string;
};

export default function WrongNotes({ notes, onOutcome }: WrongNotesProps) {
  const [retry, setRetry] = useState<RetryTarget | null>(null);

  if (notes.length === 0) {
    return (
      <p className="practice-empty" role="status">
        아직 오답이 없어요. 문제를 풀다 틀리면 여기에 모아 두고 다시 풀 수 있어요.
      </p>
    );
  }

  return (
    <div className="wrong-notes">
      <p className="wrong-notes-count">모아 둔 오답 {notes.length}개</p>

      <ul className="wrong-notes-list">
        {notes.map((note) => {
          const entry = getSkillEntry(note.skillId);
          const key = `${note.skillId}:${note.seed}`;
          return (
            <li key={key} className="wrong-note">
              <div>
                <strong>{entry?.label ?? note.skillId}</strong>
                <span className="wrong-note-date">{note.at}</span>
              </div>
              <div className="wrong-note-actions">
                <button
                  type="button"
                  className="practice-secondary"
                  onClick={() => setRetry({ skillId: note.skillId, seed: note.seed, key })}
                >
                  똑같은 문제 다시
                </button>
                <button
                  type="button"
                  className="practice-secondary"
                  onClick={() => setRetry({ skillId: note.skillId, key: `${key}:similar` })}
                >
                  비슷한 문제
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {retry ? (
        <div className="wrong-notes-retry">
          <button type="button" className="practice-secondary" onClick={() => setRetry(null)}>
            닫기
          </button>
          <PracticeRunner
            key={retry.key}
            skillId={retry.skillId}
            initialSeed={retry.seed}
            onOutcome={onOutcome}
          />
        </div>
      ) : null}
    </div>
  );
}
```

`key={retry.key}`가 중요하다. 다른 오답을 골랐을 때 러너를 새로 마운트해야 문제가 실제로 바뀐다.

- [ ] **Step 2: `app/visual-refresh.css` 끝에 추가**

```css
.wrong-notes {
  display: grid;
  gap: 12px;
}

.wrong-notes-count {
  margin: 0;
  font-weight: 700;
}

.wrong-notes-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.wrong-note {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
}

.wrong-note-date {
  margin-left: 8px;
  font-size: 13px;
  opacity: 0.7;
}

.wrong-note-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.wrong-notes-retry {
  display: grid;
  gap: 10px;
  justify-items: start;
}

@media (max-width: 390px) {
  .wrong-note {
    align-items: flex-start;
  }
}
```

- [ ] **Step 3: 검증과 커밋**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

```bash
git add app/practice/WrongNotes.tsx app/visual-refresh.css
git commit -m "feat(practice): 오답노트 UI 추가"
```

---

### Task 7: 오늘 탭 진입점

**Files:**
- Create: `app/practice/TodayPractice.tsx`
- Modify: `app/visual-refresh.css`

발견성 문제를 푼다. 지금 연습 카드는 수학 탭 → 지식 지도 → 단원 → 개념 → 스크롤까지 다섯 번 이동해야 닿는다.

- [ ] **Step 1: 구현**

```tsx
"use client";

import { useMemo, useState } from "react";
import PracticeRunner from "./PracticeRunner";
import { listSkillIds } from "./generators/registry.ts";
import { getSkillEntry } from "./skill-map.ts";
import { isDue, skillKey, type ReviewProgress } from "./review-queue.ts";
import type { PracticeOutcomeReport } from "./PracticeRunner";

export type TodayPracticeProps = {
  reviewById: Record<string, ReviewProgress>;
  today: string;
  onOutcome: (report: PracticeOutcomeReport) => void;
};

export default function TodayPractice({ reviewById, today, onOutcome }: TodayPracticeProps) {
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);

  // 복습일이 지난 스킬을 먼저, 그다음 아직 한 번도 안 푼 스킬을 준다.
  const queue = useMemo(() => {
    const all = listSkillIds();
    const due = all.filter((skillId) => {
      const progress = reviewById[skillKey(skillId)];
      return progress ? isDue(progress, today) : false;
    });
    const fresh = all.filter((skillId) => !reviewById[skillKey(skillId)]);
    return { due, fresh };
  }, [reviewById, today]);

  const suggested = queue.due[0] ?? queue.fresh[0] ?? listSkillIds()[0];
  const suggestedLabel = getSkillEntry(suggested)?.label ?? suggested;

  return (
    <section className="today-practice" aria-label="오늘의 연습">
      <div className="today-practice-head">
        <div>
          <p className="practice-eyebrow">오늘의 연습</p>
          <h3>
            {queue.due.length > 0
              ? `복습할 게 ${queue.due.length}개 있어`
              : "새 문제로 시작해 볼까?"}
          </h3>
          <p className="today-practice-sub">{suggestedLabel}부터 시작하면 돼.</p>
        </div>
        <button
          type="button"
          className="practice-primary"
          onClick={() => setOpenSkillId((previous) => (previous === suggested ? null : suggested))}
          aria-expanded={openSkillId === suggested}
        >
          {openSkillId === suggested ? "접기" : "바로 시작"}
        </button>
      </div>

      {openSkillId ? (
        <PracticeRunner key={openSkillId} skillId={openSkillId} onOutcome={onOutcome} />
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: `app/visual-refresh.css` 끝에 추가**

```css
.today-practice {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--math-border);
  border-radius: 18px;
  background: var(--math-surface);
}

.today-practice-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.today-practice-head h3 {
  margin: 0;
  font-size: 18px;
}

.today-practice-sub {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.8;
}
```

- [ ] **Step 3: 검증과 커밋**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

```bash
git add app/practice/TodayPractice.tsx app/visual-refresh.css
git commit -m "feat(practice): 오늘 탭 연습 진입점 추가"
```

---

### Task 8: 앱 상태 배선 (v2 → v3)

**Files:**
- Modify: `app/IpsiCoachApp.tsx`
- Modify: `tests/rendered-html.test.mjs`

가장 조심해야 하는 태스크다. `IpsiCoachApp.tsx`는 1400줄이 넘고 동생의 실제 진도가 여기에 걸려 있다. **최소한만 바꾼다.**

- [ ] **Step 1: import 추가**

```ts
import TodayPractice from "./practice/TodayPractice";
import WrongNotes from "./practice/WrongNotes";
import type { PracticeOutcomeReport } from "./practice/PracticeRunner";
import { getSkillEntry } from "./practice/skill-map";
import {
  EMPTY_PRACTICE_STATE,
  migrateVocabIntoReview,
  normalizePracticeState,
  recordOutcome,
  type PracticeState,
} from "./practice/practice-state";
```

- [ ] **Step 2: `AppState`에 필드 추가**

`schemaVersion: 2`를 `schemaVersion: 3`으로 바꾸고 필드를 하나 더한다.

```ts
type AppState = {
  schemaVersion: 3;
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
};
```

`DEFAULT_APP_STATE`에도 `schemaVersion: 3`과 `practice: EMPTY_PRACTICE_STATE`를 넣는다.

- [ ] **Step 3: `normalizeStoredState`에서 마이그레이션**

반환 객체의 `schemaVersion: 2`를 `3`으로 바꾸고, 마지막에 `practice`를 추가한다.

```ts
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
```

`migrateLegacyState`(v1 경로)에는 손대지 않는다. `DEFAULT_APP_STATE`를 펼치므로 `practice`가 자동으로 빈 값이 되고, 그 뒤 v2 정규화를 거치면서 단어 진도가 옮겨진다.

- [ ] **Step 4: 결과 기록 핸들러 추가**

상태 갱신 함수들이 모여 있는 자리에 넣는다.

```ts
  const handlePracticeOutcome = (report: PracticeOutcomeReport) => {
    const targetSeconds = getSkillEntry(report.skillId)?.targetSeconds ?? 60;
    setState((previous) =>
      addStudyMinutes(
        {
          ...previous,
          practice: recordOutcome(previous.practice, {
            ...report,
            targetSeconds,
            today: getLocalDateKey(),
          }),
        },
        getLocalDateKey(),
        1,
      ),
    );
  };
```

문제 하나를 1분으로 세어 학습 기록과 연속 학습일에 반영한다. 지금은 타이머를 돌려야만 연속 기록이 오르는데, 문제를 푸는 것도 공부다.

- [ ] **Step 5: 오늘 탭에 `TodayPractice` 렌더**

오늘 탭의 `EncouragementCoach` 바로 다음에 넣는다.

```tsx
<TodayPractice
  reviewById={state.practice.reviewById}
  today={getLocalDateKey()}
  onOutcome={handlePracticeOutcome}
/>
```

- [ ] **Step 6: 기록 탭에 `WrongNotes` 렌더**

기록 탭 안, 학습 기록 섹션 다음에 넣는다.

```tsx
<section className="study-detail-section" aria-label="오답노트">
  <div className="content-section-heading">
    <span>WRONG NOTES</span>
    <div>
      <h2>다시 풀 문제</h2>
      <p>틀린 문제를 모아 뒀어요. 똑같은 문제로 다시 풀거나 비슷한 문제로 확인하세요.</p>
    </div>
  </div>
  <WrongNotes notes={state.practice.wrongNotes} onOutcome={handlePracticeOutcome} />
</section>
```

- [ ] **Step 7: 수학 탭의 러너에도 결과 보고 연결**

Part 1에서 넣은 `renderConceptPractice` 안의 `PracticeRunner`에 `onOutcome`을 추가한다.

```tsx
  return skillIds.map((skillId) => (
    <PracticeRunner key={skillId} skillId={skillId} onOutcome={handlePracticeOutcome} />
  ));
```

- [ ] **Step 8: 회귀 어서션 갱신**

`tests/rendered-html.test.mjs`의 두 번째 테스트에서 `assert.match(component, /schemaVersion: 2/);`를 아래로 바꾼다.

```js
  assert.match(component, /schemaVersion: 3/);
  assert.match(component, /migrateVocabIntoReview/, "v2 단어 진도가 복습 큐로 옮겨져야 한다");
  assert.match(component, /recordOutcome/);
```

같은 파일 첫 번째 테스트(서버 렌더 HTML)에 추가한다.

```js
  assert.match(html, /오늘의 연습/);
```

- [ ] **Step 9: 전체 검증**

Run: `npm test`
Expected: 103 단위 + 5 회귀 전부 통과

Run: `npm run build:vercel`
Expected: `✓ Compiled successfully`

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

- [ ] **Step 10: 기존 진도 보존을 실제로 확인**

이 스텝은 건너뛰지 말 것. 동생의 데이터가 걸려 있다.

`npm run dev`로 띄운 뒤 브라우저 콘솔에서 v2 상태를 심는다.

```js
localStorage.setItem("first-step-study-v2", JSON.stringify({
  schemaVersion: 2,
  userName: "인1이",
  dailyGoal: "완벽보다 오늘의 한 칸",
  taskDate: "",
  completedTasks: [],
  completedUnitIds: ["ma-01"],
  bookmarkedNoteIds: [],
  studyLog: { "2026-08-05": 25 },
  vocab: { progressById: { assume: { status: "review", dueDate: "2026-08-09", lastReviewedAt: "2026-08-06", intervalDays: 3, reviewCount: 2, streak: 2, favorite: true, ease: 2.3, mastery: 40 } }, lastSessionCompletedAt: null },
  language: { korean: { completedConceptIds: [], correctQuestionIds: [] }, english: { completedConceptIds: [], correctQuestionIds: [] } },
  math: { completedConceptIds: [], correctQuestionIds: [] },
}));
location.reload();
```

새로고침 후 확인할 것:
1. 영어·단어 탭에서 `assume`이 즐겨찾기·복습예정 상태로 남아 있다
2. 콘솔에서 `JSON.parse(localStorage["first-step-study-v2"]).practice.reviewById["vocab:assume"].mastery`가 `40`이다
3. `schemaVersion`이 `3`이다
4. 로드맵의 `ma-01` 완료 표시와 학습 기록이 남아 있다

- [ ] **Step 11: 오답노트가 실제로 쌓이는지 확인**

오늘 탭 → "바로 시작" → 일부러 틀린 답을 고르고 정답 확인 → 기록 탭으로 이동 → "다시 풀 문제"에 방금 문제가 있는지 본다. "똑같은 문제 다시"를 눌러 **같은 문제**가 나오는지, "비슷한 문제"를 눌러 **다른 문제**가 나오는지 확인한다.

- [ ] **Step 12: 커밋**

```bash
git add app/IpsiCoachApp.tsx tests/rendered-html.test.mjs
git commit -m "feat(practice): 오답노트·복습 큐를 앱 상태에 배선하고 v3로 마이그레이션"
```

---

## 완료 기준

- [ ] `npm test` 통과 (103 단위 + 5 회귀)
- [ ] `npm run build:vercel` 통과
- [ ] `npm run lint` 에러 0 (경고 4개 유지)
- [ ] `npx tsc --noEmit --incremental false` 통과
- [ ] v2 저장 데이터가 v3로 올라가며 단어 진도·즐겨찾기·로드맵 완료·학습 기록이 전부 보존된다
- [ ] 틀린 문제가 오답노트에 쌓이고, 같은 문제와 비슷한 문제로 각각 다시 풀 수 있다
- [ ] 복습일이 지난 스킬이 오늘 탭에 나타난다
- [ ] 오늘 탭에서 한 번의 탭으로 문제 풀이가 시작된다
- [ ] 단어 복습 동작이 리팩터링 전과 같다

## 다음 계획으로 넘기는 것

- 3/10/20분 코스 편성기와 세션 러너 (개념 카드 + 문제 + 단어를 한 줄로)
- 영어 10스킬·국어 10스킬 생성기와 문장·지문 뱅크
- 미쿠 반응 — `mistakeTag`가 이제 저장되므로 "부호를 놓쳤구나"를 말할 재료가 생겼다
- 레벨 2·3 자동 조정 (`skillLevels`는 이미 저장 중)
- 조사 처리(`3로` → `3으로`)와 `x^2`/`x²` 표기 통일
