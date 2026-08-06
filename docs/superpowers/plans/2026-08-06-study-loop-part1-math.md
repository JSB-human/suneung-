# 학습 루프 Part 1 — 수학 생성 엔진 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수학 5개 스킬에서 무한히 새 문제가 생성되고, 모든 문항이 단계별 풀이와 3단계 힌트를 가지며, 문제 화면을 벗어나지 않고 개념·요점을 볼 수 있게 한다.

**Architecture:** 시드 기반 난수(`createRng`)로 구동되는 순수 함수 생성기가 답을 먼저 정하고 문제를 역방향으로 만든다. `{skillId, seed, level}` 세 값이면 문항이 완전히 재현되므로 저장·재출제가 가볍다. 생성기는 UI를 모르고, UI는 생성 규칙을 모른다. `skill-map.ts`가 skillId를 기존 요점 카드·기초 캡슐·커리큘럼 개념에 연결하되 기존 콘텐츠는 수정하지 않는다.

**Tech Stack:** TypeScript, React 19, Next.js 16 (vinext + Turbopack), `node --test` + `--experimental-strip-types`

**참조 스펙:** `docs/superpowers/specs/2026-08-06-study-loop-design.md`

---

## 이 계획의 범위

스펙 1(학습 루프) 전체 중 **수학 세로 슬라이스**만 다룬다. 이것만으로 동작하는 소프트웨어가 나온다: 수학 탭에서 개념을 고르고 무한히 새 문제를 풀 수 있다.

**이 계획에 없는 것 (후속 계획):**

- Part 2: 나머지 수학 10스킬 + 영어 10스킬 + 국어 10스킬 + 문장/지문 뱅크 집필
- Part 3: 복습 큐(`review-queue.ts`), 세션 편성(`session-planner.ts`), 오답노트, 미쿠 반응(`app/miku/`)

Part 1에서 틀린 문제는 아직 어디에도 누적되지 않는다. 오답노트는 Part 3에서 붙는다.

**난이도 처리:** Part 1에서 `level`은 **파라미터 범위와 음수 등장 여부만** 바꾼다(구조적 변형은 Part 2). 노베이스는 레벨 1에서 시작하므로 이 범위로 충분하다.

---

## 검증된 사전 조건

계획 작성 중 실물로 확인한 사항이다. 다시 조사하지 말 것.

- Node v22.17.1에서 `node --experimental-strip-types --test`로 `.ts` 모듈을 테스트에서 직접 import할 수 있다. 전이 import와 `import type`도 동작한다.
- 타입 스트리핑은 import 경로에 **`.ts` 확장자를 강제**한다. 따라서 `tsconfig.json`에 `allowImportingTsExtensions: true`를 켜고, **이 계획에서 새로 만드는 모듈끼리는 항상 `.ts` 확장자를 붙여 import**한다.
- 이 설정으로 `npx tsc --noEmit`, `npm run build`(vinext), `npm run build:vercel`(next/Turbopack), `npm run lint`이 모두 통과함을 확인했다.
- 타입 스트리핑은 `enum`, `namespace`, 생성자 파라미터 프로퍼티를 지원하지 않는다. **새 모듈에서 이 셋을 쓰지 말 것.** 타입만 가져올 때는 반드시 `import type`을 쓴다.
- `npm run lint`은 현재 경고 5개, 에러 0개다. 경고 수가 늘지 않으면 정상이다.

---

## 파일 구조

| 파일 | 책임 |
| --- | --- |
| `app/practice/rng.ts` | 시드 난수. 같은 시드 → 같은 수열 |
| `app/practice/types.ts` | `GeneratedQuestion`, `Choice`, `Level` 등 공용 타입 |
| `app/practice/question-invariants.ts` | 생성 문항 불변식 검사. 테스트와 런타임 가드가 공유 |
| `app/practice/math-format.ts` | 분수 약분, 다항식·인수 문자열 포맷 |
| `app/practice/generators/choice-builder.ts` | 정답 1개 + 중복 없는 오답으로 선지 구성 |
| `app/practice/generators/math.ts` | 수학 5스킬 생성기 |
| `app/practice/generators/registry.ts` | skillId → 생성기. `generateQuestion()` 진입점 |
| `app/practice/skill-map.ts` | skillId ↔ 기존 개념 자료 연결표 |
| `app/practice/grading.ts` | 정답 판정, 평가 환산 |
| `app/practice/concept-source.ts` | skillId → 요점 카드·기초 캡슐에서 개념 자료 추출 |
| `app/practice/safe-generate.ts` | 생성 실패를 삼키고 다음 시드로 재시도 |
| `app/practice/ConceptSheet.tsx` | 문제 옆에서 여는 개념·요점 시트 |
| `app/practice/PracticeRunner.tsx` | 문제 풀이 UI |
| `app/MathKnowledgeMap.tsx` | (수정) 개념 상세에 "이 개념 문제 풀기" 슬롯 추가 |
| `app/IpsiCoachApp.tsx` | (수정) 슬롯에 `PracticeRunner` 연결 |
| `tests/unit/*.test.mjs` | 단위 테스트 |

---

### Task 1: 단위 테스트 인프라 + 시드 난수

**Files:**
- Create: `app/practice/rng.ts`
- Create: `tests/unit/rng.test.mjs`
- Modify: `tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: `tsconfig.json`에 `allowImportingTsExtensions` 추가**

`compilerOptions` 안에 한 줄을 넣는다. `"resolveJsonModule": true,` 바로 다음 줄에 추가한다.

```json
    "allowImportingTsExtensions": true,
```

- [ ] **Step 2: `package.json`에 단위 테스트 스크립트 추가**

`scripts`에서 `test`를 아래처럼 바꾸고 `test:unit`을 추가한다. 단위 테스트는 빠르므로 빌드보다 먼저 돌려 실패를 빨리 본다.

```json
    "test": "npm run test:unit && npm run build && node --test tests/rendered-html.test.mjs",
    "test:unit": "node --experimental-strip-types --test tests/unit/",
```

- [ ] **Step 3: 실패하는 테스트 작성**

`tests/unit/rng.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createRng, hashString } from "../../app/practice/rng.ts";

test("same seed produces the same sequence", () => {
  const first = createRng(12345);
  const second = createRng(12345);
  const a = Array.from({ length: 20 }, () => first.int(0, 1000));
  const b = Array.from({ length: 20 }, () => second.int(0, 1000));
  assert.deepEqual(a, b);
});

test("different seeds diverge", () => {
  const a = Array.from({ length: 20 }, (_, i) => createRng(1).int(0, 1000) + i * 0);
  const b = Array.from({ length: 20 }, (_, i) => createRng(2).int(0, 1000) + i * 0);
  assert.notDeepEqual(a, b);
});

test("int stays within bounds", () => {
  const rng = createRng(7);
  for (let i = 0; i < 2000; i += 1) {
    const value = rng.int(-5, 5);
    assert.ok(value >= -5 && value <= 5, `out of range: ${value}`);
    assert.ok(Number.isInteger(value), `not an integer: ${value}`);
  }
});

test("nonZeroInt never returns zero", () => {
  const rng = createRng(99);
  for (let i = 0; i < 2000; i += 1) {
    assert.notEqual(rng.nonZeroInt(-3, 3), 0);
  }
});

test("shuffle preserves the multiset", () => {
  const rng = createRng(42);
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const output = rng.shuffle(input);
  assert.deepEqual([...output].sort((x, y) => x - y), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8], "shuffle must not mutate its input");
});

test("pick returns a member of the list", () => {
  const rng = createRng(3);
  const items = ["a", "b", "c"];
  for (let i = 0; i < 200; i += 1) {
    assert.ok(items.includes(rng.pick(items)));
  }
});

test("hashString is deterministic and separates inputs", () => {
  assert.equal(hashString("2026-08-06"), hashString("2026-08-06"));
  assert.notEqual(hashString("2026-08-06"), hashString("2026-08-07"));
  assert.ok(Number.isInteger(hashString("x")) && hashString("x") >= 0);
});
```

- [ ] **Step 4: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/rng.ts`

- [ ] **Step 5: `app/practice/rng.ts` 구현**

```ts
export type Rng = {
  next: () => number;
  int: (minInclusive: number, maxInclusive: number) => number;
  nonZeroInt: (minInclusive: number, maxInclusive: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
  bool: () => boolean;
};

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed: number): Rng {
  let state = (seed >>> 0) || 1;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (minInclusive: number, maxInclusive: number): number =>
    minInclusive + Math.floor(next() * (maxInclusive - minInclusive + 1));

  const nonZeroInt = (minInclusive: number, maxInclusive: number): number => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const value = int(minInclusive, maxInclusive);
      if (value !== 0) {
        return value;
      }
    }
    return maxInclusive > 0 ? maxInclusive : 1;
  };

  const pick = <T>(items: readonly T[]): T => items[int(0, items.length - 1)];

  const shuffle = <T>(items: readonly T[]): T[] => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapWith = int(0, index);
      const held = result[index];
      result[index] = result[swapWith];
      result[swapWith] = held;
    }
    return result;
  };

  return { next, int, nonZeroInt, pick, shuffle, bool: () => next() < 0.5 };
}
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — 7개 테스트 전부 통과 (`# fail 0`)

- [ ] **Step 7: 타입체크**

Run: `npx tsc --noEmit --incremental false`
Expected: 출력 없음, 종료 코드 0

- [ ] **Step 8: 커밋**

```bash
git add tsconfig.json package.json app/practice/rng.ts tests/unit/rng.test.mjs
git commit -m "feat(practice): 시드 기반 난수와 단위 테스트 인프라 추가"
```

---

### Task 2: 공용 타입과 문항 불변식 검사기

**Files:**
- Create: `app/practice/types.ts`
- Create: `app/practice/question-invariants.ts`
- Create: `tests/unit/question-invariants.test.mjs`

불변식 검사기는 두 곳에서 쓴다. 테스트에서는 모든 생성기의 출력을 검사하고, 런타임에서는 깨진 문항을 걸러 세션이 중단되지 않게 한다. 이후 모든 생성기 테스트가 이 함수를 재사용하므로 먼저 만든다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/question-invariants.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";

function validQuestion(overrides = {}) {
  return {
    skillId: "ma-linear-eq",
    seed: 1,
    level: 1,
    prompt: "3x + 4 = 19 일 때, x의 값은?",
    inputLabel: "x의 값",
    choices: [
      { value: "5", label: "5" },
      { value: "7", label: "7", mistakeTag: "sign-transpose" },
      { value: "15", label: "15", mistakeTag: "no-divide" },
      { value: "-5", label: "-5", mistakeTag: "sign-flip" },
    ],
    acceptableAnswers: ["5"],
    steps: ["양변에서 4를 빼면 3x = 15", "양변을 3으로 나누면 x = 5"],
    hints: ["일차방정식이야", "이항하면 부호가 바뀌어", "먼저 3x = 15 를 만들어 봐"],
    ...overrides,
  };
}

