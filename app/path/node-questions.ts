import type { NodeQuestion } from "./types.ts";

// 칸마다 확인 문제 3개를 채우기 위해 새로 집필한 고정 문항.
// 원본 콘텐츠(FOUNDATION_REFERENCE의 quickCheck, 커리큘럼 개념의 selfCheckQuestion)는
// 칸당 1문항뿐이므로 여기서 2문항씩 보탠다. 키는 path-nodes.ts의 노드 id다.
//
// 집필 원칙
// - 그 칸이 방금 가르친 것만 묻는다. 옆 단원 지식은 묻지 않는다.
// - 오답 선지는 특정 오해를 가진 학습자가 실제로 고를 만한 것으로 쓴다.
// - 해설은 왜 그 답이 맞는지를 한두 문장으로 말한다.
export const NODE_QUESTIONS: Record<string, NodeQuestion[]> = {
  // ── 국어 캡슐 ──────────────────────────────────────────────
  "capsule:ko-sentence-skeleton": [
    {
      id: "ko-sentence-skeleton-x1",
      prompt: "‘지난주에 새로 문을 연 도서관이 학생들에게 큰 인기를 끌었다.’의 뼈대는 무엇인가요?",
      choices: [
        { value: "library-popular", label: "도서관이 인기를 끌었다" },
        { value: "lastweek-open", label: "지난주가 문을 열었다" },
        { value: "students-popular", label: "학생들이 인기를 끌었다" },
        { value: "library-open", label: "도서관이 문을 열었다" },
      ],
      answer: "library-popular",
      explanation:
        "서술어 ‘끌었다’를 먼저 찾고 ‘무엇이?’라고 물으면 주어는 ‘도서관이’입니다. ‘지난주에 새로 문을 연’은 도서관을 꾸미는 말이라 뼈대에서 빠집니다.",
    },
    {
      id: "ko-sentence-skeleton-x2",
      prompt: "‘어제 산 두꺼운 책이 생각보다 무겁다.’에서 잠시 괄호로 묶어도 뜻이 남는 부분은 어디인가요?",
      choices: [
        { value: "modifiers", label: "어제 산 두꺼운" },
        { value: "subject", label: "책이" },
        { value: "predicate", label: "무겁다" },
        { value: "core", label: "책이 무겁다" },
      ],
      answer: "modifiers",
      explanation:
        "‘어제 산 두꺼운’은 책을 꾸미는 관형어라 묶어도 ‘책이 무겁다’라는 뼈대가 그대로 남습니다. 주어와 서술어를 묶으면 문장이 사라집니다.",
    },
  ],

  "capsule:ko-fact-inference": [
    {
      id: "ko-fact-inference-x1",
      prompt: "‘청소년의 수면 시간을 지금보다 늘릴 필요가 있다.’는 어디에 해당하나요?",
      choices: [
        { value: "claim", label: "주장 — 글쓴이의 판단이 들어 있다" },
        { value: "fact", label: "사실 — 지문에서 참·거짓을 확인할 수 있다" },
        { value: "example", label: "사례 — 구체적인 경우를 든 것이다" },
        { value: "data", label: "자료 — 조사한 수치를 그대로 옮긴 것이다" },
      ],
      answer: "claim",
      explanation:
        "‘필요가 있다’는 관찰이 아니라 글쓴이가 옳다고 내세우는 판단입니다. 사실이라면 참·거짓을 확인할 수 있어야 합니다.",
    },
    {
      id: "ko-fact-inference-x2",
      prompt: "지문에 ‘이 약은 일부 환자에게 효과가 있었다’라고만 적혀 있습니다. 지문이 허용하는 말은 무엇인가요?",
      choices: [
        { value: "some-worked", label: "효과를 본 환자가 있었다" },
        { value: "all-work", label: "이 약은 모든 환자에게 효과가 있다" },
        { value: "always", label: "이 약은 반드시 효과를 낸다" },
        { value: "none", label: "이 약은 어떤 환자에게도 효과가 없다" },
      ],
      answer: "some-worked",
      explanation:
        "‘일부’라는 범위 안에서만 말할 수 있습니다. ‘모든’이나 ‘반드시’로 바꾸면 근거가 허용한 범위를 넘습니다.",
    },
  ],

  "capsule:ko-nonfiction-structure": [
    {
      id: "ko-nonfiction-structure-x1",
      prompt: "‘고래는 포유류에 속한다. 포유류란 새끼에게 젖을 먹이는 동물이다.’의 설명 구조는 무엇인가요?",
      choices: [
        { value: "definition", label: "정의·분류" },
        { value: "contrast", label: "비교·대조" },
        { value: "cause", label: "원인·결과" },
        { value: "process", label: "과정·원리" },
      ],
      answer: "definition",
      explanation:
        "‘A는 B에 속한다’로 갈래를 나누고 ‘B란 ~이다’로 뜻을 정해 주고 있습니다. 두 대상을 견주지도, 순서를 밟지도 않습니다.",
    },
    {
      id: "ko-nonfiction-structure-x2",
      prompt: "‘도시의 인구가 빠르게 늘면서 주택 부족이 심해졌다.’의 설명 구조는 무엇인가요?",
      choices: [
        { value: "cause", label: "원인·결과" },
        { value: "problem", label: "문제·해결" },
        { value: "contrast", label: "비교·대조" },
        { value: "definition", label: "정의·분류" },
      ],
      answer: "cause",
      explanation:
        "인구 증가가 원인, 주택 부족이 결과로 이어져 있습니다. 주택 부족이 문제처럼 보여도 해결 방안이 나오지 않았으므로 문제·해결은 아닙니다.",
    },
  ],

  "capsule:ko-reference-terms": [
    {
      id: "ko-reference-terms-x1",
      prompt: "‘도시는 주변보다 기온이 높아지는 열섬 현상을 겪는다. 이 현상은 밤에도 기온을 잘 내려가지 못하게 한다.’에서 ‘이 현상’이 가리키는 것은?",
      choices: [
        { value: "heat-island", label: "도시의 기온이 주변보다 높아지는 열섬 현상" },
        { value: "night-drop", label: "밤에 기온이 내려가는 일" },
        { value: "city", label: "도시" },
        { value: "temperature", label: "기온" },
      ],
      answer: "heat-island",
      explanation:
        "지시어는 앞 문장의 핵심 명사만이 아니라 그 명사가 맺은 관계까지 붙여 읽어야 합니다. 앞 문장이 정의한 것은 ‘기온이 높아지는 열섬 현상’입니다.",
    },
    {
      id: "ko-reference-terms-x2",
      prompt: "지문이 ‘균형’을 ‘두 힘의 크기가 같은 상태’라고 정의했는데, 내가 알던 뜻과 다릅니다. 어떻게 풀어야 하나요?",
      choices: [
        { value: "passage", label: "지문이 준 정의를 기준으로 푼다" },
        { value: "dictionary", label: "사전에 실린 뜻을 기준으로 푼다" },
        { value: "background", label: "평소 알던 배경지식을 기준으로 푼다" },
        { value: "skip", label: "정의가 헷갈리므로 그 문단은 건너뛴다" },
      ],
      answer: "passage",
      explanation:
        "시험에서 판단 기준은 지문이 세운 정의입니다. 같은 단어라도 글이 새로 정의하면 그 정의가 우선합니다.",
    },
  ],

  "capsule:ko-poetry": [
    {
      id: "ko-poetry-x1",
      prompt: "시에 ‘나는 열두 살 소녀였다’라는 구절이 있습니다. 여기서 알 수 있는 것은 무엇인가요?",
      choices: [
        { value: "persona", label: "화자가 소녀로 설정되어 있다" },
        { value: "author-gender", label: "작가가 여성이라는 사실" },
        { value: "author-child", label: "작가가 실제로 겪은 열두 살의 일" },
        { value: "written-year", label: "시가 쓰인 연도" },
      ],
      answer: "persona",
      explanation:
        "작품 속에서 말하는 이는 화자이고, 화자와 작가를 같다고 단정할 수 없습니다. 시가 알려 주는 것은 화자의 설정까지입니다.",
    },
    {
      id: "ko-poetry-x2",
      prompt: "‘돌아오지 않는 배를 하루 종일 바라본다’라는 구절에서 화자의 정서를 가장 잘 설명한 것은?",
      choices: [
        { value: "longing", label: "돌아오지 않는 배를 향한 기다림과 그리움" },
        { value: "sea-love", label: "바다를 좋아하는 마음" },
        { value: "ship-wish", label: "배를 직접 만들고 싶은 소망" },
        { value: "biography", label: "작가가 어부였다는 사실" },
      ],
      answer: "longing",
      explanation:
        "정서는 대상과 근거를 함께 말해야 합니다. 대상은 ‘돌아오지 않는 배’이고, ‘하루 종일 바라본다’는 행동이 기다림의 근거가 됩니다.",
    },
  ],

  "capsule:ko-fiction": [
    {
      id: "ko-fiction-x1",
      prompt: "‘그는 사실을 밝혀야 한다고 생각하면서도 불이익이 두려워 끝내 망설였다.’에 나타난 갈등은?",
      choices: [
        { value: "internal", label: "내적 갈등 — 한 인물의 마음속 충돌" },
        { value: "society", label: "인물과 사회의 갈등" },
        { value: "person", label: "인물과 인물의 갈등" },
        { value: "fate", label: "인물과 운명의 갈등" },
      ],
      answer: "internal",
      explanation:
        "부딪치는 두 마음이 모두 한 인물 안에 있습니다. 불이익이라는 바깥 사정이 언급되지만 장면에서 충돌하는 곳은 인물의 마음속입니다.",
    },
    {
      id: "ko-fiction-x2",
      prompt: "‘나는 그가 무슨 생각을 하는지 끝내 알 수 없었다.’라는 서술에서 알 수 있는 것은?",
      choices: [
        { value: "first-person", label: "‘나’가 보고 겪은 것만 전달하는 1인칭 시점이다" },
        { value: "omniscient", label: "서술자가 모든 인물의 속마음을 아는 전지적 시점이다" },
        { value: "he-narrator", label: "‘그’가 이야기를 전하는 서술자다" },
        { value: "unknowable", label: "시점은 이 문장만으로 전혀 알 수 없다" },
      ],
      answer: "first-person",
      explanation:
        "서술자가 자신을 ‘나’라 부르고, 다른 인물의 속마음은 모른다고 말합니다. 시점이 전달할 수 있는 정보의 범위를 이렇게 제한합니다.",
    },
  ],

  "capsule:ko-drama-essay": [
    {
      id: "ko-drama-essay-x1",
      prompt: "‘영수: (창밖을 보며) 벌써 겨울이네.’에서 지시문에 해당하는 부분은?",
      choices: [
        { value: "stage", label: "(창밖을 보며)" },
        { value: "line", label: "벌써 겨울이네." },
        { value: "name", label: "영수" },
        { value: "all", label: "문장 전체" },
      ],
      answer: "stage",
      explanation:
        "괄호 안은 배우의 동작과 말하는 방식을 알려 주는 지시문입니다. 인물이 소리 내어 하는 말은 ‘벌써 겨울이네.’뿐입니다.",
    },
    {
      id: "ko-drama-essay-x2",
      prompt: "수필에서 글쓴이가 낡은 손수건을 길게 묘사했습니다. 무엇을 중심으로 읽어야 하나요?",
      choices: [
        { value: "insight", label: "손수건이 불러낸 경험과 거기서 얻은 깨달음" },
        { value: "object", label: "손수건의 재질과 값" },
        { value: "plot", label: "손수건을 둘러싼 인물들의 갈등" },
        { value: "rhythm", label: "묘사에 쓰인 문장의 운율" },
      ],
      answer: "insight",
      explanation:
        "수필의 중심은 소재 자체가 아니라 경험을 통해 글쓴이의 생각이 어떻게 달라졌는가입니다. 소재는 그 생각을 불러내는 통로입니다.",
    },
  ],

  "capsule:ko-grammar-levels": [
    {
      id: "ko-grammar-levels-x1",
      prompt: "‘밥’의 음운은 몇 개인가요?",
      choices: [
        { value: "three", label: "3개" },
        { value: "one", label: "1개" },
        { value: "two", label: "2개" },
        { value: "four", label: "4개" },
      ],
      answer: "three",
      explanation:
        "음운은 뜻을 구별하는 가장 작은 소리 단위여서 ㅂ, ㅏ, ㅂ 세 개입니다. 글자 수 1개, 음절 수 1개와는 다릅니다.",
    },
    {
      id: "ko-grammar-levels-x2",
      prompt: "‘읽었다’를 형태소로 바르게 나눈 것은?",
      choices: [
        { value: "three-parts", label: "읽- / -었- / -다" },
        { value: "two-a", label: "읽- / -었다" },
        { value: "two-b", label: "읽었- / -다" },
        { value: "one", label: "읽었다 (더 나눌 수 없다)" },
      ],
      answer: "three-parts",
      explanation:
        "‘읽-’은 뜻을, ‘-었-’은 과거를, ‘-다’는 문장을 끝맺는 기능을 각각 맡습니다. 뜻이나 기능을 가진 조각은 더 이상 나눌 수 없을 때까지 나눕니다.",
    },
  ],

  "capsule:ko-media-literacy": [
    {
      id: "ko-media-literacy-x1",
      prompt: "막대그래프의 세로축이 95부터 100까지만 그려져 두 막대의 차이가 아주 커 보입니다. 가장 먼저 할 판단은?",
      choices: [
        { value: "axis", label: "축 범위를 잘라 차이를 과장했을 수 있다" },
        { value: "real-gap", label: "실제로 두 값의 차이가 아주 크다" },
        { value: "sample", label: "표본이 충분히 크게 조사되었다" },
        { value: "recent", label: "자료가 최근에 만들어졌다" },
      ],
      answer: "axis",
      explanation:
        "세로축이 0이 아니라 95에서 시작하면 5 안쪽의 차이가 화면 전체를 차지합니다. 편집이 인상을 바꾼 경우이므로 실제 값을 확인해야 합니다.",
    },
    {
      id: "ko-media-literacy-x2",
      prompt: "사진과 숫자가 잔뜩 들어간 건강 카드 뉴스가 있습니다. 그만큼 객관적이라고 볼 수 있나요?",
      choices: [
        { value: "check-source", label: "아니다 — 누가 어떤 원자료로 만들었고 무엇이 빠졌는지 확인해야 한다" },
        { value: "numbers", label: "그렇다 — 숫자가 들어갔으면 검증된 자료다" },
        { value: "photo", label: "그렇다 — 사진이 있으면 실제로 있었던 일이다" },
        { value: "views", label: "그렇다 — 조회수가 높으면 믿을 만하다" },
      ],
      answer: "check-source",
      explanation:
        "사진과 숫자도 만든 사람이 목적에 맞게 골라 넣은 정보입니다. 출처와 원자료, 빠진 내용을 함께 봐야 신뢰도를 판단할 수 있습니다.",
    },
  ],

  "capsule:ko-answer-evidence": [
    {
      id: "ko-answer-evidence-x1",
      prompt: "지문은 ‘이 정책은 물가를 낮출 수 있다’인데 선택지는 ‘이 정책은 물가를 반드시 낮춘다’입니다. 무엇이 틀렸나요?",
      choices: [
        { value: "degree", label: "가능성을 확정으로 바꿔 정도를 과장했다" },
        { value: "subject", label: "행동의 주체를 다른 대상으로 바꿨다" },
        { value: "causal", label: "원인과 결과를 뒤집었다" },
        { value: "new", label: "지문에 없는 대상을 새로 넣었다" },
      ],
      answer: "degree",
      explanation:
        "‘수 있다’는 가능성이고 ‘반드시’는 확정입니다. 주체도 대상도 그대로이므로 어긋난 곳은 정도뿐입니다.",
    },
    {
      id: "ko-answer-evidence-x2",
      prompt: "지문은 ‘수요가 늘어 가격이 올랐다’인데 선택지는 ‘가격이 올라 수요가 늘었다’입니다. 어떤 오답 유형인가요?",
      choices: [
        { value: "causal", label: "원인과 결과를 뒤집었다" },
        { value: "range", label: "일부를 전체로 확대했다" },
        { value: "subject", label: "주체를 바꿨다" },
        { value: "degree", label: "정도를 과장했다" },
      ],
      answer: "causal",
      explanation:
        "쓰인 단어는 같지만 무엇이 원인이고 무엇이 결과인지가 반대로 바뀌었습니다. 단어만 훑으면 놓치기 쉬운 유형입니다.",
    },
  ],

  // ── 국어 개념 · 읽기 기초와 독서 ────────────────────────────
  "concept:korean-signal-reading": [
    {
      id: "korean-signal-reading-x1",
      prompt: "‘값이 올랐다. 그러나 판매량은 줄지 않았다.’에서 ‘그러나’의 역할은 무엇인가요?",
      choices: [
        { value: "contrast", label: "앞말을 뒤집어 반대되는 내용을 잇는다" },
        { value: "cause", label: "앞말을 원인, 뒷말을 결과로 잇는다" },
        { value: "add", label: "앞말에 비슷한 내용을 덧붙인다" },
        { value: "example", label: "앞말의 예를 든다" },
      ],
      answer: "contrast",
      explanation:
        "값이 올랐으면 보통 판매량이 줄 텐데 그러지 않았다고 말합니다. ‘그러나’는 이렇게 예상과 어긋나는 내용을 이어 줍니다.",
    },
    {
      id: "korean-signal-reading-x2",
      prompt: "‘동네 도서관이 갑자기 문을 닫았다. 이 소식에 학생들이 크게 아쉬워했다.’에서 ‘이 소식’이 가리키는 것은?",
      choices: [
        { value: "closed", label: "동네 도서관이 갑자기 문을 닫았다는 것" },
        { value: "sad", label: "학생들이 아쉬워했다는 것" },
        { value: "library", label: "동네 도서관" },
        { value: "students", label: "학생들" },
      ],
      answer: "closed",
      explanation:
        "지시어는 바로 앞 문장이 말한 내용을 다시 가리킵니다. ‘도서관’이라는 낱말 하나가 아니라 ‘문을 닫았다’는 사건 전체를 받습니다.",
    },
  ],

  "concept:korean-main-sentence": [
    {
      id: "korean-main-sentence-x1",
      prompt: "① 규칙적인 운동은 기억력에 도움이 된다. ② 실제로 매일 걷는 학생의 시험 점수가 더 높았다는 조사가 있다. ③ 걷기는 특별한 장비도 필요 없다. — 중심 문장은?",
      choices: [
        { value: "s1", label: "①" },
        { value: "s2", label: "②" },
        { value: "s3", label: "③" },
        { value: "all", label: "세 문장 모두" },
      ],
      answer: "s1",
      explanation:
        "②는 ①을 뒷받침하는 사례이고 ③은 덧붙인 설명입니다. 문단이 하고 싶은 말을 가장 압축한 문장은 ①입니다.",
    },
    {
      id: "korean-main-sentence-x2",
      prompt: "중심 문장을 찾을 때 첫 문장만 보면 안 되는 까닭은 무엇인가요?",
      choices: [
        { value: "last", label: "설명을 먼저 하고 마지막 문장에서 정리하는 문단도 있기 때문" },
        { value: "long", label: "첫 문장이 대체로 가장 길기 때문" },
        { value: "pointer", label: "첫 문장에는 지시어가 많이 나오기 때문" },
        { value: "example", label: "문단은 반드시 예시로 시작하기 때문" },
      ],
      answer: "last",
      explanation:
        "중심 문장의 자리는 정해져 있지 않습니다. 뒷받침 문장을 먼저 늘어놓고 끝에서 결론을 말하는 문단이 흔하므로 마지막까지 확인해야 합니다.",
    },
  ],

  "concept:korean-humanities-reading": [
    {
      id: "korean-humanities-reading-x1",
      prompt: "인문 지문의 ‘자유란 남의 간섭을 받지 않는 상태를 말한다.’ 같은 문장이 하는 일은 무엇인가요?",
      choices: [
        { value: "boundary", label: "개념의 경계를 정해 준다" },
        { value: "feeling", label: "글쓴이의 감정을 드러낸다" },
        { value: "counter", label: "앞의 주장을 반박한다" },
        { value: "case", label: "구체적인 사례를 든다" },
      ],
      answer: "boundary",
      explanation:
        "‘A란 B이다’는 정의 문장이라 그 글에서 A를 어디까지로 볼지 정해 줍니다. 이 경계를 놓치면 뒤 내용을 다르게 읽게 됩니다.",
    },
    {
      id: "korean-humanities-reading-x2",
      prompt: "두 학자의 관점이 나오는 인문 지문을 표로 정리할 때, 두 칸에 나란히 맞춰 적어야 할 항목은?",
      choices: [
        { value: "criteria", label: "각 관점의 기준·대상·결론" },
        { value: "birth", label: "두 학자의 출생 연도" },
        { value: "order", label: "두 관점이 지문에 나온 순서" },
        { value: "length", label: "두 관점을 설명한 문단의 길이" },
      ],
      answer: "criteria",
      explanation:
        "비교는 같은 위치끼리 맞출 때 정확해집니다. 기준·대상·결론을 나란히 놓아야 두 관점이 어디서 갈라지는지 보입니다.",
    },
  ],

  "concept:korean-social-reading": [
    {
      id: "korean-social-reading-x1",
      prompt: "‘공급이 줄면 가격이 오른다. 실제로 지난여름 폭우로 채소 출하량이 줄자 값이 크게 뛰었다.’에서 뒤 문장이 하는 일은?",
      choices: [
        { value: "apply", label: "앞에서 제시한 원리가 실제로 적용된 장면을 보여 준다" },
        { value: "new", label: "앞과 다른 새로운 원리를 세운다" },
        { value: "refute", label: "앞의 원리를 반박한다" },
        { value: "emotion", label: "글쓴이의 안타까운 심정을 드러낸다" },
      ],
      answer: "apply",
      explanation:
        "앞 문장은 원리, 뒤 문장은 그 원리가 들어맞은 사례입니다. 원리와 사례를 나누어 두면 보기 문제에서 무엇을 대조할지가 분명해집니다.",
    },
    {
      id: "korean-social-reading-x2",
      prompt: "사회 지문에서 ‘단, 다른 조건이 같을 때’ 같은 말을 반드시 표시해 두는 까닭은?",
      choices: [
        { value: "condition", label: "조건이 하나만 바뀌어도 사례 해석이 달라지기 때문" },
        { value: "length", label: "그런 문장이 대체로 길어서 읽기 어렵기 때문" },
        { value: "exam", label: "시험에 그 문장이 그대로 나오기 때문" },
        { value: "polite", label: "글쓴이가 겸손하게 쓴 표현이기 때문" },
      ],
      answer: "condition",
      explanation:
        "원리는 조건 위에서만 성립합니다. 보기에서 조건 하나를 슬쩍 바꿔 놓으면 같은 원리라도 결론이 달라지므로 조건어를 놓치면 안 됩니다.",
    },
  ],

  "concept:korean-science-tech-reading": [
    {
      id: "korean-science-tech-reading-x1",
      prompt: "‘빛이 잎에 닿으면 엽록소가 이를 흡수하고, 흡수된 에너지가 물을 분해한다.’를 읽을 때 가장 먼저 정리할 것은?",
      choices: [
        { value: "steps", label: "빛 → 흡수 → 분해라는 단계의 순서" },
        { value: "attitude", label: "글쓴이가 이 현상을 대하는 태도" },
        { value: "origin", label: "‘엽록소’라는 말의 어원" },
        { value: "rhythm", label: "문장의 길이와 리듬" },
      ],
      answer: "steps",
      explanation:
        "과정 설명은 순서가 뼈대입니다. 화살표로 단계만 이어 두면 용어가 낯설어도 문제에서 어느 단계를 묻는지 바로 찾을 수 있습니다.",
    },
    {
      id: "korean-science-tech-reading-x2",
      prompt: "실험 지문에 ‘온도를 5도씩 높였더니 반응 속도가 빨라졌다’라고 나왔습니다. 변수와 결과를 바르게 나눈 것은?",
      choices: [
        { value: "temp-speed", label: "변수는 온도, 결과는 반응 속도" },
        { value: "speed-temp", label: "변수는 반응 속도, 결과는 온도" },
        { value: "both-var", label: "온도와 반응 속도가 모두 변수" },
        { value: "both-res", label: "온도와 반응 속도가 모두 결과" },
      ],
      answer: "temp-speed",
      explanation:
        "실험하는 사람이 일부러 바꾼 것이 변수, 그에 따라 달라진 것이 결과입니다. 여기서는 온도를 직접 높였고 반응 속도가 따라 달라졌습니다.",
    },
  ],

  "concept:korean-integrated-reading": [
    {
      id: "korean-integrated-reading-x1",
      prompt: "(가)와 (나)를 비교할 때 짝을 맞춰 놓아야 하는 것은 무엇인가요?",
      choices: [
        { value: "same-slot", label: "(가)의 결론과 (나)의 결론처럼 같은 위치끼리" },
        { value: "mixed", label: "(가)의 결론과 (나)의 사례" },
        { value: "edges", label: "(가)의 첫 문장과 (나)의 마지막 문장" },
        { value: "length", label: "(가)의 길이와 (나)의 길이" },
      ],
      answer: "same-slot",
      explanation:
        "비교는 대상·관점·근거·결론처럼 같은 항목끼리 맞출 때만 뜻이 있습니다. 결론과 사례를 견주면 어긋난 비교가 됩니다.",
    },
    {
      id: "korean-integrated-reading-x2",
      prompt: "(가)에만 나온 내용을 근거로 (나)의 주장을 설명한 선택지가 있습니다. 어떻게 판단해야 하나요?",
      choices: [
        { value: "mixed", label: "두 지문의 정보가 섞였으므로 적절하지 않다" },
        { value: "integrated", label: "두 지문을 잘 통합했으므로 적절하다" },
        { value: "exists", label: "(가)에 실제로 있는 내용이므로 적절하다" },
        { value: "unknown", label: "근거가 어느 지문에 있든 판단할 수 없다" },
      ],
      answer: "mixed",
      explanation:
        "통합 지문 문제는 어느 지문이 무엇을 말했는지를 구별하는지 봅니다. (나)가 말하지 않은 근거를 (나)의 것으로 쓰면 틀린 선택지입니다.",
    },
  ],

  // ── 국어 개념 · 문학 ───────────────────────────────────────
  "concept:korean-modern-poetry": [
    {
      id: "korean-modern-poetry-x1",
      prompt: "‘창틀에 먼지가 뽀얗게 앉아 있다’는 무엇에 해당하나요?",
      choices: [
        { value: "image", label: "눈앞에 장면이 그려지는 이미지" },
        { value: "emotion", label: "화자의 정서를 직접 말한 부분" },
        { value: "theme", label: "시의 주제를 요약한 문장" },
        { value: "speaker", label: "화자가 누구인지 밝힌 부분" },
      ],
      answer: "image",
      explanation:
        "‘뽀얗게 앉은 먼지’는 눈으로 보는 장면을 떠올리게 하는 이미지입니다. 정서는 이 장면을 근거로 삼아 따로 적어야 합니다.",
    },
    {
      id: "korean-modern-poetry-x2",
      prompt: "시어 하나의 뜻이 끝내 잡히지 않을 때 가장 안전한 방법은 무엇인가요?",
      choices: [
        { value: "whole", label: "반복되는 장면과 분위기를 묶어 전체 흐름으로 판단한다" },
        { value: "dict", label: "그 시어의 사전 뜻을 그대로 넣어 해석한다" },
        { value: "skip", label: "그 행을 빼고 나머지만 읽는다" },
        { value: "author", label: "작가의 생애에서 답을 찾는다" },
      ],
      answer: "whole",
      explanation:
        "시는 낱말 하나로 결정되지 않습니다. 반복되는 장면과 분위기를 모으면 그 시어가 어느 쪽 정서에 놓였는지 드러납니다.",
    },
  ],

  "concept:korean-modern-fiction": [
    {
      id: "korean-modern-fiction-x1",
      prompt: "소설을 읽다가 ‘그로부터 삼 년 전, 그는 고향을 떠났다’라는 문장을 만났습니다. 타임라인에 어떻게 적어야 하나요?",
      choices: [
        { value: "before", label: "지금 장면보다 앞선 일이므로 앞쪽에 적는다" },
        { value: "after", label: "지금 장면 다음에 일어난 일로 적는다" },
        { value: "as-written", label: "문장이 나온 순서대로 맨 뒤에 적는다" },
        { value: "drop", label: "회상이므로 타임라인에서 뺀다" },
      ],
      answer: "before",
      explanation:
        "소설은 사건을 일어난 순서대로만 들려주지 않습니다. ‘삼 년 전’은 회상이므로 서술된 자리가 아니라 실제 시간 순서에 맞춰 앞쪽에 놓아야 합니다.",
    },
    {
      id: "korean-modern-fiction-x2",
      prompt: "인물 A가 B에게 유독 차갑게 말하는 장면의 이유를 찾을 때 가장 먼저 볼 것은?",
      choices: [
        { value: "relation", label: "두 인물의 관계와 그 전에 있었던 사건" },
        { value: "style", label: "그 대사에 쓰인 표현법" },
        { value: "setting", label: "장면의 배경 묘사" },
        { value: "year", label: "소설이 발표된 연도" },
      ],
      answer: "relation",
      explanation:
        "인물의 행동은 관계와 앞선 사건에서 나옵니다. 관계도를 먼저 그려 두면 ‘왜 저렇게 말했는가’를 근거 있게 설명할 수 있습니다.",
    },
  ],

  "concept:korean-classical-poetry": [
    {
      id: "korean-classical-poetry-x1",
      prompt: "고전시가에 ‘달’이 거듭 나옵니다. 가장 먼저 생각해 볼 것은 무엇인가요?",
      choices: [
        { value: "symbol", label: "화자의 정서나 태도를 비유하는 장치일 수 있다" },
        { value: "night", label: "작품이 밤에 지어졌다는 사실" },
        { value: "season", label: "계절이 겨울이라는 뜻" },
        { value: "science", label: "그 시대의 천문 지식 수준" },
      ],
      answer: "symbol",
      explanation:
        "고전시가에서 자연물은 풍경 그 자체보다 화자의 마음을 담아내는 매개로 자주 쓰입니다. 달이 어떤 상황에서 나오는지 함께 보면 정서가 잡힙니다.",
    },
    {
      id: "korean-classical-poetry-x2",
      prompt: "‘님 그린 뜻이 갈수록 깊어라’를 현대어로 옮기면?",
      choices: [
        { value: "longing", label: "임을 그리워하는 마음이 갈수록 깊어진다" },
        { value: "drawing", label: "임을 그린 그림이 깊숙이 걸려 있다" },
        { value: "message", label: "임에게 내 뜻을 전하려 한다" },
        { value: "road", label: "임이 떠난 길이 갈수록 깊어진다" },
      ],
      answer: "longing",
      explanation:
        "여기서 ‘그리다’는 그림을 그린다는 뜻이 아니라 그리워한다는 뜻입니다. 상황과 화자의 바람을 현대어로 바꿔 놓으면 낯선 표현이 훨씬 덜 부담스럽습니다.",
    },
  ],

  "concept:korean-classical-fiction": [
    {
      id: "korean-classical-fiction-x1",
      prompt: "고전소설에서 주인공이 시련을 겪고, 도와주는 인물을 만나고, 문제를 해결하는 흐름이 자주 보입니다. 이를 어떻게 활용하면 좋을까요?",
      choices: [
        { value: "pattern", label: "반복되는 사건 구조로 보고 다음 전개를 예상하며 읽는다" },
        { value: "same-author", label: "작가가 모두 같은 사람이라는 근거로 삼는다" },
        { value: "chance", label: "우연이므로 특별히 신경 쓰지 않는다" },
        { value: "short", label: "원문이 짧다는 뜻으로 받아들인다" },
      ],
      answer: "pattern",
      explanation:
        "고전소설은 시련·조력·해결 같은 구조가 되풀이됩니다. 이 전형을 알고 있으면 낯선 작품도 어느 단계인지 짚으며 빠르게 읽을 수 있습니다.",
    },
    {
      id: "korean-classical-fiction-x2",
      prompt: "고전소설에서 어떤 인물이 긍정적으로 그려졌는지 판단하려면 무엇을 함께 봐야 하나요?",
      choices: [
        { value: "both", label: "서술자의 설명과 인물의 실제 행동을 함께 본다" },
        { value: "name", label: "인물 이름의 뜻만 본다" },
        { value: "count", label: "인물이 등장한 횟수만 센다" },
        { value: "line-length", label: "인물의 대사 길이만 잰다" },
      ],
      answer: "both",
      explanation:
        "고전소설은 서술자가 인물을 대놓고 평하기도 하고, 행동으로 보여 주기도 합니다. 둘을 같이 봐야 작품이 어떤 가치를 옳다고 보는지 읽힙니다.",
    },
  ],

  "concept:korean-drama-essay": [
    {
      id: "korean-drama-essay-x1",
      prompt: "희곡에서 인물들의 갈등이 가장 잘 드러나는 곳은 어디인가요?",
      choices: [
        { value: "clash", label: "서로 맞부딪치는 대사와 그때의 장면 지시" },
        { value: "cast", label: "맨 앞의 등장인물 목록" },
        { value: "acts", label: "막과 장의 개수" },
        { value: "theater", label: "작품이 공연된 극장 이름" },
      ],
      answer: "clash",
      explanation:
        "극에는 서술자의 설명이 없어서 인물의 말과 행동이 갈등을 직접 보여 줍니다. 대사와 함께 붙은 지시문이 그때의 태도까지 알려 줍니다.",
    },
    {
      id: "korean-drama-essay-x2",
      prompt: "수필에서 ‘그날 이후 나는 서두르지 않기로 했다’ 같은 문장이 중요한 까닭은?",
      choices: [
        { value: "attitude", label: "경험을 바라보는 글쓴이의 태도와 변화가 드러나기 때문" },
        { value: "time", label: "사건이 일어난 시간 순서를 알려 주기 때문" },
        { value: "conflict", label: "등장인물 사이의 갈등을 보여 주기 때문" },
        { value: "stage", label: "무대 지시문에 해당하기 때문" },
      ],
      answer: "attitude",
      explanation:
        "수필의 중심은 사건 자체가 아니라 그 경험에서 글쓴이가 무엇을 얻었는가입니다. 태도가 달라지는 문장이 곧 글의 핵심입니다.",
    },
  ],

  // ── 국어 개념 · 문법 ───────────────────────────────────────
  "concept:korean-phonology": [
    {
      id: "korean-phonology-x1",
      prompt: "‘물’과 ‘불’의 뜻이 달라지는 까닭은 무엇인가요?",
      choices: [
        { value: "phoneme", label: "첫소리 ㅁ과 ㅂ이 뜻을 구별하는 음운이기 때문" },
        { value: "shape", label: "글자의 생김새가 다르기 때문" },
        { value: "syllable", label: "음절 수가 서로 다르기 때문" },
        { value: "pos", label: "두 단어의 품사가 다르기 때문" },
      ],
      answer: "phoneme",
      explanation:
        "두 낱말은 첫소리 하나만 다른데 뜻이 완전히 갈립니다. 이렇게 뜻을 가르는 가장 작은 소리 단위가 음운입니다.",
    },
    {
      id: "korean-phonology-x2",
      prompt: "‘신라’를 소리 내어 읽으면 [실라]가 됩니다. 여기서 확인해야 할 것은 무엇인가요?",
      choices: [
        { value: "sound-change", label: "적는 글자와 달리 실제 소리가 이어지며 바뀌었다는 점" },
        { value: "wrong", label: "‘신라’라는 표기가 맞춤법에 어긋난다는 점" },
        { value: "meaning", label: "발음이 바뀌면서 뜻도 달라졌다는 점" },
        { value: "morpheme", label: "형태소가 하나 늘어났다는 점" },
      ],
      answer: "sound-change",
      explanation:
        "발음 변화는 소리가 편하게 이어지려고 일어나는 일이라 표기와 어긋날 수 있습니다. 표기는 그대로 ‘신라’이고 뜻도 바뀌지 않습니다.",
    },
  ],

  "concept:korean-morpheme": [
    {
      id: "korean-morpheme-x1",
      prompt: "형태소를 가장 정확하게 설명한 것은 무엇인가요?",
      choices: [
        { value: "morpheme", label: "뜻이나 문법 기능을 가진 가장 작은 단위" },
        { value: "phoneme", label: "뜻을 구별하는 가장 작은 소리" },
        { value: "syllable", label: "한 번에 소리 나는 덩어리" },
        { value: "word", label: "혼자 쓸 수 있는 가장 작은 단위" },
      ],
      answer: "morpheme",
      explanation:
        "형태소의 기준은 소리가 아니라 뜻과 기능입니다. 소리 기준은 음운·음절이고, 혼자 쓸 수 있느냐는 단어의 기준입니다.",
    },
    {
      id: "korean-morpheme-x2",
      prompt: "다음 중 형태소를 둘 이상으로 나눌 수 있는 말은 무엇인가요?",
      choices: [
        { value: "high", label: "높였다" },
        { value: "sea", label: "바다" },
        { value: "cloud", label: "구름" },
        { value: "stone", label: "돌" },
      ],
      answer: "high",
      explanation:
        "‘높였다’는 뜻 조각 ‘높-’에 문법 조각들이 붙은 말이라 더 나눌 수 있습니다. ‘바다·구름·돌’은 쪼개는 순간 뜻이 사라집니다.",
    },
  ],

  "concept:korean-parts-of-speech": [
    {
      id: "korean-parts-of-speech-x1",
      prompt: "‘예쁜 꽃이 활짝 피었다’에서 ‘활짝’의 품사는 무엇인가요?",
      choices: [
        { value: "adverb", label: "부사" },
        { value: "adjective", label: "형용사" },
        { value: "noun", label: "명사" },
        { value: "verb", label: "동사" },
      ],
      answer: "adverb",
      explanation:
        "‘활짝’은 ‘피었다’라는 움직임이 어떻게 일어났는지를 꾸며 줍니다. 이렇게 용언을 꾸미는 말이 부사입니다.",
    },
    {
      id: "korean-parts-of-speech-x2",
      prompt: "‘민수가 빠르게 달린다’에서 ‘달린다’의 품사는 무엇인가요?",
      choices: [
        { value: "verb", label: "동사" },
        { value: "adjective", label: "형용사" },
        { value: "noun", label: "명사" },
        { value: "adverb", label: "부사" },
      ],
      answer: "verb",
      explanation:
        "움직임을 나타내면 동사, 성질이나 상태를 나타내면 형용사입니다. ‘달린다’는 하는 동작이므로 동사입니다.",
    },
  ],

  "concept:korean-sentence": [
    {
      id: "korean-sentence-x1",
      prompt: "‘동생이 새 신발을 신었다’에서 목적어는 무엇인가요?",
      choices: [
        { value: "object", label: "신발을" },
        { value: "subject", label: "동생이" },
        { value: "modifier", label: "새" },
        { value: "predicate", label: "신었다" },
      ],
      answer: "object",
      explanation:
        "서술어 ‘신었다’에 ‘무엇을?’이라고 물으면 ‘신발을’이 나옵니다. ‘새’는 신발을 꾸미는 관형어라 목적어에 들어가지 않습니다.",
    },
    {
      id: "korean-sentence-x2",
      prompt: "‘내가 하고 싶은 말은 약속을 꼭 지켜야 한다.’가 어색한 까닭은 무엇인가요?",
      choices: [
        { value: "agreement", label: "주어 ‘말은’과 서술어가 짝을 이루지 못했다" },
        { value: "no-object", label: "목적어가 빠져 있다" },
        { value: "long-modifier", label: "관형어가 너무 길다" },
        { value: "no-adverb", label: "부사어가 빠져 있다" },
      ],
      answer: "agreement",
      explanation:
        "주어가 ‘말은’이면 서술어도 ‘~것이다’처럼 받아야 합니다. ‘지켜야 한다’는 사람이 주어일 때 쓰는 말이라 호응이 어긋났습니다.",
    },
  ],

  "concept:korean-norms": [
    {
      id: "korean-norms-x1",
      prompt: "다음 중 표기가 바른 것은 무엇인가요?",
      choices: [
        { value: "wen", label: "웬일이야" },
        { value: "waen", label: "왠일이야" },
        { value: "wen-space", label: "웬 일이야" },
        { value: "waen-space", label: "왠 일이야" },
      ],
      answer: "wen",
      explanation:
        "‘어찌 된’이라는 뜻일 때는 ‘웬’을 쓰고, ‘왠’은 ‘왠지’에서만 씁니다. ‘웬일’은 한 단어라 붙여 적습니다.",
    },
    {
      id: "korean-norms-x2",
      prompt: "‘꽃이’를 [꼬치]로 읽으면서도 ‘꼬치’라고 적지 않는 까닭은 무엇인가요?",
      choices: [
        { value: "form", label: "소리 나는 대로가 아니라 원래 형태를 밝혀 적기 때문" },
        { value: "old", label: "옛날 사람들이 그렇게 읽었기 때문" },
        { value: "count", label: "글자 수를 맞추기 위해서" },
        { value: "space", label: "띄어쓰기를 쉽게 하기 위해서" },
      ],
      answer: "form",
      explanation:
        "맞춤법은 뜻을 알아보기 쉽도록 기본 형태 ‘꽃’을 살려 적습니다. 그래서 ‘꽃’, ‘꽃이’, ‘꽃밭’이 발음은 달라도 표기는 한 형태로 이어집니다.",
    },
  ],

  // ── 국어 개념 · 화법·작문·매체와 마무리 ──────────────────────
  "concept:korean-speech": [
    {
      id: "korean-speech-x1",
      prompt: "‘이 부분은 조금 더 설명해 주실 수 있을까요?’의 발화 의도로 알맞은 것은?",
      choices: [
        { value: "request", label: "요청 — 추가 설명을 부탁한다" },
        { value: "refute", label: "반박 — 앞말이 틀렸다고 지적한다" },
        { value: "persuade", label: "설득 — 상대의 생각을 바꾸려 한다" },
        { value: "praise", label: "칭찬 — 설명이 좋았다고 평가한다" },
      ],
      answer: "request",
      explanation:
        "‘~해 주실 수 있을까요?’는 질문 모양이지만 실제로는 부탁입니다. 화법은 문장의 형태보다 그 말로 무엇을 하려는지를 봅니다.",
    },
    {
      id: "korean-speech-x2",
      prompt: "‘내일 발표 자료를 미리 보내 주실 수 있나요?’에 대한 반응으로 가장 적절한 것은?",
      choices: [
        { value: "answer", label: "보낼 수 있는지와 언제 보낼지를 답한다" },
        { value: "topic", label: "발표 주제가 흥미롭다고 말한다" },
        { value: "font", label: "자료의 글꼴이 마음에 들지 않는다고 말한다" },
        { value: "story", label: "자신의 지난 발표 경험을 길게 이야기한다" },
      ],
      answer: "answer",
      explanation:
        "적절한 반응은 앞말의 의도와 조건을 그대로 이어받아야 합니다. 여기서 의도는 요청이고 조건은 ‘내일’과 ‘미리’이므로 가능 여부와 시점을 답해야 합니다.",
    },
  ],

  "concept:korean-writing": [
    {
      id: "korean-writing-x1",
      prompt: "같은 주제로 글을 써도 독자가 ‘같은 학교 학생’일 때와 ‘학교 밖 어른’일 때 달라지는 것은?",
      choices: [
        { value: "content", label: "어떤 내용을 고르고 어디까지 설명할지" },
        { value: "topic", label: "글의 주제 자체" },
        { value: "name", label: "글쓴이의 이름" },
        { value: "rules", label: "적용되는 맞춤법 규칙" },
      ],
      answer: "content",
      explanation:
        "독자가 이미 아는 것이 다르면 설명할 범위와 예시가 달라집니다. 주제나 맞춤법은 독자에 따라 바뀌지 않습니다.",
    },
    {
      id: "korean-writing-x2",
      prompt: "주장하는 글에 넣을 자료를 고르는 기준으로 가장 알맞은 것은?",
      choices: [
        { value: "support", label: "그 자료가 내 주장을 실제로 뒷받침하는가" },
        { value: "many", label: "자료를 많이 넣을수록 좋다" },
        { value: "new", label: "최신 자료면 내용과 상관없이 좋다" },
        { value: "chart", label: "그래프 모양이면 무조건 좋다" },
      ],
      answer: "support",
      explanation:
        "자료는 개수나 모양이 아니라 주장과의 연결로 값이 정해집니다. 주장과 이어지지 않는 자료는 글의 초점을 흐립니다.",
    },
  ],

  "concept:korean-media": [
    {
      id: "korean-media-x1",
      prompt: "같은 통계를 한 자료는 큰 빨간 글씨로 맨 위에, 다른 자료는 표 구석에 작게 넣었습니다. 달라지는 것은?",
      choices: [
        { value: "emphasis", label: "독자가 받는 강조와 인상" },
        { value: "value", label: "통계 값 자체" },
        { value: "source", label: "자료의 출처" },
        { value: "method", label: "조사한 방법" },
      ],
      answer: "emphasis",
      explanation:
        "매체는 같은 정보라도 어디에 어떻게 놓느냐로 의미를 만듭니다. 숫자는 그대로지만 무엇이 중요해 보이는지가 바뀝니다.",
    },
    {
      id: "korean-media-x2",
      prompt: "매체 자료의 신뢰도를 판단할 때 함께 봐야 할 세 가지로 알맞은 것은?",
      choices: [
        { value: "core", label: "출처, 목적, 편집 방식" },
        { value: "look", label: "글자 크기, 색, 배경 음악" },
        { value: "popular", label: "조회수, 좋아요 수, 댓글 수" },
        { value: "amount", label: "사진 개수, 표 개수, 영상 길이" },
      ],
      answer: "core",
      explanation:
        "누가 만들었고 무엇을 노렸으며 어떻게 잘라 붙였는지가 신뢰도를 정합니다. 보기 좋은 정도나 인기는 내용이 맞다는 증거가 아닙니다.",
    },
  ],

  "concept:korean-problem-application": [
    {
      id: "korean-problem-application-x1",
      prompt: "‘윗글의 서술상 특징으로 적절한 것은?’이라는 문항은 무엇을 묻고 있나요?",
      choices: [
        { value: "how", label: "글이 내용을 서술한 방식" },
        { value: "claim", label: "글쓴이의 주장" },
        { value: "word", label: "낯선 용어의 뜻" },
        { value: "order", label: "사건이 일어난 순서" },
      ],
      answer: "how",
      explanation:
        "‘서술상 특징’은 무엇을 말했는가가 아니라 어떻게 말했는가를 묻습니다. 문항이 요구하는 기능을 먼저 분류하면 지문에서 볼 곳이 달라집니다.",
    },
    {
      id: "korean-problem-application-x2",
      prompt: "틀린 문제를 다시 볼 때 효과가 가장 큰 일은 무엇인가요?",
      choices: [
        { value: "evidence", label: "어떤 근거를 잘못 보고 골랐는지 찾기" },
        { value: "number", label: "정답 번호만 다시 외우기" },
        { value: "dict", label: "모르는 단어를 전부 사전에서 찾기" },
        { value: "again", label: "같은 문제를 그냥 한 번 더 풀기" },
      ],
      answer: "evidence",
      explanation:
        "국어 오답은 몰라서보다 근거를 잘못 짚어서 생기는 경우가 많습니다. 어디를 잘못 봤는지 한 줄로 적어 두면 같은 실수가 줄어듭니다.",
    },
  ],

  "concept:korean-ebs-linkage": [
    {
      id: "korean-ebs-linkage-x1",
      prompt: "EBS 강의를 켜기 전에 하면 가장 좋은 일은 무엇인가요?",
      choices: [
        { value: "structure", label: "지문을 먼저 읽고 구조를 표시해 두기" },
        { value: "answer", label: "해설을 먼저 보고 정답을 외워 두기" },
        { value: "copy", label: "강의 필기를 미리 옮겨 적어 두기" },
        { value: "title", label: "작품 제목만 외워 두기" },
      ],
      answer: "structure",
      explanation:
        "내가 먼저 표시해 둔 구조가 있어야 강의에서 무엇이 새 정보인지 알 수 있습니다. 아무 표시 없이 들으면 강의가 지나간 뒤 남는 것이 없습니다.",
    },
    {
      id: "korean-ebs-linkage-x2",
      prompt: "연계 지문을 공부한 뒤 남겨야 할 것으로 가장 알맞은 것은?",
      choices: [
        { value: "process", label: "그 지문에 적용한 읽기 절차와 글의 구조" },
        { value: "titles", label: "공부한 작품과 지문의 제목 목록" },
        { value: "answers", label: "문항별 정답 번호와 배점" },
        { value: "notes", label: "강의 필기를 예쁘게 옮긴 노트" },
      ],
      answer: "process",
      explanation:
        "수능에는 같은 지문이 그대로 나오지 않습니다. 남겨야 할 것은 제목이나 답이 아니라 다음 지문에도 쓸 수 있는 읽는 절차입니다.",
    },
  ],

  // ── 영어 캡슐 ──────────────────────────────────────────────
  "capsule:en-vocabulary": [
    {
      id: "en-vocabulary-x1",
      prompt: "‘decide’와 한 가족인 말로 ‘She made a ____.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "decision", label: "decision" },
        { value: "decide", label: "decide" },
        { value: "decisive", label: "decisive" },
        { value: "decided", label: "decided" },
      ],
      answer: "decision",
      explanation:
        "관사 a 뒤이자 made의 목적어 자리이므로 명사가 와야 합니다. decide는 동사, decisive는 형용사라 이 자리에 들어갈 수 없습니다.",
    },
    {
      id: "en-vocabulary-x2",
      prompt: "‘Water the plants every day.’에서 water의 품사는 무엇인가요?",
      choices: [
        { value: "verb", label: "동사 — 물을 주다" },
        { value: "noun", label: "명사 — 물" },
        { value: "adjective", label: "형용사 — 물의" },
        { value: "adverb", label: "부사 — 물처럼" },
      ],
      answer: "verb",
      explanation:
        "문장 맨 앞에서 the plants라는 목적어를 데리고 명령하는 자리이므로 동사입니다. 외운 첫 번째 뜻 ‘물’만 떠올리면 문장이 풀리지 않습니다.",
    },
  ],

  "capsule:en-sv-skeleton": [
    {
      id: "en-sv-skeleton-x1",
      prompt: "‘The boy standing near the door opened the window.’의 중심 동사(V)는 무엇인가요?",
      choices: [
        { value: "opened", label: "opened" },
        { value: "standing", label: "standing" },
        { value: "near", label: "near" },
        { value: "window", label: "window" },
      ],
      answer: "opened",
      explanation:
        "시제가 표시된 동사는 opened 하나뿐입니다. standing은 시제 표시가 없는 -ing 형태라 The boy를 꾸미는 덩어리에 들어갑니다.",
    },
    {
      id: "en-sv-skeleton-x2",
      prompt: "‘My father gave me a book.’의 뼈대 구조로 알맞은 것은?",
      choices: [
        { value: "svoo", label: "S + V + O + O" },
        { value: "svoc", label: "S + V + O + C" },
        { value: "svo", label: "S + V + O" },
        { value: "svc", label: "S + V + C" },
      ],
      answer: "svoo",
      explanation:
        "me(누구에게)와 a book(무엇을)이 각각 다른 대상이라 목적어가 둘입니다. me가 a book의 정체를 설명하는 것이 아니므로 보어(C)가 아닙니다.",
    },
  ],

  "capsule:en-listening-preview": [
    {
      id: "en-listening-preview-x1",
      prompt:
        "그림 문제의 선택지가 ‘A boy is reading a book.’과 ‘A boy is closing a book.’처럼 나옵니다. 듣기 전에 표시해 둘 곳은?",
      choices: [
        { value: "verbs", label: "서로 다른 동사 reading과 closing" },
        { value: "same", label: "두 문장에 똑같이 나오는 A boy" },
        { value: "length", label: "두 문장의 길이 차이" },
        { value: "article", label: "관사 a가 몇 번 나오는지" },
      ],
      answer: "verbs",
      explanation:
        "같은 부분은 어느 쪽을 골라도 맞으니 들을 필요가 없습니다. 선택지가 갈리는 지점, 곧 동사만 기다리면 들을 정보의 양이 크게 줄어듭니다.",
    },
    {
      id: "en-listening-preview-x2",
      prompt:
        "선택지가 ‘a doctor and a patient’, ‘a teacher and a student’, ‘a waiter and a customer’처럼 나왔습니다. 무엇을 기다리며 들어야 할까요?",
      choices: [
        { value: "relation", label: "관계를 알려 주는 호칭·장소·해야 할 일 표현" },
        { value: "numbers", label: "대화에 나오는 시각과 가격" },
        { value: "tense", label: "문장에 쓰인 시제" },
        { value: "speed", label: "말하는 사람의 속도" },
      ],
      answer: "relation",
      explanation:
        "선택지가 모두 두 사람의 관계이므로 이 문항이 묻는 축은 관계입니다. menu나 order 같은 낱말 하나가 곧바로 식당의 종업원과 손님을 가리켜 줍니다.",
    },
  ],

  "capsule:en-listening-flow": [
    {
      id: "en-listening-flow-x1",
      prompt:
        "대화입니다. M: Let’s meet at six. / W: Actually, I have a class until six thirty. Can we make it seven? / M: Sure, seven works. — 두 사람이 만나기로 한 시각은?",
      choices: [
        { value: "seven", label: "7시" },
        { value: "six", label: "6시" },
        { value: "sixthirty", label: "6시 30분" },
        { value: "none", label: "아직 정해지지 않았다" },
      ],
      answer: "seven",
      explanation:
        "Actually 뒤에서 처음 말한 six가 취소되고 seven이 새 제안으로 나옵니다. 마지막 Sure까지 확인해야 합의된 시각이 확정됩니다.",
    },
    {
      id: "en-listening-flow-x2",
      prompt:
        "대화입니다. W: How about taking the bus? / M: I’d love to, but the bus doesn’t come on Sundays. Let’s take a taxi. / W: Okay. — 두 사람이 이용할 교통수단은?",
      choices: [
        { value: "taxi", label: "택시" },
        { value: "bus", label: "버스" },
        { value: "subway", label: "지하철" },
        { value: "walk", label: "걸어서" },
      ],
      answer: "taxi",
      explanation:
        "I’d love to, but은 겉으로는 긍정이지만 실제로는 거절입니다. 거절 뒤에 나온 새 제안 a taxi를 상대가 Okay로 받아들여 최종 행동이 됩니다.",
    },
  ],

  "capsule:en-modifiers": [
    {
      id: "en-modifiers-x1",
      prompt: "‘I went to the store to buy milk.’에서 to buy는 어떤 뜻으로 읽어야 하나요?",
      choices: [
        { value: "purpose", label: "우유를 사기 위해 — 간 이유를 더한다" },
        { value: "subject", label: "우유를 사는 것 — 문장의 주어다" },
        { value: "adjective", label: "살 우유 — 앞의 명사를 꾸민다" },
        { value: "main", label: "우유를 샀다 — 문장의 중심 동사다" },
      ],
      answer: "purpose",
      explanation:
        "문장에는 이미 중심 동사 went가 있고 주어 자리도 I가 채우고 있습니다. 남은 자리는 문장 전체를 꾸미는 부사 자리라 ‘~하기 위해’로 읽습니다.",
    },
    {
      id: "en-modifiers-x2",
      prompt: "‘She is good at ____ English.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "speaking", label: "speaking" },
        { value: "to-speak", label: "to speak" },
        { value: "speak", label: "speak" },
        { value: "spoke", label: "spoke" },
      ],
      answer: "speaking",
      explanation:
        "at은 전치사라 뒤에 명사 자리가 옵니다. 동사를 그 자리에 넣으려면 명사 노릇을 하는 동명사 speaking으로 바꿔야 하고, to부정사는 전치사 뒤에 오지 못합니다.",
    },
  ],

  "capsule:en-clauses": [
    {
      id: "en-clauses-x1",
      prompt: "‘We stayed home ____ it was raining.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "because", label: "because" },
        { value: "because-of", label: "because of" },
        { value: "although", label: "although" },
        { value: "so", label: "so" },
      ],
      answer: "because",
      explanation:
        "빈칸 뒤에 it was라는 주어+동사가 있으므로 절을 이끄는 because가 맞습니다. because of 뒤에는 the rain 같은 명사 덩어리만 올 수 있습니다.",
    },
    {
      id: "en-clauses-x2",
      prompt: "‘If it rains tomorrow, we will stay inside.’에서 If가 이끄는 논리는 무엇인가요?",
      choices: [
        { value: "condition", label: "조건 — 그런 경우라면" },
        { value: "time", label: "시간 — 그때가 되면" },
        { value: "reason", label: "이유 — 그렇기 때문에" },
        { value: "contrast", label: "대조 — 그런데도" },
      ],
      answer: "condition",
      explanation:
        "비가 올지 안 올지 아직 모르는 상태에서 ‘비가 오는 경우에만’ 안에 머문다고 말합니다. when이라면 비가 온다는 사실을 전제로 그 시점을 가리키게 됩니다.",
    },
  ],

  "capsule:en-participles": [
    {
      id: "en-participles-x1",
      prompt: "‘She showed me a photo ____ by her father.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "taken", label: "taken" },
        { value: "taking", label: "taking" },
        { value: "took", label: "took" },
        { value: "to-take", label: "to take" },
      ],
      answer: "taken",
      explanation:
        "photo는 사진을 찍는 주체가 아니라 찍히는 대상입니다. 꾸밈을 받는 명사가 행동을 당하면 p.p.를 쓰고, 뒤의 by her father가 그 수동 관계를 다시 확인해 줍니다.",
    },
    {
      id: "en-participles-x2",
      prompt: "‘영화가 사람들을 지루하게 만들었다’는 뜻이 되도록 ‘The movie was very ____.’를 채우면?",
      choices: [
        { value: "boring", label: "boring" },
        { value: "bored", label: "bored" },
        { value: "bore", label: "bore" },
        { value: "to-bore", label: "to bore" },
      ],
      answer: "boring",
      explanation:
        "지루하게 만드는 쪽이 영화이므로 능동 관계라 -ing를 씁니다. bored는 그 감정을 받는 쪽에 쓰는 말이라 ‘I was bored.’처럼 사람이 주어일 때 맞습니다.",
    },
  ],

  "capsule:en-relatives": [
    {
      id: "en-relatives-x1",
      prompt: "‘I have a friend ____ lives in Busan.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "who", label: "who" },
        { value: "whom", label: "whom" },
        { value: "which", label: "which" },
        { value: "whose", label: "whose" },
      ],
      answer: "who",
      explanation:
        "빈칸 뒤 lives 앞에 주어가 비어 있고 선행사 a friend는 사람입니다. 사람 선행사의 주어 자리를 채우는 관계대명사는 who이고, whom은 목적어가 빈 자리에 씁니다.",
    },
    {
      id: "en-relatives-x2",
      prompt: "‘This is the house ____ my grandmother built.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "which", label: "which" },
        { value: "where", label: "where" },
        { value: "who", label: "who" },
        { value: "when", label: "when" },
      ],
      answer: "which",
      explanation:
        "선행사가 장소여도 built 뒤에 목적어가 비어 있으므로 그 자리를 메우는 관계대명사 which가 필요합니다. where 뒤에는 빠진 성분이 없는 완전한 절이 와야 합니다.",
    },
  ],

  "capsule:en-reading-logic": [
    {
      id: "en-reading-logic-x1",
      prompt:
        "‘Many people want to save money. ____, they still buy things they do not need.’의 빈칸에 알맞은 연결어는?",
      choices: [
        { value: "however", label: "However" },
        { value: "therefore", label: "Therefore" },
        { value: "for-example", label: "For example" },
        { value: "moreover", label: "Moreover" },
      ],
      answer: "however",
      explanation:
        "돈을 아끼고 싶다는 앞 내용과 필요 없는 물건을 산다는 뒤 내용이 서로 어긋납니다. 이렇게 방향이 꺾일 때 쓰는 신호가 however입니다.",
    },
    {
      id: "en-reading-logic-x2",
      prompt: "‘The team practiced every morning for a year. This helped them win.’에서 This가 가리키는 것은?",
      choices: [
        { value: "practice", label: "팀이 일 년 동안 매일 아침 연습한 일" },
        { value: "team", label: "the team" },
        { value: "morning", label: "every morning" },
        { value: "year", label: "a year" },
      ],
      answer: "practice",
      explanation:
        "this는 앞 문장의 명사 하나가 아니라 그 문장이 말한 사건 전체를 짧게 받을 수 있습니다. 도움이 된 것은 팀 자체가 아니라 매일 연습했다는 사실입니다.",
    },
  ],

  "capsule:en-question-types": [
    {
      id: "en-question-types-x1",
      prompt: "삽입할 문장이 ‘But this idea has a problem.’입니다. 어디에 넣어야 할까요?",
      choices: [
        { value: "after-idea", label: "어떤 생각(idea)이 소개된 바로 뒤" },
        { value: "first", label: "글의 맨 첫 문장 자리" },
        { value: "last", label: "결론이 끝난 맨 마지막" },
        { value: "any", label: "뜻만 통하면 어느 자리든 괜찮다" },
      ],
      answer: "after-idea",
      explanation:
        "this idea는 앞에 이미 나온 생각을 받고, But은 그 생각을 뒤집습니다. 두 신호가 모두 앞에 생각을 소개한 문장이 있어야 한다고 가리킵니다.",
    },
    {
      id: "en-question-types-x2",
      prompt:
        "지문이 sleep을 되풀이해 다루고 마지막에 ‘충분한 잠이 학습에 도움이 된다’로 끝납니다. 주제로 가장 알맞은 것은?",
      choices: [
        { value: "sleep-learning", label: "충분한 잠이 학습에 주는 도움" },
        { value: "hours", label: "잠은 하루에 몇 시간이 좋은가" },
        { value: "health", label: "건강하게 사는 여러 가지 방법" },
        { value: "grades", label: "시험 성적을 올리는 여러 방법" },
      ],
      answer: "sleep-learning",
      explanation:
        "주제는 반복되는 대상(sleep)과 글쓴이의 핵심 평가(학습에 도움이 된다)를 합친 것입니다. 시간만 다루면 너무 좁고, 건강 전반이나 성적 향상 전반은 글이 다루지 않은 범위까지 넓힌 것입니다.",
    },
  ],

  "capsule:en-grammar-check": [
    {
      id: "en-grammar-check-x1",
      prompt: "‘The students in the classroom ____ waiting.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "are", label: "are" },
        { value: "is", label: "is" },
        { value: "was", label: "was" },
        { value: "has", label: "has" },
      ],
      answer: "are",
      explanation:
        "중심 주어는 복수인 The students이고 in the classroom은 주어를 꾸미는 덩어리입니다. 동사 바로 앞의 classroom을 주어로 착각하면 단수 is를 고르게 됩니다.",
    },
    {
      id: "en-grammar-check-x2",
      prompt: "‘The teacher gave a ____ explanation.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "simple", label: "simple" },
        { value: "simply", label: "simply" },
        { value: "simplicity", label: "simplicity" },
        { value: "simplify", label: "simplify" },
      ],
      answer: "simple",
      explanation:
        "관사 a와 명사 explanation 사이는 명사를 꾸미는 형용사 자리입니다. simply는 부사, simplicity는 명사, simplify는 동사라 이 자리에 들어갈 수 없습니다.",
    },
  ],

  // ── 영어 개념 · 어휘/발음 ───────────────────────────────────
  "concept:english-sound-symbol": [
    {
      id: "english-sound-symbol-x1",
      prompt: "cat, map, bag를 한 묶음으로 소리 내 읽는 연습이 도움이 되는 까닭은 무엇인가요?",
      choices: [
        { value: "same-vowel", label: "가운데 모음 소리를 셋이 똑같이 나눠 가지기 때문" },
        { value: "meaning", label: "세 단어의 뜻이 서로 비슷하기 때문" },
        { value: "letters", label: "세 단어가 모두 세 글자이기 때문" },
        { value: "verbs", label: "세 단어가 모두 동사로 쓰이기 때문" },
      ],
      answer: "same-vowel",
      explanation:
        "같은 소리 조각을 가진 단어를 묶으면 하나를 익힐 때 나머지도 함께 읽히게 됩니다. 글자 수가 같다는 점은 소리와 상관이 없습니다.",
    },
    {
      id: "english-sound-symbol-x2",
      prompt: "알파벳 C의 이름은 ‘씨’인데 cat에서는 /k/ 소리가 납니다. 여기서 알 수 있는 것은?",
      choices: [
        { value: "name-sound", label: "글자의 이름과 단어 속 소리는 다를 수 있다" },
        { value: "always-k", label: "C는 어느 단어에서나 /k/로만 소리 난다" },
        { value: "wrong", label: "cat의 철자가 잘못 적혀 있다" },
        { value: "skip-name", label: "알파벳 이름은 배울 필요가 없다" },
      ],
      answer: "name-sound",
      explanation:
        "글자 이름은 그 글자를 부르는 말이고, 단어 안에서 나는 소리는 따로 익혀야 합니다. 같은 C라도 city에서는 /s/로 소리 납니다.",
    },
  ],

  "concept:english-vocab-chunks": [
    {
      id: "english-vocab-chunks-x1",
      prompt: "‘사진을 찍다’를 영어 청크로 옮긴 것으로 알맞은 것은?",
      choices: [
        { value: "take", label: "take a photo" },
        { value: "make", label: "make a photo" },
        { value: "do", label: "do a photo" },
        { value: "bring", label: "bring a photo" },
      ],
      answer: "take",
      explanation:
        "photo는 take와 짝을 이루어 다니는 말입니다. 한국어 ‘찍다’를 사전에서 하나씩 옮기면 문법은 맞아 보여도 영어에서 쓰지 않는 조합이 됩니다.",
    },
    {
      id: "english-vocab-chunks-x2",
      prompt: "영어에서는 ‘make friends’라고 쓰고 ‘do friends’라고는 쓰지 않습니다. 이 사실이 알려 주는 것은?",
      choices: [
        { value: "pair", label: "단어는 같이 붙어 다니는 짝까지 함께 익혀야 한다" },
        { value: "do", label: "동사 do는 영어에서 거의 쓰이지 않는다" },
        { value: "only", label: "friends는 어떤 문장에서도 make하고만 쓰인다" },
        { value: "grammar", label: "문법 규칙만 알면 어떤 동사든 넣어 쓸 수 있다" },
      ],
      answer: "pair",
      explanation:
        "뜻이 비슷한 동사라도 명사마다 함께 쓰는 짝이 정해져 있습니다. 그래서 단어를 낱개로 외우는 대신 짧은 덩어리로 묶어 두어야 실제 문장에서 꺼내 쓸 수 있습니다.",
    },
  ],

  // ── 영어 개념 · 듣기 ────────────────────────────────────────
  "concept:english-listening-purpose-relation": [
    {
      id: "english-listening-purpose-relation-x1",
      prompt:
        "대화입니다. M: Hello, I ordered a jacket last week, but the size is too small. Can I change it? / W: Sure. May I have your order number? — 남자가 전화한 목적은?",
      choices: [
        { value: "exchange", label: "산 옷을 다른 크기로 바꾸려고" },
        { value: "order", label: "새 옷을 주문하려고" },
        { value: "delay", label: "배송이 늦어 항의하려고" },
        { value: "location", label: "가게 위치를 물어보려고" },
      ],
      answer: "exchange",
      explanation:
        "too small과 Can I change it?이 목적을 그대로 말해 줍니다. ordered라는 말이 나오지만 새로 주문하려는 것이 아니라 이미 산 물건을 바꾸려는 것입니다.",
    },
    {
      id: "english-listening-purpose-relation-x2",
      prompt:
        "대화입니다. W: Your homework was late again. Please bring it tomorrow. / M: I am sorry, Ms. Kim. I will. — 두 사람의 관계는?",
      choices: [
        { value: "teacher", label: "선생님과 학생" },
        { value: "doctor", label: "의사와 환자" },
        { value: "clerk", label: "점원과 손님" },
        { value: "coach", label: "감독과 선수" },
      ],
      answer: "teacher",
      explanation:
        "homework라는 해야 할 일과 Ms. Kim이라는 호칭이 함께 관계를 가리킵니다. 관계는 낱말 하나가 아니라 호칭·장소·할 일 단서를 모아서 정합니다.",
    },
  ],

  "concept:english-listening-number-detail": [
    {
      id: "english-listening-number-detail-x1",
      prompt:
        "대화입니다. W: How much is this cap? / M: It is twenty dollars, but today everything is five dollars off. / W: Then I will take one. — 여자가 낼 돈은?",
      choices: [
        { value: "15", label: "15달러" },
        { value: "20", label: "20달러" },
        { value: "5", label: "5달러" },
        { value: "25", label: "25달러" },
      ],
      answer: "15",
      explanation:
        "처음 들린 twenty에서 멈추면 안 되고 five dollars off라는 조건까지 반영해야 합니다. 숫자 문제는 마지막으로 확정된 값을 적는 것이 원칙입니다.",
    },
    {
      id: "english-listening-number-detail-x2",
      prompt: "선택지가 3:00, 3:30, 4:00, 4:30이라면 듣기 전에 무엇을 정해 두어야 하나요?",
      choices: [
        { value: "time", label: "시각을 묻는 문항이므로 시간 표현과 시간을 바꾸는 말을 기다린다" },
        { value: "price", label: "가격 표현이 나올 때마다 받아 적는다" },
        { value: "people", label: "등장하는 사람 수를 세며 듣는다" },
        { value: "place", label: "장소 이름이 나오기를 기다린다" },
      ],
      answer: "time",
      explanation:
        "선택지가 모두 시각이므로 이 문항이 묻는 축은 시간입니다. 무엇을 기다릴지 먼저 정해 두면 다른 숫자가 섞여 나와도 흔들리지 않습니다.",
    },
  ],

  "concept:english-listening-inference": [
    {
      id: "english-listening-inference-x1",
      prompt:
        "대화입니다. M: Do you want to go hiking tomorrow? / W: Well, the weather report says it will rain all day. — 여자의 말이 뜻하는 것은?",
      choices: [
        { value: "refuse", label: "등산은 어렵겠다는 완곡한 거절" },
        { value: "like-rain", label: "비 오는 날 등산을 더 좋아한다는 뜻" },
        { value: "ask", label: "날씨를 대신 알아봐 달라는 부탁" },
        { value: "forget", label: "내일 약속을 잊고 있었다는 뜻" },
      ],
      answer: "refuse",
      explanation:
        "여자는 거절한다고 직접 말하지 않고 비가 온다는 사실만 말합니다. 들은 근거인 rain all day와 등산이라는 상황을 합치면 거절로 읽히는 것이 자연스럽습니다.",
    },
    {
      id: "english-listening-inference-x2",
      prompt: "남자가 대화에서 ‘I have to study tonight.’이라고만 말했습니다. 들은 근거 안에서 할 수 있는 판단은?",
      choices: [
        { value: "busy", label: "오늘 밤에는 다른 일을 하기 어렵다" },
        { value: "score", label: "남자는 시험에서 좋은 점수를 받을 것이다" },
        { value: "hate", label: "남자는 공부를 싫어한다" },
        { value: "tomorrow", label: "남자는 내일도 공부할 것이다" },
      ],
      answer: "busy",
      explanation:
        "이 문장이 보장하는 범위는 오늘 밤 해야 할 일까지입니다. 성적이나 감정, 내일 계획은 듣지 않은 내용을 덧붙인 추측이라 근거를 넘어섭니다.",
    },
  ],

  "concept:english-listening-long-dialogue": [
    {
      id: "english-listening-long-dialogue-x1",
      prompt:
        "대화입니다. W: Let us plan the school festival. First, we should decide the date. / M: How about May 10? Then we can book the hall. / W: Good. After that, we will tell the club leaders. — 두 사람이 할 일의 순서는?",
      choices: [
        { value: "date-hall-club", label: "날짜 정하기 → 강당 예약 → 동아리 대표에게 알리기" },
        { value: "hall-date-club", label: "강당 예약 → 날짜 정하기 → 동아리 대표에게 알리기" },
        { value: "club-date-hall", label: "동아리 대표에게 알리기 → 날짜 정하기 → 강당 예약" },
        { value: "date-club-hall", label: "날짜 정하기 → 동아리 대표에게 알리기 → 강당 예약" },
      ],
      answer: "date-hall-club",
      explanation:
        "First, Then, After that가 순서를 그대로 표시해 줍니다. 긴 대화는 문장을 다 붙잡는 대신 이런 순서 신호와 키워드만 남겨도 흐름이 유지됩니다.",
    },
    {
      id: "english-listening-long-dialogue-x2",
      prompt: "긴 대화를 듣다가 가운데 두 문장을 놓쳤습니다. 어떻게 해야 하나요?",
      choices: [
        { value: "recover", label: "놓친 부분은 두고 이어지는 말에서 주제와 할 일을 다시 잡는다" },
        { value: "stop", label: "놓친 부분을 떠올릴 때까지 잠시 멈춘다" },
        { value: "guess", label: "남은 부분은 듣지 않고 답을 찍는다" },
        { value: "rewrite", label: "처음부터 다시 떠올리며 문장을 받아쓴다" },
      ],
      answer: "recover",
      explanation:
        "놓친 곳에 매달리는 동안 뒤에 나오는 문장까지 함께 놓치게 됩니다. 대화의 주제와 마지막 할 일만 다시 이어 붙이면 대부분 회복할 수 있습니다.",
    },
  ],

  // ── 영어 개념 · 문장 문법 ───────────────────────────────────
  "concept:english-parts-of-speech": [
    {
      id: "english-parts-of-speech-x1",
      prompt: "‘This is a fast car.’와 ‘The student runs fast.’에서 fast의 품사는 각각 무엇인가요?",
      choices: [
        { value: "adj-adv", label: "앞은 형용사, 뒤는 부사" },
        { value: "adv-adj", label: "앞은 부사, 뒤는 형용사" },
        { value: "both-adj", label: "둘 다 형용사" },
        { value: "both-adv", label: "둘 다 부사" },
      ],
      answer: "adj-adv",
      explanation:
        "앞 문장의 fast는 명사 car를 꾸미고, 뒤 문장의 fast는 동사 runs를 꾸밉니다. 같은 단어라도 품사는 자리와 무엇을 꾸미는지로 정해집니다.",
    },
    {
      id: "english-parts-of-speech-x2",
      prompt: "‘The very old tree fell down.’에서 very가 꾸미는 말은 무엇인가요?",
      choices: [
        { value: "old", label: "old" },
        { value: "tree", label: "tree" },
        { value: "fell", label: "fell" },
        { value: "down", label: "down" },
      ],
      answer: "old",
      explanation:
        "very는 바로 뒤 형용사 old의 정도를 키워 줍니다. 부사는 동사만 꾸미는 것이 아니라 형용사와 다른 부사도 꾸밀 수 있습니다.",
    },
  ],

  "concept:english-svo": [
    {
      id: "english-svo-x1",
      prompt: "‘The children in the park played soccer.’에서 수식어를 걷어 낸 뼈대는 무엇인가요?",
      choices: [
        { value: "children-played", label: "The children played soccer" },
        { value: "park-played", label: "The park played soccer" },
        { value: "children-park", label: "The children in the park" },
        { value: "played-park", label: "played soccer in the park" },
      ],
      answer: "children-played",
      explanation:
        "in the park는 아이들이 어디에 있는지를 더해 주는 덩어리라 걷어 낼 수 있습니다. 남는 누가-한다-무엇을이 이 문장의 뼈대입니다.",
    },
    {
      id: "english-svo-x2",
      prompt: "‘My sister sings beautifully.’에 목적어(O)가 있나요?",
      choices: [
        { value: "no", label: "없다 — beautifully는 어떻게 노래하는지를 꾸미는 말이다" },
        { value: "yes-adv", label: "있다 — beautifully가 목적어다" },
        { value: "yes-subj", label: "있다 — My sister가 목적어다" },
        { value: "unknown", label: "동사만 보고는 알 수 없다" },
      ],
      answer: "no",
      explanation:
        "목적어는 동작을 받는 대상이 되는 명사 자리입니다. beautifully는 노래하는 방식을 꾸미는 부사라 목적어가 될 수 없고, 이 문장은 S+V로 끝납니다.",
    },
  ],

  "concept:english-tense-voice": [
    {
      id: "english-tense-voice-x1",
      prompt: "‘I ____ to Busan last summer.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "went", label: "went" },
        { value: "go", label: "go" },
        { value: "will-go", label: "will go" },
        { value: "am-going", label: "am going" },
      ],
      answer: "went",
      explanation:
        "last summer가 이미 지나간 때를 못 박아 줍니다. 시간 단서와 동사 형태는 늘 같이 봐야 하므로 과거형 went가 맞습니다.",
    },
    {
      id: "english-tense-voice-x2",
      prompt: "‘편지는 남동생이 썼다’는 뜻이 되도록 ‘The letter ____ by my brother.’를 채우면?",
      choices: [
        { value: "was-written", label: "was written" },
        { value: "wrote", label: "wrote" },
        { value: "was-writing", label: "was writing" },
        { value: "writes", label: "writes" },
      ],
      answer: "was-written",
      explanation:
        "주어 The letter는 쓰는 쪽이 아니라 쓰이는 쪽이므로 be + p.p. 형태가 필요합니다. wrote를 넣으면 편지가 무언가를 썼다는 뜻이 되어 버립니다.",
    },
  ],

  "concept:english-nonfinite": [
    {
      id: "english-nonfinite-x1",
      prompt: "‘Swimming is good exercise.’와 ‘The swimming boy is my brother.’에서 swimming의 역할은?",
      choices: [
        { value: "noun-adj", label: "앞은 명사 역할(주어), 뒤는 형용사 역할(명사 꾸밈)" },
        { value: "adj-noun", label: "앞은 형용사 역할, 뒤는 명사 역할" },
        { value: "both-noun", label: "둘 다 명사 역할" },
        { value: "both-verb", label: "둘 다 문장의 중심 동사" },
      ],
      answer: "noun-adj",
      explanation:
        "앞 문장에서는 is의 주어 자리를 차지하고, 뒤 문장에서는 boy 앞에서 어떤 소년인지 설명합니다. 같은 -ing라도 이름보다 문장에서 맡은 역할로 갈립니다.",
    },
    {
      id: "english-nonfinite-x2",
      prompt: "‘I have a lot of work to do.’에서 to do의 역할은 무엇인가요?",
      choices: [
        { value: "adjective", label: "앞의 명사 work를 꾸민다 — 해야 할 일" },
        { value: "subject", label: "문장의 주어다" },
        { value: "purpose", label: "일하는 목적을 말한다" },
        { value: "main", label: "문장의 중심 동사다" },
      ],
      answer: "adjective",
      explanation:
        "to do가 바로 앞 명사 work 뒤에 붙어 어떤 일인지를 좁혀 줍니다. 중심 동사는 이미 have가 맡고 있어 to do가 그 자리를 대신할 수 없습니다.",
    },
  ],

  "concept:english-clauses": [
    {
      id: "english-clauses-x1",
      prompt: "‘The man who lives next door has a big dog.’에서 who lives next door가 꾸미는 말은?",
      choices: [
        { value: "man", label: "The man" },
        { value: "door", label: "next door" },
        { value: "dog", label: "a big dog" },
        { value: "has", label: "has" },
      ],
      answer: "man",
      explanation:
        "관계사절은 바로 앞의 명사를 설명합니다. 이 절을 괄호로 묶으면 The man has a big dog라는 뼈대가 그대로 남습니다.",
    },
    {
      id: "english-clauses-x2",
      prompt: "‘The song that we heard yesterday was beautiful.’의 중심 동사는 무엇인가요?",
      choices: [
        { value: "was", label: "was" },
        { value: "heard", label: "heard" },
        { value: "song", label: "song" },
        { value: "beautiful", label: "beautiful" },
      ],
      answer: "was",
      explanation:
        "heard는 that we heard yesterday라는 관계사절 안의 동사입니다. 그 절을 괄호로 묶으면 The song was beautiful이 남고, 남은 was가 문장 전체의 동사입니다.",
    },
  ],

  // ── 영어 개념 · 구문 독해 ───────────────────────────────────
  "concept:english-chunking": [
    {
      id: "english-chunking-x1",
      prompt: "‘I saw a boy who was running in the park.’를 끊어 읽을 때 가장 알맞은 자리는?",
      choices: [
        { value: "before-who", label: "I saw a boy / who was running in the park." },
        { value: "after-a", label: "I saw a / boy who was running in the park." },
        { value: "after-who", label: "I saw a boy who / was running in the park." },
        { value: "after-was", label: "I saw a boy who was / running in the park." },
      ],
      answer: "before-who",
      explanation:
        "who부터 앞의 boy를 설명하는 새 덩어리가 시작됩니다. 관사와 명사 사이나 주어와 동사 사이를 자르면 한 덩어리가 반으로 쪼개집니다.",
    },
    {
      id: "english-chunking-x2",
      prompt: "‘The book on the table / is mine.’처럼 끊었습니다. 이 자리를 고른 근거는 무엇인가요?",
      choices: [
        { value: "chunk-end", label: "on the table까지가 주어 덩어리이고 그 뒤부터 동사가 시작되기 때문" },
        { value: "half", label: "문장을 길이가 비슷하게 반으로 나누면 읽기 쉽기 때문" },
        { value: "count", label: "단어 다섯 개마다 끊는 것이 규칙이기 때문" },
        { value: "prep", label: "전치사 앞에서는 언제나 끊어야 하기 때문" },
      ],
      answer: "chunk-end",
      explanation:
        "끊는 자리는 글자 수가 아니라 덩어리가 끝나는 곳으로 정합니다. 여기서는 주어 덩어리 The book on the table이 끝나고 동사 is가 시작됩니다.",
    },
  ],

  "concept:english-connectors": [
    {
      id: "english-connectors-x1",
      prompt:
        "‘Some students study late at night. For example, my brother reads until two.’에서 For example이 하는 일은?",
      choices: [
        { value: "case", label: "앞 문장의 내용을 구체적인 경우로 보여 준다" },
        { value: "turn", label: "앞 문장의 내용을 뒤집는다" },
        { value: "result", label: "앞 문장의 결과를 말한다" },
        { value: "new", label: "앞과 상관없는 새 주제를 시작한다" },
      ],
      answer: "case",
      explanation:
        "뒤 문장은 앞 문장이 말한 ‘늦게까지 공부하는 학생’에 들어맞는 한 사람을 듭니다. 예시는 앞의 주장을 바꾸지 않고 뒷받침만 합니다.",
    },
    {
      id: "english-connectors-x2",
      prompt:
        "‘Buses, subways, and trains are all useful. These help many people move every day.’에서 These가 가리키는 것은?",
      choices: [
        { value: "vehicles", label: "버스, 지하철, 기차" },
        { value: "people", label: "많은 사람" },
        { value: "day", label: "매일" },
        { value: "help", label: "도움이 되는 일" },
      ],
      answer: "vehicles",
      explanation:
        "these는 앞 문장에서 나열한 대상을 한 번에 받아 옵니다. 지시어가 나오면 앞으로 되돌아가 무엇을 묶어 받았는지 표시해 두어야 흐름이 끊기지 않습니다.",
    },
  ],

  // ── 영어 개념 · 독해 유형과 마무리 ──────────────────────────
  "concept:english-main-idea": [
    {
      id: "english-main-idea-x1",
      prompt:
        "‘Walking is a simple exercise. It needs no special tools. Anyone can start it today. So walking is a good way to stay healthy.’의 주제로 알맞은 것은?",
      choices: [
        { value: "walking-health", label: "걷기가 건강을 지키는 쉬운 방법이라는 것" },
        { value: "tools", label: "운동에 필요한 도구를 고르는 방법" },
        { value: "today", label: "오늘 당장 시작할 수 있는 여러 가지 일" },
        { value: "routine", label: "건강한 사람들의 하루 일과" },
      ],
      answer: "walking-health",
      explanation:
        "walking이 처음과 끝에 되풀이되고 So로 시작하는 마지막 문장이 결론을 말합니다. 반복 대상과 결론 문장을 합치면 주제가 그대로 나옵니다.",
    },
    {
      id: "english-main-idea-x2",
      prompt: "주제를 찾을 때 So, Thus, In short로 시작하는 문장을 눈여겨봐야 하는 까닭은?",
      choices: [
        { value: "conclusion", label: "앞의 내용을 하나로 묶어 정리하는 결론 문장일 때가 많기 때문" },
        { value: "hard", label: "그런 문장에 어려운 단어가 많이 들어 있기 때문" },
        { value: "long", label: "그런 문장이 대체로 가장 길기 때문" },
        { value: "first", label: "그런 문장이 언제나 글의 첫 문장이기 때문" },
      ],
      answer: "conclusion",
      explanation:
        "이런 말은 앞에서 늘어놓은 설명을 받아 한 문장으로 묶겠다는 신호입니다. 결론 문장은 반복 핵심어와 함께 주제를 가장 빠르게 알려 줍니다.",
    },
  ],

  "concept:english-gap": [
    {
      id: "english-gap-x1",
      prompt:
        "‘Many people think that talent decides everything. However, most experts say that ____ matters more. Even the best players train for many hours every day.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "practice", label: "practice" },
        { value: "talent", label: "talent" },
        { value: "luck", label: "luck" },
        { value: "money", label: "money" },
      ],
      answer: "practice",
      explanation:
        "However가 앞의 talent를 뒤집으므로 빈칸에는 talent와 맞서는 말이 와야 합니다. 뒤 문장의 train for many hours가 그 말이 연습임을 확인해 줍니다.",
    },
    {
      id: "english-gap-x2",
      prompt: "빈칸 앞 문장이 어떤 장점을 말했고, 빈칸이 들어 있는 문장이 However로 시작합니다. 빈칸의 방향은?",
      choices: [
        { value: "against", label: "앞에서 말한 장점과 어긋나는 쪽" },
        { value: "same", label: "앞의 장점을 더 강하게 되풀이하는 쪽" },
        { value: "new", label: "앞과 상관없는 새 화제를 여는 쪽" },
        { value: "alone", label: "빈칸이 든 문장 하나만 보고 정하면 되는 쪽" },
      ],
      answer: "against",
      explanation:
        "빈칸은 그 문장 하나가 아니라 앞뒤 관계가 정합니다. However가 방향을 꺾었으니 빈칸에도 앞의 장점과 반대되는 내용이 들어가야 합니다.",
    },
  ],

  "concept:english-order-insertion": [
    {
      id: "english-order-insertion-x1",
      prompt:
        "(A) He was very hungry after the long walk. (B) A boy found a small shop on the street. (C) So he bought a sandwich there. — 알맞은 순서는?",
      choices: [
        { value: "bac", label: "(B) - (A) - (C)" },
        { value: "abc", label: "(A) - (B) - (C)" },
        { value: "bca", label: "(B) - (C) - (A)" },
        { value: "cab", label: "(C) - (A) - (B)" },
      ],
      answer: "bac",
      explanation:
        "(A)의 He와 (C)의 there는 앞에 소년과 가게가 먼저 나와야 가리킬 수 있으므로 (B)가 맨 앞입니다. 배가 고팠다는 이유를 받아 So가 붙은 (C)가 마지막입니다.",
    },
    {
      id: "english-order-insertion-x2",
      prompt: "순서 문제에서 첫 번째 자리에 올 수 없는 문단을 빠르게 거르는 방법은?",
      choices: [
        { value: "pronoun", label: "it, this, However처럼 앞을 받는 말로 시작하는 문단을 뺀다" },
        { value: "short", label: "가장 짧은 문단을 뺀다" },
        { value: "hard", label: "모르는 단어가 많은 문단을 뺀다" },
        { value: "period", label: "마침표로 끝나는 문단을 뺀다" },
      ],
      answer: "pronoun",
      explanation:
        "지시어와 연결어는 앞에 받을 내용이 있어야 쓸 수 있는 말입니다. 그런 말로 시작하는 문단은 받을 앞 내용이 없는 첫 자리에 놓일 수 없습니다.",
    },
  ],

  "concept:english-vocab-grammar": [
    {
      id: "english-vocab-grammar-x1",
      prompt: "‘The old bridge is dangerous, so the city decided to ____ it.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "repair", label: "repair" },
        { value: "ignore", label: "ignore" },
        { value: "praise", label: "praise" },
        { value: "borrow", label: "borrow" },
      ],
      answer: "repair",
      explanation:
        "네 단어 모두 문법상으로는 그 자리에 들어갑니다. 위험하다는 앞 내용이 뒤에 올 행동의 방향을 정하므로 문맥에 맞는 것은 repair뿐입니다.",
    },
    {
      id: "english-vocab-grammar-x2",
      prompt: "‘Each of the students ____ a name tag.’의 빈칸에 알맞은 것은?",
      choices: [
        { value: "has", label: "has" },
        { value: "have", label: "have" },
        { value: "are", label: "are" },
        { value: "were", label: "were" },
      ],
      answer: "has",
      explanation:
        "주어의 중심은 Each 하나이고 of the students는 그것을 꾸미는 덩어리라 단수로 받습니다. 동사 바로 앞의 students에 끌리면 have를 고르게 됩니다.",
    },
  ],

  "concept:english-long-passage": [
    {
      id: "english-long-passage-x1",
      prompt:
        "장문의 한 문단이 ‘For example, in one school, students planted trees in the yard.’로 시작합니다. 이 문단의 역할은?",
      choices: [
        { value: "example", label: "앞 문단의 주장을 받쳐 주는 사례" },
        { value: "problem", label: "글 전체의 문제 제기" },
        { value: "counter", label: "앞 문단을 반박하는 부분" },
        { value: "conclusion", label: "글 전체를 정리하는 결론" },
      ],
      answer: "example",
      explanation:
        "For example과 한 학교의 구체적인 이야기가 앞 문단이 말한 내용을 받쳐 줍니다. 문단마다 이런 역할을 한 단어로 붙여 두면 긴 글도 짧아집니다.",
    },
    {
      id: "english-long-passage-x2",
      prompt: "장문을 읽다가 한 문장이 전혀 해석되지 않습니다. 가장 좋은 방법은?",
      choices: [
        { value: "move-on", label: "표시만 해 두고 넘어가 문단 역할과 연결사로 흐름을 잇는다" },
        { value: "dictionary", label: "그 문장이 풀릴 때까지 단어를 하나씩 찾아본다" },
        { value: "skip-para", label: "그 문단 전체를 건너뛴다" },
        { value: "restart", label: "글의 처음으로 돌아가 다시 읽는다" },
      ],
      answer: "move-on",
      explanation:
        "장문에서는 멈춤보다 진행이 중요합니다. 문단 역할과 연결사가 남아 있으면 문장 하나를 놓쳐도 큰 흐름은 무너지지 않습니다.",
    },
  ],

  "concept:english-ebs-linkage": [
    {
      id: "english-ebs-linkage-x1",
      prompt:
        "EBS 듣기 지문에서 ‘Actually, I have to work late.’를 만났고 강의로 확인했습니다. 노트에 남겨야 할 것은?",
      choices: [
        { value: "procedure", label: "Actually가 나오면 앞의 계획을 지운다는 절차" },
        { value: "translation", label: "그 문장의 한국어 번역 한 줄" },
        { value: "number", label: "그 문장이 몇 번 문항에 나왔는지" },
        { value: "board", label: "강사가 판서에 쓴 색깔과 기호" },
      ],
      answer: "procedure",
      explanation:
        "수능에는 같은 지문이 그대로 나오지 않습니다. 남겨야 할 것은 이 지문의 번역이 아니라 다음 듣기에도 그대로 쓸 수 있는 절차입니다.",
    },
    {
      id: "english-ebs-linkage-x2",
      prompt: "듣기에서 숫자 문제를 자주 틀립니다. EBS를 어떻게 쓰는 것이 좋을까요?",
      choices: [
        { value: "type", label: "숫자 유형만 모아 단위 확인 → 바뀌는 말 기다리기 절차를 되풀이한다" },
        { value: "all", label: "강좌를 1강부터 끝까지 순서대로 모두 듣는다" },
        { value: "reading", label: "독해 강좌를 먼저 다 끝낸 뒤에 듣기로 넘어간다" },
        { value: "copy", label: "강의 필기를 그대로 옮겨 적어 둔다" },
      ],
      answer: "type",
      explanation:
        "EBS는 많이 보는 것보다 약한 유형 하나를 정해 같은 절차를 반복할 때 효과가 납니다. 강좌를 순서대로 훑으면 약점은 그대로 남습니다.",
    },
  ],

  "concept:english-practical": [
    {
      id: "english-practical-x1",
      prompt: "실전에서 빈칸 문제 하나에 5분 넘게 막혔습니다. 가장 좋은 선택은?",
      choices: [
        { value: "mark", label: "표시해 두고 다음 문항으로 넘어간 뒤 시간이 남으면 돌아온다" },
        { value: "hold", label: "풀릴 때까지 그 문항을 계속 붙잡는다" },
        { value: "guess", label: "아무 번호나 찍고 다시 보지 않는다" },
        { value: "skip-all", label: "남은 문항을 모두 건너뛰고 채점한다" },
      ],
      answer: "mark",
      explanation:
        "한 문항에 머무는 동안 풀 수 있었던 뒤 문항까지 함께 잃습니다. 회수 가능한 문항을 먼저 챙기고 남은 시간에 돌아오는 편이 점수를 지킵니다.",
    },
    {
      id: "english-practical-x2",
      prompt:
        "‘The man who was standing near the gate waved at us.’에서 단어는 다 아는데 어디서 끊을지 몰라 틀렸습니다. 오답 원인은?",
      choices: [
        { value: "structure", label: "구조 — 절과 수식 덩어리를 나누지 못했다" },
        { value: "word", label: "단어 — 어휘가 부족했다" },
        { value: "time", label: "시간 — 시간이 모자랐다" },
        { value: "mark", label: "실수 — 답을 잘못 옮겨 적었다" },
      ],
      answer: "structure",
      explanation:
        "단어를 모두 알고도 who절이 어디서 끝나는지 못 봤다면 어휘가 아니라 구조에서 무너진 것입니다. 원인을 갈라 적어야 다음에 무엇을 훈련할지 정해집니다.",
    },
  ],
};
