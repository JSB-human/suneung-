# 순차 학습 경로 Part 1 — 길 뼈대와 수학 길

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 과목별 길이 화면에 나오고, 칸을 열면 설명 → 공식 → 확인 문제가 순서대로 나오며, 수학 22칸이 실제로 동작한다.

**Architecture:** 길 데이터를 손으로 나열하지 않는다. 기존 커리큘럼이 이미 순서를 갖고 있으므로(캡슐 배열 순서, 챕터→단원→개념 순서) 코드로 유도한다. 손으로 쓰는 것은 요점 카드 연결표뿐이다. 진도 계산은 순수 함수로 분리해 테스트한다.

**Tech Stack:** TypeScript, React 19, Next.js 16 (vinext + Turbopack), `node --test` + `--experimental-strip-types`

**참조 스펙:** `docs/superpowers/specs/2026-08-07-guided-path-design.md`

---

## 이 계획의 범위

**포함:** 길 데이터 유도, 진도 상태(v3→v4), 길 화면, 칸 화면, 탭 개편(서브탭 제거), 수학 캡슐 7칸 문항 보강.

**제외 (후속 계획):**
- 로드맵 파생 뷰 (Part 2)
- 국어·영어 확인 문항 124개 (Part 3)
- 단어 1500개 (Part 4)

국어·영어 길도 이번에 화면에는 나온다. 다만 칸당 확인 문제가 1개뿐이다. Part 3에서 3개로 채운다.

---

## 검증된 사전 조건

이전 단계에서 확인된 것들이다. 다시 조사하지 말 것.

- `npm run test:unit` = `node --experimental-strip-types --test tests/unit/**/*.test.mjs`. 현재 103개 통과. `npm test`는 여기에 빌드와 회귀 5개를 더한다. 전부 초록.
- **확장자 규칙:** `app/practice/`·`app/path/` 안의 `.ts` 모듈끼리는 `.ts` 확장자를 붙여 import한다. `.tsx`는 확장자 없이 import한다. `app/IpsiCoachApp.tsx` 같은 기존 앱 파일에서 부를 때는 확장자를 생략한다.
- **Node 테스트는 `.tsx`를 import할 수 없다.** 테스트해야 할 로직은 반드시 `.ts`에 둔다.
- `enum`·`namespace`·생성자 파라미터 프로퍼티 금지. 타입만 가져올 때는 `import type`.
- 이 저장소의 lint는 렌더 중 `Date.now()` 호출을 **에러**로 잡는다(`react-hooks/purity`). 날짜는 이벤트 핸들러나 프롭에서 받는다.
- `npm run lint` 기준선: 경고 4개, 에러 0개.
- localStorage 키는 `first-step-study-v2` 그대로. 내부 `schemaVersion`으로만 구분한다.

## 기존 자산 (재사용, 다시 만들지 말 것)

- `app/practice/skill-map.ts` — `SKILL_MAP`, `getSkillEntry`. 각 항목이 `coreNoteId`·`foundationId`·`conceptId`를 갖는다
- `app/practice/safe-generate.ts` — `generateSafely(skillId, level, seed?)`
- `app/practice/grading.ts` — `gradeAnswer`
- `app/practice/practice-state.ts` — `recordOutcome`, `WrongNote`
- `app/practice/PracticeRunner.tsx` — `onOutcome`, `initialSeed` 프롭 지원
- `app/practice/review-queue.ts` — `applyRating`, `isDue`, `skillKey`
- `app/foundation-reference.ts` — `FOUNDATION_REFERENCE` 31개
- `app/study-content.ts` — `CORE_NOTES` 35개
- `app/language-curriculum.ts` — `LANGUAGE_KNOWLEDGE_CURRICULA` (국어 21, 영어 20 개념)
- `app/math-curriculum.ts` — `MATH_KNOWLEDGE_CURRICULUM` (12 개념, 36 문항)

---

## 파일 구조

| 파일 | 책임 |
| --- | --- |
| `app/path/types.ts` | `PathNode`, `PathNodeKind`, `NodeQuestion` |
| `app/path/formula-map.ts` | 노드 → 요점 카드 연결표 (손으로 작성) |
| `app/path/path-nodes.ts` | 기존 커리큘럼에서 노드 배열을 유도 |
| `app/path/node-content.ts` | 노드 → 설명·공식·확인 문제를 모아 주는 조회 |
| `app/path/path-state.ts` | 진도 계산·갱신 (순수 함수) |
| `app/path/PathView.tsx` | 길 화면 |
| `app/path/NodeRunner.tsx` | 칸 화면 |
| `app/IpsiCoachApp.tsx` | 서브탭 제거, 길 연결, v4 마이그레이션 |

---

### Task 1: 길 타입과 요점 카드 연결표

**Files:**
- Create: `app/path/types.ts`
- Create: `app/path/formula-map.ts`
- Create: `tests/unit/formula-map.test.mjs`

- [ ] **Step 1: `app/path/types.ts` 작성**

```ts
import type { Subject } from "../practice/types.ts";

export type PathNodeKind = "capsule" | "concept";

export type PathNode = {
  id: string;
  subject: Subject;
  order: number;
  title: string;
  summary: string;
  kind: PathNodeKind;
  sourceId: string;
  formulaNoteId?: string;
  skillId?: string;
};

export type NodeQuestion = {
  id: string;
  prompt: string;
  choices: { value: string; label: string }[];
  answer: string;
  explanation: string;
};
```

`PathNode.id`는 `kind`와 `sourceId`로 만든다: `capsule:ko-sentence-skeleton`, `concept:linear-equations`. 별도 id 체계를 만들지 않는다.