test("a well-formed question has no violations", () => {
  assert.deepEqual(findQuestionViolations(validQuestion()), []);
});

test("empty prompt is a violation", () => {
  assert.ok(findQuestionViolations(validQuestion({ prompt: "   " })).some((v) => v.includes("prompt")));
});

test("missing steps is a violation", () => {
  assert.ok(findQuestionViolations(validQuestion({ steps: [] })).some((v) => v.includes("steps")));
});

test("hints must be exactly three non-empty entries", () => {
  assert.ok(findQuestionViolations(validQuestion({ hints: ["a", "b"] })).some((v) => v.includes("hints")));
  assert.ok(findQuestionViolations(validQuestion({ hints: ["a", "b", " "] })).some((v) => v.includes("hints")));
});

test("duplicate choice values are a violation", () => {
  const question = validQuestion();
  question.choices[1] = { value: "5", label: "5" };
  assert.ok(findQuestionViolations(question).some((v) => v.includes("duplicate")));
});

test("exactly one choice must be correct", () => {
  const noneCorrect = validQuestion({ acceptableAnswers: ["999"] });
  assert.ok(findQuestionViolations(noneCorrect).some((v) => v.includes("exactly one")));
});

test("fewer than three choices is a violation", () => {
  const question = validQuestion();
  question.choices = question.choices.slice(0, 2);
  assert.ok(findQuestionViolations(question).some((v) => v.includes("at least 3")));
});

test("input-only questions without choices are allowed", () => {
  const question = validQuestion();
  delete question.choices;
  assert.deepEqual(findQuestionViolations(question), []);
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/question-invariants.ts`

- [ ] **Step 3: `app/practice/types.ts` 구현**

```ts
import type { Rng } from "./rng.ts";

export type Subject = "korean" | "english" | "math";

export type Level = 1 | 2 | 3;

export type Choice = {
  value: string;
  label: string;
  mistakeTag?: string;
};

export type QuestionBody = {
  prompt: string;
  inputLabel: string;
  choices?: Choice[];
  acceptableAnswers: string[];
  steps: string[];
  hints: [string, string, string];
};

export type GeneratedQuestion = QuestionBody & {
  skillId: string;
  seed: number;
  level: Level;
};

export type QuestionGenerator = (rng: Rng, level: Level) => QuestionBody;
```

`QuestionBody`에 `skillId`와 `seed`가 없는 것이 의도다. 생성기는 자기 이름과 시드를 몰라도 되고, `registry.ts`의 `generateQuestion()`이 채워 넣는다.

- [ ] **Step 4: `app/practice/question-invariants.ts` 구현**

```ts
import type { GeneratedQuestion, QuestionBody } from "./types.ts";

export function findQuestionViolations(
  question: GeneratedQuestion | QuestionBody,
): string[] {
  const violations: string[] = [];

  if (!question.prompt?.trim()) {
    violations.push("prompt is empty");
  }
  if (!question.inputLabel?.trim()) {
    violations.push("inputLabel is empty");
  }
  if (!question.acceptableAnswers?.length) {
    violations.push("acceptableAnswers is empty");
  } else if (question.acceptableAnswers.some((answer) => !answer.trim())) {
    violations.push("acceptableAnswers has a blank entry");
  }
  if (!question.steps?.length) {
    violations.push("steps is empty");
  } else if (question.steps.some((step) => !step.trim())) {
    violations.push("steps has a blank entry");
  }
  if (!Array.isArray(question.hints) || question.hints.length !== 3) {
    violations.push("hints must have exactly 3 entries");
  } else if (question.hints.some((hint) => !hint.trim())) {
    violations.push("hints has a blank entry");
  }

  const choices = question.choices;
  if (choices) {
    if (choices.length < 3) {
      violations.push("choices must have at least 3 entries");
    }
    if (choices.some((choice) => !choice.label.trim())) {
      violations.push("choices have a blank label");
    }
    const values = choices.map((choice) => choice.value);
    if (new Set(values).size !== values.length) {
      violations.push("choices have duplicate values");
    }
    const labels = choices.map((choice) => choice.label);
    if (new Set(labels).size !== labels.length) {
      violations.push("choices have duplicate labels");
    }
    const correctCount = choices.filter((choice) =>
      question.acceptableAnswers.includes(choice.value),
    ).length;
    if (correctCount !== 1) {
      violations.push(`exactly one choice must be correct, found ${correctCount}`);
    }
  }

  return violations;
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — rng 7개 + invariants 8개, `# fail 0`

- [ ] **Step 6: 커밋**

```bash
git add app/practice/types.ts app/practice/question-invariants.ts tests/unit/question-invariants.test.mjs
git commit -m "feat(practice): 문항 공용 타입과 불변식 검사기 추가"
```

---

### Task 3: 수식 포맷과 선지 구성 유틸

**Files:**
- Create: `app/practice/math-format.ts`
- Create: `app/practice/generators/choice-builder.ts`
- Create: `tests/unit/math-format.test.mjs`
- Create: `tests/unit/choice-builder.test.mjs`

다섯 개 생성기가 전부 이 두 모듈을 쓴다. 여기서 포맷을 통일해 두지 않으면 생성기마다 `x^2 + 7x + 12`와 `x²+7x+12`가 섞여 정답 비교가 깨진다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/math-format.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  formatFactor,
  formatFraction,
  formatQuadratic,
  gcd,
  reduceFraction,
} from "../../app/practice/math-format.ts";

test("gcd handles negatives and zero", () => {
  assert.equal(gcd(12, 18), 6);
  assert.equal(gcd(-12, 18), 6);
  assert.equal(gcd(7, 0), 7);
  assert.equal(gcd(0, 0), 1);
});

test("reduceFraction reduces and normalises sign to the numerator", () => {
  assert.deepEqual(reduceFraction(6, 8), { numerator: 3, denominator: 4 });
  assert.deepEqual(reduceFraction(3, -4), { numerator: -3, denominator: 4 });
  assert.deepEqual(reduceFraction(-6, -8), { numerator: 3, denominator: 4 });
  assert.deepEqual(reduceFraction(0, 5), { numerator: 0, denominator: 1 });
});

test("formatFraction hides denominator 1", () => {
  assert.equal(formatFraction({ numerator: 3, denominator: 4 }), "3/4");
  assert.equal(formatFraction({ numerator: 5, denominator: 1 }), "5");
  assert.equal(formatFraction({ numerator: -3, denominator: 4 }), "-3/4");
});

test("formatQuadratic renders readable polynomials", () => {
  assert.equal(formatQuadratic(1, 7, 12), "x^2 + 7x + 12");
  assert.equal(formatQuadratic(1, -2, -15), "x^2 - 2x - 15");
  assert.equal(formatQuadratic(2, -5, -12), "2x^2 - 5x - 12");
  assert.equal(formatQuadratic(1, 0, -9), "x^2 - 9");
  assert.equal(formatQuadratic(1, -1, 0), "x^2 - x");
  assert.equal(formatQuadratic(-1, 3, 0), "-x^2 + 3x");
  assert.equal(formatQuadratic(0, 0, 0), "0");
});

test("formatFactor renders (x + a) form", () => {
  assert.equal(formatFactor(3), "(x + 3)");
  assert.equal(formatFactor(-4), "(x - 4)");
});
```

`tests/unit/choice-builder.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createRng } from "../../app/practice/rng.ts";
import { buildChoices } from "../../app/practice/generators/choice-builder.ts";

test("builds four unique choices containing the correct answer once", () => {
  const rng = createRng(1);
  const choices = buildChoices(rng, "5", [
    { value: "7", mistakeTag: "sign-transpose" },
    { value: "15", mistakeTag: "no-divide" },
    { value: "-5", mistakeTag: "sign-flip" },
  ]);

  assert.equal(choices.length, 4);
  assert.equal(choices.filter((choice) => choice.value === "5").length, 1);
  assert.equal(new Set(choices.map((choice) => choice.value)).size, 4);
});

test("drops candidates that duplicate the correct answer", () => {
  const rng = createRng(2);
  const choices = buildChoices(rng, "5", [
    { value: "5", mistakeTag: "same-as-answer" },
    { value: "6", mistakeTag: "off-by-one" },
    { value: "7", mistakeTag: "other" },
    { value: "8", mistakeTag: "other" },
  ]);

  assert.equal(choices.length, 4);
  assert.equal(choices.filter((choice) => choice.value === "5").length, 1);
});

test("pads with numeric fallbacks when candidates run out", () => {
  const rng = createRng(3);
  const choices = buildChoices(rng, "5", [{ value: "6", mistakeTag: "off-by-one" }]);

  assert.equal(choices.length, 4);
  assert.equal(new Set(choices.map((choice) => choice.value)).size, 4);
});

test("the correct choice carries no mistakeTag", () => {
  const rng = createRng(4);
  const choices = buildChoices(rng, "5", [{ value: "6", mistakeTag: "off-by-one" }]);
  const correct = choices.find((choice) => choice.value === "5");
  assert.equal(correct.mistakeTag, undefined);
});

test("same seed yields the same order", () => {
  const candidates = [
    { value: "6", mistakeTag: "a" },
    { value: "7", mistakeTag: "b" },
    { value: "8", mistakeTag: "c" },
  ];
  const first = buildChoices(createRng(9), "5", candidates);
  const second = buildChoices(createRng(9), "5", candidates);
  assert.deepEqual(first, second);
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/math-format.ts`

- [ ] **Step 3: `app/practice/math-format.ts` 구현**

```ts
export type Fraction = { numerator: number; denominator: number };

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x === 0 ? 1 : x;
}

export function reduceFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new Error("denominator must not be zero");
  }
  if (numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
  };
}

export function formatFraction(fraction: Fraction): string {
  return fraction.denominator === 1
    ? String(fraction.numerator)
    : `${fraction.numerator}/${fraction.denominator}`;
}

export function formatQuadratic(a: number, b: number, c: number): string {
  const parts: string[] = [];

  if (a !== 0) {
    const body = Math.abs(a) === 1 ? "x^2" : `${Math.abs(a)}x^2`;
    parts.push(a < 0 ? `-${body}` : body);
  }
  if (b !== 0) {
    const body = Math.abs(b) === 1 ? "x" : `${Math.abs(b)}x`;
    if (parts.length === 0) {
      parts.push(b < 0 ? `-${body}` : body);
    } else {
      parts.push(`${b < 0 ? "-" : "+"} ${body}`);
    }
  }
  if (c !== 0) {
    if (parts.length === 0) {
      parts.push(String(c));
    } else {
      parts.push(`${c < 0 ? "-" : "+"} ${Math.abs(c)}`);
    }
  }

  return parts.length === 0 ? "0" : parts.join(" ");
}

