import type { MikuMood } from "./miku-mood.ts";

/** 스펙이 정한 11종 이벤트. */
export type MikuEvent =
  | "sessionStart"
  | "correct"
  | "correctStreak3"
  | "wrong"
  | "wrongTwice"
  | "hintUsed"
  | "levelUp"
  | "sessionComplete"
  | "comeback"
  | "lateNight"
  | "dailyFirst";

export const MIKU_EVENTS: readonly MikuEvent[] = [
  "sessionStart",
  "correct",
  "correctStreak3",
  "wrong",
  "wrongTwice",
  "hintUsed",
  "levelUp",
  "sessionComplete",
  "comeback",
  "lateNight",
  "dailyFirst",
];

export type MikuLine = {
  id: string;
  text: string;
  /** 없으면 어떤 기분에서도 쓸 수 있는 대사다. */
  moods?: readonly MikuMood[];
};

/**
 * 이벤트마다 기분 없이 쓰는 공용 2줄 + 기분별 1줄씩 5줄 = 7줄을 둔다.
 * 어떤 기분에서도 후보가 3줄이므로 직전 대사를 빼도 고를 게 남는다.
 */
export const MIKU_LINES: Record<MikuEvent, readonly MikuLine[]> = {
  sessionStart: [
    { id: "start-open", text: "시작할 때가 제일 무겁지. 첫 문제만 열면 그다음은 쉬워." },
    { id: "start-one", text: "오늘 몇 개 풀지는 나중에 정하자. 일단 한 문제만." },
    { id: "start-cheerful", text: "좋아, 바로 시작하자. 나도 옆에서 같이 볼게.", moods: ["cheerful"] },
    { id: "start-encouraging", text: "어제 하던 데서 이어서 하면 돼. 처음부터 다시 안 해도 괜찮아.", moods: ["encouraging"] },
    { id: "start-proud", text: "요즘 페이스 좋아. 오늘도 그대로만 가면 돼.", moods: ["proud"] },
    { id: "start-worried", text: "오랜만이든 아니든 지금 앉은 게 중요해. 가벼운 것부터 꺼내 줄게.", moods: ["worried"] },
    { id: "start-sleepy", text: "이 시간엔 무리하지 말고 딱 세 문제만 하자.", moods: ["sleepy"] },
  ],
  correct: [
    { id: "correct-next", text: "맞았어. 다음 거." },
    { id: "correct-keep", text: "정확해. 방금 그 순서 그대로 유지해." },
    { id: "correct-cheerful", text: "좋아, 이 유형은 이제 손에 붙었네.", moods: ["cheerful"] },
    { id: "correct-encouraging", text: "맞았어. 어떻게 풀었는지 한 번만 되짚고 넘어가자.", moods: ["encouraging"] },
    { id: "correct-proud", text: "망설임 없이 갔네. 이 정도면 확실히 아는 거야.", moods: ["proud"] },
    { id: "correct-worried", text: "맞았어. 봐, 못 하는 거 아니잖아.", moods: ["worried"] },
    { id: "correct-sleepy", text: "졸린데도 계산은 정확하네.", moods: ["sleepy"] },
  ],
  correctStreak3: [
    { id: "streak-not-luck", text: "세 개 연속. 우연 아니야, 방법이 잡힌 거야." },
    { id: "streak-harder", text: "세 개 연속 맞았어. 이 유형은 다음에 더 어려운 걸로 줄게." },
    { id: "streak-cheerful", text: "세 개 연속 🎵 흐름 안 끊기게 바로 다음 문제.", moods: ["cheerful"] },
    { id: "streak-encouraging", text: "세 개 연속이야. 아까 헤매던 게 정리된 거지.", moods: ["encouraging"] },
    { id: "streak-proud", text: "세 개 연속. 이 유형은 이제 물어볼 게 없겠는데.", moods: ["proud"] },
    { id: "streak-worried", text: "세 개 연속 맞았어. 오늘 시작이 안 좋았을 뿐이야.", moods: ["worried"] },
    { id: "streak-sleepy", text: "세 개 연속. 이쯤에서 접어도 오늘 몫은 했어.", moods: ["sleepy"] },
  ],
  // mistakeTag가 있으면 아래 MISTAKE_LINES가 이긴다. 여기 줄들은 태그가 없을 때,
  // 즉 직접 입력형이거나 선지 밖의 답을 냈을 때만 쓴다.
  wrong: [
    { id: "wrong-split", text: "어디서 갈라졌는지 보자. 풀이 첫 줄부터 네 계산이랑 맞춰 봐." },
    { id: "wrong-now", text: "지금 틀린 게 다행이야. 어느 줄까지 맞았는지부터 찾자." },
    { id: "wrong-cheerful", text: "여기서 걸렸구나. 풀이 보고 바로 다시 가자.", moods: ["cheerful"] },
    { id: "wrong-encouraging", text: "답만 보지 말고 두 번째 줄을 봐. 거기서 갈리는 문제야.", moods: ["encouraging"] },
    { id: "wrong-proud", text: "이건 놓칠 만해. 대신 왜 그런지는 확인하고 가자.", moods: ["proud"] },
    { id: "wrong-worried", text: "천천히. 한 줄씩 같이 따라가 보자.", moods: ["worried"] },
    { id: "wrong-sleepy", text: "지금은 눈이 미끄러질 시간이야. 풀이만 읽고 넘어가도 돼.", moods: ["sleepy"] },
  ],
  wrongTwice: [
    { id: "twice-concept", text: "두 번 걸렸으면 문제가 아니라 개념 쪽이야. 요점부터 다시 보자." },
    { id: "twice-stop", text: "잠깐 멈추자. 같은 데서 두 번 미끄러졌어." },
    { id: "twice-cheerful", text: "두 번째네. 이번엔 힌트 열고 가자, 그것도 푸는 방법이야.", moods: ["cheerful"] },
    { id: "twice-encouraging", text: "두 번 틀린 건 네가 못해서가 아니라 아직 안 배워서야.", moods: ["encouraging"] },
    { id: "twice-proud", text: "여기만 유독 안 맞네. 약한 자리 하나 찾은 거야.", moods: ["proud"] },
    { id: "twice-worried", text: "두 번 연속이면 잠깐 쉬자. 물 한 잔 마시고 와.", moods: ["worried"] },
    { id: "twice-sleepy", text: "두 번 틀렸으면 오늘은 여기까지. 내일 맑은 머리로 보면 달라.", moods: ["sleepy"] },
  ],
  hintUsed: [
    { id: "hint-not-lose", text: "힌트 봤다고 진 거 아니야. 막힌 데를 정확히 아는 게 더 중요해." },
    { id: "hint-write", text: "힌트 읽었으면 이제 손으로 한 줄 써 봐." },
    { id: "hint-cheerful", text: "이 힌트면 충분할 거야. 나머지는 네가 해.", moods: ["cheerful"] },
    { id: "hint-encouraging", text: "혼자 끙끙대는 것보다 힌트 먼저 보는 게 빨라.", moods: ["encouraging"] },
    { id: "hint-proud", text: "힌트까지 왔네. 이 문제는 원래 좀 어려운 거야.", moods: ["proud"] },
    { id: "hint-worried", text: "힌트 다 봐도 괜찮아. 오늘은 이해만 하고 가자.", moods: ["worried"] },
    { id: "hint-sleepy", text: "이 시간엔 힌트 먼저 봐도 돼. 무리하지 말자.", moods: ["sleepy"] },
  ],
  levelUp: [
    { id: "level-harder", text: "레벨 올랐어. 문제도 같이 세질 거야." },
    { id: "level-stacked", text: "다음 단계야. 지금까지 푼 게 쌓인 결과야." },
    { id: "level-cheerful", text: "레벨 업 ✨ 이제 조금 더 긴 문제 줄게.", moods: ["cheerful"] },
    { id: "level-encouraging", text: "레벨 올랐어. 어려우면 다시 내려도 되니까 부담 갖지 마.", moods: ["encouraging"] },
    { id: "level-proud", text: "여기까지 온 사람 많지 않아. 다음 단계 열렸어.", moods: ["proud"] },
    { id: "level-worried", text: "레벨 올랐어. 조금씩이라도 앞으로 가고 있다는 뜻이야.", moods: ["worried"] },
    { id: "level-sleepy", text: "레벨 올랐네. 확인은 내일 해도 되니까 오늘은 자.", moods: ["sleepy"] },
  ],
  sessionComplete: [
    { id: "done-close", text: "오늘 몫 끝. 여기서 덮어도 돼." },
    { id: "done-remember", text: "끝냈어. 내일 이어서 할 자리는 내가 기억해 둘게." },
    { id: "done-cheerful", text: "오늘 깔끔했어. 이 페이스면 다음 주가 달라져.", moods: ["cheerful"] },
    { id: "done-encouraging", text: "다 했어. 많이 한 날보다 안 거른 날이 쌓이는 거야.", moods: ["encouraging"] },
    { id: "done-proud", text: "오늘 정답률 좋았어. 스스로 확인하고 가.", moods: ["proud"] },
    { id: "done-worried", text: "끝까지 앉아 있었네. 오늘은 그거면 충분해.", moods: ["worried"] },
    { id: "done-sleepy", text: "다 끝냈어. 이제 진짜 자자.", moods: ["sleepy"] },
  ],
  comeback: [
    { id: "back-no-question", text: "돌아왔네. 그동안 뭐 했는지는 안 물을게." },
    { id: "back-not-gone", text: "며칠 비었어도 배운 게 사라지진 않아. 가벼운 것부터 다시 켜자." },
    { id: "back-cheerful", text: "왔구나. 오늘은 감 되찾는 것만 하자.", moods: ["cheerful"] },
    { id: "back-encouraging", text: "쉬었다 다시 오는 게 제일 어려운데, 그걸 했어.", moods: ["encouraging"] },
    { id: "back-proud", text: "예전에 풀던 거 아직 기억나는지 볼까.", moods: ["proud"] },
    { id: "back-worried", text: "많이 비었지. 처음부터 다시 안 해도 되니까 걱정 마.", moods: ["worried"] },
    { id: "back-sleepy", text: "돌아온 첫날부터 밤샘은 하지 말자. 딱 몇 문제만.", moods: ["sleepy"] },
  ],
  lateNight: [
    { id: "night-short", text: "지금 시간에 앉아 있는 거 알아. 대신 짧게 가자." },
    { id: "night-review", text: "졸리면 새 개념 말고 아까 틀린 것만 다시 보는 게 나아." },
    { id: "night-cheerful", text: "늦었는데 기분은 좋아 보이네. 세 문제만 하고 끄자.", moods: ["cheerful"] },
    { id: "night-encouraging", text: "이 시간에 푼 건 내일 잘 안 남아. 그래도 온 건 인정.", moods: ["encouraging"] },
    { id: "night-proud", text: "이 시간까지 하는 날이 며칠째지. 무리는 하지 마.", moods: ["proud"] },
    { id: "night-worried", text: "안 자고 뭐 해. 오늘 못 한 건 내일 해도 돼.", moods: ["worried"] },
    { id: "night-sleepy", text: "나도 졸려. 마지막 한 문제만 같이 하고 자자.", moods: ["sleepy"] },
  ],
  dailyFirst: [
    { id: "first-picked", text: "오늘 첫 접속이야. 뭐부터 할지는 내가 골라 놨어." },
    { id: "first-review", text: "오늘 시작. 어제 틀린 것 몇 개가 복습으로 올라와 있어." },
    { id: "first-cheerful", text: "오늘도 왔네. 바로 시작하자.", moods: ["cheerful"] },
    { id: "first-encouraging", text: "오늘 처음이야. 3분짜리부터 열어 둘게.", moods: ["encouraging"] },
    { id: "first-proud", text: "연속 기록 이어지는 중. 오늘 것만 하면 돼.", moods: ["proud"] },
    { id: "first-worried", text: "오늘 처음 왔어. 어제 못 한 건 신경 쓰지 말고 오늘 것만.", moods: ["worried"] },
    { id: "first-sleepy", text: "오늘 첫 접속이 이 시간이네. 짧게 하고 자자.", moods: ["sleepy"] },
  ],
};