- [ ] **Step 2: 실패하는 테스트 작성 — `tests/unit/formula-map.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { FORMULA_MAP } from "../../app/path/formula-map.ts";

test("every mapped note id exists in CORE_NOTES", async () => {
  const source = await readFile(new URL("../../app/study-content.ts", import.meta.url), "utf8");
  for (const [sourceId, noteId] of Object.entries(FORMULA_MAP)) {
    assert.ok(source.includes(`id: "${noteId}"`), `${sourceId} maps to unknown note: ${noteId}`);
  }
});

test("every mapped source id exists as a capsule or a curriculum concept", async () => {
  const [foundation, language, math] = await Promise.all([
    readFile(new URL("../../app/foundation-reference.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/language-curriculum.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/math-curriculum.ts", import.meta.url), "utf8"),
  ]);
  const all = foundation + language + math;
  for (const sourceId of Object.keys(FORMULA_MAP)) {
    assert.ok(all.includes(`id: "${sourceId}"`), `unknown source id: ${sourceId}`);
  }
});

test("the map is not trivially small", () => {
  assert.ok(Object.keys(FORMULA_MAP).length >= 20, `expected at least 20 mappings, got ${Object.keys(FORMULA_MAP).length}`);
});
```

- [ ] **Step 3: 테스트 실행, 실패 확인**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module .../app/path/formula-map.ts`

- [ ] **Step 4: `app/path/formula-map.ts` 작성**

이건 손으로 쓰는 유일한 데이터다. `CORE_NOTES` 35개를 읽고, 각 캡슐·개념에 어울리는 노트를 연결한다.

**작성 방법:** 먼저 아래를 실행해 양쪽 목록을 뽑는다.

```bash
node --experimental-strip-types -e "
import {CORE_NOTES} from './app/study-content.ts';
import {FOUNDATION_REFERENCE} from './app/foundation-reference.ts';
import {LANGUAGE_KNOWLEDGE_CURRICULA} from './app/language-curriculum.ts';
import {MATH_KNOWLEDGE_CURRICULUM} from './app/math-curriculum.ts';
console.log('=== NOTES ===');
for (const n of CORE_NOTES) console.log(n.id, '|', n.subject, '|', n.title);
console.log('=== CAPSULES ===');
for (const c of FOUNDATION_REFERENCE) console.log(c.id, '|', c.subject, '|', c.title);
console.log('=== CONCEPTS ===');
for (const s of ['korean','english']) for (const ch of LANGUAGE_KNOWLEDGE_CURRICULA[s].chapters) for (const u of ch.units) for (const co of u.concepts) console.log(co.id, '|', s, '|', co.title);
for (const ch of MATH_KNOWLEDGE_CURRICULUM.chapters) for (const u of ch.units) for (const co of u.concepts) console.log(co.id, '| math |', co.title);
" --input-type=module
```

그 결과를 보고 아래 형태로 작성한다. 같은 과목 안에서만 연결한다. 어울리는 노트가 없으면 넣지 않는다 — 억지로 연결하면 엉뚱한 공식이 뜬다.

```ts
export const FORMULA_MAP: Record<string, string> = {
  // 예시. 실제 id는 위 명령 출력으로 확인해 채운다.
  "ma-equations": "ma-linear",
  "linear-equations": "ma-linear",
  "ma-identities-factoring": "ma-factor",
  // ...
};
```

최소 20개 이상 연결한다. `SKILL_MAP`에 이미 `coreNoteId`가 있는 5개 스킬의 연결은 그대로 재사용해도 된다.

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: 103 + 3 = 106 pass, 0 fail

- [ ] **Step 6: 커밋**

```bash
git add app/path/types.ts app/path/formula-map.ts tests/unit/formula-map.test.mjs
git commit -m "feat(path): 길 타입과 요점 카드 연결표 추가"
```

---

### Task 2: 커리큘럼에서 길 유도

**Files:**
- Create: `app/path/path-nodes.ts`
- Create: `tests/unit/path-nodes.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성 — `tests/unit/path-nodes.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { FOUNDATION_REFERENCE } from "../../app/foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../../app/language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../../app/math-curriculum.ts";
import { PATH_NODES, getNode, getNodesForSubject } from "../../app/path/path-nodes.ts";

const SUBJECTS = ["korean", "english", "math"];

test("node ids are unique", () => {
  const ids = PATH_NODES.map((node) => node.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("capsules come before concepts within a subject", () => {
  for (const subject of SUBJECTS) {
    const nodes = getNodesForSubject(subject);
    const firstConcept = nodes.findIndex((node) => node.kind === "concept");
    const lastCapsule = nodes.map((node) => node.kind).lastIndexOf("capsule");
    assert.ok(lastCapsule < firstConcept, `${subject}: capsules and concepts interleave`);
  }
});

test("order runs 1..n with no gaps per subject", () => {
  for (const subject of SUBJECTS) {
    const orders = getNodesForSubject(subject).map((node) => node.order);
    assert.deepEqual(orders, orders.map((_, index) => index + 1), `${subject} order has gaps`);
  }
});

test("every capsule and every concept appears exactly once", () => {
  const sourceIds = new Set(PATH_NODES.map((node) => node.sourceId));

  for (const capsule of FOUNDATION_REFERENCE) {
    assert.ok(sourceIds.has(capsule.id), `capsule missing from path: ${capsule.id}`);
  }

  for (const subject of ["korean", "english"]) {
    for (const chapter of LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          assert.ok(sourceIds.has(concept.id), `concept missing from path: ${concept.id}`);
        }
      }
    }
  }

  for (const chapter of MATH_KNOWLEDGE_CURRICULUM.chapters) {
    for (const unit of chapter.units) {
      for (const concept of unit.concepts) {
        assert.ok(sourceIds.has(concept.id), `math concept missing from path: ${concept.id}`);
      }
    }
  }
});

test("subject node counts match the measured content", () => {
  assert.equal(getNodesForSubject("korean").length, 31);
  assert.equal(getNodesForSubject("english").length, 31);
  assert.equal(getNodesForSubject("math").length, 22);
  assert.equal(PATH_NODES.length, 84);
});

test("every node has a non-empty title and summary", () => {
  for (const node of PATH_NODES) {
    assert.ok(node.title.trim(), `${node.id} has no title`);
    assert.ok(node.summary.trim(), `${node.id} has no summary`);
  }
});

test("getNode finds by id and returns null otherwise", () => {
  assert.equal(getNode(PATH_NODES[0].id)?.id, PATH_NODES[0].id);
  assert.equal(getNode("no-such-node"), null);
});

test("math nodes that have a generator carry its skillId", () => {
  const withSkill = PATH_NODES.filter((node) => node.skillId);
  assert.ok(withSkill.length >= 5, `expected at least 5 generator-backed nodes, got ${withSkill.length}`);
  for (const node of withSkill) {
    assert.equal(node.subject, "math");
  }
});
```