export function formatFactor(offset: number): string {
  return offset < 0 ? `(x - ${Math.abs(offset)})` : `(x + ${offset})`;
}
```

- [ ] **Step 4: `app/practice/generators/choice-builder.ts` 구현**

```ts
import type { Rng } from "../rng.ts";
import type { Choice } from "../types.ts";

export type DistractorCandidate = {
  value: string;
  mistakeTag: string;
};

const TOTAL_CHOICES = 4;

export function buildChoices(
  rng: Rng,
  correctValue: string,
  candidates: readonly DistractorCandidate[],
): Choice[] {
  const chosen: Choice[] = [{ value: correctValue, label: correctValue }];
  const used = new Set<string>([correctValue]);

  for (const candidate of candidates) {
    if (chosen.length >= TOTAL_CHOICES) {
      break;
    }
    const value = candidate.value.trim();
    if (!value || used.has(value)) {
      continue;
    }
    used.add(value);
    chosen.push({ value, label: value, mistakeTag: candidate.mistakeTag });
  }

  const numericBase = Number(correctValue);
  let offset = 1;
  while (chosen.length < TOTAL_CHOICES && offset < 60) {
    const value = Number.isFinite(numericBase)
      ? String(numericBase + (offset % 2 === 1 ? offset : -offset))
      : `${correctValue} (${offset})`;
    offset += 1;
    if (used.has(value)) {
      continue;
    }
    used.add(value);
    chosen.push({ value, label: value, mistakeTag: "near-miss" });
  }

  return rng.shuffle(chosen);
}
```

`numericBase`가 `NaN`인 경우(예: `(x + 3)(x + 4)` 같은 문자열 정답)에도 폴백이 고유한 값을 만들도록 했다. 다만 그런 스킬은 후보를 충분히 넘겨 폴백까지 가지 않게 하는 것이 정상이며, Task 6·7의 테스트가 이를 강제한다.

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 6: 커밋**

```bash
git add app/practice/math-format.ts app/practice/generators/choice-builder.ts tests/unit/math-format.test.mjs tests/unit/choice-builder.test.mjs
git commit -m "feat(practice): 수식 포맷과 선지 구성 유틸 추가"
```

---

### Task 4: 일차방정식 생성기 (`ma-linear-eq`)

**Files:**
- Create: `app/practice/generators/math.ts`
- Create: `tests/unit/generators-math.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/generators-math.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { createRng } from "../../app/practice/rng.ts";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";
import { MATH_GENERATORS } from "../../app/practice/generators/math.ts";

const LEVELS = [1, 2, 3];

function generate(skillId, seed, level) {
  return MATH_GENERATORS[skillId](createRng(seed), level);
}

test("ma-linear-eq satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-linear-eq", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-linear-eq answer actually solves the printed equation", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-linear-eq", seed, 1);
    const match = question.prompt.match(/^(-?\d+)x ([+-]) (\d+) = (-?\d+)/);
    assert.ok(match, `unparseable prompt: ${question.prompt}`);
    const coefficient = Number(match[1]);
    const constant = match[2] === "-" ? -Number(match[3]) : Number(match[3]);
    const rightSide = Number(match[4]);
    const solution = Number(question.acceptableAnswers[0]);
    assert.equal(coefficient * solution + constant, rightSide, `seed ${seed}`);
  }
});

test("ma-linear-eq is deterministic for a given seed", () => {
  assert.deepEqual(generate("ma-linear-eq", 77, 2), generate("ma-linear-eq", 77, 2));
});

test("ma-linear-eq produces varied questions across seeds", () => {
  const prompts = new Set();
  for (let seed = 0; seed < 60; seed += 1) {
    prompts.add(generate("ma-linear-eq", seed, 1).prompt);
  }
  assert.ok(prompts.size > 40, `expected variety, got ${prompts.size} distinct prompts`);
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/generators/math.ts`

- [ ] **Step 3: `app/practice/generators/math.ts` 구현**

```ts
import type { Rng } from "../rng.ts";
import type { Level, QuestionBody, QuestionGenerator } from "../types.ts";
import { buildChoices, type DistractorCandidate } from "./choice-builder.ts";

type LevelRange = {
  coefficientMax: number;
  solutionMax: number;
  constantMax: number;
  allowNegative: boolean;
};

const LEVEL_RANGE: Record<Level, LevelRange> = {
  1: { coefficientMax: 5, solutionMax: 6, constantMax: 9, allowNegative: false },
  2: { coefficientMax: 8, solutionMax: 9, constantMax: 14, allowNegative: true },
  3: { coefficientMax: 12, solutionMax: 12, constantMax: 20, allowNegative: true },
};

function integerCandidates(
  values: ReadonlyArray<{ value: number; mistakeTag: string }>,
  exclude: number,
): DistractorCandidate[] {
  return values
    .filter((item) => Number.isInteger(item.value) && item.value !== exclude)
    .map((item) => ({ value: String(item.value), mistakeTag: item.mistakeTag }));
}

const generateLinearEquation: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const range = LEVEL_RANGE[level];
  const coefficient = rng.int(2, range.coefficientMax);
  const solution = range.allowNegative
    ? rng.nonZeroInt(-range.solutionMax, range.solutionMax)
    : rng.int(1, range.solutionMax);
  const constant = rng.nonZeroInt(-range.constantMax, range.constantMax);
  const rightSide = coefficient * solution + constant;

  const prompt = `${coefficient}x ${constant < 0 ? "-" : "+"} ${Math.abs(constant)} = ${rightSide} 일 때, x의 값은?`;

  const candidates = integerCandidates(
    [
      { value: (rightSide + constant) / coefficient, mistakeTag: "sign-transpose" },
      { value: rightSide - constant, mistakeTag: "no-divide" },
      { value: -solution, mistakeTag: "sign-flip" },
      { value: solution + 1, mistakeTag: "off-by-one" },
      { value: solution - 1, mistakeTag: "off-by-one" },
    ],
    solution,
  );

  return {
    prompt,
    inputLabel: "x의 값",
    choices: buildChoices(rng, String(solution), candidates),
    acceptableAnswers: [String(solution)],
    steps: [
      `양변에서 ${constant < 0 ? `${Math.abs(constant)}를 더하면` : `${constant}를 빼면`} ${coefficient}x = ${coefficient * solution}`,
      `양변을 ${coefficient}로 나누면 x = ${solution}`,
      `검산: ${coefficient} × ${solution} ${constant < 0 ? "-" : "+"} ${Math.abs(constant)} = ${rightSide}`,
    ],
    hints: [
      "일차방정식이야. x가 있는 항만 왼쪽에 남기면 돼.",
      `상수항 ${constant}를 반대쪽으로 넘겨. 넘어갈 때 부호가 바뀌어.`,
      `${coefficient}x = ${coefficient * solution} 까지 왔으면 양변을 ${coefficient}로 나누면 끝이야.`,
    ],
  };
};

export const MATH_GENERATORS: Record<string, QuestionGenerator> = {
  "ma-linear-eq": generateLinearEquation,
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

정답 검증 테스트가 실패하면 `prompt` 문자열 형식과 테스트의 정규식이 어긋난 것이다. 문자열을 바꾸지 말고 정규식이 기대하는 `"{a}x + {b} = {c} 일 때"` 형식을 유지하라. 이후 태스크의 테스트도 이 형식을 가정한다.

- [ ] **Step 5: 타입체크와 린트**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 경고 5개 유지(에러 0)

- [ ] **Step 6: 커밋**

```bash
git add app/practice/generators/math.ts tests/unit/generators-math.test.mjs
git commit -m "feat(practice): 일차방정식 무한 생성기 추가"
```

---

### Task 5: 다항식 전개 생성기 (`ma-poly-expand`)

**Files:**
- Modify: `app/practice/generators/math.ts`
- Modify: `tests/unit/generators-math.test.mjs`

- [ ] **Step 1: 실패하는 테스트 추가**

`tests/unit/generators-math.test.mjs` 끝에 추가한다.

```js
test("ma-poly-expand satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-poly-expand", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-poly-expand answer equals the product of the printed factors", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-poly-expand", seed, 2);
    const match = question.prompt.match(
      /^\((-?\d*)x ([+-]) (\d+)\)\((-?\d*)x ([+-]) (\d+)\)/,
    );
    assert.ok(match, `unparseable prompt: ${question.prompt}`);

    const readCoefficient = (raw) => (raw === "" ? 1 : raw === "-" ? -1 : Number(raw));
    const a = readCoefficient(match[1]);
    const b = match[2] === "-" ? -Number(match[3]) : Number(match[3]);
    const c = readCoefficient(match[4]);
    const d = match[5] === "-" ? -Number(match[6]) : Number(match[6]);

    const expected = expandToString(a * c, a * d + b * c, b * d);
    assert.equal(question.acceptableAnswers[0], expected, `seed ${seed}`);
  }
});

function expandToString(a, b, c) {
  const parts = [];
  if (a !== 0) {
    const body = Math.abs(a) === 1 ? "x^2" : `${Math.abs(a)}x^2`;
    parts.push(a < 0 ? `-${body}` : body);
  }
  if (b !== 0) {
    const body = Math.abs(b) === 1 ? "x" : `${Math.abs(b)}x`;
    parts.push(parts.length === 0 ? (b < 0 ? `-${body}` : body) : `${b < 0 ? "-" : "+"} ${body}`);
  }
  if (c !== 0) {
    parts.push(parts.length === 0 ? String(c) : `${c < 0 ? "-" : "+"} ${Math.abs(c)}`);
  }
  return parts.length === 0 ? "0" : parts.join(" ");
}
```

이 테스트의 `expandToString`은 `formatQuadratic`을 **일부러 다시 구현한 것**이다. 같은 함수를 불러 쓰면 포맷 버그를 잡지 못한다.

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `MATH_GENERATORS["ma-poly-expand"] is not a function`

- [ ] **Step 3: 생성기 구현**

`app/practice/generators/math.ts`의 import에 `formatQuadratic`을 추가한다.

```ts
import { formatQuadratic } from "../math-format.ts";
```

`MATH_GENERATORS` 선언 **위에** 아래 함수를 추가한다.

```ts
function formatBinomial(coefficient: number, constant: number): string {
  const head = coefficient === 1 ? "x" : coefficient === -1 ? "-x" : `${coefficient}x`;
  return `(${head} ${constant < 0 ? "-" : "+"} ${Math.abs(constant)})`;
}

const generatePolynomialExpansion: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const range = LEVEL_RANGE[level];
  const leadA = level === 1 ? 1 : rng.int(1, 3);
  const leadC = level === 3 ? rng.int(1, 3) : 1;
  const constantB = rng.nonZeroInt(-Math.min(range.constantMax, 9), Math.min(range.constantMax, 9));
  const constantD = rng.nonZeroInt(-Math.min(range.constantMax, 9), Math.min(range.constantMax, 9));

  const squareTerm = leadA * leadC;
  const middleTerm = leadA * constantD + constantB * leadC;
  const constantTerm = constantB * constantD;

  const answer = formatQuadratic(squareTerm, middleTerm, constantTerm);
  const prompt = `${formatBinomial(leadA, constantB)}${formatBinomial(leadC, constantD)} 를 전개하면?`;

  const candidates: DistractorCandidate[] = [
    { value: formatQuadratic(squareTerm, 0, constantTerm), mistakeTag: "missing-cross" },
    { value: formatQuadratic(squareTerm, middleTerm, -constantTerm), mistakeTag: "constant-sign" },
    { value: formatQuadratic(squareTerm, -middleTerm, constantTerm), mistakeTag: "middle-sign" },
    { value: formatQuadratic(squareTerm, constantB + constantD, constantTerm), mistakeTag: "cross-add-only" },
  ].filter((candidate) => candidate.value !== answer);

  return {
    prompt,
    inputLabel: "전개한 식",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps: [
      "앞의 각 항을 뒤의 각 항에 모두 곱한다 (분배법칙).",
      `x² 항: ${leadA} × ${leadC} = ${squareTerm}`,
      `x 항: ${leadA} × (${constantD}) + (${constantB}) × ${leadC} = ${middleTerm}`,
      `상수항: (${constantB}) × (${constantD}) = ${constantTerm}`,
      `정리하면 ${answer}`,
    ],
    hints: [
      "곱셈공식이야. 괄호 두 개를 항끼리 모두 곱해.",
      "빠뜨리기 쉬운 건 가운데 x항이야. 바깥끼리, 안쪽끼리 곱한 걸 더해야 해.",
      `x² 항은 ${squareTerm}, 상수항은 ${constantTerm}. 가운데 항만 남았어.`,
    ],
  };
};
```

`MATH_GENERATORS`에 항목을 추가한다.

```ts
export const MATH_GENERATORS: Record<string, QuestionGenerator> = {
  "ma-linear-eq": generateLinearEquation,
  "ma-poly-expand": generatePolynomialExpansion,
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 5: 커밋**

```bash
git add app/practice/generators/math.ts tests/unit/generators-math.test.mjs
git commit -m "feat(practice): 다항식 전개 생성기 추가"
```

---

### Task 6: 인수분해 생성기 (`ma-factor`) + 교차 검증

**Files:**
- Modify: `app/practice/generators/math.ts`
- Modify: `tests/unit/generators-math.test.mjs`

인수분해는 답이 문자열이라 오타나 정렬 불일치가 생기기 쉽다. 전개해서 원식과 맞는지 독립적으로 검산하는 테스트를 반드시 넣는다.

- [ ] **Step 1: 실패하는 테스트 추가**

```js
test("ma-factor satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-factor", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-factor answer expands back to the printed polynomial", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-factor", seed, 2);

    const promptMatch = question.prompt.match(/^x\^2 ([+-]) (\d*)x ([+-]) (\d+)/);
    assert.ok(promptMatch, `unparseable prompt: ${question.prompt}`);
    const middleMagnitude = promptMatch[2] === "" ? 1 : Number(promptMatch[2]);
    const middle = promptMatch[1] === "-" ? -middleMagnitude : middleMagnitude;
    const constant = promptMatch[3] === "-" ? -Number(promptMatch[4]) : Number(promptMatch[4]);

    const answerMatch = question.acceptableAnswers[0].match(
      /^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/,
    );
    assert.ok(answerMatch, `unparseable answer: ${question.acceptableAnswers[0]}`);
    const rootA = answerMatch[1] === "-" ? -Number(answerMatch[2]) : Number(answerMatch[2]);
    const rootB = answerMatch[3] === "-" ? -Number(answerMatch[4]) : Number(answerMatch[4]);

    assert.equal(rootA + rootB, middle, `seed ${seed}: middle term mismatch`);
    assert.equal(rootA * rootB, constant, `seed ${seed}: constant term mismatch`);
  }
});

