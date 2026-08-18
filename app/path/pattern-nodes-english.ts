import type { PatternNode } from "./pattern-nodes.ts";

/**
 * 수능 영어 문제 유형 칸.
 *
 * 문항 번호 순서대로 놓는다. 개념 칸에서 배운 문장 읽기를 실제 시험지의
 * 번호별 모양에 붙이는 자리라, 번호가 곧 학습 순서다.
 *
 * 듣기(1~17번)는 이 앱에 음성이 없으므로 다루지 않는다.
 */
export const ENGLISH_PATTERNS: PatternNode[] = [
  {
    id: "en-p18-purpose",
    subject: "english",
    title: "18번 글의 목적",
    summary: "편지 한 통을 읽고 이 글을 쓴 진짜 용건을 고릅니다.",
    explanation:
      "18번은 편지나 이메일 한 통을 통째로 보여 주고 글쓴이가 이 글을 쓴 목적을 고르는 문제입니다. 앞부분은 거의 언제나 인사말과 칭찬, 감사로 시작하고 진짜 용건은 그 뒤에 나옵니다. 그래서 첫 문장만 읽고 고르면 대부분 틀립니다. 선택지는 모두 한국어로 ‘~하려고’ 꼴이라, 요청인지 안내인지 사과인지 하는 방향만 갈립니다. 독해력보다 용건 문장을 찾아내는 습관이 점수를 정합니다.",
    keyPoints: [
      "선택지 다섯 개를 먼저 읽고 각 선택지의 끝말(요청·안내·사과·감사·항의)에 표시합니다.",
      "본문에서 I am writing to, I would like to, Could you, Please가 들어간 문장을 찾아 밑줄을 긋습니다.",
      "밑줄 친 문장의 동사와 목적어만 한국어로 옮겨 적고, 그 말이 그대로 들어간 선택지를 고릅니다.",
    ],
    mistake:
      "첫 문단의 감사나 칭찬을 목적으로 착각합니다. 앞의 좋은 말은 예의를 갖추려고 붙인 것이고, 진짜 용건은 그다음에 오는 요청 문장에 있습니다.",
    questions: [
      {
        id: "en-p18-q1",
        prompt:
          "‘Thank you for your kind letter. Our members enjoyed your talk last month. However, the heater in the reading room has been broken for two weeks. Could you please send someone to fix it?’ 이 글의 목적으로 가장 알맞은 것은?",
        choices: [
          { value: "repair", label: "고장 난 난방기 수리를 요청하려고" },
          { value: "thanks", label: "지난달 강연에 감사하려고" },
          { value: "invite", label: "새 강연에 초대하려고" },
          { value: "notice", label: "열람실 휴관을 알리려고" },
        ],
        answer: "repair",
        explanation:
          "감사 인사는 본론에 들어가기 전에 붙인 예의입니다. 실제 용건은 Could you please send someone to fix it이라는 요청 문장이므로 목적은 수리 요청입니다.",
      },
      {
        id: "en-p18-q2",
        prompt: "편지에서 인사말이 끝나고 진짜 용건이 시작된다는 신호로 가장 알맞은 표현은?",
        choices: [
          { value: "writing-to", label: "I am writing to ask about ..." },
          { value: "hope-well", label: "I hope you are doing well." },
          { value: "pleased", label: "I was pleased to meet you." },
          { value: "thank", label: "Thank you for your support." },
        ],
        answer: "writing-to",
        explanation:
          "I am writing to 뒤에는 편지를 쓴 이유가 곧바로 붙습니다. 나머지 세 개는 본론에 들어가기 전 인사말이라 목적을 알려 주지 않습니다.",
      },
      {
        id: "en-p18-q3",
        prompt:
          "‘We are happy to tell you that your son has joined our science club. The club meets every Friday at four. We need a parent to help us on the first day. Would you be able to join us this Friday?’ 이 글의 목적으로 가장 알맞은 것은?",
        choices: [
          { value: "help", label: "첫날 도움을 줄 학부모 참여를 요청하려고" },
          { value: "join", label: "아들의 동아리 가입을 알리려고" },
          { value: "change", label: "모임 시간 변경을 안내하려고" },
          { value: "intro", label: "과학 동아리를 소개하려고" },
        ],
        answer: "help",
        explanation:
          "가입 소식과 모임 시간은 상황을 알려 주는 배경입니다. 상대에게 실제로 바라는 것은 마지막 물음표 문장 Would you be able to join us이므로 목적은 참여 요청입니다.",
      },
    ],
  },

  {
    id: "en-p19-mood",
    subject: "english",
    title: "19번 심경 변화",
    summary: "짧은 이야기에서 주인공의 감정이 앞과 뒤로 어떻게 바뀌는지 고릅니다.",
    explanation:
      "19번은 짧은 이야기 한 편을 주고 주인공의 심경이 처음에서 끝으로 어떻게 바뀌는지를 A → B 꼴로 고르는 문제입니다. 선택지가 nervous → relieved처럼 단어 두 개로 되어 있어서 앞 단어와 뒤 단어를 서로 다른 장면에서 확인해야 합니다. 글 가운데에는 상황이 뒤집히는 문장이 거의 언제나 하나 있습니다. 감정을 nervous 같은 단어로 직접 말해 주지 않고 shaking hands, heart pounding처럼 몸의 반응으로 보여 주는 경우가 많습니다.",
    keyPoints: [
      "선택지의 앞 단어끼리 한 줄, 뒤 단어끼리 한 줄로 모아 뜻을 먼저 적습니다.",
      "본문에서 but, suddenly, then, finally를 찾아 그 앞에 세로선을 긋고 글을 두 장면으로 나눕니다.",
      "세로선 앞에서 감정을 보여 주는 표현 하나, 뒤에서 하나를 찾아 선택지의 앞·뒤 단어와 맞춰 봅니다.",
    ],
    mistake:
      "앞 단어만 맞으면 바로 고릅니다. 선택지에는 앞 단어가 같은 것이 둘 이상 들어 있으므로, 뒤 단어까지 확인해야 하나만 남습니다.",
    questions: [
      {
        id: "en-p19-q1",
        prompt:
          "‘Mina stood at the door with shaking hands. She could not remember a single line. Then she saw her teacher smiling in the front row. Her voice came back, and she finished the whole speech.’ Mina의 심경 변화로 가장 알맞은 것은?",
        choices: [
          { value: "nervous-relieved", label: "불안한 → 안도한" },
          { value: "bored-excited", label: "지루한 → 신난" },
          { value: "angry-calm", label: "화난 → 차분한" },
          { value: "happy-disappointed", label: "행복한 → 실망한" },
        ],
        answer: "nervous-relieved",
        explanation:
          "손이 떨리고 대사를 하나도 기억하지 못하는 것은 불안의 표시입니다. Then 뒤에서 목소리가 돌아와 연설을 끝냈으므로 뒤 장면의 감정은 안도입니다.",
      },
      {
        id: "en-p19-q2",
        prompt: "심경 변화 문제에서 장면이 뒤집히는 자리를 알려 주는 말로 가장 알맞은 것은?",
        choices: [
          { value: "suddenly", label: "Suddenly" },
          { value: "because", label: "Because" },
          { value: "for-example", label: "For example" },
          { value: "in-addition", label: "In addition" },
        ],
        answer: "suddenly",
        explanation:
          "suddenly, but, then처럼 흐름을 꺾는 말 뒤에서 상황이 바뀝니다. because나 for example은 앞 내용을 이어 설명할 뿐이라 감정이 바뀌지 않습니다.",
      },
      {
        id: "en-p19-q3",
        prompt:
          "‘His heart was pounding and his mouth felt dry as he waited for the results.’가 보여 주는 심경으로 가장 알맞은 것은?",
        choices: [
          { value: "anxious", label: "초조한" },
          { value: "bored", label: "지루한" },
          { value: "proud", label: "자랑스러운" },
          { value: "sleepy", label: "졸린" },
        ],
        answer: "anxious",
        explanation:
          "심장이 뛰고 입이 마른다는 몸의 반응은 결과를 기다리는 초조함을 보여 줍니다. 19번은 감정 단어 대신 이런 몸의 반응으로 심경을 알려 주는 일이 많습니다.",
      },
    ],
  },

  {
    id: "en-p20-claim",
    subject: "english",
    title: "20번 필자의 주장",
    summary: "필자가 독자에게 시키는 행동 하나를 골라냅니다.",
    explanation:
      "20번은 필자가 독자에게 이렇게 하라고 말하는 글을 주고 그 주장을 한국어 문장으로 고르는 문제입니다. 선택지가 모두 ‘~해야 한다’로 끝나므로 내용이 아니라 방향이 갈립니다. 주장 문장에는 should, must, need to가 들어가거나 동사로 시작하는 명령문 꼴이고, 보통 첫 문단 끝과 마지막 문단에 두 번 나옵니다. 22번 요지와 비슷해 보이지만, 주장은 반드시 사람이 할 행동을 지목한다는 점이 다릅니다.",
    keyPoints: [
      "본문을 훑으며 should, must, need to가 든 문장과 동사로 시작하는 명령문에 동그라미를 칩니다.",
      "동그라미가 두 개 이상이면 글 마지막에 있는 것을 고릅니다. 필자는 끝에서 한 번 더 못을 박습니다.",
      "고른 문장을 ‘누가 무엇을 하라’ 한 줄로 적고, 행동이 그대로 들어간 선택지를 찾습니다.",
    ],
    mistake:
      "본문에 나온 예시나 연구 결과를 주장으로 고릅니다. 예시는 주장을 믿게 하려고 붙인 근거일 뿐이고, 주장은 언제나 사람이 할 행동을 말합니다.",
    questions: [
      {
        id: "en-p20-q1",
        prompt:
          "‘Students often study many subjects at the same time. This feels busy, but little stays in memory. Choose one subject and stay with it for an hour. Deep work on one thing beats touching five things.’ 필자의 주장으로 가장 알맞은 것은?",
        choices: [
          { value: "one-subject", label: "한 번에 한 과목에 집중해서 공부해야 한다" },
          { value: "many", label: "여러 과목을 번갈아 공부해야 한다" },
          { value: "time", label: "공부 시간을 더 늘려야 한다" },
          { value: "memory", label: "암기하는 방법을 바꿔야 한다" },
        ],
        answer: "one-subject",
        explanation:
          "Choose one subject and stay with it이라는 명령문이 필자가 시키는 행동이고, 마지막 문장이 같은 말을 다시 확인해 줍니다.",
      },
      {
        id: "en-p20-q2",
        prompt: "다음 중 필자의 주장이 담긴 문장으로 가장 알맞은 것은?",
        choices: [
          { value: "should", label: "We should read the label before we buy food." },
          { value: "survey", label: "A survey found that many people buy food quickly." },
          { value: "define", label: "A label is a small paper on a product." },
          { value: "example", label: "For example, my friend bought the wrong milk." },
        ],
        answer: "should",
        explanation:
          "주장은 독자가 할 행동을 가리키는 문장이고 We should read가 바로 그것입니다. 조사 결과와 정의, 예시는 그 주장을 받쳐 주는 재료입니다.",
      },
      {
        id: "en-p20-q3",
        prompt: "20번 주장과 22번 요지의 선택지가 다른 점으로 가장 알맞은 것은?",
        choices: [
          { value: "action", label: "주장은 사람이 할 행동을, 요지는 글이 내린 결론을 말한다" },
          { value: "length", label: "주장이 요지보다 늘 길다" },
          { value: "lang", label: "주장은 영어로, 요지는 한국어로 나온다" },
          { value: "place", label: "주장은 첫 문장에만, 요지는 마지막 문장에만 있다" },
        ],
        answer: "action",
        explanation:
          "두 유형 모두 한국어 선택지를 쓰지만, 20번은 ‘~해야 한다’처럼 독자가 할 행동을 시키고 22번은 글 전체가 도달한 결론을 정리합니다.",
      },
    ],
  },

  {
    id: "en-p21-implication",
    subject: "english",
    title: "21번 밑줄 함축 의미",
    summary: "밑줄 친 비유가 이 글 안에서 무슨 뜻으로 쓰였는지 찾습니다.",
    explanation:
      "21번은 지문 속 밑줄 친 짧은 표현을 주고 그 표현이 이 글 안에서 무엇을 뜻하는지 고르는 문제입니다. 밑줄은 대개 비유라서 사전 뜻으로는 답이 나오지 않습니다. 근거는 밑줄이 그어진 문장 자체가 아니라 그 앞뒤 문장, 특히 바로 뒤에 이어지는 풀이 문장에 있습니다. 선택지는 영어로 나오기도 하지만 결국 글의 요지를 밑줄 표현 자리에 맞게 바꿔 쓴 것입니다. 그래서 요지를 한 줄로 잡아 두면 답이 반으로 줄어듭니다.",
    keyPoints: [
      "밑줄 표현이 글에서 좋은 뜻으로 쓰였는지 나쁜 뜻으로 쓰였는지 옆에 + 또는 −를 적습니다.",
      "밑줄 바로 앞뒤 두 문장에서 그 표현을 풀어 설명한 부분을 찾아 밑줄을 긋습니다.",
      "글 전체의 요지를 한 줄로 적고, 그 요지와 부호가 같은 선택지만 남긴 뒤 고릅니다.",
    ],
    mistake:
      "밑줄 친 단어의 사전 뜻으로 답을 고릅니다. 21번은 단어 시험이 아니라 그 표현이 이 글 안에서 맡은 역할을 묻는 문제입니다.",
    questions: [
      {
        id: "en-p21-q1",
        prompt:
          "‘Some students carry a heavy backpack of old rules. They keep using the study habits they learned in middle school, even when those habits no longer work.’ 밑줄 친 a heavy backpack of old rules의 의미로 가장 알맞은 것은?",
        choices: [
          { value: "outdated", label: "통하지 않는데도 버리지 못하는 옛 방식" },
          { value: "bag", label: "교과서가 많이 들어 무거운 가방" },
          { value: "school-rules", label: "학교가 정한 엄격한 규칙" },
          { value: "strength", label: "오래 공부해서 쌓인 힘" },
        ],
        answer: "outdated",
        explanation:
          "바로 뒤 문장이 밑줄을 풀어 설명합니다. 더 이상 통하지 않는데도 계속 쓰는 중학교 시절 습관을 가리킵니다.",
      },
      {
        id: "en-p21-q2",
        prompt:
          "‘Praise can become a cage. Children who hear only praise stop trying new things.’에서 밑줄 친 a cage가 가리키는 것으로 가장 알맞은 것은?",
        choices: [
          { value: "limit", label: "칭찬이 아이를 가두어 새 시도를 막는 일" },
          { value: "safe", label: "칭찬이 아이를 안전하게 지켜 주는 일" },
          { value: "zoo", label: "동물원에 있는 실제 우리" },
          { value: "reward", label: "더 큰 상을 받게 되는 일" },
        ],
        answer: "limit",
        explanation:
          "뒤 문장이 새로운 시도를 멈춘다는 나쁜 결과를 말하므로 cage는 가두어 막는다는 부정적인 뜻으로 쓰였습니다.",
      },
      {
        id: "en-p21-q3",
        prompt: "21번에서 밑줄 표현의 뜻을 정할 근거로 가장 먼저 볼 곳은?",
        choices: [
          { value: "around", label: "밑줄 바로 앞뒤 문장" },
          { value: "dict", label: "영어 사전에 실린 첫 번째 뜻" },
          { value: "title", label: "지문 위에 붙은 제목" },
          { value: "longest", label: "선택지 중 가장 긴 것" },
        ],
        answer: "around",
        explanation:
          "필자는 비유를 던진 뒤 곧바로 그 뜻을 풀어 설명합니다. 그래서 앞뒤 문장이 사전보다 정확한 근거가 됩니다.",
      },
    ],
  },

  {
    id: "en-p22-main-point",
    subject: "english",
    title: "22번 글의 요지",
    summary: "글 전체가 도달한 결론을 한국어 한 문장으로 고릅니다.",
    explanation:
      "22번은 글 전체가 하고 싶은 말을 한국어 한 문장으로 고르는 문제입니다. 답의 뿌리는 필자의 판단이 담긴 문장, 곧 중요하다·낫다·해롭다 같은 평가가 들어간 문장입니다. 그런 문장은 보통 첫 문단 끝이나 마지막 문단에 놓이고, 가운데는 그것을 뒷받침하는 예와 연구입니다. 23번 주제가 ‘무엇에 관한 글인가’를 묻는다면 22번 요지는 ‘그래서 필자가 뭐라고 했는가’를 묻습니다.",
    keyPoints: [
      "각 문단의 첫 문장만 먼저 읽어 글이 되풀이해 다루는 대상을 확인합니다.",
      "important, must, better, harmful처럼 평가가 든 문장을 찾아 별표를 합니다.",
      "별표 문장을 ‘무엇은 어떠하다’ 한 줄로 줄이고, 그 대상과 평가가 둘 다 든 선택지를 고릅니다.",
    ],
    mistake:
      "본문에 나온 예시 하나만 정리한 선택지를 고릅니다. 요지는 예시가 아니라 여러 예시가 함께 가리키는 결론입니다.",
    questions: [
      {
        id: "en-p22-q1",
        prompt:
          "‘We often think talent decides everything. But most experts became good after years of daily practice. Talent may open the door, but practice keeps you in the room.’ 이 글의 요지로 가장 알맞은 것은?",
        choices: [
          { value: "practice", label: "재능보다 꾸준한 연습이 실력을 만든다" },
          { value: "talent", label: "재능이 있어야 전문가가 될 수 있다" },
          { value: "door", label: "기회의 문을 여는 방법이 중요하다" },
          { value: "years", label: "전문가가 되기까지는 오랜 시간이 걸린다" },
        ],
        answer: "practice",
        explanation:
          "But 뒤에 필자의 판단이 있고 마지막 문장이 같은 판단을 비유로 다시 말합니다. 연습이 실력을 지킨다는 것이 글의 결론입니다.",
      },
      {
        id: "en-p22-q2",
        prompt: "다음 중 요지의 뿌리가 되는 필자의 판단이 담긴 문장은?",
        choices: [
          { value: "important", label: "Sleep is more important than one extra hour of study." },
          { value: "fact", label: "Most students sleep about six hours a night." },
          { value: "example", label: "My brother slept four hours last night." },
          { value: "question", label: "How long do you usually sleep?" },
        ],
        answer: "important",
        explanation:
          "more important than은 필자가 내린 평가입니다. 나머지는 사실이나 예시, 질문이라서 글의 결론이 될 수 없습니다.",
      },
      {
        id: "en-p22-q3",
        prompt:
          "글이 도시의 가로수만 다뤘는데 선택지에 ‘환경을 보호해야 한다’가 있습니다. 이 선택지의 문제는?",
        choices: [
          { value: "broad", label: "글이 다루지 않은 범위까지 넓혔다" },
          { value: "narrow", label: "글보다 범위가 지나치게 좁다" },
          { value: "opposite", label: "글과 내용이 반대다" },
          { value: "fine", label: "맞는 말이므로 문제가 없다" },
        ],
        answer: "broad",
        explanation:
          "요지는 글이 실제로 다룬 범위와 크기가 같아야 합니다. 그 자체로 옳은 말이어도 글보다 넓으면 답이 될 수 없습니다.",
      },
    ],
  },
];