**주의:** 개념 id가 커리큘럼 안에서 중복될 수 있다. 이전 조사에서 `equation-inequality-bridge`가 두 번 나타났다. 유도 코드는 중복 sourceId를 한 번만 담아야 하고, 위 "unique ids" 테스트가 이를 강제한다. 만약 개수 테스트(31/31/22)가 실패하면 중복 때문일 수 있으니, 실제 개수를 확인하고 테스트의 숫자를 실제에 맞춰라 — 다만 **왜 달라졌는지 반드시 보고할 것.**

- [ ] **Step 2: 테스트 실행, 실패 확인**

Run: `npm run test:unit`
Expected: FAIL — module not found

- [ ] **Step 3: `app/path/path-nodes.ts` 구현**

```ts
import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { SKILL_MAP } from "../practice/skill-map.ts";
import type { Subject } from "../practice/types.ts";
import { FORMULA_MAP } from "./formula-map.ts";
import type { PathNode } from "./types.ts";

const SUBJECTS: Subject[] = ["korean", "english", "math"];

function findSkillId(sourceId: string): string | undefined {
  const entry = Object.values(SKILL_MAP).find(
    (skill) => skill.foundationId === sourceId || skill.conceptId === sourceId,
  );
  return entry?.skillId;
}

function buildSubjectNodes(subject: Subject): PathNode[] {
  const nodes: PathNode[] = [];
  const seen = new Set<string>();

  const push = (
    sourceId: string,
    kind: PathNode["kind"],
    title: string,
    summary: string,
  ): void => {
    if (seen.has(sourceId)) {
      return;
    }
    seen.add(sourceId);
    nodes.push({
      id: `${kind}:${sourceId}`,
      subject,
      order: nodes.length + 1,
      title,
      summary,
      kind,
      sourceId,
      formulaNoteId: FORMULA_MAP[sourceId],
      skillId: findSkillId(sourceId),
    });
  };

  for (const capsule of FOUNDATION_REFERENCE) {
    if (capsule.subject === subject) {
      push(capsule.id, "capsule", capsule.title, capsule.beginnerExplanation);
    }
  }

  if (subject === "math") {
    for (const chapter of MATH_KNOWLEDGE_CURRICULUM.chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          push(concept.id, "concept", concept.title, concept.summary);
        }
      }
    }
  } else {
    for (const chapter of LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          push(concept.id, "concept", concept.title, concept.summary);
        }
      }
    }
  }

  return nodes;
}

export const PATH_NODES: PathNode[] = SUBJECTS.flatMap(buildSubjectNodes);

const NODE_BY_ID = new Map(PATH_NODES.map((node) => [node.id, node]));

export function getNode(nodeId: string): PathNode | null {
  return NODE_BY_ID.get(nodeId) ?? null;
}

export function getNodesForSubject(subject: Subject): PathNode[] {
  return PATH_NODES.filter((node) => node.subject === subject);
}
```

캡슐을 먼저, 개념을 나중에 놓는 것이 의도다. 캡슐은 노베이스용 기초 설명이므로 개념보다 앞서야 한다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: 106 + 8 = 114 pass, 0 fail

- [ ] **Step 5: 실제 길을 눈으로 확인**

```bash
node --experimental-strip-types -e "
import {getNodesForSubject} from './app/path/path-nodes.ts';
for (const s of ['korean','english','math']) {
  console.log('\n=== ' + s + ' (' + getNodesForSubject(s).length + '칸) ===');
  for (const n of getNodesForSubject(s)) console.log(n.order, n.kind === 'capsule' ? '기초' : '개념', n.title, n.formulaNoteId ? '[공식]' : '', n.skillId ? '[생성기]' : '');
}
" --input-type=module
```

순서가 노베이스에게 말이 되는지 본다. 이상하면 보고하라 — 순서는 학습 경험의 핵심이다.

- [ ] **Step 6: 커밋**

```bash
git add app/path/path-nodes.ts tests/unit/path-nodes.test.mjs
git commit -m "feat(path): 기존 커리큘럼에서 길 84칸 유도"
```

---

### Task 3: 칸 내용 조회

**Files:**
- Create: `app/path/node-content.ts`
- Create: `tests/unit/node-content.test.mjs`

칸 화면이 필요로 하는 설명·공식·확인 문제를 한 곳에서 모아 준다. UI가 여러 데이터 파일을 직접 뒤지지 않게 한다.