test("ma-factor orders the two factors consistently", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const answer = generate("ma-factor", seed, 2).acceptableAnswers[0];
    const match = answer.match(/^\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/);
    const first = match[1] === "-" ? -Number(match[2]) : Number(match[2]);
    const second = match[3] === "-" ? -Number(match[4]) : Number(match[4]);
    assert.ok(first <= second, `factors not sorted for seed ${seed}: ${answer}`);
  }
});
```

프롬프트 정규식이 `x^2 ± bx ± c`만 받으므로, 생성기는 **중간항과 상수항이 모두 0이 아닌** 문제만 내야 한다.

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `MATH_GENERATORS["ma-factor"] is not a function`

- [ ] **Step 3: 생성기 구현**

`app/practice/generators/math.ts`의 `math-format.ts` import에 `formatFactor`를 추가한다.

```ts
import { formatFactor, formatQuadratic } from "../math-format.ts";
```

생성기를 추가한다.

```ts
function pickFactorRoots(rng: Rng, bound: number): [number, number] {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const first = rng.nonZeroInt(-bound, bound);
    const second = rng.nonZeroInt(-bound, bound);
    if (first + second !== 0) {
      return first <= second ? [first, second] : [second, first];
    }
  }
  return [1, 2];
}

const generateFactoring: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const bound = level === 1 ? 5 : level === 2 ? 8 : 11;
  const [rootA, rootB] = pickFactorRoots(rng, bound);

  const middleTerm = rootA + rootB;
  const constantTerm = rootA * rootB;
  const answer = `${formatFactor(rootA)}${formatFactor(rootB)}`;
  const prompt = `${formatQuadratic(1, middleTerm, constantTerm)} 를 인수분해하면?`;

  const candidates: DistractorCandidate[] = [
    { value: `${formatFactor(-rootA)}${formatFactor(-rootB)}`, mistakeTag: "both-signs" },
    { value: `${formatFactor(rootA)}${formatFactor(-rootB)}`, mistakeTag: "one-sign" },
    { value: `${formatFactor(-rootA)}${formatFactor(rootB)}`, mistakeTag: "one-sign" },
    { value: `${formatFactor(rootA + 1)}${formatFactor(rootB - 1)}`, mistakeTag: "sum-only" },
    { value: `${formatFactor(rootA - 1)}${formatFactor(rootB + 1)}`, mistakeTag: "sum-only" },
  ].filter((candidate) => candidate.value !== answer);

  return {
    prompt,
    inputLabel: "인수분해한 식",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps: [
      `곱해서 ${constantTerm}, 더해서 ${middleTerm}이 되는 두 수를 찾는다.`,
      `그 두 수는 ${rootA} 와 ${rootB} 이다.`,
      `따라서 ${answer}`,
      `검산: 전개하면 ${formatQuadratic(1, middleTerm, constantTerm)}`,
    ],
    hints: [
      "x²+(a+b)x+ab = (x+a)(x+b) 꼴이야.",
      `곱해서 ${constantTerm}이 되는 두 정수 짝을 모두 적어 봐.`,
      `그중 더해서 ${middleTerm}이 되는 짝이 답이야.`,
    ],
  };
};
```

`MATH_GENERATORS`에 `"ma-factor": generateFactoring,`를 추가한다.

`pickFactorRoots`가 `first + second !== 0`을 요구하는 이유는 합이 0이면 중간항이 사라져 `x^2 - 9` 형태가 되고, 테스트 정규식이 요구하는 `x^2 ± bx ± c` 형식이 깨지기 때문이다. 합차공식은 Part 2에서 별도 스킬로 다룬다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 5: 커밋**

```bash
git add app/practice/generators/math.ts tests/unit/generators-math.test.mjs
git commit -m "feat(practice): 인수분해 생성기와 전개 교차검증 추가"
```

---

### Task 7: 이차방정식 생성기 (`ma-quad-eq`)

**Files:**
- Modify: `app/practice/generators/math.ts`
- Modify: `tests/unit/generators-math.test.mjs`

- [ ] **Step 1: 실패하는 테스트 추가**

```js
test("ma-quad-eq satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-quad-eq", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-quad-eq roots satisfy the printed equation", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-quad-eq", seed, 2);

    const promptMatch = question.prompt.match(/^x\^2 ([+-]) (\d*)x ([+-]) (\d+) = 0/);
    assert.ok(promptMatch, `unparseable prompt: ${question.prompt}`);
    const bMagnitude = promptMatch[2] === "" ? 1 : Number(promptMatch[2]);
    const b = promptMatch[1] === "-" ? -bMagnitude : bMagnitude;
    const c = promptMatch[3] === "-" ? -Number(promptMatch[4]) : Number(promptMatch[4]);

    const rootMatches = [...question.acceptableAnswers[0].matchAll(/x = (-?\d+)/g)];
    assert.equal(rootMatches.length, 2, `expected two roots: ${question.acceptableAnswers[0]}`);

    for (const rootMatch of rootMatches) {
      const root = Number(rootMatch[1]);
      assert.equal(root * root + b * root + c, 0, `seed ${seed}: ${root} is not a root`);
    }
  }
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `MATH_GENERATORS["ma-quad-eq"] is not a function`

- [ ] **Step 3: 생성기 구현**

```ts
function formatRoots(rootA: number, rootB: number): string {
  return rootA === rootB ? `x = ${rootA}` : `x = ${rootA} 또는 x = ${rootB}`;
}

const generateQuadraticEquation: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const bound = level === 1 ? 5 : level === 2 ? 8 : 11;
  const [rootA, rootB] = pickFactorRoots(rng, bound);

  const middleTerm = -(rootA + rootB);
  const constantTerm = rootA * rootB;
  const answer = formatRoots(rootA, rootB);
  const prompt = `${formatQuadratic(1, middleTerm, constantTerm)} = 0 의 해는?`;

  const candidates: DistractorCandidate[] = [
    { value: formatRoots(-rootA, -rootB), mistakeTag: "root-sign" },
    { value: formatRoots(rootA, -rootB), mistakeTag: "one-root-sign" },
    { value: formatRoots(-rootA, rootB), mistakeTag: "one-root-sign" },
    { value: formatRoots(rootA + 1, rootB), mistakeTag: "factor-pair" },
    { value: formatRoots(rootA, rootB + 1), mistakeTag: "factor-pair" },
  ].filter((candidate) => candidate.value !== answer);

  return {
    prompt,
    inputLabel: "x의 값",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps: [
      `좌변을 인수분해하면 ${formatFactor(-rootA)}${formatFactor(-rootB)} = 0`,
      "AB = 0 이면 A = 0 또는 B = 0 이다.",
      `따라서 ${answer}`,
    ],
    hints: [
      "우변이 0이니까 좌변을 인수분해부터 해 봐.",
      `곱해서 ${constantTerm}, 더해서 ${middleTerm}이 되는 두 수를 찾아.`,
      "인수분해했으면 각 괄호를 0으로 놓으면 돼. 부호가 반대로 나오는 것에 주의해.",
    ],
  };
};
```

