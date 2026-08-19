/**
 * 기초 개념 칸의 "자세한 강의" 부분.
 *
 * `FoundationCapsule`의 `beginnerExplanation`은 두 문장짜리 요약이다. 그것만으로는
 * 노베이스가 개념을 처음 배울 수 없다 — 이미 아는 사람에게 상기시키는 글이기 때문이다.
 * 이 타입은 그 자리를 메운다: 왜 배우는지부터 시작해, 아는 것에 빗대어 설명하고,
 * 한 문제를 끝까지 같이 풀고, 어디서 틀리는지 짚는다.
 *
 * **길이가 아니라 구조로 깊이를 만든다.** 1500자를 이어 붙이면 휴대폰에서는
 * 글벽이 되어 아무도 읽지 않는다. 제목이 붙은 덩어리로 나누면 같은 양도 읽힌다.
 */

export type LessonExample = {
  /** 풀어 볼 문제. 실제 시험에서 보는 모양이어야 한다. */
  question: string;
  /** 한 줄에 한 동작. 머릿속에서 일어나는 일을 순서대로 적는다. */
  steps: string[];
  answer: string;
};

export type LessonSection = {
  /** "왜 이걸 배우나요?"처럼 말을 거는 제목. 명사구보다 낫다. */
  heading: string;
  /** 3~6문장. 아는 것에서 출발해 모르는 것으로 간다. */
  body: string;
  example?: LessonExample;
};

export type FoundationLesson = {
  /** `FoundationCapsule.id`와 같아야 한다. */
  capsuleId: string;
  /** 칸을 열자마자 보이는 한 줄. "이걸 배우면 무엇을 할 수 있는가". */
  hook: string;
  sections: LessonSection[];
};
