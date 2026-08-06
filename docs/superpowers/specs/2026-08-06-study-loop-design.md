# 학습 루프 설계 (스펙 1)

작성일: 2026-08-06

## 배경

`수능人`은 2028학년도 수능을 목표로 하는 노베이스 학습자용 모바일 학습 사이트다. 컨셉은 하츠네 미쿠와 함께 공부하는 것이다.

현재 콘텐츠 인벤토리:

| 항목 | 수량 |
| --- | --- |
| 국어·영어 개념 노드 | 42개 (개념당 자가진단 1문항, 총 42문항) |
| 수학 개념 노드 | 13개 (연습문제 37문항) |
| 기초 교과서 캡슐 (`FOUNDATION_REFERENCE`) | 31개 |
| 요점 카드 (`CORE_NOTES`) | 35개 |
| 영단어 (SRS 있음) | 153개 |
| 국어 지문 / 영어 듣기 자료 | 0개 |
| 단어 외 복습 큐·오답노트 | 없음 |

사용자가 지목한 문제는 네 가지다: 풀 게 없다, 설명이 어렵다, 뭘 할지 모르겠다, 재미가 없어 다시 오지 않는다.

진단: 이 사이트는 *무엇을 공부할지 알려주는 안내서*이지 *붙잡고 푸는 곳*이 아니다. 개념당 문항이 1개라 한 번 풀면 끝이고 재방문 이유가 없다. 미쿠는 아바타 이미지 1장과 이모지 말풍선, BGM 모달까지라 컨셉이 장식에 머문다. 요점·개념 자료는 네 가지 서로 다른 자료구조에 흩어져 있고 문제 풀이 화면과 분리된 별도 탭에 있다.

## 범위

이 스펙은 **학습 루프**를 다룬다: 문제 생성 엔진, 개념 참조 레이어, 통합 복습 큐, 세션 편성, 미쿠 반응.

**이 스펙에서 다루지 않는 것 (스펙 2로 분리):**

- 기존 55개 개념 설명의 노베이스 눈높이 리라이트
- 국어 장문 지문, 문학 작품 콘텐츠
- 영어 듣기 (오디오) 기능
- 미쿠 의상·배경·스티커 수집 등 게임화 요소

**의도적으로 제외한 것:**

- **진단 테스트.** 학습자가 노베이스임이 이미 확정되어 있어 테스트로 얻을 정보가 "처음부터 시작"뿐이다. 세션 편성기가 실제 정답률로 난이도를 조절하는 편이 더 정확하고 구현량도 적다.
- **LLM API 실시간 연동.** 비용·서버·환각 리스크가 있고, 아래 생성 방식으로 필요한 문항 수를 충족할 수 있다.

## 설계 원칙

1. **역방향 생성** — 답을 먼저 정하고 문제를 거꾸로 만든다. 답이 항상 깔끔하고, 풀이 단계가 부산물로 나온다.
2. **생성기는 순수 함수** — `(rng) => GeneratedQuestion`. 시드가 같으면 결과가 같다. 테스트 가능하고, 저장은 `{skillId, seed}` 두 값으로 끝난다.
3. **개념은 문제 옆에 있다** — 막혔을 때 화면을 나가지 않는다.
4. **미쿠와 학습 로직은 서로를 모른다** — 한쪽만 고칠 수 있어야 한다.
5. **기존 콘텐츠를 재작성하지 않는다** — 흩어진 개념 자료는 참조 표로 연결만 한다.

## 모듈 구조

`IpsiCoachApp.tsx`는 1409줄, `VocabTrainer.tsx`는 716줄이다. 여기에 기능을 더 얹으면 유지가 어려워지므로, 새 기능은 UI에서 분리된 순수 로직 모듈로 넣고 기존 컴포넌트가 이를 사용하도록 바꾼다.