`MATH_GENERATORS`에 `"ma-quad-eq": generateQuadraticEquation,`를 추가한다.

부호에 주의하라. 근이 `rootA`, `rootB`이면 방정식은 `x² − (rootA+rootB)x + rootA·rootB = 0` 이고, 인수는 `(x − rootA)(x − rootB)` 다. 그래서 `formatFactor`에는 `-rootA`를 넘긴다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 5: 커밋**

```bash
git add app/practice/generators/math.ts tests/unit/generators-math.test.mjs
git commit -m "feat(practice): 이차방정식 생성기 추가"
```

---

### Task 8: 분수 사칙연산 생성기 (`ma-frac-arith`)

**Files:**
- Modify: `app/practice/generators/math.ts`
- Modify: `tests/unit/generators-math.test.mjs`

- [ ] **Step 1: 실패하는 테스트 추가**

```js
test("ma-frac-arith satisfies question invariants across many seeds", () => {
  for (const level of LEVELS) {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generate("ma-frac-arith", seed, level);
      const violations = findQuestionViolations(question);
      assert.deepEqual(violations, [], `seed ${seed} level ${level}: ${violations.join(", ")}`);
    }
  }
});

test("ma-frac-arith answer matches an independent exact computation", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const question = generate("ma-frac-arith", seed, 2);
    const match = question.prompt.match(/^(\d+)\/(\d+) ([+\-×÷]) (\d+)\/(\d+)/);
    assert.ok(match, `unparseable prompt: ${question.prompt}`);

    const a = Number(match[1]);
    const b = Number(match[2]);
    const operator = match[3];
    const c = Number(match[4]);
    const d = Number(match[5]);

    let numerator;
    let denominator;
    if (operator === "+") {
      numerator = a * d + c * b;
      denominator = b * d;
    } else if (operator === "-") {
      numerator = a * d - c * b;
      denominator = b * d;
    } else if (operator === "×") {
      numerator = a * c;
      denominator = b * d;
    } else {
      numerator = a * d;
      denominator = b * c;
    }

    const divide = (x, y) => {
      let p = Math.abs(x);
      let q = Math.abs(y);
      while (q !== 0) {
        const r = p % q;
        p = q;
        q = r;
      }
      return p === 0 ? 1 : p;
    };

    const sign = denominator < 0 ? -1 : 1;
    const common = divide(numerator, denominator);
    const reducedNumerator = numerator === 0 ? 0 : (sign * numerator) / common;
    const reducedDenominator = numerator === 0 ? 1 : (sign * denominator) / common;
    const expected =
      reducedDenominator === 1 ? String(reducedNumerator) : `${reducedNumerator}/${reducedDenominator}`;

    assert.equal(question.acceptableAnswers[0], expected, `seed ${seed}: ${question.prompt}`);
  }
});

test("ma-frac-arith level 1 uses only addition and subtraction", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const question = generate("ma-frac-arith", seed, 1);
    assert.ok(/[+\-]/.test(question.prompt), question.prompt);
    assert.ok(!/[×÷]/.test(question.prompt), `level 1 must not use × or ÷: ${question.prompt}`);
  }
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `MATH_GENERATORS["ma-frac-arith"] is not a function`

- [ ] **Step 3: 생성기 구현**

`math-format.ts` import를 확장한다.

```ts
import { formatFactor, formatFraction, formatQuadratic, reduceFraction } from "../math-format.ts";
```

생성기를 추가한다.

```ts
const generateFractionArithmetic: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const denominatorMax = level === 1 ? 8 : level === 2 ? 11 : 14;
  const operators = level === 1 ? ["+", "-"] : ["+", "-", "×", "÷"];
  const operator = rng.pick(operators);

  const denominatorB = rng.int(2, denominatorMax);
  const denominatorD = rng.int(2, denominatorMax);
  const numeratorA = rng.int(1, denominatorB * 2);
  const numeratorC = rng.int(1, denominatorD * 2);

  let rawNumerator: number;
  let rawDenominator: number;
  if (operator === "+") {
    rawNumerator = numeratorA * denominatorD + numeratorC * denominatorB;
    rawDenominator = denominatorB * denominatorD;
  } else if (operator === "-") {
    rawNumerator = numeratorA * denominatorD - numeratorC * denominatorB;
    rawDenominator = denominatorB * denominatorD;
  } else if (operator === "×") {
    rawNumerator = numeratorA * numeratorC;
    rawDenominator = denominatorB * denominatorD;
  } else {
    rawNumerator = numeratorA * denominatorD;
    rawDenominator = denominatorB * numeratorC;
  }

  const result = reduceFraction(rawNumerator, rawDenominator);
  const answer = formatFraction(result);
  const prompt = `${numeratorA}/${denominatorB} ${operator} ${numeratorC}/${denominatorD} 를 계산하면? (기약분수로)`;

  const naive =
    operator === "+"
      ? formatFraction(reduceFraction(numeratorA + numeratorC, denominatorB + denominatorD))
      : operator === "-"
        ? formatFraction(reduceFraction(numeratorA - numeratorC, denominatorB - denominatorD || 1))
        : formatFraction(reduceFraction(rawDenominator, rawNumerator || 1));

  const candidates: DistractorCandidate[] = [
    { value: naive, mistakeTag: "denominator-shortcut" },
    { value: formatFraction(reduceFraction(-result.numerator, result.denominator)), mistakeTag: "sign" },
    { value: formatFraction({ numerator: rawNumerator, denominator: rawDenominator === 0 ? 1 : rawDenominator }), mistakeTag: "not-reduced" },
    { value: formatFraction(reduceFraction(result.numerator + 1, result.denominator)), mistakeTag: "off-by-one" },
    { value: formatFraction(reduceFraction(result.numerator, result.denominator + 1)), mistakeTag: "off-by-one" },
  ].filter((candidate) => candidate.value !== answer);

  const steps =
    operator === "+" || operator === "-"
      ? [
          `분모를 ${denominatorB} 와 ${denominatorD} 의 공통분모 ${denominatorB * denominatorD} 로 맞춘다.`,
          `${numeratorA * denominatorD}/${denominatorB * denominatorD} ${operator} ${numeratorC * denominatorB}/${denominatorB * denominatorD}`,
          `분자끼리 계산하면 ${rawNumerator}/${rawDenominator}`,
          `약분하면 ${answer}`,
        ]
      : operator === "×"
        ? [
            "분자는 분자끼리, 분모는 분모끼리 곱한다.",
            `${numeratorA * numeratorC}/${denominatorB * denominatorD}`,
            `약분하면 ${answer}`,
          ]
        : [
            "나눗셈은 뒤 분수를 뒤집어 곱한다.",
            `${numeratorA}/${denominatorB} × ${denominatorD}/${numeratorC} = ${rawNumerator}/${rawDenominator}`,
            `약분하면 ${answer}`,
          ];

  const hints: [string, string, string] =
    operator === "+" || operator === "-"
      ? [
          "분모가 다르면 바로 더하거나 뺄 수 없어.",
          `공통분모 ${denominatorB * denominatorD} 로 통분부터 해.`,
          "통분했으면 분자끼리만 계산하고, 마지막에 약분하는 걸 잊지 마.",
        ]
      : operator === "×"
        ? [
            "곱셈은 통분이 필요 없어.",
            "분자는 분자끼리, 분모는 분모끼리 곱해.",
            "곱한 뒤 약분하면 끝이야.",
          ]
        : [
            "나눗셈은 곱셈으로 바꿔서 풀어.",
            `뒤에 있는 ${numeratorC}/${denominatorD} 를 뒤집으면 ${denominatorD}/${numeratorC} 야.`,
            "뒤집어 곱한 다음 약분하면 끝이야.",
          ];

  return {
    prompt,
    inputLabel: "계산 결과",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps,
    hints,
  };
};
```

`MATH_GENERATORS`에 `"ma-frac-arith": generateFractionArithmetic,`를 추가한다.

`reduceFraction`은 분모 0에서 예외를 던지므로, 위 코드는 `|| 1`과 `=== 0 ? 1 :` 로 0이 들어갈 수 있는 자리를 모두 막았다. 오답 후보는 정확할 필요가 없고 **유효한 문자열이기만 하면 된다** — 어차피 오답이다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 5: 타입체크와 린트**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

- [ ] **Step 6: 커밋**

```bash
git add app/practice/generators/math.ts tests/unit/generators-math.test.mjs
git commit -m "feat(practice): 분수 사칙연산 생성기 추가"
```

---

### Task 9: 생성기 레지스트리와 개념 연결표

**Files:**
- Create: `app/practice/generators/registry.ts`
- Create: `app/practice/skill-map.ts`
- Create: `tests/unit/registry.test.mjs`
- Create: `tests/unit/skill-map.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/registry.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";
import { generateQuestion, listSkillIds } from "../../app/practice/generators/registry.ts";

test("every registered skill generates valid questions at every level", () => {
  for (const skillId of listSkillIds()) {
    for (const level of [1, 2, 3]) {
      for (let seed = 0; seed < 50; seed += 1) {
        const question = generateQuestion(skillId, seed, level);
        const violations = findQuestionViolations(question);
        assert.deepEqual(violations, [], `${skillId} seed ${seed} level ${level}: ${violations.join(", ")}`);
      }
    }
  }
});

test("generateQuestion stamps skillId, seed and level onto the result", () => {
  const question = generateQuestion("ma-linear-eq", 123, 2);
  assert.equal(question.skillId, "ma-linear-eq");
  assert.equal(question.seed, 123);
  assert.equal(question.level, 2);
});

test("the same skillId, seed and level always reproduce the same question", () => {
  for (const skillId of listSkillIds()) {
    assert.deepEqual(generateQuestion(skillId, 55, 1), generateQuestion(skillId, 55, 1));
  }
});