- [ ] **Step 1: 실패하는 테스트 작성 — `tests/unit/node-content.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { PATH_NODES } from "../../app/path/path-nodes.ts";
import { resolveNodeContent } from "../../app/path/node-content.ts";

test("every node resolves to content with an explanation", () => {
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    assert.ok(content, `no content for ${node.id}`);
    assert.ok(content.explanation.trim(), `${node.id} has no explanation`);
    assert.ok(content.title.trim(), `${node.id} has no title`);
  }
});

test("every node offers at least one check question", () => {
  for (const node of PATH_NODES) {
    const content = resolveNodeContent(node.id);
    const hasFixed = content.questions.length > 0;
    const hasGenerator = Boolean(content.skillId);
    assert.ok(hasFixed || hasGenerator, `${node.id} has no way to ask a question`);
  }
});

test("fixed questions are well formed", () => {
  for (const node of PATH_NODES) {
    for (const question of resolveNodeContent(node.id).questions) {
      assert.ok(question.prompt.trim(), `${node.id}: blank prompt`);
      assert.ok(question.explanation.trim(), `${node.id}: blank explanation`);
      assert.ok(question.choices.length >= 2, `${node.id}: too few choices`);
      const correct = question.choices.filter((choice) => choice.value === question.answer);
      assert.equal(correct.length, 1, `${node.id}: answer must match exactly one choice`);
      const values = question.choices.map((choice) => choice.value);
      assert.equal(new Set(values).size, values.length, `${node.id}: duplicate choices`);
    }
  }
});

test("resolveNodeContent returns null for an unknown node", () => {
  assert.equal(resolveNodeContent("no-such-node"), null);
});

test("nodes with a formula mapping expose formula text", () => {
  const withFormula = PATH_NODES.filter((node) => node.formulaNoteId);
  assert.ok(withFormula.length >= 20);
  for (const node of withFormula) {
    const content = resolveNodeContent(node.id);
    assert.ok(content.keyPoints.length > 0, `${node.id} has a note but no key points`);
  }
});
```

- [ ] **Step 2: 테스트 실행, 실패 확인**

Run: `npm run test:unit`

- [ ] **Step 3: `app/path/node-content.ts` 구현**

```ts
import { FOUNDATION_REFERENCE } from "../foundation-reference.ts";
import { LANGUAGE_KNOWLEDGE_CURRICULA } from "../language-curriculum.ts";
import { MATH_KNOWLEDGE_CURRICULUM } from "../math-curriculum.ts";
import { CORE_NOTES } from "../study-content.ts";
import { getNode } from "./path-nodes.ts";
import type { NodeQuestion } from "./types.ts";

export type NodeContent = {
  nodeId: string;
  title: string;
  explanation: string;
  keyPoints: string[];
  formula?: string;
  mistake?: string;
  questions: NodeQuestion[];
  skillId?: string;
};

function findCapsule(sourceId: string) {
  return FOUNDATION_REFERENCE.find((item) => item.id === sourceId);
}

function findLanguageConcept(sourceId: string) {
  for (const subject of ["korean", "english"] as const) {
    for (const chapter of LANGUAGE_KNOWLEDGE_CURRICULA[subject].chapters) {
      for (const unit of chapter.units) {
        for (const concept of unit.concepts) {
          if (concept.id === sourceId) {
            return concept;
          }
        }
      }
    }
  }
  return undefined;
}

function findMathConcept(sourceId: string) {
  for (const chapter of MATH_KNOWLEDGE_CURRICULUM.chapters) {
    for (const unit of chapter.units) {
      for (const concept of unit.concepts) {
        if (concept.id === sourceId) {
          return concept;
        }
      }
    }
  }
  return undefined;
}

export function resolveNodeContent(nodeId: string): NodeContent | null {
  const node = getNode(nodeId);
  if (!node) {
    return null;
  }

  const note = node.formulaNoteId
    ? CORE_NOTES.find((item) => item.id === node.formulaNoteId)
    : undefined;

  const base = {
    nodeId,
    title: node.title,
    keyPoints: note?.essentials ? [...note.essentials] : [],
    formula: note?.formula,
    mistake: note?.mistake,
    skillId: node.skillId,
  };

  if (node.kind === "capsule") {
    const capsule = findCapsule(node.sourceId);
    if (!capsule) {
      return null;
    }
    return {
      ...base,
      explanation: capsule.beginnerExplanation,
      keyPoints: base.keyPoints.length > 0 ? base.keyPoints : [...capsule.keyPoints],
      formula: base.formula ?? capsule.frame,
      mistake: base.mistake ?? capsule.commonTrap,
      questions: [
        {
          id: `${nodeId}:quick`,
          prompt: capsule.quickCheck.prompt,
          choices: [],
          answer: capsule.quickCheck.answer,
          explanation: capsule.quickCheck.explanation,
        },
      ],
    };
  }

  const languageConcept = findLanguageConcept(node.sourceId);
  if (languageConcept) {
    const check = languageConcept.selfCheckQuestion;
    return {
      ...base,
      explanation: languageConcept.summary,
      keyPoints:
        base.keyPoints.length > 0 ? base.keyPoints : [...languageConcept.corePoints],
      questions: [
        {
          id: check.id,
          prompt: check.prompt,
          choices: check.choices ? [...check.choices] : [],
          answer: check.acceptableAnswers[0] ?? check.answer,
          explanation: check.explanation,
        },
      ],
    };
  }

  const mathConcept = findMathConcept(node.sourceId);
  if (mathConcept) {
    return {
      ...base,
      explanation: mathConcept.summary,
      keyPoints:
        base.keyPoints.length > 0 ? base.keyPoints : [...mathConcept.corePrinciples],
      questions: mathConcept.practiceQuestions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        choices: question.choices ? [...question.choices] : [],
        answer: question.acceptableAnswers[0],
        explanation: question.explanation,
      })),
    };
  }

  return null;
}
```