/**
 * 이 표가 이 기능의 전부다. 생성기의 오답 선지에 붙은 태그 하나가
 * "무엇을 어떻게 틀렸는지" 한 줄로 돌아온다. 태그가 뜻하는 실수는
 * `app/practice/generators/math.ts`의 오답 선지 계산식에서 왔다.
 */
export const MISTAKE_LINES: Record<string, string> = {
  // 일차방정식 — 이항, 나눗셈, 부호
  "sign-transpose": "이항할 때 부호! 왼쪽에서 더하던 수는 오른쪽으로 넘어가면 빼야 해.",
  "no-divide": "이항까지는 맞았어. 마지막에 x 앞의 계수로 양변을 나누는 걸 빼먹었네.",
  "sign-flip": "답의 부호가 통째로 반대야. 나누는 과정에서 음수 하나를 흘렸어.",
  "off-by-one": "딱 1 차이야. 방법은 맞으니까 계산 한 줄만 다시 짚어 보자.",

  // 곱셈공식 전개 — 가운데 항이 제일 잘 빠진다
  "missing-cross": "가운데 x항이 빠졌어. 바깥끼리, 안쪽끼리 곱한 것도 더해야 해.",
  "constant-sign": "상수항 부호가 반대야. 음수끼리 곱하면 양수가 되는 걸 확인해 봐.",
  "middle-sign": "x항의 부호가 뒤집혔어. 두 곱을 더할 때 부호를 그대로 가져와야 해.",
  "cross-add-only": "가운데 항에서 상수만 더했어. x 앞의 계수까지 같이 곱해야 해.",
  "square-confusion": "완전제곱식으로 착각했어. 이건 서로 다른 두 괄호라 그 공식이 안 맞아.",
  "constant-add": "상수항은 더하는 게 아니라 곱하는 거야. 뒤의 두 수를 곱해 봐.",

  // 인수분해 — 곱과 합 두 조건을 동시에
  "both-signs": "두 괄호의 부호가 모두 반대야. 전개해 보면 상수항 부호가 안 맞을 거야.",
  "one-sign": "한쪽 괄호의 부호만 어긋났어. 두 수를 곱해서 상수항이 나오는지 확인해 봐.",
  "sum-only": "더해서는 맞는데 곱하면 상수항이 안 나와. 두 조건을 동시에 만족해야 해.",

  // 이차방정식 — 인수와 해의 부호가 반대
  "root-sign": "해의 부호가 통째로 반대야. (x-2)(x-3)=0의 해는 x=2, x=3이 되지.",
  "one-root-sign": "두 해 중 하나만 부호가 어긋났어. 각 괄호를 0으로 놓고 다시 풀어 봐.",
  "factor-pair": "찾은 두 수가 살짝 어긋났어. 곱해서 상수항이 되는 짝인지 먼저 확인해.",

  // 분수 계산
  "denominator-shortcut": "분모끼리 더하면 안 돼. 통분부터 하고 분자만 계산하는 거야.",
  sign: "결과의 부호가 반대야. 어느 쪽 분자가 더 큰지부터 다시 봐.",
  "cross-error": "통분하는 과정에서 어긋났어. 분자에 곱한 수를 하나씩 다시 써 보자.",
  "not-reduced": "계산은 맞는데 약분이 남았어. 분자와 분모를 같은 수로 나눌 수 있어.",

  // 선지를 채우려고 만든 근접값
  "near-miss": "답 바로 옆까지 갔어. 마지막 한 줄만 다시 계산해 보자.",
};