test("different seeds reproduce different questions", () => {
  const prompts = new Set();
  for (let seed = 0; seed < 40; seed += 1) {
    prompts.add(generateQuestion("ma-factor", seed, 2).prompt);
  }
  assert.ok(prompts.size > 25, `expected variety, got ${prompts.size}`);
});

test("an unknown skillId throws a named error", () => {
  assert.throws(() => generateQuestion("no-such-skill", 1, 1), /no-such-skill/);
});

test("all five planned math skills are registered", () => {
  assert.deepEqual(
    [...listSkillIds()].sort(),
    ["ma-factor", "ma-frac-arith", "ma-linear-eq", "ma-poly-expand", "ma-quad-eq"],
  );
});
```

`tests/unit/skill-map.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { listSkillIds } from "../../app/practice/generators/registry.ts";
import { SKILL_MAP, getSkillsForConcept } from "../../app/practice/skill-map.ts";

test("every registered generator has a skill-map entry", () => {
  for (const skillId of listSkillIds()) {
    assert.ok(SKILL_MAP[skillId], `missing skill-map entry for ${skillId}`);
  }
});

test("skill-map entries reference core notes that actually exist", async () => {
  const source = await readFile(new URL("../../app/study-content.ts", import.meta.url), "utf8");
  for (const entry of Object.values(SKILL_MAP)) {
    if (!entry.coreNoteId) continue;
    assert.ok(source.includes(`id: "${entry.coreNoteId}"`), `unknown core note: ${entry.coreNoteId}`);
  }
});

test("skill-map entries reference foundation capsules that actually exist", async () => {
  const source = await readFile(new URL("../../app/foundation-reference.ts", import.meta.url), "utf8");
  for (const entry of Object.values(SKILL_MAP)) {
    if (!entry.foundationId) continue;
    assert.ok(source.includes(`id: "${entry.foundationId}"`), `unknown capsule: ${entry.foundationId}`);
  }
});

test("skill-map entries reference math concepts that actually exist", async () => {
  const source = await readFile(new URL("../../app/math-curriculum.ts", import.meta.url), "utf8");
  for (const entry of Object.values(SKILL_MAP)) {
    if (!entry.conceptId) continue;
    assert.ok(source.includes(`id: "${entry.conceptId}"`), `unknown concept: ${entry.conceptId}`);
  }
});

test("getSkillsForConcept finds skills attached to a curriculum concept", () => {
  assert.deepEqual(getSkillsForConcept("linear-equations"), ["ma-linear-eq"]);
  assert.deepEqual(getSkillsForConcept("no-such-concept"), []);
});