**주의:** 캡슐의 `quickCheck`와 일부 개념 문항은 선택지가 없는 주관식이다. 위 코드는 `choices: []`를 넣는다. 그러면 "선지 2개 이상" 테스트가 실패한다. 두 가지 중 하나를 택하라.

1. 테스트를 `choices.length === 0 || choices.length >= 2`로 고친다 (주관식 허용)
2. 주관식 문항에 선지를 만들어 준다

**1번을 택하라.** 주관식은 정당한 문제 형태이고, 칸 화면은 선지가 없으면 입력란을 보여 주면 된다. 다만 테스트를 고칠 때 "선지가 있으면 정답이 정확히 하나여야 한다"는 조건은 유지하라.

- [ ] **Step 4: 테스트를 주관식 허용으로 고치고 통과 확인**

`tests/unit/node-content.test.mjs`의 "fixed questions are well formed" 테스트에서 선지 검사 부분을 아래로 바꾼다.

```js
      if (question.choices.length > 0) {
        assert.ok(question.choices.length >= 2, `${node.id}: too few choices`);
        const correct = question.choices.filter((choice) => choice.value === question.answer);
        assert.equal(correct.length, 1, `${node.id}: answer must match exactly one choice`);
        const values = question.choices.map((choice) => choice.value);
        assert.equal(new Set(values).size, values.length, `${node.id}: duplicate choices`);
      }
```

Run: `npm run test:unit`
Expected: 114 + 5 = 119 pass, 0 fail

정답이 선지와 매칭되지 않아 실패하는 노드가 나오면, 그 노드의 실제 데이터를 확인하고 **어떤 노드가 왜 어긋나는지 보고하라.** 조용히 테스트를 약화시키지 말 것.

- [ ] **Step 5: 커밋**

```bash
git add app/path/node-content.ts tests/unit/node-content.test.mjs
git commit -m "feat(path): 칸 내용 조회 추가"
```

---

### Task 4: 진도 상태

**Files:**
- Create: `app/path/path-state.ts`
- Create: `tests/unit/path-state.test.mjs`

- [ ] **Step 1: 실패하는 테스트 작성 — `tests/unit/path-state.test.mjs`**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { getNodesForSubject } from "../../app/path/path-nodes.ts";
import {
  EMPTY_PATH_STATE,
  completeNode,
  getNodeStatus,
  getNextNode,
  getSubjectProgress,
  normalizePathState,
} from "../../app/path/path-state.ts";

const firstMath = getNodesForSubject("math")[0];
const secondMath = getNodesForSubject("math")[1];

test("normalizePathState survives junk", () => {
  assert.deepEqual(normalizePathState(undefined), EMPTY_PATH_STATE);
  assert.deepEqual(normalizePathState(null), EMPTY_PATH_STATE);
  assert.deepEqual(normalizePathState({ completedNodeIds: "nope" }).completedNodeIds, []);
});

test("normalizePathState drops unknown node ids", () => {
  const state = normalizePathState({ completedNodeIds: [firstMath.id, "no-such-node"] });
  assert.deepEqual(state.completedNodeIds, [firstMath.id]);
});

test("only the first node is unlocked at the start", () => {
  assert.equal(getNodeStatus(EMPTY_PATH_STATE, firstMath.id), "current");
  assert.equal(getNodeStatus(EMPTY_PATH_STATE, secondMath.id), "locked");
});

test("completing a node unlocks the next one", () => {
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.equal(getNodeStatus(state, firstMath.id), "done");
  assert.equal(getNodeStatus(state, secondMath.id), "current");
});

test("scoring below two out of three flags review but still unlocks", () => {
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 1, 3);
  assert.equal(getNodeStatus(state, firstMath.id), "done");
  assert.ok(state.needsReviewNodeIds.includes(firstMath.id));
  assert.equal(getNodeStatus(state, secondMath.id), "current", "진행을 막으면 안 된다");
});

test("scoring two out of three does not flag review", () => {
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 2, 3);
  assert.deepEqual(state.needsReviewNodeIds, []);
});

test("completing the same node twice does not duplicate", () => {
  let state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  state = completeNode(state, firstMath.id, 3, 3);
  assert.equal(state.completedNodeIds.filter((id) => id === firstMath.id).length, 1);
});

test("re-completing a flagged node clears the review flag", () => {
  let state = completeNode(EMPTY_PATH_STATE, firstMath.id, 1, 3);
  state = completeNode(state, firstMath.id, 3, 3);
  assert.deepEqual(state.needsReviewNodeIds, []);
});

test("completeNode does not mutate its input", () => {
  const before = JSON.stringify(EMPTY_PATH_STATE);
  completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.equal(JSON.stringify(EMPTY_PATH_STATE), before);
});

test("getNextNode returns the first unfinished node of a subject", () => {
  assert.equal(getNextNode(EMPTY_PATH_STATE, "math")?.id, firstMath.id);
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.equal(getNextNode(state, "math")?.id, secondMath.id);
});

test("getNextNode returns null when a subject is finished", () => {
  let state = EMPTY_PATH_STATE;
  for (const node of getNodesForSubject("math")) {
    state = completeNode(state, node.id, 3, 3);
  }
  assert.equal(getNextNode(state, "math"), null);
});

test("getSubjectProgress counts done over total", () => {
  const total = getNodesForSubject("math").length;
  assert.deepEqual(getSubjectProgress(EMPTY_PATH_STATE, "math"), { done: 0, total });
  const state = completeNode(EMPTY_PATH_STATE, firstMath.id, 3, 3);
  assert.deepEqual(getSubjectProgress(state, "math"), { done: 1, total });
});
```

- [ ] **Step 2: 테스트 실행, 실패 확인**

- [ ] **Step 3: `app/path/path-state.ts` 구현**

```ts
import type { Subject } from "../practice/types.ts";
import { getNode, getNodesForSubject } from "./path-nodes.ts";
import type { PathNode } from "./types.ts";