```
app/practice/
  types.ts             생성 문제·스킬 공용 타입
  rng.ts               시드 기반 난수 (mulberry32)
  skill-map.ts         skillId ↔ 개념 자료 연결표
  generators/
    math.ts            수학 문제 템플릿
    english.ts         영어 문제 템플릿
    korean.ts          국어 문제 템플릿
    registry.ts        skillId → 생성기 매핑
  banks/
    english-sentences.ts  영어 문장 뱅크 (구조 태그 포함)
    korean-passages.ts    국어 짧은 지문 뱅크
  review-queue.ts      전 과목 공용 SRS
  session-planner.ts   오늘의 코스 편성
  PracticeRunner.tsx   문제 풀이 UI
  ConceptSheet.tsx     문제 위에 올라오는 개념·요점 시트

app/miku/
  miku-lines.ts        상황별 대사 뱅크
  miku-mood.ts         최근 성과 → 기분 계산
  MikuPartner.tsx      아바타 + 말풍선
```

### skillId — 전체의 척추

스킬 하나가 생성기 1개 + 요점 카드 + 기초 캡슐 + 커리큘럼 개념을 묶는다. `skill-map.ts`가 그 연결표이며, 이것이 있어야 "지금 푸는 문제의 개념"을 즉시 꺼낼 수 있다.

```ts
type SkillMapEntry = {
  skillId: string;
  subject: "korean" | "english" | "math";
  label: string;
  coreNoteId?: string;        // CORE_NOTES 참조
  foundationId?: string;      // FOUNDATION_REFERENCE 참조
  conceptId?: string;         // 수학/국어·영어 커리큘럼 개념 참조
};
```

연결표는 **참조만** 한다. 기존 네 종류 개념 데이터를 통합하거나 재작성하지 않는다. 지금 콘텐츠를 건드리지 않으므로 안전하고, 스펙 2에서 설명을 다시 쓸 때도 이 표는 그대로 쓴다.

### 요점·개념이 노출되는 다섯 지점

| 시점 | 동작 |
| --- | --- |
| 세션 시작 | 오늘 다룰 개념 카드 1장을 먼저 읽고 시작 |
| 문제 푸는 중 | 하단 "개념 보기" → `ConceptSheet`가 올라옴. 문제 화면 이탈 없음 |
| 막혔을 때 | 힌트 3단계 — ① 무슨 개념인지 ② 요점 한 줄 + 공식 틀 ③ 첫 단계 시연 |
| 틀린 직후 | 해당 요점 카드 자동 펼침 + 미쿠가 어긋난 지점을 지적 |
| 상시 | 검색 가능한 "요점 사전" (기존 `CoreNotes` 확장, 즐겨찾기 유지) |

## 문제 생성 엔진

### 생성 결과 타입

```ts
type Choice = {
  value: string;
  label: string;
  mistakeTag?: string;   // 이 오답이 나오는 전형적 실수
};

type GeneratedQuestion = {
  skillId: string;
  seed: number;
  level: 1 | 2 | 3;
  prompt: string;
  choices?: Choice[];         // 없으면 직접 입력형
  acceptableAnswers: string[];
  steps: string[];            // 자동 생성된 풀이 단계
  hints: [string, string, string];
};

type QuestionGenerator = (rng: Rng, level: 1 | 2 | 3) => GeneratedQuestion;
```

`steps`가 "설명이 어렵다"에 대한 답이다. 역방향 생성이므로 각 문제의 풀이 과정을 코드가 이미 알고 있다. 생성된 모든 문항이 예외 없이 단계별 해설을 갖는다.

### 오답 선지

랜덤한 값이 아니라 **전형적 실수의 결과**로 만든다. 부호를 놓쳤을 때 나오는 값, 이항하며 부호를 바꾸지 않았을 때 나오는 값 등이다. 각 선지에 `mistakeTag`를 달아 두면 오답이 "그냥 틀림"이 아니라 진단이 되고, 미쿠 대사가 여기에 연결된다.

### 스킬 목록 (총 35개)

**수학 15 — 파라미터 변형으로 사실상 무한 생성**

