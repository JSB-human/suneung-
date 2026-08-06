export type FoundationSubject = "korean" | "english" | "math";

export type FoundationCapsule = {
  id: string;
  subject: FoundationSubject;
  title: string;
  eyebrow: string;
  beginnerExplanation: string;
  keyPoints: [string, string, string];
  frame?: string;
  workedExample: {
    prompt: string;
    process: string;
    result: string;
  };
  commonTrap: string;
  quickCheck: {
    prompt: string;
    answer: string;
    explanation: string;
  };
  tags: string[];
  scopeNote?: string;
};

export const FOUNDATION_SUBJECT_META: Record<
  FoundationSubject,
  { label: string; shortDescription: string; startGuide: string }
> = {
  korean: {
    label: "국어",
    shortDescription: "문장을 정확히 읽고, 근거로 답을 고르는 힘",
    startGuide: "처음에는 정답률보다 ‘근거 한 줄 찾기’에 집중하면 충분해요.",
  },
  english: {
    label: "영어",
    shortDescription: "듣기 순서부터 문장 뼈대와 독해 논리까지",
    startGuide: "모든 단어를 번역하지 않아도 괜찮아요. 주어와 동사부터 잡아 봐요.",
  },
  math: {
    label: "수학",
    shortDescription: "중학 연산을 고1 개념으로, 다시 2028 수능으로 연결",
    startGuide: "공식을 외우기 전에 기호가 뜻하는 것을 말로 읽어 보면 훨씬 쉬워져요.",
  },
};