export type NodeStatus = "done" | "current" | "locked";

export type PathState = {
  completedNodeIds: string[];
  needsReviewNodeIds: string[];
};

export const EMPTY_PATH_STATE: PathState = {
  completedNodeIds: [],
  needsReviewNodeIds: [],
};

const REVIEW_THRESHOLD = 2;

function onlyKnownNodeIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is string => typeof item === "string" && getNode(item) !== null,
  );
}

export function normalizePathState(value: unknown): PathState {
  if (!value || typeof value !== "object") {
    return EMPTY_PATH_STATE;
  }
  const candidate = value as Partial<PathState>;
  return {
    completedNodeIds: onlyKnownNodeIds(candidate.completedNodeIds),
    needsReviewNodeIds: onlyKnownNodeIds(candidate.needsReviewNodeIds),
  };
}

export function getNextNode(state: PathState, subject: Subject): PathNode | null {
  return (
    getNodesForSubject(subject).find(
      (node) => !state.completedNodeIds.includes(node.id),
    ) ?? null
  );
}

export function getNodeStatus(state: PathState, nodeId: string): NodeStatus {
  if (state.completedNodeIds.includes(nodeId)) {
    return "done";
  }
  const node = getNode(nodeId);
  if (!node) {
    return "locked";
  }
  return getNextNode(state, node.subject)?.id === nodeId ? "current" : "locked";
}

export function completeNode(
  state: PathState,
  nodeId: string,
  correctCount: number,
  totalCount: number,
): PathState {
  if (!getNode(nodeId)) {
    return state;
  }

  const completedNodeIds = state.completedNodeIds.includes(nodeId)
    ? state.completedNodeIds
    : [...state.completedNodeIds, nodeId];

  const needsReview = totalCount > 0 && correctCount < REVIEW_THRESHOLD;
  const withoutThis = state.needsReviewNodeIds.filter((id) => id !== nodeId);

  return {
    completedNodeIds,
    needsReviewNodeIds: needsReview ? [...withoutThis, nodeId] : withoutThis,
  };
}