| skillId | 내용 |
| --- | --- |
| `ma-frac-arith` | 분수·소수 사칙연산 |
| `ma-ratio` | 비와 비율, 백분율 |
| `ma-exp-root` | 지수법칙, 제곱근 |
| `ma-poly-expand` | 다항식 전개 (곱셈공식) |
| `ma-factor` | 인수분해 |
| `ma-linear-eq` | 일차방정식 |
| `ma-simul-eq` | 연립일차방정식 |
| `ma-quad-eq` | 이차방정식 |
| `ma-inequality` | 일차부등식 |
| `ma-linear-fn` | 일차함수 |
| `ma-quad-fn` | 이차함수 |
| `ma-pythagoras` | 피타고라스 정리 |
| `ma-trig-ratio` | 삼각비 |
| `ma-counting` | 경우의 수 |
| `ma-probability` | 확률 |

**영어 10 — 단어 153개 + 문장 뱅크 약 120문장의 조합으로 수천 문항**

| skillId | 내용 |
| --- | --- |
| `en-vocab-meaning` | 단어 뜻 고르기 (오답은 같은 태그 단어에서 추출) |
| `en-vocab-blank` | 예문 빈칸 |
| `en-word-form` | 어형 변화 (품사 파생) |
| `en-sv-find` | 주어·동사 찾기 |
| `en-tense` | 시제 |
| `en-agreement` | 수일치 |
| `en-relative` | 관계사 |
| `en-verbal` | 준동사 (to부정사·동명사·분사) |
| `en-connector` | 연결어 |
| `en-word-order` | 어순 배열 |

**국어 10 — 지문 뱅크 약 80단락 기반, 수백 문항**

| skillId | 내용 |
| --- | --- |
| `ko-skeleton` | 주어·서술어 찾기 |
| `ko-modifier` | 수식 관계 |
| `ko-connector` | 접속어 추론 |
| `ko-structure` | 문단 구조 판별 (정의·비교·인과·문제해결·과정) |
| `ko-referent` | 지시어가 가리키는 것 |
| `ko-fact-opinion` | 사실·주장·추론 구별 |
| `ko-summary` | 문단 요약 고르기 |
| `ko-word-context` | 문맥상 어휘 의미 |
| `ko-sentence-order` | 문장 순서 배열 |
| `ko-poetry-device` | 표현법 판별 |

국어는 진짜 무한 생성이 불가능하다. 코드가 지문을 창작할 수 없기 때문이다. 짧은 지문 뱅크(3~5문장 단락 약 80개)를 집필하고, 생성기는 *어느 지문 × 어느 질문 유형 × 어떤 오답 조합*을 고른다. 지문을 추가하면 문항 수가 비례해 늘어나는 구조다.

### 난이도

모든 생성기가 `level: 1 | 2 | 3`을 받는다. 1은 작은 수·단문, 3은 수능 근접. 노베이스는 전 스킬 레벨 1에서 시작하고, 세션 편성기가 최근 정답률로 조정한다.

### 집필해야 하는 분량

| 항목 | 분량 |
| --- | --- |
| 수학 | 0 (전부 코드 생성) |
| 영어 문장 뱅크 | 약 120문장 (구조 태그 포함) |
| 국어 지문 뱅크 | 약 80단락 (3~5문장) |
| skill-map 연결표 | 35줄 (기존 자료 참조) |

## 복습 큐

단어와 스킬이 하나의 큐에 들어간다. id 접두사로 구분한다: `vocab:assume`, `skill:ma-factor`.

기존 `VocabTrainer.tsx` 안에 있는 SM-2 계열 로직을 `review-queue.ts`로 추출해 범용화한다. 진행도 타입은 기존 `VocabWordProgress`의 필드를 그대로 물려받는다.

```ts
type ReviewProgress = {
  status: "new" | "learning" | "review" | "completed";
  dueDate: string | null;
  lastReviewedAt: string | null;
  intervalDays: number;
  reviewCount: number;
  streak: number;
  favorite: boolean;
  ease: number;
  mastery: number;
};
```

`VocabWordProgress`는 `ReviewProgress`의 별칭으로 남겨 기존 코드가 그대로 동작하게 한다. `VocabTrainer`는 이 모듈을 사용하도록 리팩터링하며 그만큼 짧아진다.

### 평가 환산