export function getMistakeLine(tag: string | null | undefined): string | null {
  if (!tag) {
    return null;
  }
  return Object.prototype.hasOwnProperty.call(MISTAKE_LINES, tag)
    ? MISTAKE_LINES[tag]
    : null;
}

export type MikuPickInput = {
  event: MikuEvent;
  mood: MikuMood;
  /** 직전에 쓴 대사 id. 후보가 남아 있으면 이 줄은 다시 뽑지 않는다. */
  previousLineId?: string | null;
  /** 같은 시드는 항상 같은 대사를 낸다. */
  seed: number;
  /** `wrong` 이벤트에서만 쓴다. */
  mistakeTag?: string | null;
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * 대사 하나를 고른다. 순수 함수이므로 렌더 중에 불러도 안전하다.
 *
 * `wrong` + 아는 `mistakeTag`이면 전용 진단 줄이 무조건 이긴다.
 * 여기서 무작위를 섞으면 "무엇을 틀렸는지"가 흐려진다.
 */
export function pickMikuLine(input: MikuPickInput): MikuLine {
  if (input.event === "wrong") {
    const diagnosis = getMistakeLine(input.mistakeTag);
    if (diagnosis) {
      return { id: `wrong-tag:${input.mistakeTag}`, text: diagnosis };
    }
  }

  const bank = MIKU_LINES[input.event] ?? MIKU_LINES.sessionStart;
  const byMood = bank.filter((line) => !line.moods || line.moods.includes(input.mood));
  const pool = byMood.length > 0 ? byMood : bank;
  const withoutPrevious = pool.filter((line) => line.id !== input.previousLineId);
  const candidates = withoutPrevious.length > 0 ? withoutPrevious : pool;

  const seed = Number.isFinite(input.seed) ? Math.floor(input.seed) : 0;
  const index = hashSeed(`${input.event}:${input.mood}:${seed}`) % candidates.length;
  return candidates[index];
}

/**
 * 서버 렌더와 첫 페인트에서 쓰는 고정 대사. 저장된 기록을 읽기 전에는
 * 기분도 시각도 모르므로 무작위를 쓰면 하이드레이션이 어긋난다.
 */
export function getDefaultMikuLine(): MikuLine {
  return MIKU_LINES.sessionStart[0];
}