export const FOUNDATION_REFERENCE: FoundationCapsule[] = [
  {
    id: "ko-sentence-skeleton",
    subject: "korean",
    title: "긴 문장도 주어·서술어부터",
    eyebrow: "문장 읽기 1",
    beginnerExplanation:
      "국어 문장이 길어지는 까닭은 핵심 문장에 설명이 여러 겹 붙기 때문입니다. 먼저 ‘누가/무엇이 어찌하다·어떠하다’만 남기면 문장의 뼈대가 보입니다.",
    keyPoints: [
      "서술어를 먼저 찾고 ‘누가/무엇이?’라고 물어 주어를 찾습니다.",
      "관형어·부사어는 잠시 괄호로 묶어도 핵심 뜻이 남아야 합니다.",
      "한국어는 주어가 생략될 수 있으므로 앞 문장에서 대상을 보충합니다.",
    ],
    frame: "[주어]가/는 + (꾸며 주는 말) + [서술어]한다/이다",
    workedExample: {
      prompt: "‘오랜 연구 끝에 개발된 이 장치는 작은 진동도 감지한다.’의 뼈대는?",
      process: "서술어 ‘감지한다’를 찾고 ‘무엇이?’라고 묻습니다. ‘오랜 연구 끝에 개발된’은 장치를 꾸밉니다.",
      result: "이 장치는 작은 진동도 감지한다.",
    },
    commonTrap: "문장 맨 앞의 명사를 무조건 주어로 고르면 수식어 안의 명사에 속기 쉽습니다.",
    quickCheck: {
      prompt: "‘도시에 사는 사람들의 이동 방식이 빠르게 변했다.’의 주어와 서술어는?",
      answer: "주어: 이동 방식이 / 서술어: 변했다",
      explanation: "‘도시에 사는’은 사람들을, ‘사람들의’는 이동 방식을 꾸밉니다.",
    },
    tags: ["문장", "주어", "서술어", "독해", "기초"],
  },
  {
    id: "ko-fact-inference",
    subject: "korean",
    title: "사실·주장·추론 구별하기",
    eyebrow: "문장 읽기 2",
    beginnerExplanation:
      "지문에 직접 적힌 사실, 글쓴이가 옳다고 내세우는 주장, 여러 문장을 합쳐 얻는 추론은 다릅니다. 문제는 이 경계를 바꾸어 오답을 만듭니다.",
    keyPoints: [
      "사실은 지문에서 그대로 확인할 수 있고 참·거짓을 검증할 수 있습니다.",
      "주장은 ‘필요하다, 바람직하다’처럼 글쓴이의 판단이 들어갑니다.",
      "추론은 근거가 허용하는 범위까지만 가능하며 가능성을 확정으로 바꾸면 안 됩니다.",
    ],
    frame: "지문 문장(근거) → 말해도 되는 범위 → 선택지 판단",
    workedExample: {
      prompt: "‘비가 온 날 우산 판매가 늘었다.’에서 ‘비가 오면 항상 판매가 는다’고 말할 수 있을까?",
      process: "한 관찰 결과는 확인되지만 모든 경우를 뜻하는 ‘항상’의 근거는 없습니다.",
      result: "말할 수 없다. 관찰을 보편 법칙으로 확대했다.",
    },
    commonTrap: "‘일부’를 ‘모두’로, ‘가능하다’를 ‘반드시 그렇다’로 바꾼 선택지에 주의합니다.",
    quickCheck: {
      prompt: "‘A 지역의 세 학교에서 독서 시간이 늘었다.’로 ‘A 지역 모든 학생의 독서 시간이 늘었다’를 알 수 있을까?",
      answer: "알 수 없다",
      explanation: "세 학교의 결과를 지역 전체로 일반화할 근거가 부족합니다.",
    },
    tags: ["사실", "주장", "추론", "근거", "선택지"],
  },
  {
    id: "ko-nonfiction-structure",
    subject: "korean",
    title: "비문학 설명 구조 5가지",
    eyebrow: "독서",
    beginnerExplanation:
      "비문학은 낯선 내용을 무작정 나열하지 않습니다. 정의·분류, 비교·대조, 원인·결과, 문제·해결, 과정·원리 중 어떤 틀로 설명하는지 찾으면 내용이 정리됩니다.",
    keyPoints: [
      "‘A란 ~이다’는 정의, ‘A와 B는 달리’는 비교·대조 신호입니다.",
      "‘때문에/따라서’는 인과, ‘문제/방안’은 문제·해결을 연결합니다.",
      "과정 글은 단계의 순서와 각 단계에서 바뀌는 대상을 표시합니다.",
    ],
    frame: "문단 역할: 개념 소개 → 원리/관계 설명 → 사례·한계·의의",
    workedExample: {
      prompt: "‘기존 배터리는 무겁다. 반면 새 배터리는 가볍지만 가격이 높다.’의 구조는?",
      process: "‘반면’이 두 대상의 공통 기준(무게·가격)을 대비합니다.",
      result: "비교·대조 구조",
    },
    commonTrap: "사례의 재미있는 내용만 기억하고 그 사례가 설명한 원리나 기준을 놓치지 않습니다.",
    quickCheck: {
      prompt: "‘교통 체증이 심해졌다. 이를 줄이기 위해 버스 전용 차로를 늘렸다.’의 구조는?",
      answer: "문제·해결",
      explanation: "교통 체증이라는 문제와 전용 차로 확대라는 해결 방안이 짝을 이룹니다.",
    },
    tags: ["비문학", "독서", "정의", "비교", "인과", "구조"],
  },
  {
    id: "ko-reference-terms",
    subject: "korean",
    title: "낯선 용어와 지시어 추적",
    eyebrow: "독서",
    beginnerExplanation:
      "과학·경제 지문에서 용어를 이미 알고 있을 필요는 없습니다. 글이 제시한 정의, 조건, 예외를 짧게 다시 쓰고 ‘이것·그러한’이 가리키는 말을 바로 연결하면 됩니다.",
    keyPoints: [
      "새 용어 옆에 ‘뜻 / 조건 / 결과’를 세 칸으로 메모합니다.",
      "지시어는 보통 앞 문장의 핵심 명사나 사건을 가리킵니다.",
      "같은 단어라도 문맥에서 새롭게 정의되면 지문의 정의를 우선합니다.",
    ],
    frame: "용어 X = 무엇 / 언제 성립 / 성립하면 무엇이 달라짐",
    workedExample: {
      prompt: "‘임계점은 상태가 바뀌는 경계값이다. 이 값보다 온도가 높으면…’에서 ‘이 값’은?",
      process: "바로 앞에서 값으로 정의된 명사 ‘임계점’을 찾습니다.",
      result: "임계점(상태가 바뀌는 경계값)",
    },
    commonTrap: "배경지식으로 지문 정의를 고치려 하지 말고 시험에서는 제시된 정의를 기준으로 풉니다.",
    quickCheck: {
      prompt: "‘광합성률은 빛의 세기에 따라 변한다. 이러한 변화는…’에서 ‘이러한 변화’는?",
      answer: "빛의 세기에 따른 광합성률의 변화",
      explanation: "지시어만 읽지 말고 앞 문장의 관계 전체를 붙여 읽습니다.",
    },
    tags: ["용어", "지시어", "과학", "경제", "문맥"],
  },
  {
    id: "ko-poetry",
    subject: "korean",
    title: "시는 화자·상황·정서로",
    eyebrow: "문학 · 시",
    beginnerExplanation:
      "시는 ‘무슨 뜻인지 감으로 맞히는 글’이 아닙니다. 작품 속 말하는 이인 화자가 어떤 상황에서 무엇을 보고 어떤 태도를 보이는지 확인하면 해석의 중심이 잡힙니다.",
    keyPoints: [
      "화자와 실제 작가는 같다고 단정하지 않습니다.",
      "이미지는 눈·귀·촉감처럼 감각을 떠올리게 하는 표현입니다.",
      "반복·대조·비유는 정서나 태도를 강조하는 방식입니다.",
    ],
    frame: "화자 + 처한 상황 + 대상 + 정서 변화 + 표현 근거",
    workedExample: {
      prompt: "떠난 친구의 빈 의자를 반복해서 바라보는 화자의 정서는?",
      process: "부재한 대상 ‘친구’와 반복되는 행동 ‘바라본다’를 근거로 잡습니다.",
      result: "친구의 부재에 대한 그리움과 쓸쓸함",
    },
    commonTrap: "‘슬퍼 보인다’로 끝내지 말고 슬픔의 대상과 표현 근거를 함께 말합니다.",
    quickCheck: {
      prompt: "같은 구절을 세 번 반복했다면 가장 먼저 확인할 효과는?",
      answer: "화자의 정서나 의미를 강조하는 효과",
      explanation: "반복된 말의 내용이 무엇인지 확인해야 정확한 강조 대상을 찾을 수 있습니다.",
    },
    tags: ["문학", "시", "화자", "정서", "이미지", "표현법"],
  },
  {
    id: "ko-fiction",
    subject: "korean",
    title: "소설은 인물·사건·갈등",
    eyebrow: "문학 · 소설",
    beginnerExplanation:
      "소설은 인물이 원하는 것과 그것을 막는 힘이 부딪치며 진행됩니다. 인물의 말과 행동이 바뀌는 지점을 따라가면 성격과 주제를 근거 있게 설명할 수 있습니다.",
    keyPoints: [
      "인물의 성격은 해설뿐 아니라 말·행동·다른 인물의 반응으로 판단합니다.",
      "갈등은 인물 대 인물, 사회, 운명, 자기 내면으로 나눠 볼 수 있습니다.",
      "1인칭은 ‘나’의 경험만, 전지적 시점은 여러 인물의 내면까지 보여 줄 수 있습니다.",
    ],
    frame: "인물의 욕망 → 방해/갈등 → 선택 → 결과와 변화",
    workedExample: {
      prompt: "겁이 나지만 친구 대신 사실을 밝힌 인물의 변화는?",
      process: "처음의 두려움과 마지막 행동 ‘사실을 밝힘’을 대조합니다.",
      result: "두려움을 이기고 책임 있게 행동하는 인물로 성장했다.",
    },
    commonTrap: "독자가 아는 사실을 작품 속 인물도 안다고 착각하지 않습니다. 시점이 정보 범위를 제한합니다.",
    quickCheck: {
      prompt: "인물이 혼자 후회하면서도 결정을 못 하는 갈등은?",
      answer: "내적 갈등",
      explanation: "한 인물의 마음속에서 욕구나 가치가 충돌하는 경우입니다.",
    },
    tags: ["문학", "소설", "인물", "사건", "갈등", "시점"],
  },
  {
    id: "ko-drama-essay",
    subject: "korean",
    title: "극·수필을 읽는 다른 눈",
    eyebrow: "문학 · 갈래",
    beginnerExplanation:
      "극은 무대에서 보이는 행동과 대사로 사건을 전달하고, 수필은 글쓴이의 실제 경험과 생각을 비교적 자유롭게 펼칩니다. 갈래에 따라 정보를 주는 방식이 다릅니다.",
    keyPoints: [
      "희곡의 지시문은 인물의 표정·동작·무대 상황을 알려 줍니다.",
      "대사는 갈등과 인물 관계를 직접 드러냅니다.",
      "수필은 소재보다 경험을 통해 얻은 깨달음과 태도가 중심입니다.",
    ],
    frame: "극: 대사/행동 → 관계·갈등 | 수필: 경험 → 생각의 변화",
    workedExample: {
      prompt: "수필에서 낡은 운동화를 오래 묘사한 까닭을 어떻게 찾을까?",
      process: "운동화와 연결된 경험, 그 전후 글쓴이의 생각 변화를 찾습니다.",
      result: "운동화 자체보다 그것이 불러낸 기억과 깨달음이 중심이다.",
    },
    commonTrap: "극의 지시문을 인물이 실제로 말한 대사로 처리하지 않습니다.",
    quickCheck: {
      prompt: "희곡에서 ‘(고개를 숙이며)’는 무엇인가?",
      answer: "지시문",
      explanation: "배우의 동작과 말하는 방식을 안내하여 인물의 심리를 간접적으로 보여 줍니다.",
    },
    tags: ["희곡", "극", "수필", "갈래", "지시문", "대사"],
  },
  {
    id: "ko-grammar-levels",
    subject: "korean",
    title: "음운부터 문장까지 층위 잡기",
    eyebrow: "문법",
    beginnerExplanation:
      "문법 용어는 작은 단위가 큰 단위를 이루는 계단으로 보면 쉽습니다. 소리인 음운, 소리마디인 음절, 뜻을 가진 최소 단위인 형태소, 홀로 쓰일 수 있는 단위인 단어가 문장을 만듭니다.",
    keyPoints: [
      "음운은 뜻을 구별하는 가장 작은 소리 단위이고 음절은 한 번에 소리 나는 단위입니다.",
      "형태소는 뜻을 가진 최소 단위이며 실질/형식, 자립/의존으로 나눕니다.",
      "품사는 형태·기능·의미를 기준으로 명사, 동사, 형용사 등 아홉 갈래로 나눕니다.",
    ],
    frame: "음운 < 음절 / 형태소 ≤ 단어 < 구·절 < 문장",
    workedExample: {
      prompt: "‘먹었다’를 형태소로 나누면?",
      process: "뜻의 최소 단위로 ‘먹-’(내용), ‘-었-’(과거), ‘-다’(끝맺음)를 찾습니다.",
      result: "먹- / -었- / -다, 세 형태소",
    },
    commonTrap: "글자 수, 음절 수, 형태소 수는 서로 같지 않을 수 있습니다.",
    quickCheck: {
      prompt: "‘산’은 한 글자이다. 음절은 몇 개인가?",
      answer: "1음절",
      explanation: "한 번에 소리 나는 덩어리가 하나입니다. 음운은 ㅅ, ㅏ, ㄴ 세 개입니다.",
    },
    tags: ["문법", "음운", "음절", "형태소", "단어", "품사"],
  },
  {
    id: "ko-media-literacy",
    subject: "korean",
    title: "매체 자료는 출처·의도·편집",
    eyebrow: "매체",
    beginnerExplanation:
      "표, 영상, 카드 뉴스도 누군가 목적에 맞게 고른 정보입니다. 내용만 보지 말고 누가, 누구에게, 왜 만들었는지와 무엇이 빠졌는지를 살펴야 합니다.",
    keyPoints: [
      "제작자·발행일·원자료를 확인해 신뢰도를 판단합니다.",
      "축의 범위, 표본 크기, 잘린 이미지처럼 편집이 인상을 바꿀 수 있습니다.",
      "같은 주제를 다룬 두 자료의 목적과 대상 독자가 다르면 표현 방식도 달라집니다.",
    ],
    frame: "출처 → 목적 → 대상 → 표현 방식 → 빠진 정보",
    workedExample: {
      prompt: "그래프가 95에서 100까지만 보여 작은 차이를 매우 크게 보이게 했다면?",
      process: "세로축 시작점과 전체 범위를 확인합니다.",
      result: "축을 잘라 차이를 과장한 시각화일 수 있다.",
    },
    commonTrap: "사진과 숫자가 있다는 이유만으로 객관적이라고 믿지 않습니다.",
    quickCheck: {
      prompt: "건강 정보 카드 뉴스에서 가장 먼저 확인할 두 가지는?",
      answer: "제작자(출처)와 근거가 된 원자료",
      explanation: "누가 어떤 자료를 바탕으로 만들었는지 알아야 신뢰도를 판단할 수 있습니다.",
    },
    tags: ["매체", "미디어", "출처", "그래프", "신뢰도", "2028"],
  },
  {
    id: "ko-answer-evidence",
    subject: "korean",
    title: "선택지는 반드시 근거 한 줄",
    eyebrow: "문제 풀이",
    beginnerExplanation:
      "국어 문제는 ‘그럴듯함’을 고르는 시험이 아니라 지문과 작품이 허용한 내용을 고르는 시험입니다. 각 선택지 옆에 근거 위치를 대거나 틀린 단어를 표시합니다.",
    keyPoints: [
      "발문에서 ‘적절한/적절하지 않은’을 먼저 동그라미 칩니다.",
      "선택지를 주체·행동·정도·원인으로 쪼개 지문과 대조합니다.",
      "오답은 대상 바꾸기, 인과 뒤집기, 범위 확대, 정도 과장이 많습니다.",
    ],
    frame: "발문 확인 → 선택지 쪼개기 → 근거 위치 → 틀린 한 단어",
    workedExample: {
      prompt: "지문은 ‘가격이 오를 수 있다’인데 선택지는 ‘반드시 오른다’라고 했다.",
      process: "가능성을 나타내는 ‘수 있다’와 확정을 나타내는 ‘반드시’를 비교합니다.",
      result: "정도 과장으로 틀린 선택지",
    },
    commonTrap: "내 상식과 맞는 선택지라도 지문 근거가 없으면 정답으로 확정하지 않습니다.",
    quickCheck: {
      prompt: "지문 ‘일부 식물은 그늘에서 잘 자란다’와 선택지 ‘식물은 그늘에서 잘 자란다’의 차이는?",
      answer: "일부를 전체로 확대했다",
      explanation: "대상의 범위가 달라졌으므로 선택지는 지문과 일치하지 않습니다.",
    },
    tags: ["문제풀이", "선택지", "근거", "오답", "범위"],
  },
  {
    id: "en-listening-preview",
    subject: "english",
    title: "듣기 전 10초, 선택지로 예측",
    eyebrow: "듣기 1",
    beginnerExplanation:
      "영어 듣기는 소리가 나오기 전부터 시작합니다. 선택지의 사람·장소·숫자·행동을 훑으면 무엇을 들어야 하는지 미리 정할 수 있어 모든 문장을 번역할 필요가 없습니다.",
    keyPoints: [
      "그림과 선택지에서 서로 다른 부분만 표시합니다.",
      "질문이 목적, 장소, 관계, 숫자 중 무엇을 요구하는지 먼저 확인합니다.",
      "예측은 정답 확정이 아니라 들을 정보의 범위를 줄이는 과정입니다.",
    ],
    frame: "문항 유형 확인 → 선택지 차이 표시 → 핵심어 예상 → 들으며 검증",
    workedExample: {
      prompt: "선택지가 2시, 3시, 4시, 5시라면 무엇에 집중할까?",
      process: "숫자와 시간 표현, 일정이 바뀌는 말(but, instead)을 기다립니다.",
      result: "처음 나온 시간이 아니라 최종 확정 시간을 고른다.",
    },
    commonTrap: "대화 초반에 들린 숫자를 바로 고르면 뒤의 변경 내용을 놓칠 수 있습니다.",
    quickCheck: {
      prompt: "선택지가 모두 장소라면 듣기 전에 예상할 정보는?",
      answer: "장소를 알려 주는 사물·행동·직업 표현",
      explanation: "예: menu는 식당, prescription은 약국을 떠올리게 합니다.",
    },
    tags: ["영어듣기", "선택지", "예측", "숫자", "장소"],
  },
  {
    id: "en-listening-flow",
    subject: "english",
    title: "듣기 대화의 순서와 정정",
    eyebrow: "듣기 2",
    beginnerExplanation:
      "대부분의 짧은 대화는 상황 제시, 문제나 요청, 제안, 최종 결정 순서로 흐릅니다. 특히 상대가 처음 말을 고치는 표현을 들으면 정답 후보를 갱신해야 합니다.",
    keyPoints: [
      "who·where·why를 초반 두세 문장에서 잡습니다.",
      "but, actually, instead, then은 계획이 달라지는 신호입니다.",
      "마지막 제안에 대한 수락·거절 표현이 최종 행동을 결정합니다.",
    ],
    frame: "상황 → 문제/요청 → 제안 → 수락·거절 → 최종 행동",
    workedExample: {
      prompt: "‘Let’s meet at three. Actually, I have class then. How about four?’ 최종 시간은?",
      process: "three 뒤에 actually로 정정되고 four가 새 제안으로 나옵니다.",
      result: "4시(상대의 수락 여부까지 확인)",
    },
    commonTrap: "처음 들린 정보와 마지막으로 합의된 정보를 혼동하지 않습니다.",
    quickCheck: {
      prompt: "‘That sounds great.’는 제안에 대한 어떤 반응인가?",
      answer: "수락",
      explanation: "긍정 반응 뒤에 이어지는 행동이 최종 결정일 가능성이 큽니다.",
    },
    tags: ["영어듣기", "대화", "정정", "제안", "순서"],
  },
  {
    id: "en-vocabulary",
    subject: "english",
    title: "단어는 뜻 하나보다 문장 가족으로",
    eyebrow: "어휘",
    beginnerExplanation:
      "단어를 한국어 뜻 하나로만 외우면 문장에서 형태가 바뀔 때 알아보기 어렵습니다. 품사, 자주 붙는 말, 짧은 예문을 묶고 간격을 두고 다시 만나야 오래 기억됩니다.",
    keyPoints: [
      "단어 앞뒤를 보고 명사·동사·형용사·부사 중 품사를 확인합니다.",
      "decide–decision–decisive처럼 어근이 같은 단어 가족을 묶습니다.",
      "당일, 1일 뒤, 3일 뒤, 7일 뒤에 틀린 단어 중심으로 복습합니다.",
    ],
    frame: "단어 / 품사 / 핵심 뜻 / 짝 표현 / 내 예문",
    workedExample: {
      prompt: "‘She made a decision.’에서 decision은?",
      process: "관사 a 뒤, 동사 made의 목적어 자리이므로 명사입니다.",
      result: "decide(결정하다)의 명사형 decision(결정)",
    },
    commonTrap: "첫 번째 사전 뜻만 외우지 말고 실제 문장의 품사와 문맥 뜻을 확인합니다.",
    quickCheck: {
      prompt: "‘The plan is effective.’에서 effective의 품사는?",
      answer: "형용사",
      explanation: "be동사 is 뒤에서 주어 the plan의 상태를 설명합니다.",
    },
    tags: ["영단어", "어휘", "품사", "단어가족", "복습"],
  },
  {
    id: "en-sv-skeleton",
    subject: "english",
    title: "영어 문장 뼈대 S·V부터",
    eyebrow: "구문 1",
    beginnerExplanation:
      "영어는 주어(S)와 동사(V)가 문장의 중심입니다. 긴 꾸밈말을 괄호로 묶고 시제가 표시된 진짜 동사를 찾으면 목적어(O)와 보어(C)도 자연스럽게 보입니다.",
    keyPoints: [
      "조동사 뒤 동사, 시제·수 일치가 표시된 동사가 문장의 중심 후보입니다.",
      "목적어는 동작의 대상, 보어는 주어나 목적어의 정체·상태를 설명합니다.",
      "한 절에는 원칙적으로 중심 주어와 중심 동사가 한 쌍 있습니다.",
    ],
    frame: "S + V / S + V + O / S + V + C / S + V + O + O / S + V + O + C",
    workedExample: {
      prompt: "‘The small changes made the room bright.’의 뼈대는?",
      process: "The small changes=S, made=V, the room=O, bright=목적어 상태를 설명하는 C입니다.",
      result: "S+V+O+C: 작은 변화가 방을 밝게 만들었다.",
    },
    commonTrap: "-ing나 p.p. 형태를 모두 중심 동사로 보지 말고 조동사·시제 표시를 확인합니다.",
    quickCheck: {
      prompt: "‘The soup smells good.’에서 good의 역할은?",
      answer: "주격 보어(C)",
      explanation: "good은 목적어가 아니라 주어 the soup의 상태를 설명합니다.",
    },
    tags: ["구문", "주어", "동사", "목적어", "보어", "SVOC"],
  },
  {
    id: "en-modifiers",
    subject: "english",
    title: "전치사구·to부정사·동명사",
    eyebrow: "구문 2",
    beginnerExplanation:
      "전치사구와 준동사는 문장을 길게 만들지만 역할을 알면 덩어리로 읽을 수 있습니다. to+동사원형, 동사-ing가 문장 안에서 명사·형용사·부사 역할 중 무엇을 하는지 봅니다.",
    keyPoints: [
      "전치사+명사 덩어리는 보통 장소·시간·방법을 더하거나 명사를 꾸밉니다.",
      "to부정사는 ‘~하는 것/할/~하기 위해’로 문장 자리에 따라 해석합니다.",
      "동명사(-ing)는 명사처럼 주어·목적어·보어 자리에 올 수 있습니다.",
    ],
    frame: "자리 먼저 보기: 명사 자리 → 명사적 / 명사 뒤 → 형용사적 / 문장 꾸밈 → 부사적",
    workedExample: {
      prompt: "‘To read daily helps you.’에서 To read의 역할은?",
      process: "문장 맨 앞에서 동사 helps의 주어 자리를 차지합니다.",
      result: "명사적 용법: 매일 읽는 것은 너에게 도움이 된다.",
    },
    commonTrap: "to를 보면 무조건 ‘~하기 위해’로 해석하지 말고 문장 속 자리를 먼저 봅니다.",
    quickCheck: {
      prompt: "‘She enjoys reading.’에서 reading은?",
      answer: "동명사, enjoys의 목적어",
      explanation: "즐기는 대상 ‘읽는 것’을 나타내며 명사 자리에 있습니다.",
    },
    tags: ["전치사", "to부정사", "동명사", "준동사", "수식어"],
  },
  {
    id: "en-clauses",
    subject: "english",
    title: "접속사는 절과 절의 이음표",
    eyebrow: "구문 3",
    beginnerExplanation:
      "절은 주어와 동사를 갖춘 작은 문장입니다. 접속사는 두 절의 관계를 알려 주므로 원인, 대조, 조건, 시간 중 어떤 논리인지 표시하면 긴 문장도 나눠집니다.",
    keyPoints: [
      "because는 이유, although는 양보·대조, if는 조건, when은 시간을 이끕니다.",
      "that절은 ‘~라는 것’처럼 명사 자리에 들어갈 수 있습니다.",
      "접속사 뒤에는 원칙적으로 주어+동사가 이어지는지 확인합니다.",
    ],
    frame: "[주절 S+V] + 접속사 + [종속절 S+V]",
    workedExample: {
      prompt: "‘Although it was cold, we walked outside.’의 논리는?",
      process: "although는 예상과 반대되는 결과를 잇습니다.",
      result: "추웠지만 우리는 밖에서 걸었다(양보·대조).",
    },
    commonTrap: "because와 because of를 혼동하지 않습니다. because 뒤는 절, because of 뒤는 명사 덩어리입니다.",
    quickCheck: {
      prompt: "‘I know that he is honest.’에서 that절의 역할은?",
      answer: "know의 목적어인 명사절",
      explanation: "‘그가 정직하다는 것’을 안다는 뜻으로 목적어 자리를 채웁니다.",
    },
    tags: ["절", "접속사", "because", "although", "that절", "논리"],
  },
  {
    id: "en-participles",
    subject: "english",
    title: "분사는 능동 -ing, 수동 p.p.",
    eyebrow: "구문 4",
    beginnerExplanation:
      "분사는 동사에서 왔지만 문장에서는 주로 명사를 꾸미거나 상태를 설명합니다. 꾸밈을 받는 명사가 그 행동을 하면 -ing, 행동을 당하면 p.p.를 우선 생각합니다.",
    keyPoints: [
      "-ing는 진행·능동, p.p.는 완료·수동의 기본 느낌을 가집니다.",
      "분사구문은 시간·이유·조건·동시 상황을 짧게 줄인 표현입니다.",
      "분사구문의 의미상 주어는 특별한 표시가 없으면 주절 주어와 같습니다.",
    ],
    frame: "명사 — 행동의 주체면 -ing / 행동의 대상이면 p.p.",
    workedExample: {
      prompt: "‘the window broken by the ball’에서 broken인 까닭은?",
      process: "창문은 공이 깨뜨리는 주체가 아니라 깨진 대상입니다.",
      result: "수동 관계이므로 p.p. broken",
    },
    commonTrap: "사람이면 -ed, 사물이면 -ing처럼 외우지 말고 실제 능동·수동 관계를 판단합니다.",
    quickCheck: {
      prompt: "‘a barking dog’에서 barking을 쓰는 까닭은?",
      answer: "개가 짖는 행동의 주체이기 때문",
      explanation: "dog와 bark가 능동 관계라 -ing를 씁니다.",
    },
    tags: ["분사", "분사구문", "능동", "수동", "ing", "p.p."],
  },
  {
    id: "en-relatives",
    subject: "english",
    title: "관계사는 앞 명사를 다시 설명",
    eyebrow: "구문 5",
    beginnerExplanation:
      "관계사는 앞의 명사(선행사)를 뒤 절로 설명합니다. 뒤 절에서 빠진 자리가 있으면 관계대명사, 문장이 완전하고 장소·시간 같은 정보를 더하면 관계부사를 살펴봅니다.",
    keyPoints: [
      "who는 사람, which는 사물, that은 사람·사물 선행사에 쓰일 수 있습니다.",
      "관계대명사는 뒤 절에서 주어 또는 목적어 역할을 함께 합니다.",
      "where·when·why 뒤는 기본적으로 필요한 성분이 갖춰진 완전한 절입니다.",
    ],
    frame: "선행사 + 관계사 + (선행사를 한 칸 비운 설명절)",
    workedExample: {
      prompt: "‘the book that I bought’에서 that의 역할은?",
      process: "I bought 뒤에 목적어가 비어 있고 그 자리가 the book입니다.",
      result: "목적격 관계대명사 that",
    },
    commonTrap: "선행사가 장소라고 무조건 where를 쓰지 말고 뒤 절에 빠진 성분이 있는지 확인합니다.",
    quickCheck: {
      prompt: "‘the city where I live’에서 where 뒤 ‘I live’는 완전한가?",
      answer: "완전하다",
      explanation: "live는 여기서 목적어가 필요하지 않고 where가 ‘그 도시에서’라는 장소 정보를 더합니다.",
    },
    tags: ["관계사", "관계대명사", "관계부사", "선행사", "절"],
  },
  {
    id: "en-reading-logic",
    subject: "english",
    title: "독해는 연결어와 지시어 지도",
    eyebrow: "독해 1",
    beginnerExplanation:
      "독해는 모든 문장을 똑같이 번역하는 일이 아닙니다. however, therefore, for example 같은 연결어로 문장 관계를 표시하고 it, they, this가 가리키는 말을 찾으면 글의 방향이 보입니다.",
    keyPoints: [
      "however는 방향 전환, therefore는 결과, for example은 사례 신호입니다.",
      "this가 문장 전체를 가리키면 앞 내용을 짧은 명사구로 바꿔 봅니다.",
      "반복되는 핵심어와 같은 뜻으로 바꾼 표현이 글의 주제를 만듭니다.",
    ],
    frame: "주장/화제 → 설명·이유 → 반전/대조 → 사례 → 결론",
    workedExample: {
      prompt: "‘The tool is cheap. However, it is difficult to use.’의 중심 방향은?",
      process: "however 뒤가 앞의 장점을 뒤집는 핵심 평가입니다.",
      result: "도구는 저렴하지만 사용하기 어렵다는 한계가 강조된다.",
    },
    commonTrap: "예시의 세부 정보만 기억하고 예시가 뒷받침하는 앞 문장의 주장을 놓치지 않습니다.",
    quickCheck: {
      prompt: "therefore 뒤에는 보통 원인과 결과 중 무엇이 오는가?",
      answer: "결과",
      explanation: "앞의 이유나 상황을 받아 논리적 결과를 제시합니다.",
    },
    tags: ["독해", "연결어", "지시어", "주제", "논리"],
  },
  {
    id: "en-question-types",
    subject: "english",
    title: "독해 유형별 찾을 단서",
    eyebrow: "독해 2",
    beginnerExplanation:
      "주제·제목, 빈칸, 순서, 문장 삽입, 무관한 문장, 요약은 같은 글을 서로 다른 방식으로 묻습니다. 유형 이름보다 ‘어떤 관계를 확인해야 하는가’를 기억합니다.",
    keyPoints: [
      "주제·제목은 반복되는 대상과 글쓴이의 핵심 평가를 합칩니다.",
      "순서·삽입은 대명사, 연결어, 같은 명사의 반복으로 앞뒤를 잇습니다.",
      "빈칸은 빈칸 한 문장보다 앞뒤의 대조·인과와 글 전체 주제를 근거로 풉니다.",
    ],
    frame: "주제=대상+핵심말 / 순서=지시어+연결어 / 빈칸=논리+재진술",
    workedExample: {
      prompt: "새 문장이 ‘This solution…’으로 시작하면 어디에 놓일까?",
      process: "앞에서 solution이 가리킬 구체적인 해결책이 처음 소개된 위치를 찾습니다.",
      result: "해결책 소개 뒤가 유력하다.",
    },
    commonTrap: "선택지에 지문과 같은 단어가 많다는 이유만으로 고르지 말고 관계와 중심 뜻을 확인합니다.",
    quickCheck: {
      prompt: "무관한 문장을 찾을 때 가장 먼저 볼 것은?",
      answer: "문단의 반복 주제와 문장들의 공통 방향",
      explanation: "혼자 다른 대상이나 방향을 말하는 문장이 흐름을 끊습니다.",
    },
    tags: ["주제", "제목", "빈칸", "순서", "삽입", "요약"],
  },
  {
    id: "en-grammar-check",
    subject: "english",
    title: "어법은 자리·관계·일치 순서",
    eyebrow: "문법",
    beginnerExplanation:
      "어법 문제를 뜻만으로 풀면 비슷한 표현에 흔들립니다. 먼저 그 자리에 필요한 품사와 문장 성분을 보고, 능동·수동 관계와 주어·동사의 수 일치를 확인합니다.",
    keyPoints: [
      "관사 뒤·동사의 목적어 자리에는 명사, 명사 앞에는 보통 형용사가 필요합니다.",
      "주어의 중심 명사가 단수인지 복수인지 찾아 동사와 맞춥니다.",
      "and로 연결된 항목은 품사와 형태를 나란히 맞추는 평행 구조를 확인합니다.",
    ],
    frame: "빈자리 품사 → 문장 성분 → 능동/수동 → 수 일치 → 평행",
    workedExample: {
      prompt: "‘The list of items is long.’에서 is가 맞는 까닭은?",
      process: "of items는 list를 꾸미며 중심 주어 list는 단수입니다.",
      result: "단수 동사 is가 맞다.",
    },
    commonTrap: "동사 바로 앞의 복수 명사를 주어로 착각하지 말고 수식어를 걷어 냅니다.",
    quickCheck: {
      prompt: "‘She likes reading, swimming, and to run.’에서 어색한 부분은?",
      answer: "to run",
      explanation: "and로 연결된 reading, swimming과 형태를 맞춰 running이 자연스럽습니다.",
    },
    tags: ["어법", "문법", "수일치", "능동", "수동", "평행구조"],
  },
  {
    id: "ma-number-arithmetic",
    subject: "math",
    title: "부호·분수·지수 연산",
    eyebrow: "고1 필수 선수",
    beginnerExplanation:
      "고1 수학에서 막히는 많은 순간은 새 개념보다 부호와 분수 계산에서 시작합니다. 계산 순서와 등호를 한 줄씩 지키면 실수를 크게 줄일 수 있습니다.",
    keyPoints: [
      "괄호 → 거듭제곱 → 곱셈·나눗셈 → 덧셈·뺄셈 순서로 계산합니다.",
      "분수 덧셈은 공통분모를 만들고, 나눗셈은 역수를 곱합니다.",
      "음수의 제곱과 -a²를 구별합니다: (-a)²=a², -a²=-(a²).",
    ],
    frame: "a/b + c/d = (ad+bc)/bd,  a/b ÷ c/d = ad/bc (b,c,d≠0)",
    workedExample: {
      prompt: "-3² + (-3)²의 값은?",
      process: "-3²=-(3²)=-9, (-3)²=9로 괄호 범위를 따로 봅니다.",
      result: "-9+9=0",
    },
    commonTrap: "분수에서 분자와 분모에 덧셈이 섞여 있을 때 항 하나만 약분할 수 없습니다.",
    quickCheck: {
      prompt: "2/3 ÷ 4/5는?",
      answer: "5/6",
      explanation: "나누는 수 4/5의 역수 5/4를 곱해 10/12=5/6입니다.",
    },
    tags: ["연산", "부호", "분수", "지수", "중학복습"],
    scopeNote: "공통수학1·2 학습을 위한 고1 선수 개념입니다. 직접 출제 과목명은 아니지만 이후 대수·미적분Ⅰ·확률과 통계 계산의 바닥입니다.",
  },
  {
    id: "ma-expressions",
    subject: "math",
    title: "문자를 수처럼 다루는 식",
    eyebrow: "고1 필수 선수",
    beginnerExplanation:
      "문자는 아직 모르는 수 또는 변할 수 있는 수입니다. 같은 문자와 같은 차수를 가진 동류항끼리만 계수를 더하고, 분배법칙으로 괄호를 정확히 풉니다.",
    keyPoints: [
      "3x와 -2x는 동류항이지만 3x와 3x²은 동류항이 아닙니다.",
      "a(b+c)=ab+ac이며 괄호 앞 음수는 모든 항의 부호를 바꿉니다.",
      "식의 값은 문자를 주어진 수로 바꾼 뒤 괄호를 유지해 계산합니다.",
    ],
    frame: "axⁿ + bxⁿ = (a+b)xⁿ,  -(a-b)=-a+b",
    workedExample: {
      prompt: "2(x-3)-3(x+1)을 간단히 하면?",
      process: "2x-6-3x-3으로 모든 항에 분배한 뒤 동류항을 모읍니다.",
      result: "-x-9",
    },
    commonTrap: "-(x-2)를 -x-2로 풀지 않습니다. 정답은 -x+2입니다.",
    quickCheck: {
      prompt: "4x²-2x+3x²+x는?",
      answer: "7x²-x",
      explanation: "같은 차수끼리 4x²+3x², -2x+x를 각각 계산합니다.",
    },
    tags: ["다항식", "동류항", "분배법칙", "식", "문자"],
    scopeNote: "공통수학1의 다항식과 모든 고등 수학 식 변형에 필요한 선수 개념입니다.",
  },
  {
    id: "ma-identities-factoring",
    subject: "math",
    title: "곱셈공식과 인수분해는 왕복",
    eyebrow: "고1 핵심",
    beginnerExplanation:
      "곱셈공식은 괄호를 펼치는 규칙이고 인수분해는 펼쳐진 식을 곱의 꼴로 되돌리는 과정입니다. 두 방향을 함께 연습해야 식의 구조가 보입니다.",
    keyPoints: [
      "(a+b)²=a²+2ab+b², (a-b)²=a²-2ab+b²입니다.",
      "(a+b)(a-b)=a²-b²는 두 제곱의 차를 인수분해할 때도 씁니다.",
      "공통인수를 먼저 묶고 남은 식에 공식이 적용되는지 봅니다.",
    ],
    frame: "전개 ⇄ 인수분해: (x+p)(x+q) ⇄ x²+(p+q)x+pq",
    workedExample: {
      prompt: "x²+5x+6을 인수분해하면?",
      process: "합이 5이고 곱이 6인 두 수 2, 3을 찾습니다.",
      result: "(x+2)(x+3)",
    },
    commonTrap: "(a+b)²을 a²+b²로 쓰면 가운데 항 2ab를 빠뜨립니다.",
    quickCheck: {
      prompt: "9x²-25를 인수분해하면?",
      answer: "(3x-5)(3x+5)",
      explanation: "(3x)²-5²인 두 제곱의 차입니다.",
    },
    tags: ["곱셈공식", "인수분해", "다항식", "항등식"],
    scopeNote: "공통수학1 핵심이며, 2028 수능 범위인 대수와 미적분Ⅰ의 식 정리에서 반복해서 사용됩니다.",
  },
  {
    id: "ma-equations",
    subject: "math",
    title: "방정식은 양쪽 저울",
    eyebrow: "고1 핵심",
    beginnerExplanation:
      "방정식은 어떤 문자 값에서만 참인 등식입니다. 등호 양쪽에 같은 연산을 해도 균형이 유지된다는 원리로 해를 찾고, 마지막에 원래 식에 대입해 확인합니다.",
    keyPoints: [
      "항을 ‘넘기면 부호가 바뀐다’는 말은 양변에 같은 수를 더하거나 빼는 과정의 줄임말입니다.",
      "이차방정식은 인수분해, 완전제곱, 근의 공식으로 풉니다.",
      "분모·근호가 있는 방정식은 계산 전 정의되는 값의 조건을 확인합니다.",
    ],
    frame: "ax²+bx+c=0 → x=(-b±√(b²-4ac))/(2a), a≠0",
    workedExample: {
      prompt: "x²-5x+6=0의 해는?",
      process: "(x-2)(x-3)=0으로 인수분해하고 각 인수를 0으로 둡니다.",
      result: "x=2 또는 x=3",
    },
    commonTrap: "식의 양변을 문자식으로 나눌 때 그 문자식이 0인 경우를 잃을 수 있습니다.",
    quickCheck: {
      prompt: "2x+3=11의 해는?",
      answer: "x=4",
      explanation: "양변에서 3을 빼고 2로 나누면 x=4입니다.",
    },
    tags: ["방정식", "이차방정식", "근의공식", "해", "등식"],
    scopeNote: "공통수학1 핵심 선수 개념입니다. 이후 함수의 교점, 대수 방정식, 미적분 문제 해결의 계산 도구가 됩니다.",
  },
  {
    id: "ma-inequalities",
    subject: "math",
    title: "부등식은 범위와 방향",
    eyebrow: "고1 핵심",
    beginnerExplanation:
      "부등식의 해는 한 값이 아니라 조건을 만족하는 수의 범위입니다. 수직선에 표시하고 음수를 곱하거나 나눌 때 부등호 방향이 바뀌는 이유까지 이해합니다.",
    keyPoints: [
      "양변에 같은 수를 더하거나 빼면 부등호 방향은 유지됩니다.",
      "음수를 곱하거나 나누면 대소 관계가 뒤집혀 부등호 방향이 바뀝니다.",
      "연립부등식은 각 해를 수직선에 표시한 뒤 공통 부분을 찾습니다.",
    ],
    frame: "a<b에서 c<0이면 ac>bc,  해 집합은 수직선의 구간",
    workedExample: {
      prompt: "-2x<6을 풀면?",
      process: "양변을 -2로 나누며 부등호 방향을 바꿉니다.",
      result: "x>-3",
    },
    commonTrap: "음수로 나누고도 부등호를 그대로 두는 실수가 가장 흔합니다.",
    quickCheck: {
      prompt: "3x-1≥8을 풀면?",
      answer: "x≥3",
      explanation: "양변에 1을 더해 3x≥9, 양수 3으로 나누므로 방향은 유지됩니다.",
    },
    tags: ["부등식", "연립부등식", "수직선", "범위"],
    scopeNote: "공통수학1의 핵심 선수 개념이며 2028 수능에서 함수의 범위와 조건을 다룰 때 계속 쓰입니다.",
  },
  {
    id: "ma-functions-graphs",
    subject: "math",
    title: "함수는 입력과 출력의 약속",
    eyebrow: "고1→2028 연결",
    beginnerExplanation:
      "함수는 입력 x 하나에 출력 y 하나를 정하는 규칙입니다. 식, 표, 그래프는 같은 관계를 서로 다른 모습으로 표현하므로 세 표현을 오갈 수 있어야 합니다.",
    keyPoints: [
      "정의역은 넣을 수 있는 값, 치역은 실제로 나오는 값의 모음입니다.",
      "그래프 위 점 (a,b)는 f(a)=b라는 뜻입니다.",
      "그래프의 교점은 두 식을 동시에 만족하는 연립방정식의 해입니다.",
    ],
    frame: "y=f(x), 점 (a,b) 위 ⇔ b=f(a)",
    workedExample: {
      prompt: "f(x)=2x-1일 때 그래프가 지나는 점은?",
      process: "x=3을 넣으면 f(3)=6-1=5입니다.",
      result: "(3,5)",
    },
    commonTrap: "f(x)를 f와 x의 곱으로 보지 않습니다. x를 넣었을 때의 출력이라는 함수 기호입니다.",
    quickCheck: {
      prompt: "f(x)=x²에서 f(-2)는?",
      answer: "4",
      explanation: "x 전체를 -2로 바꿔 (-2)²=4입니다.",
    },
    tags: ["함수", "그래프", "정의역", "치역", "교점"],
    scopeNote: "공통수학2의 함수가 직접 토대입니다. 2028 수능 수학의 대수·미적분Ⅰ은 함수와 그래프 해석을 중심 도구로 사용합니다.",
  },
  {
    id: "ma-coordinate-geometry",
    subject: "math",
    title: "좌표로 도형을 식으로 바꾸기",
    eyebrow: "고1 핵심",
    beginnerExplanation:
      "좌표기하에서는 점과 선, 원을 숫자와 식으로 표현합니다. 그림을 정확히 그리고 공식의 각 문자가 어떤 길이·기울기·위치를 뜻하는지 연결합니다.",
    keyPoints: [
      "두 점 사이 거리는 피타고라스 정리로 구합니다.",
      "기울기는 x가 1만큼 변할 때 y가 얼마나 변하는지 나타냅니다.",
      "원 (x-a)²+(y-b)²=r²의 중심은 (a,b), 반지름은 r입니다.",
    ],
    frame: "거리=√((x₂-x₁)²+(y₂-y₁)²), 기울기=(y₂-y₁)/(x₂-x₁)",
    workedExample: {
      prompt: "(1,2)와 (4,6) 사이 거리는?",
      process: "x 차이는 3, y 차이는 4이므로 √(3²+4²)을 계산합니다.",
      result: "5",
    },
    commonTrap: "원의 식에서 (x+2)²의 중심 x좌표는 2가 아니라 -2입니다.",
    quickCheck: {
      prompt: "y=3x-2의 기울기는?",
      answer: "3",
      explanation: "y=mx+n에서 x의 계수 m이 직선의 기울기입니다.",
    },
    tags: ["도형의방정식", "좌표", "거리", "기울기", "원"],
    scopeNote: "공통수학2의 내용으로 고1 학교 시험의 핵심입니다. 2028 수능에서는 함수 그래프와 도형 해석을 위한 선수 도구로 연결됩니다.",
  },
  {
    id: "ma-sets-propositions",
    subject: "math",
    title: "집합과 명제는 조건의 언어",
    eyebrow: "고1 핵심",
    beginnerExplanation:
      "집합은 조건에 맞는 대상을 모은 것이고 명제는 참·거짓을 분명히 판단할 수 있는 문장입니다. 복잡한 조건을 그림과 논리로 정리하는 언어입니다.",
    keyPoints: [
      "합집합 A∪B는 둘 중 하나 이상, 교집합 A∩B는 둘 다 속하는 원소입니다.",
      "‘p이면 q’에서 p는 충분조건, q는 필요조건입니다.",
      "명제와 대우는 참·거짓이 같지만 역은 항상 같지 않습니다.",
    ],
    frame: "p→q의 대우는 ¬q→¬p,  n(A∪B)=n(A)+n(B)-n(A∩B)",
    workedExample: {
      prompt: "‘4의 배수이면 짝수이다’에서 충분조건은?",
      process: "p=4의 배수, q=짝수이고 p이면 q가 참입니다.",
      result: "‘4의 배수’는 ‘짝수’이기 위한 충분조건",
    },
    commonTrap: "p→q가 참이라고 q→p도 참이라고 생각하지 않습니다.",
    quickCheck: {
      prompt: "A={1,2,3}, B={3,4}일 때 A∩B는?",
      answer: "{3}",
      explanation: "두 집합에 모두 들어 있는 원소만 모읍니다.",
    },
    tags: ["집합", "명제", "필요조건", "충분조건", "대우"],
    scopeNote: "공통수학2 핵심 선수 개념입니다. 2028 수능의 조건 해석과 경우 분류에서 논리 언어로 계속 사용됩니다.",
  },
  {
    id: "ma-counting-probability",
    subject: "math",
    title: "경우의 수와 확률은 빠짐없이 세기",
    eyebrow: "고1→2028 연결",
    beginnerExplanation:
      "경우의 수는 가능한 결과를 중복이나 누락 없이 세는 방법입니다. 먼저 순서가 중요한지, 동시에 선택하는지, 같은 것이 있는지 말로 판단한 뒤 공식을 씁니다.",
    keyPoints: [
      "연달아 일어나는 선택은 곱의 법칙, 겹치지 않는 갈래는 합의 법칙을 씁니다.",
      "순열은 순서가 중요하고 조합은 뽑힌 구성만 중요합니다.",
      "각 결과가 같은 가능성을 가질 때 확률=원하는 경우/전체 경우입니다.",
    ],
    frame: "nPr=n!/(n-r)!,  nCr=n!/(r!(n-r)!),  P(A)=n(A)/n(S)",
    workedExample: {
      prompt: "5명 중 회장 1명과 부회장 1명을 뽑는 경우는?",
      process: "역할이 달라 순서가 중요합니다. 회장 5가지 뒤 부회장 4가지입니다.",
      result: "5×4=20가지",
    },
    commonTrap: "‘뽑는다’는 말만 보고 조합을 쓰지 말고 역할·순서가 다른지 확인합니다.",
    quickCheck: {
      prompt: "5명 중 대표 2명을 뽑는 경우는?",
      answer: "10가지",
      explanation: "역할 구분 없이 두 명의 구성만 중요하므로 5C2=10입니다.",
    },
    tags: ["경우의수", "순열", "조합", "확률", "곱의법칙"],
    scopeNote: "고1 경우의 수는 2028 수능 직접 범위인 확률과 통계의 출발점입니다. 지금은 공식 암기보다 세는 기준을 설명하는 연습이 우선입니다.",
  },
  {
    id: "ma-matrices",
    subject: "math",
    title: "행렬은 수를 표로 정리한 계산",
    eyebrow: "고1 공통수학",
    beginnerExplanation:
      "행렬은 수나 정보를 행과 열로 배열한 것입니다. 같은 위치끼리 더하고, 곱셈은 앞 행과 뒤 열을 짝지어 계산합니다.",
    keyPoints: [
      "m×n 행렬은 m개의 행과 n개의 열을 가집니다.",
      "덧셈은 크기가 같은 행렬에서 같은 위치의 원소끼리 합니다.",
      "AB가 가능하려면 A의 열 수와 B의 행 수가 같아야 하며 보통 AB≠BA입니다.",
    ],
    frame: "A(m×n)B(n×p)는 가능하고 결과는 m×p 행렬",
    workedExample: {
      prompt: "[1 2]와 세로 행렬 [3;4]의 곱은?",
      process: "앞 행과 뒤 열의 같은 자리끼리 곱해 더합니다: 1×3+2×4.",
      result: "11",
    },
    commonTrap: "행렬 곱셈을 같은 위치의 원소끼리 단순히 곱하는 계산으로 착각하지 않습니다.",
    quickCheck: {
      prompt: "2×3 행렬 A와 3×4 행렬 B의 AB 크기는?",
      answer: "2×4",
      explanation: "안쪽 크기 3이 같아 곱할 수 있고 바깥 크기 2×4가 결과가 됩니다.",
    },
    tags: ["행렬", "행", "열", "행렬곱", "공통수학"],
    scopeNote: "2022 개정 공통수학의 고1 학습 내용입니다. 2028 수능 수학의 직접 출제 과목(대수·미적분Ⅰ·확률과 통계)과 구분해 학교 기초와 표현 도구로 학습합니다.",
  },
];

export const getFoundationCapsules = (subject: FoundationSubject): FoundationCapsule[] =>
  FOUNDATION_REFERENCE.filter((capsule) => capsule.subject === subject);

export const FOUNDATION_CAPSULE_COUNTS: Record<FoundationSubject, number> = {
  korean: getFoundationCapsules("korean").length,
  english: getFoundationCapsules("english").length,
  math: getFoundationCapsules("math").length,
};