단어는 지금처럼 사용자가 `again/hard/good/easy`를 직접 고른다. 문제 풀이는 그렇게 물으면 흐름이 끊기므로 행동에서 자동 환산한다.

| 상황 | 환산 |
| --- | --- |
| 정답 + 힌트 0 + 빠름 | `easy` |
| 정답 + 힌트 0 | `good` |
| 정답 + 힌트 사용 | `hard` |
| 오답 | `again` |

"빠름"의 기준은 스킬별 목표 시간의 60% 이내로 한다. 목표 시간은 `skill-map.ts`에 스킬당 하나씩 둔다.

### 오답노트

```ts
type WrongNote = {
  skillId: string;
  seed: number;
  level: 1 | 2 | 3;
  mistakeTag: string | null;   // 고른 오답의 태그
  at: string;                  // YYYY-MM-DD
};
```

한 건이 80바이트 남짓이므로 100건 링버퍼(약 8KB)로 둔다. 문제 전문을 저장하지 않고 시드로 재현하므로 **"똑같은 문제 다시 풀기"**(같은 시드)와 **"비슷한 문제 풀기"**(같은 스킬, 새 시드)가 모두 가능하다. 오답노트가 죽은 기록이 아니라 살아있는 문제집이 된다.

## 세션 편성

```ts
type SessionPlan = {
  date: string;
  goalMinutes: 3 | 10 | 20;
  steps: SessionStep[];
};

type SessionStep = { id: string } & (
  | { kind: "concept"; skillId: string }
  | { kind: "question"; skillId: string; seed: number; level: 1 | 2 | 3 }
  | { kind: "vocab"; wordIds: string[] }
);
```

`id`는 코스 안에서의 위치와 내용으로 결정론적으로 만든다(예: `q:ma-factor:81734`, `c:ko-connector`). `practice.doneStepIds`가 이 값을 참조하므로, 같은 날 새로고침해도 이미 푼 스텝이 완료 상태로 남는다.

| 코스 | 구성 |
| --- | --- |
| 3분 | 문제 3 |
| 10분 | 개념 1 + 문제 8 + 단어 5 |
| 20분 | 개념 2 + 문제 15 + 단어 10 |

선택 우선순위: **복습 예정(due) → 최근 오답 스킬 → 새 스킬(커리큘럼 순서) → 단어**.

**하루 시드**를 쓴다. 날짜 문자열을 해시해 시드로 삼으므로 새로고침해도 오늘의 코스는 동일하다. 매번 바뀌면 "다시 뽑기"를 반복하다 공부를 시작하지 않게 된다.

## 미쿠 반응

### 기분

`cheerful | encouraging | proud | worried | sleepy` 5종. 최근 7일 학습량, 오늘 정답률, 연속 학습일, 접속 시각으로 계산한다. 계산은 `miku-mood.ts`의 순수 함수로 두어 테스트 가능하게 한다.

### 이벤트

11종: `sessionStart`, `correct`, `correctStreak3`, `wrong`, `wrongTwice`, `hintUsed`, `levelUp`, `sessionComplete`, `comeback`(3일 이상 공백 후 복귀), `lateNight`, `dailyFirst`.

각 이벤트당 대사 5~8줄에 기분별 변형을 둔다. 직전에 사용한 줄은 다시 뽑지 않는다(`miku.lastLineId`로 추적).

`wrong` 이벤트에는 `mistakeTag`를 넘긴다. "아쉽다, 다시 해보자"가 아니라 "부호! 이항할 때 부호 바꾸는 거 놓쳤어"처럼 구체적으로 짚는다. 이것이 미쿠가 장식이 아니라 파트너로 느껴지는 지점이다.

### 톤

반말을 유지하되 이모지는 **문장당 1개 이하**로 줄인다. 현재 코드는 한 문장에 3개씩 쓰고 있어(`🎵 ... ✨ 💖`) 고등학생에게는 유치하게 읽힐 수 있다.

## 데이터와 마이그레이션

`schemaVersion` 2 → 3. `AppState`에 추가:

```ts
practice: {
  reviewById: Record<string, ReviewProgress>;   // vocab:* 와 skill:* 통합
  wrongNotes: WrongNote[];                      // 최대 100건
  skillLevels: Record<string, 1 | 2 | 3>;
  sessionDate: string;
  doneStepIds: string[];
};
miku: {
  lastLineId: string | null;
  lastSeenDate: string | null;
};
```

v2 → v3 마이그레이션은 `vocab.progressById[id]`를 `practice.reviewById["vocab:" + id]`로 옮기는 것이 전부다. 기존 단어 진도가 보존된다. 기존 v1 → v2 경로(`LEGACY_STORAGE_KEY`)는 그대로 유지한다.

저장 키는 `first-step-study-v2`를 계속 쓰고 내부 `schemaVersion`으로 구분한다. 새 키를 만들면 기존 데이터를 놓친다.

## 오류 처리

- 생성기에서 예외 발생 → 해당 문항만 건너뛰고 다음으로 진행. 세션 전체가 중단되지 않는다. 콘솔 경고만 남긴다.
- 저장 데이터에 등록되지 않은 `skillId` → 큐에서 조용히 제거한다.
- `skill-map`에 개념 자료가 연결되지 않은 스킬 → "개념 보기" 버튼을 숨긴다. 크래시하지 않는다.
- `localStorage` 파싱 실패 → 기존 `normalizeStoredState` 경로로 기본값 복구.

## 검증

현재 테스트는 `tests/rendered-html.test.mjs` 하나뿐이다. 생성기는 문항이 무한이라 사람이 눈으로 검수할 수 없으므로 불변식으로 검증한다.

**`tests/generators.test.mjs`** — 전 35스킬 × 레벨 3종 × 시드 0~200:

1. 예외가 발생하지 않는다
2. 정답이 선지 안에 정확히 하나 존재한다
3. 오답 선지에 중복이 없다
4. `steps`가 비어 있지 않다
5. 같은 시드는 항상 같은 문제를 낸다
6. `hints`가 3개이고 모두 비어 있지 않다

**수학 교차 검증** — 생성기와 독립된 검산 함수로 확인한다. 인수분해 결과를 다시 전개해 원식과 일치하는지, 방정식 해를 원식에 대입해 0이 되는지 등. 생성기가 틀린 답을 만들면 학습자가 그것을 정답으로 배우게 되므로 이 부분은 엄격히 한다.

**`tests/review-queue.test.mjs`** — SRS 간격 계산, due 판정, 평가 환산, v2 → v3 마이그레이션.

**`tests/session-planner.test.mjs`** — 같은 날짜는 같은 코스, 목표 시간별 스텝 수, 우선순위 적용.

**`tests/miku-mood.test.mjs`** — 입력 조합별 기분 계산, 직전 대사 회피.

기존 `npm run typecheck`, `npm run lint`, `npm test`를 모두 통과해야 한다.

## 화면 배치

탭은 늘리지 않는다 (오늘 / 국어 / 영어·단어 / 수학 / 기록).

| 위치 | 변경 |
| --- | --- |
| 오늘 | 미쿠 파트너 + 오늘의 코스 카드 → 바로 시작 |
| 국어·영어·수학 | 각 개념에 "이 개념 문제 풀기" 버튼 추가 |
| 기록 | 오답노트, 요점 사전 추가 |

## 성공 기준

1. 국·영·수 각 과목에서 같은 스킬을 연속 10문항 이상 새 문제로 풀 수 있다.
2. 모든 생성 문항이 단계별 풀이와 3단계 힌트를 갖는다.
3. 문제 풀이 화면을 벗어나지 않고 해당 개념의 요점을 볼 수 있다.
4. 틀린 문제가 오답노트에 쌓이고, 같은 문제 또는 비슷한 문제로 다시 풀 수 있다.
5. 오늘의 코스를 한 번의 탭으로 시작할 수 있고, 새로고침해도 코스가 바뀌지 않는다.
6. 미쿠가 오답 시 구체적인 실수 지점을 언급한다.
7. 기존 단어 진도와 학습 기록이 마이그레이션 후 보존된다.
8. `npm run typecheck`, `npm run lint`, `npm test`가 모두 통과한다.