export function getSubjectProgress(
  state: PathState,
  subject: Subject,
): { done: number; total: number } {
  const nodes = getNodesForSubject(subject);
  return {
    done: nodes.filter((node) => state.completedNodeIds.includes(node.id)).length,
    total: nodes.length,
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:unit`
Expected: 119 + 12 = 131 pass, 0 fail

- [ ] **Step 5: 커밋**

```bash
git add app/path/path-state.ts tests/unit/path-state.test.mjs
git commit -m "feat(path): 길 진도 계산 추가"
```

---

### Task 5: 칸 화면

**Files:**
- Create: `app/path/NodeRunner.tsx`
- Modify: `app/visual-refresh.css`

- [ ] **Step 1: `app/path/NodeRunner.tsx` 구현**

```tsx
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
```

생성기가 붙은 칸(`content.skillId`)은 `PracticeRunner`를 그대로 재사용한다. 무한 문제이므로 "이 칸 끝내기"를 학습자가 직접 누른다.

- [ ] **Step 2: `app/visual-refresh.css` 끝에 스타일 추가**

```css
.node-runner {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
}

.node-runner-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.node-runner-head h3 {
  margin: 0;
  font-size: 19px;
  line-height: 1.35;
}

.node-explanation {
  margin: 0;
  line-height: 1.7;
}

.node-check {
  display: grid;
  gap: 12px;
}

.node-progress {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--math);
}

.node-input {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  font-size: 16px;
}

@media (max-width: 390px) {
  .node-runner {
    padding: 14px;
  }
}
```

`font-size: 16px`는 iOS Safari가 입력란 포커스 시 화면을 확대하지 않게 하는 최소값이다. 줄이지 말 것.

- [ ] **Step 3: 검증과 커밋**

Run: `npx tsc --noEmit --incremental false && npm run lint`
Expected: 타입 에러 없음, lint 에러 0

```bash
git add app/path/NodeRunner.tsx app/visual-refresh.css
git commit -m "feat(path): 칸 화면 추가"
```

---

### Task 6: 길 화면

**Files:**
- Create: `app/path/PathView.tsx`
- Modify: `app/visual-refresh.css`

- [ ] **Step 1: `app/path/PathView.tsx` 구현**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { PracticeOutcomeReport } from "../practice/PracticeRunner";
import type { Subject } from "../practice/types.ts";
import NodeRunner from "./NodeRunner";
import { getNodesForSubject } from "./path-nodes.ts";
import { getNodeStatus, getSubjectProgress, type PathState } from "./path-state.ts";

export type PathViewProps = {
  subject: Subject;
  state: PathState;
  onCompleteNode: (nodeId: string, correctCount: number, totalCount: number) => void;
  onOutcome?: (report: PracticeOutcomeReport) => void;
};

export default function PathView({
  subject,
  state,
  onCompleteNode,
  onOutcome,
}: PathViewProps) {
  const [openNodeId, setOpenNodeId] = useState<string | null>(null);
  const currentRef = useRef<HTMLLIElement | null>(null);

  const nodes = getNodesForSubject(subject);
  const progress = getSubjectProgress(state, subject);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [subject]);

  if (openNodeId) {
    return (
      <NodeRunner
        nodeId={openNodeId}
        onOutcome={onOutcome}
        onComplete={(correctCount, totalCount) =>
          onCompleteNode(openNodeId, correctCount, totalCount)
        }
        onClose={() => setOpenNodeId(null)}
      />
    );
  }

  return (
    <section className="path-view" aria-label={`${subject} 학습 경로`}>
      <p className="path-progress" role="status">
        {progress.done} / {progress.total} 칸 완료
      </p>

      <ol className="path-list">
        {nodes.map((node) => {
          const status = getNodeStatus(state, node.id);
          const needsReview = state.needsReviewNodeIds.includes(node.id);
          return (
            <li
              key={node.id}
              ref={status === "current" ? currentRef : null}
              className={`path-node is-${status}`}
            >
              <button
                type="button"
                className="path-node-button"
                disabled={status === "locked"}
                onClick={() => setOpenNodeId(node.id)}
                aria-current={status === "current" ? "step" : undefined}
              >
                <span className="path-node-order" aria-hidden="true">
                  {status === "done" ? "✓" : node.order}
                </span>
                <span className="path-node-body">
                  <strong>{node.title}</strong>
                  <small>{node.summary}</small>
                  {needsReview ? <em className="path-node-review">복습 필요</em> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
```

잠긴 칸도 제목과 요약을 렌더한다. 이것이 "전체 그림"을 만든다. 버튼만 `disabled`다.

- [ ] **Step 2: `app/visual-refresh.css` 끝에 스타일 추가**

```css
.path-view {
  display: grid;
  gap: 12px;
}

.path-progress {
  margin: 0;
  font-weight: 700;
}

.path-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.path-node-button {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
}

.path-node-order {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent);
  font-weight: 800;
}

.path-node-body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.path-node-body strong {
  font-size: 16px;
  line-height: 1.35;
}

.path-node-body small {
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.8;
}

.path-node.is-current .path-node-button {
  border-color: var(--math);
  border-width: 2px;
  box-shadow: var(--shadow-md);
}

.path-node.is-done .path-node-order {
  background: var(--math);
  color: #fff;
}

.path-node.is-locked .path-node-button {
  opacity: 0.55;
}

.path-node-review {
  font-size: 12px;
  font-weight: 700;
  font-style: normal;
  color: #c2410c;
}
```

`grid-template-columns: 40px minmax(0, 1fr)`의 `minmax(0, ...)`가 중요하다. 이것이 없으면 긴 제목이 칸을 화면 밖으로 밀어낸다 — 단어장을 깨뜨렸던 것과 같은 버그다.

- [ ] **Step 3: 검증과 커밋**

Run: `npx tsc --noEmit --incremental false && npm run lint`

```bash
git add app/path/PathView.tsx app/visual-refresh.css
git commit -m "feat(path): 길 화면 추가"
```

---

### Task 7: 탭 개편과 상태 배선

**Files:**
- Modify: `app/IpsiCoachApp.tsx`
- Modify: `tests/rendered-html.test.mjs`

가장 조심해야 하는 태스크다. 1400줄이 넘는 파일이고 동생의 실제 진도가 걸려 있다.

- [ ] **Step 1: import 추가**

```ts
import PathView from "./path/PathView";
import { EMPTY_PATH_STATE, completeNode, getNextNode, normalizePathState, type PathState } from "./path/path-state";
```

- [ ] **Step 2: `AppState`에 `path` 추가하고 `schemaVersion`을 4로**

```ts
type AppState = {
  schemaVersion: 4;
  // ... 기존 필드 그대로 ...
  path: PathState;
};
```

`DEFAULT_APP_STATE`에 `schemaVersion: 4`와 `path: EMPTY_PATH_STATE`를 넣는다.

`normalizeStoredState`의 반환 객체에서 `schemaVersion: 3`을 `4`로 바꾸고 `path: normalizePathState((candidate as { path?: unknown }).path),`를 추가한다.

`migrateLegacyState` 안의 `schemaVersion: 3` 리터럴도 `4`로 바꾼다. 타입이 맞지 않으면 컴파일되지 않는다.

- [ ] **Step 3: 칸 완료 핸들러 추가**

```ts
  const handleCompleteNode = (nodeId: string, correctCount: number, totalCount: number) => {
    const currentDateKey = getLocalDateKey();
    setAppState((previous) =>
      addStudyMinutes(
        { ...previous, path: completeNode(previous.path, nodeId, correctCount, totalCount) },
        currentDateKey,
        5,
      ),
    );
  };
```

칸 하나를 5분으로 세어 학습 기록과 연속일에 반영한다.

- [ ] **Step 4: 과목 탭의 서브탭을 전부 제거하고 `PathView`로 대체**

국어·영어·수학 탭 각각에서, 서브탭 버튼 줄과 서브탭 상태(`koreanSubTab` 등), 그리고 그에 딸린 조건부 렌더를 **전부 삭제**하고 아래 하나만 남긴다.

```tsx
<PathView
  subject="korean"
  state={appState.path}
  onCompleteNode={handleCompleteNode}
  onOutcome={handlePracticeOutcome}
/>
```

영어는 `subject="english"`, 수학은 `subject="math"`.

**삭제 대상을 정확히 파악하라.** 서브탭 상태 변수, 그 setter, 버튼 JSX, 조건부 렌더 블록, 그리고 그 블록에서만 쓰이던 import(`RoadmapView`, `CoreNotes`, `FoundationReference`, `LanguageKnowledgeMap`, `MathKnowledgeMap`, `VocabTrainer` 중 과목 탭에서만 쓰이던 것)를 함께 정리한다. **단, `VocabTrainer`는 오늘 탭에서 계속 써야 하므로 지우지 말 것.** 지운 뒤 `npx tsc --noEmit`과 `npm run lint`로 미사용 import가 남지 않았는지 확인한다.

컴포넌트 파일 자체(`RoadmapView.tsx` 등)는 **지우지 마라.** 후속 계획에서 로드맵 파생 뷰가 일부를 다시 쓴다.

- [ ] **Step 5: 오늘 탭 정리**

오늘 탭에서 아래만 남긴다.

1. 미쿠 (`EncouragementCoach`)
2. 세 과목의 다음 칸 3개
3. 오늘의 단어 (기존 `VocabTrainer`로 가는 진입 버튼 또는 축약 카드)

나머지 카드(3단계 안내, 대시보드 그리드, EBS 링크 줄 등)는 제거한다. 측정된 문제가 "9개 버튼, 2.7화면, 주요 행동까지 1.86화면 스크롤"이었으므로, 이 정리가 이번 작업의 핵심 효과다.

다음 칸 3개는 이렇게 만든다.

```tsx
{(["korean", "english", "math"] as const).map((subject) => {
  const next = getNextNode(appState.path, subject);
  if (!next) {
    return null;
  }
  return (
    <button
      key={subject}
      type="button"
      className="today-next-node"
      onClick={() => setActiveTab(subject)}
    >
      <span className="practice-eyebrow">{SUBJECT_GUIDES[subject].label}</span>
      <strong>{next.title}</strong>
    </button>
  );
})}
```

`setActiveTab`의 실제 이름은 파일에서 확인하라. 탭 id가 `english`가 아니라 다른 값이면 맞춰라.

- [ ] **Step 6: 스타일 추가 (`app/visual-refresh.css`)**

```css
.today-next-node {
  display: grid;
  gap: 4px;
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
}

.today-next-node strong {
  font-size: 16px;
  line-height: 1.35;
}
```

- [ ] **Step 7: 회귀 테스트 갱신**

`tests/rendered-html.test.mjs`에서:

- `assert.match(component, /schemaVersion: 3/);` → `/schemaVersion: 4/`
- 아래를 추가한다.

```js
  assert.match(component, /normalizePathState/, "v4 마이그레이션이 있어야 한다");
  assert.match(component, /PathView/);
```

서브탭이 사라졌으므로 서브탭 문자열을 검사하던 어서션이 실패한다. 실패하는 것을 확인한 뒤, **사라진 것이 맞는 어서션만** 지우고 새 구조를 검사하는 어서션으로 대체하라. 첫 번째 테스트(서버 렌더 HTML)에 아래를 넣는다.

```js
  assert.match(html, /칸 완료/);
```

- [ ] **Step 8: 전체 검증**

Run: `npm test`
Expected: 131 단위 + 회귀 전부 통과

Run: `npm run build:vercel && npx tsc --noEmit --incremental false && npm run lint`
Expected: 빌드 성공, 타입 에러 없음, lint 에러 0

- [ ] **Step 9: 기존 진도 보존 실증**

이 스텝을 건너뛰지 말 것. 동생 데이터가 걸려 있다.

`npm run dev`로 띄운 뒤 브라우저 콘솔에서 v3 상태를 심고 새로고침한다.

```js
localStorage.setItem("first-step-study-v2", JSON.stringify({
  schemaVersion: 3,
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
  practice: { reviewById: { "vocab:assume": { status: "review", dueDate: "2026-08-09", lastReviewedAt: "2026-08-06", intervalDays: 3, reviewCount: 2, streak: 2, favorite: true, ease: 2.3, mastery: 40 } }, wrongNotes: [], skillLevels: {} },
  miku: { lastLineId: null, lastSeenDate: null },
}));
location.reload();
```

확인할 것:
1. `schemaVersion`이 4다
2. `practice.reviewById["vocab:assume"].mastery`가 여전히 40이다
3. 단어 즐겨찾기·학습 기록이 남아 있다
4. `path`가 `{completedNodeIds: [], needsReviewNodeIds: []}`로 생겼다

- [ ] **Step 10: 길이 실제로 동작하는지 확인**

375×812 뷰포트에서:

1. 수학 탭에 22칸이 보이고, 1번만 열리고 나머지는 회색으로 잠겨 있다
2. 잠긴 칸도 제목과 요약이 읽힌다
3. 1번 칸을 열면 설명 → 공식 → 확인 문제 순으로 나온다
4. 칸을 끝내면 2번 칸이 열린다
5. 오늘 탭에 세 과목의 다음 칸이 하나씩 보인다
6. `document.documentElement.scrollWidth === clientWidth` (가로 넘침 없음)
7. 국어·영어 탭도 길이 보인다 (칸당 문제 1개)

- [ ] **Step 11: 커밋**

```bash
git add app/IpsiCoachApp.tsx app/visual-refresh.css tests/rendered-html.test.mjs
git commit -m "feat(path): 서브탭 제거하고 과목 탭을 길로 대체"
```

---

## 완료 기준

- [ ] `npm test` 통과
- [ ] `npm run build:vercel` 통과
- [ ] `npm run lint` 에러 0
- [ ] `npx tsc --noEmit --incremental false` 통과
- [ ] 하단 탭 5개, 서브탭 0개
- [ ] 각 과목 탭이 길 하나를 보여 주고 잠긴 칸의 제목·요약이 보인다
- [ ] 캡슐 31개와 개념 53개가 전부 길 위에 있다 (테스트로 강제)
- [ ] 칸을 완료하면 다음 칸이 열리고, 틀려도 진행이 막히지 않는다
- [ ] v3 데이터가 v4로 올라가며 단어 진도·학습 기록·오답노트가 보존된다
- [ ] 375px에서 모든 탭의 가로 넘침이 0이다

## 다음 계획으로 넘기는 것

- 로드맵 파생 뷰 (이번 주 카드, 단계 4개)
- 국어·영어 확인 문항 124개
- 수학 캡슐 7칸 문항 보강
- 단어 1500개 (500씩 3단계)
- 미쿠 반응 (`mistakeTag` 연결)