test("every entry declares a label and a target seconds budget", () => {
  for (const [skillId, entry] of Object.entries(SKILL_MAP)) {
    assert.ok(entry.label.trim(), `${skillId} has no label`);
    assert.ok(entry.targetSeconds > 0, `${skillId} has no targetSeconds`);
  }
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/generators/registry.ts`

- [ ] **Step 3: `app/practice/generators/registry.ts` 구현**

```ts
import { createRng } from "../rng.ts";
import type { GeneratedQuestion, Level, QuestionGenerator } from "../types.ts";
import { MATH_GENERATORS } from "./math.ts";

const GENERATORS: Record<string, QuestionGenerator> = {
  ...MATH_GENERATORS,
};

export function listSkillIds(): string[] {
  return Object.keys(GENERATORS);
}

export function hasSkill(skillId: string): boolean {
  return Object.prototype.hasOwnProperty.call(GENERATORS, skillId);
}

export function generateQuestion(
  skillId: string,
  seed: number,
  level: Level,
): GeneratedQuestion {
  const generator = GENERATORS[skillId];
  if (!generator) {
    throw new Error(`unknown skillId: ${skillId}`);
  }

  const body = generator(createRng(seed), level);
  return { ...body, skillId, seed, level };
}
```

- [ ] **Step 4: `app/practice/skill-map.ts` 구현**

아래 id들은 `study-content.ts`, `foundation-reference.ts`, `math-curriculum.ts`에 실제로 존재하는 값이다. 임의로 바꾸지 말 것 — Step 1의 테스트가 실제 파일과 대조한다.

```ts
import type { Subject } from "./types.ts";

export type SkillMapEntry = {
  skillId: string;
  subject: Subject;
  label: string;
  targetSeconds: number;
  coreNoteId?: string;
  foundationId?: string;
  conceptId?: string;
};

export const SKILL_MAP: Record<string, SkillMapEntry> = {
  "ma-frac-arith": {
    skillId: "ma-frac-arith",
    subject: "math",
    label: "분수 사칙연산",
    targetSeconds: 60,
    coreNoteId: "ma-number",
    foundationId: "ma-number-arithmetic",
    conceptId: "fraction-ratio-percent",
  },
  "ma-linear-eq": {
    skillId: "ma-linear-eq",
    subject: "math",
    label: "일차방정식",
    targetSeconds: 50,
    coreNoteId: "ma-linear",
    foundationId: "ma-equations",
    conceptId: "linear-equations",
  },
  "ma-poly-expand": {
    skillId: "ma-poly-expand",
    subject: "math",
    label: "다항식 전개",
    targetSeconds: 60,
    coreNoteId: "ma-identity",
    foundationId: "ma-identities-factoring",
    conceptId: "polynomial-expansion-factorization",
  },
  "ma-factor": {
    skillId: "ma-factor",
    subject: "math",
    label: "인수분해",
    targetSeconds: 70,
    coreNoteId: "ma-factor",
    foundationId: "ma-identities-factoring",
    conceptId: "polynomial-expansion-factorization",
  },
  "ma-quad-eq": {
    skillId: "ma-quad-eq",
    subject: "math",
    label: "이차방정식",
    targetSeconds: 80,
    coreNoteId: "ma-quadratic-equation",
    foundationId: "ma-equations",
    conceptId: "equation-inequality-bridge",
  },
};

export function getSkillsForConcept(conceptId: string): string[] {
  return Object.values(SKILL_MAP)
    .filter((entry) => entry.conceptId === conceptId)
    .map((entry) => entry.skillId);
}

export function getSkillEntry(skillId: string): SkillMapEntry | null {
  return SKILL_MAP[skillId] ?? null;
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

`getSkillsForConcept("linear-equations")` 테스트가 실패하면 `conceptId` 값이 `math-curriculum.ts`의 실제 개념 id와 다른 것이다. 실제 파일을 열어 확인하라.

- [ ] **Step 6: 커밋**

```bash
git add app/practice/generators/registry.ts app/practice/skill-map.ts tests/unit/registry.test.mjs tests/unit/skill-map.test.mjs
git commit -m "feat(practice): 생성기 레지스트리와 개념 연결표 추가"
```

---

### Task 10: 채점과 힌트 규칙

**Files:**
- Create: `app/practice/grading.ts`
- Create: `tests/unit/grading.test.mjs`

UI에 로직을 넣으면 테스트할 수 없다. 정답 판정과 힌트 노출 규칙을 순수 함수로 분리한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/grading.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { generateQuestion } from "../../app/practice/generators/registry.ts";
import { gradeAnswer, mapOutcomeToRating, normaliseAnswer } from "../../app/practice/grading.ts";

test("normaliseAnswer trims and collapses whitespace", () => {
  assert.equal(normaliseAnswer("  5  "), "5");
  assert.equal(normaliseAnswer("(x + 3)(x + 4)"), "(x+3)(x+4)");
  assert.equal(normaliseAnswer("x  =  2 또는  x = 3"), "x=2또는x=3");
});

test("gradeAnswer accepts the correct answer regardless of spacing", () => {
  const question = generateQuestion("ma-factor", 5, 2);
  const spaced = question.acceptableAnswers[0].replace(/\(/g, " ( ");
  assert.equal(gradeAnswer(question, spaced).isCorrect, true);
});

test("gradeAnswer reports the mistakeTag of the chosen wrong option", () => {
  const question = generateQuestion("ma-linear-eq", 11, 1);
  const wrong = question.choices.find((choice) => choice.mistakeTag);
  const result = gradeAnswer(question, wrong.value);
  assert.equal(result.isCorrect, false);
  assert.equal(result.mistakeTag, wrong.mistakeTag);
});

test("gradeAnswer returns a null mistakeTag for unrecognised input", () => {
  const question = generateQuestion("ma-linear-eq", 11, 1);
  const result = gradeAnswer(question, "완전히 엉뚱한 답");
  assert.equal(result.isCorrect, false);
  assert.equal(result.mistakeTag, null);
});

test("an empty submission is never correct", () => {
  const question = generateQuestion("ma-linear-eq", 11, 1);
  assert.equal(gradeAnswer(question, "   ").isCorrect, false);
});

test("mapOutcomeToRating follows the spec table", () => {
  assert.equal(mapOutcomeToRating({ isCorrect: false, hintsUsed: 0, elapsedSeconds: 5, targetSeconds: 50 }), "again");
  assert.equal(mapOutcomeToRating({ isCorrect: true, hintsUsed: 2, elapsedSeconds: 5, targetSeconds: 50 }), "hard");
  assert.equal(mapOutcomeToRating({ isCorrect: true, hintsUsed: 0, elapsedSeconds: 20, targetSeconds: 50 }), "easy");
  assert.equal(mapOutcomeToRating({ isCorrect: true, hintsUsed: 0, elapsedSeconds: 45, targetSeconds: 50 }), "good");
});

test("mapOutcomeToRating treats a wrong answer as again even when fast", () => {
  assert.equal(mapOutcomeToRating({ isCorrect: false, hintsUsed: 0, elapsedSeconds: 1, targetSeconds: 50 }), "again");
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/grading.ts`

- [ ] **Step 3: `app/practice/grading.ts` 구현**

```ts
import type { GeneratedQuestion } from "./types.ts";

export type Rating = "again" | "hard" | "good" | "easy";

export type GradeResult = {
  isCorrect: boolean;
  mistakeTag: string | null;
};

export type Outcome = {
  isCorrect: boolean;
  hintsUsed: number;
  elapsedSeconds: number;
  targetSeconds: number;
};

const FAST_RATIO = 0.6;

export function normaliseAnswer(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

export function gradeAnswer(
  question: GeneratedQuestion,
  submitted: string,
): GradeResult {
  const normalised = normaliseAnswer(submitted);
  if (!normalised) {
    return { isCorrect: false, mistakeTag: null };
  }

  const isCorrect = question.acceptableAnswers.some(
    (answer) => normaliseAnswer(answer) === normalised,
  );
  if (isCorrect) {
    return { isCorrect: true, mistakeTag: null };
  }

  const matched = question.choices?.find(
    (choice) => normaliseAnswer(choice.value) === normalised,
  );
  return { isCorrect: false, mistakeTag: matched?.mistakeTag ?? null };
}

export function mapOutcomeToRating(outcome: Outcome): Rating {
  if (!outcome.isCorrect) {
    return "again";
  }
  if (outcome.hintsUsed > 0) {
    return "hard";
  }
  return outcome.elapsedSeconds <= outcome.targetSeconds * FAST_RATIO ? "easy" : "good";
}
```

`mapOutcomeToRating`은 Part 1에서는 아직 쓰이지 않는다. Part 3의 복습 큐가 이 함수를 소비한다. 지금 만들어 두는 이유는 채점 규칙이 스펙에 확정돼 있고, 순수 함수라 지금 테스트해 두면 나중에 UI와 얽히지 않기 때문이다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 5: 커밋**

```bash
git add app/practice/grading.ts tests/unit/grading.test.mjs
git commit -m "feat(practice): 정답 판정과 평가 환산 규칙 추가"
```

---

### Task 11: 개념·요점 시트 컴포넌트

**Files:**
- Create: `app/practice/concept-source.ts`
- Create: `app/practice/ConceptSheet.tsx`
- Create: `tests/unit/concept-source.test.mjs`
- Modify: `app/visual-refresh.css`

`.tsx` 파일은 Node 테스트에서 import할 수 없으므로(JSX 미지원) 확장자를 붙이지 않는다. `.ts` 모듈만 `.ts` 확장자로 import한다.

`ConceptSheet`는 skillId를 받아 기존 요점 카드와 기초 캡슐에서 내용을 끌어와 보여준다. 데이터를 고르는 부분은 순수 함수로 분리해 테스트한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/concept-source.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { listSkillIds } from "../../app/practice/generators/registry.ts";
import { resolveConceptSource } from "../../app/practice/concept-source.ts";

test("every registered skill resolves to a concept source", () => {
  for (const skillId of listSkillIds()) {
    const source = resolveConceptSource(skillId);
    assert.ok(source, `no concept source for ${skillId}`);
    assert.ok(source.title.trim(), `${skillId} has no title`);
    assert.ok(source.keyPoints.length > 0, `${skillId} has no key points`);
  }
});

test("resolveConceptSource returns null for an unknown skill", () => {
  assert.equal(resolveConceptSource("no-such-skill"), null);
});

test("the linear equation skill surfaces its formula from the core note", () => {
  const source = resolveConceptSource("ma-linear-eq");
  assert.equal(source.title, "일차방정식");
  assert.ok(source.formula?.includes("ax+b=c"));
  assert.ok(source.mistake.trim());
});

test("key points come from the core note essentials", () => {
  const source = resolveConceptSource("ma-factor");
  assert.ok(source.keyPoints.includes("공통인수 묶기"));
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/concept-source.ts`

- [ ] **Step 3: `app/practice/concept-source.ts` 구현**

```ts
import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { CORE_NOTES } from "../study-content.ts";
import { getSkillEntry } from "./skill-map.ts";

export type ConceptSource = {
  skillId: string;
  title: string;
  oneLine: string;
  keyPoints: string[];
  formula?: string;
  mistake: string;
  workedExample?: {
    prompt: string;
    process: string;
    result: string;
  };
};

export function resolveConceptSource(skillId: string): ConceptSource | null {
  const entry = getSkillEntry(skillId);
  if (!entry) {
    return null;
  }

  const note = entry.coreNoteId
    ? CORE_NOTES.find((item) => item.id === entry.coreNoteId)
    : undefined;
  const capsule = entry.foundationId
    ? FOUNDATION_REFERENCE.find((item) => item.id === entry.foundationId)
    : undefined;

  const keyPoints = note?.essentials ?? capsule?.keyPoints ?? [];
  if (!note && !capsule) {
    return null;
  }

  return {
    skillId,
    title: note?.title ?? capsule?.title ?? entry.label,
    oneLine: note?.oneLine ?? capsule?.beginnerExplanation ?? "",
    keyPoints: [...keyPoints],
    formula: note?.formula ?? capsule?.frame,
    mistake: note?.mistake ?? capsule?.commonTrap ?? "",
    workedExample: capsule?.workedExample,
  };
}
```

기존 `foundation-reference.ts`와 `study-content.ts`는 확장자 없이 import되는 파일이지만, 이 모듈은 Node 테스트에서 불러야 하므로 `.ts`를 붙였다. Task 1에서 켠 `allowImportingTsExtensions` 덕분에 빌드도 통과한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

`ma-factor`의 key point 테스트가 실패하면 `study-content.ts`의 `ma-factor` 노트 `essentials` 첫 항목이 바뀐 것이다. 실제 값으로 테스트를 맞춰라.

- [ ] **Step 5: `app/practice/ConceptSheet.tsx` 구현**

```tsx
"use client";

import { resolveConceptSource } from "./concept-source.ts";

export type ConceptSheetProps = {
  skillId: string;
  open: boolean;
  onClose: () => void;
};

export default function ConceptSheet({ skillId, open, onClose }: ConceptSheetProps) {
  const source = resolveConceptSource(skillId);
  if (!open || !source) {
    return null;
  }

  return (
    <div
      className="concept-sheet"
      role="dialog"
      aria-modal="false"
      aria-label={`${source.title} 개념 요약`}
    >
      <div className="concept-sheet-head">
        <div>
          <p className="concept-sheet-eyebrow">지금 푸는 개념</p>
          <h3>{source.title}</h3>
        </div>
        <button type="button" onClick={onClose} className="concept-sheet-close">
          닫기
        </button>
      </div>

      <p className="concept-sheet-oneline">{source.oneLine}</p>

      {source.formula ? <p className="concept-sheet-formula">{source.formula}</p> : null}

      <ul className="concept-sheet-points">
        {source.keyPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      {source.workedExample ? (
        <div className="concept-sheet-example">
          <strong>{source.workedExample.prompt}</strong>
          <p>{source.workedExample.process}</p>
          <span>{source.workedExample.result}</span>
        </div>
      ) : null}

      <p className="concept-sheet-mistake">자주 하는 실수 · {source.mistake}</p>
    </div>
  );
}
```

- [ ] **Step 6: 스타일 추가**

`app/visual-refresh.css` 끝에 추가한다.

```css
.concept-sheet {
  display: grid;
  gap: 10px;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.concept-sheet-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.concept-sheet-head h3 {
  margin: 0;
  font-size: 18px;
}

.concept-sheet-eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--math);
}

.concept-sheet-close {
  min-height: 44px;
  min-width: 44px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
}

.concept-sheet-oneline {
  margin: 0;
  line-height: 1.6;
}

.concept-sheet-formula {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--accent);
  font-weight: 700;
}

.concept-sheet-points {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
}

.concept-sheet-example {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed var(--line);
}

.concept-sheet-example p,
.concept-sheet-example span {
  margin: 0;
  line-height: 1.6;
}

.concept-sheet-mistake {
  margin: 0;
  font-size: 14px;
  color: var(--math-title);
}

@media (max-width: 390px) {
  .concept-sheet {
    padding: 14px;
  }
}
```

- [ ] **Step 7: 타입체크와 린트**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

- [ ] **Step 8: 커밋**

```bash
git add app/practice/concept-source.ts app/practice/ConceptSheet.tsx app/visual-refresh.css tests/unit/concept-source.test.mjs
git commit -m "feat(practice): 문제 옆에서 여는 개념·요점 시트 추가"
```

---

### Task 12: 문제 풀이 UI

**Files:**
- Create: `app/practice/safe-generate.ts`
- Create: `tests/unit/safe-generate.test.mjs`
- Create: `app/practice/PracticeRunner.tsx`
- Modify: `app/visual-refresh.css`

문항 생성 실패를 삼키는 로직은 `.tsx` 안에 두면 안 된다. Node 테스트는 JSX를 처리하지 못해 `.tsx`를 import할 수 없기 때문이다. 순수 로직을 `.ts`로 분리해 먼저 테스트한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/unit/safe-generate.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { findQuestionViolations } from "../../app/practice/question-invariants.ts";
import { generateSafely } from "../../app/practice/safe-generate.ts";

test("returns a valid question for a registered skill", () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const question = generateSafely("ma-linear-eq", 1);
    assert.ok(question, "expected a question");
    assert.deepEqual(findQuestionViolations(question), []);
  }
});

test("returns null instead of throwing for an unknown skill", () => {
  assert.equal(generateSafely("no-such-skill", 1), null);
});

test("accepts an explicit seed for reproducibility", () => {
  const first = generateSafely("ma-factor", 2, 4242);
  const second = generateSafely("ma-factor", 2, 4242);
  assert.deepEqual(first, second);
  assert.equal(first.seed, 4242);
});
```

- [ ] **Step 2: 테스트를 돌려 실패를 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/practice/safe-generate.ts`

- [ ] **Step 3: `app/practice/safe-generate.ts` 구현**

```ts
import { generateQuestion } from "./generators/registry.ts";
import { findQuestionViolations } from "./question-invariants.ts";
import type { GeneratedQuestion, Level } from "./types.ts";

const MAX_GENERATION_ATTEMPTS = 5;

export function generateSafely(
  skillId: string,
  level: Level,
  seed?: number,
): GeneratedQuestion | null {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const nextSeed = seed ?? Math.floor(Math.random() * 1_000_000);
    try {
      const question = generateQuestion(skillId, nextSeed, level);
      if (findQuestionViolations(question).length === 0) {
        return question;
      }
    } catch {
      // 다음 시드로 재시도한다. 한 문항의 실패가 학습 전체를 막지 않게 한다.
    }
    if (seed !== undefined) {
      break;
    }
  }
  return null;
}
```

시드를 명시로 넘긴 경우에는 재시도하지 않는다. 같은 시드로 다시 시도해 봐야 같은 결과가 나오기 때문이다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: PASS — `# fail 0`

- [ ] **Step 5: `app/practice/PracticeRunner.tsx` 구현**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConceptSheet from "./ConceptSheet";
import { resolveConceptSource } from "./concept-source.ts";
import { gradeAnswer } from "./grading.ts";
import { hasSkill } from "./generators/registry.ts";
import { generateSafely } from "./safe-generate.ts";
import { getSkillEntry } from "./skill-map.ts";
import type { GeneratedQuestion, Level } from "./types.ts";

export type PracticeRunnerProps = {
  skillId: string;
  level?: Level;
};

export default function PracticeRunner({ skillId, level = 1 }: PracticeRunnerProps) {
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

  // 첫 문항은 마운트 후에 만든다. 시드가 무작위라 서버 렌더에서 만들면
  // 클라이언트와 다른 문제가 나와 하이드레이션이 어긋난다.
  useEffect(() => {
    if (!supported) {
      return;
    }
    setQuestion(generateSafely(skillId, level));
    setSelected(null);
    setChecked(false);
    setHintsShown(0);
  }, [level, skillId, supported]);

  const result = useMemo(
    () => (question && checked && selected ? gradeAnswer(question, selected) : null),
    [checked, question, selected],
  );

  const nextQuestion = useCallback(() => {
    setQuestion(generateSafely(skillId, level));
    setSelected(null);
    setChecked(false);
    setHintsShown(0);
  }, [level, skillId]);

  const check = useCallback(() => {
    if (!question || !selected || checked) {
      return;
    }
    setChecked(true);
    setAttemptCount((previous) => previous + 1);
    if (gradeAnswer(question, selected).isCorrect) {
      setSolvedCount((previous) => previous + 1);
    }
  }, [checked, question, selected]);

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
            className="practice-choice"
            aria-pressed={selected === choice.value}
            disabled={checked}
            onClick={() => setSelected(choice.value)}
          >
            {choice.label}
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
            onClick={() => setHintsShown((previous) => Math.min(3, previous + 1))}
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

      {result ? (
        <div className={`practice-result ${result.isCorrect ? "is-correct" : "is-wrong"}`} role="status" aria-live="polite">
          <strong>{result.isCorrect ? "정답이야!" : "아쉽다, 다시 보자"}</strong>
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
```

`Math.random()`으로 시드를 뽑는 것은 의도적이다. Part 1에는 "오늘의 코스" 개념이 없어 재현이 필요 없다. Part 3에서 세션 편성기가 시드를 넘겨주도록 바꾼다.

**첫 문항을 `useEffect`에서 만드는 이유는 반드시 지켜야 한다.** `useState` 초기화 함수에서 `Math.random()`을 부르면 서버 렌더와 클라이언트 렌더가 서로 다른 문제를 만들어 하이드레이션이 어긋난다. React가 콘솔 에러를 내고 화면이 한 번 튄다. Part 3에서 시드를 프롭으로 받게 되면 그때는 초기화 함수로 되돌려도 된다.

`mistakeTag`를 아직 화면에 쓰지 않는 것도 의도다. 이 값을 소비하는 것은 Part 3의 미쿠 대사다. `gradeAnswer`가 이미 반환하고 있으므로 그때 연결만 하면 된다.

- [ ] **Step 6: 스타일 추가**

`app/visual-refresh.css` 끝에 추가한다.

```css
.practice-runner {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--math-border);
  border-radius: 18px;
  background: var(--math-surface);
}

.practice-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
}

.practice-eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 800;
  color: var(--math);
}

.practice-score {
  margin: 0;
  font-size: 13px;
}

.practice-concept-toggle,
.practice-primary,
.practice-secondary {
  min-height: 44px;
  min-width: 44px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 700;
}

.practice-concept-toggle,
.practice-secondary {
  border: 1px solid var(--line);
  background: var(--surface);
}

.practice-primary {
  border: 1px solid var(--math);
  background: var(--math);
  color: #fff;
}

.practice-primary:disabled,
.practice-secondary:disabled {
  opacity: 0.5;
}

.practice-prompt {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.6;
}

.practice-choices {
  display: grid;
  gap: 8px;
}

.practice-choice {
  min-height: 48px;
  padding: 0 14px;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  font-size: 16px;
}

.practice-choice[aria-pressed="true"] {
  border-color: var(--math);
  background: var(--math-soft);
  font-weight: 700;
}

.practice-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.practice-hints {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
}

.practice-result {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--surface);
}

.practice-result.is-correct {
  border-color: var(--math);
}

.practice-result p {
  margin: 0;
  font-weight: 700;
}

.practice-steps {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
}

.practice-empty {
  margin: 0;
  padding: 14px;
  border-radius: 12px;
  border: 1px dashed var(--line);
  line-height: 1.6;
}

@media (max-width: 390px) {
  .practice-runner {
    padding: 14px;
  }

  .practice-prompt {
    font-size: 17px;
  }
}
```

- [ ] **Step 7: 타입체크와 린트**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

- [ ] **Step 8: 커밋**

```bash
git add app/practice/safe-generate.ts app/practice/PracticeRunner.tsx app/visual-refresh.css tests/unit/safe-generate.test.mjs
git commit -m "feat(practice): 무한 연습 풀이 UI 추가"
```

---

### Task 13: 수학 탭 통합과 회귀 테스트

**Files:**
- Modify: `app/MathKnowledgeMap.tsx`
- Modify: `app/IpsiCoachApp.tsx`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: `MathKnowledgeMap`에 연습 슬롯 프롭 추가**

`app/MathKnowledgeMap.tsx` 상단 import에 `ReactNode` 타입을 추가한다.

```ts
import { useId, useState, type CSSProperties, type ReactNode } from "react";
```

`MathKnowledgeMapProps`에 한 줄을 추가한다.

```ts
export type MathKnowledgeMapProps = {
  curriculum?: MathCurriculum;
  value: MathKnowledgeMapValue;
  onChange: (nextValue: MathKnowledgeMapValue) => void;
  ariaLabel?: string;
  className?: string;
  renderConceptPractice?: (conceptId: string) => ReactNode;
};
```

컴포넌트 함수의 구조 분해에도 `renderConceptPractice`를 추가한다.

- [ ] **Step 2: 선택된 개념 상세에 슬롯 렌더**

`selectedConcept.practiceQuestions.map(` 를 포함한 `<section>` **바로 앞에** 아래를 삽입한다.

```tsx
{renderConceptPractice ? (
  <section>
    <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>계속 새 문제로 연습</h4>
    {renderConceptPractice(selectedConcept.id)}
  </section>
) : null}
```

- [ ] **Step 3: `IpsiCoachApp`에서 슬롯 연결**

`app/IpsiCoachApp.tsx` import에 두 줄을 추가한다.

```ts
import PracticeRunner from "./practice/PracticeRunner";
import { getSkillsForConcept } from "./practice/skill-map";
```

`MathKnowledgeMap`을 렌더하는 지점에 프롭을 추가한다.

```tsx
renderConceptPractice={(conceptId) => {
  const skillIds = getSkillsForConcept(conceptId);
  if (skillIds.length === 0) {
    return null;
  }
  return skillIds.map((skillId) => <PracticeRunner key={skillId} skillId={skillId} />);
}}
```

`app/IpsiCoachApp.tsx`는 기존 파일이라 확장자 없는 import 관례를 따른다. 새 모듈끼리는 `.ts`를 붙이지만 기존 파일에서 새 모듈을 부를 때는 관례대로 확장자를 생략한다. 두 방식 모두 빌드를 통과함을 확인했다.

- [ ] **Step 4: 회귀 테스트에 어서션 추가**

`tests/rendered-html.test.mjs`의 세 번째 테스트(`ships detailed curricula, ...`) 안, `assert.match(mathMap, /rel="noreferrer noopener"/);` 다음 줄에 추가한다.

```js
  assert.match(mathMap, /renderConceptPractice/);
```

같은 파일 끝에 새 테스트를 추가한다.

```js
test("wires the infinite practice engine into the math tab", async () => {
  const [app, runner, safeGenerate, registry, skillMap] = await Promise.all([
    readFile(new URL("../app/IpsiCoachApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/PracticeRunner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/safe-generate.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/generators/registry.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/practice/skill-map.ts", import.meta.url), "utf8"),
  ]);

  assert.match(app, /PracticeRunner/);
  assert.match(app, /getSkillsForConcept/);
  assert.match(runner, /개념 보기/);
  assert.match(runner, /힌트 보기/);
  assert.match(runner, /다음 문제/);
  assert.match(runner, /aria-live="polite"/);
  assert.match(runner, /useEffect/, "첫 문항은 마운트 후에 만들어야 한다 (하이드레이션)");
  assert.match(safeGenerate, /findQuestionViolations/);
  assert.match(registry, /unknown skillId/);

  for (const skillId of ["ma-frac-arith", "ma-linear-eq", "ma-poly-expand", "ma-factor", "ma-quad-eq"]) {
    assert.match(skillMap, new RegExp(`"${skillId}"`));
  }
});
```

- [ ] **Step 5: 전체 검증**

Run: `npm test`
Expected: 단위 테스트 전부 통과 → 빌드 성공 → 렌더 테스트 전부 통과, `# fail 0`

- [ ] **Step 6: Vercel 빌드 경로도 확인**

Run: `npm run build:vercel`
Expected: `✓ Compiled successfully`, 종료 코드 0

- [ ] **Step 7: 실제 화면에서 확인**

Run: `npm run dev`

브라우저에서 수학 탭 → 아무 개념이나 선택 → "계속 새 문제로 연습" 확인:

1. 문제가 보이고 선지가 4개다
2. "개념 보기"를 누르면 요점이 문제 아래에 펼쳐지고, 화면이 이동하지 않는다
3. 틀리면 단계별 풀이와 "이 개념 요점 다시 보기"가 나온다
4. "다음 문제"를 누르면 다른 문제가 나온다 — 10번 눌러 매번 다른지 확인
5. 힌트를 3번까지만 열 수 있다

- [ ] **Step 8: 커밋**

```bash
git add app/MathKnowledgeMap.tsx app/IpsiCoachApp.tsx tests/rendered-html.test.mjs
git commit -m "feat(practice): 수학 탭에 무한 연습 엔진 연결"
```

---

## 완료 기준

- [ ] `npm test` 통과 (단위 + 빌드 + 렌더)
- [ ] `npm run build:vercel` 통과
- [ ] `npm run lint` 에러 0 (경고는 기존 5개 유지)
- [ ] `npx tsc --noEmit --incremental false` 통과
- [ ] 수학 5개 스킬 각각에서 같은 개념으로 10문항 이상 새 문제가 나온다
- [ ] 모든 생성 문항이 단계별 풀이와 3단계 힌트를 갖는다
- [ ] 문제 화면을 벗어나지 않고 요점을 볼 수 있다
- [ ] 기존 로드맵·단어·개념 학습 기능이 그대로 동작한다

## Part 1이 남기는 것

Part 3이 바로 이어받을 수 있도록 준비된 것들:

- `mapOutcomeToRating` — 복습 큐가 소비할 평가 환산. 테스트 완료.
- `gradeAnswer`의 `mistakeTag` — 미쿠 오답 대사가 소비할 실수 진단. 이미 반환 중.
- `{skillId, seed, level}` — 오답노트가 저장할 최소 단위. 재현 가능함이 테스트로 보장됨.
- `SkillMapEntry.targetSeconds` — "빠름" 판정 기준. 값 입력 완료.
