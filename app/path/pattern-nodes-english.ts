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

  {
    id: "en-p23-topic",
    subject: "english",
    title: "23번 글의 주제",
    summary: "글이 무엇에 관한 글인지를 영어 명사구로 고릅니다.",
    explanation:
      "23번은 글이 무엇에 관한 글인지를 영어 명사구로 고르는 문제입니다. 선택지 다섯 개가 서로 범위만 조금씩 다르게 만들어져 있어서, 한 문단만 덮으면 너무 좁고 글에 없는 말이 하나라도 붙으면 너무 넓습니다. 22번 요지가 글이 내린 결론 문장이라면 23번 주제는 그 결론이 다루는 범위입니다. 선택지가 영어라 어려워 보이지만, 실제로는 되풀이되는 명사 두 개를 찾는 일에 가깝습니다.",
    keyPoints: [
      "여러 문단에 걸쳐 되풀이되는 명사 두 개에 동그라미를 칩니다.",
      "그 두 명사를 잇는 관계(원인·효과·이점·문제점)를 한국어 한 단어로 옆에 적습니다.",
      "선택지에서 동그라미 친 명사가 둘 다 들어 있고 관계도 같은 것을 고릅니다.",
    ],
    mistake:
      "지문에 나온 단어가 보이면 맞다고 봅니다. 오답 선택지도 일부러 지문의 단어를 쓰므로, 단어가 아니라 두 단어를 잇는 관계까지 같은지 봐야 합니다.",
    questions: [
      {
        id: "en-p23-q1",
        prompt:
          "‘Bees do more than make honey. They move pollen from flower to flower, so many plants can produce fruit. Without bees, farmers would lose a large part of their crops.’ 이 글의 주제로 가장 알맞은 것은?",
        choices: [
          { value: "role-of-bees", label: "the role of bees in growing food" },
          { value: "how-honey", label: "how bees make honey" },
          { value: "farm-life", label: "the daily life of a farmer" },
          { value: "flowers", label: "the beauty of spring flowers" },
        ],
        answer: "role-of-bees",
        explanation:
          "되풀이되는 명사는 bees와 plants·crops이고 둘을 잇는 관계는 도움을 준다는 것입니다. honey는 첫 문장에서 오히려 그것만이 아니라며 밀어낸 소재입니다.",
      },
      {
        id: "en-p23-q2",
        prompt: "글이 아침 식사가 집중력에 주는 도움만 다뤘습니다. 주제로 가장 알맞은 것은?",
        choices: [
          { value: "breakfast-focus", label: "the effect of breakfast on concentration" },
          { value: "food-history", label: "the history of human food" },
          { value: "diet", label: "how to build a healthy diet" },
          { value: "grades", label: "ways to improve school grades" },
        ],
        answer: "breakfast-focus",
        explanation:
          "주제는 글이 다룬 범위와 정확히 겹쳐야 합니다. 나머지는 아침 식사와 집중력이라는 두 축 가운데 하나가 빠졌거나 범위가 훨씬 넓습니다.",
      },
      {
        id: "en-p23-q3",
        prompt: "22번 요지와 23번 주제가 다른 점으로 가장 알맞은 것은?",
        choices: [
          { value: "form", label: "요지는 문장으로 결론을, 주제는 명사구로 다루는 범위를 말한다" },
          { value: "hard", label: "주제가 요지보다 늘 어려운 글에서 나온다" },
          { value: "place", label: "요지는 앞 문단에, 주제는 뒤 문단에만 있다" },
          { value: "count", label: "요지는 선택지가 다섯 개, 주제는 네 개다" },
        ],
        answer: "form",
        explanation:
          "같은 글이라면 두 답이 사실상 겹치지만 묻는 모양이 다릅니다. 요지는 결론을 문장으로 말하고, 주제는 그 결론이 덮는 범위를 명사구로 말합니다.",
      },
    ],
  },

  {
    id: "en-p24-title",
    subject: "english",
    title: "24번 글의 제목",
    summary: "글 전체의 결론을 짧게 줄인 영어 제목을 고릅니다.",
    explanation:
      "24번은 글에 어울리는 제목을 영어로 고르는 문제입니다. 23번 주제와 뿌리는 같지만 제목은 더 짧고, 비유나 물음표, 콜론을 써서 멋을 낸 표현이 정답이 되는 일이 많습니다. 그래서 지문의 단어를 그대로 옮겨 놓은 선택지가 오히려 오답인 경우가 흔합니다. 제목도 글 전체를 덮어야 하고, 필자의 태도가 권함인지 경고인지까지 제목의 어감과 맞아야 합니다.",
    keyPoints: [
      "먼저 글의 요지를 한국어 한 줄로 적어 둡니다. 제목은 그 한 줄을 짧게 줄인 것입니다.",
      "선택지에서 글이 다루지 않은 명사가 하나라도 든 것을 지웁니다.",
      "남은 것 중 요지의 방향(권함·경고·놀라움)과 어감이 같은 것을 고릅니다.",
    ],
    mistake:
      "지문 첫 문장에 나온 표현이 그대로 든 선택지를 고릅니다. 제목은 첫 문장이 아니라 글 전체가 도달한 결론을 줄인 것입니다.",
    questions: [
      {
        id: "en-p24-q1",
        prompt:
          "‘Many people buy a new phone every year. The old one still works, but it looks slow next to the new model. In the end, we pay for a feeling, not for a better tool.’ 제목으로 가장 알맞은 것은?",
        choices: [
          { value: "feeling", label: "We Pay for a Feeling, Not a Better Phone" },
          { value: "faster", label: "How to Make Your Old Phone Faster" },
          { value: "history", label: "The History of the Mobile Phone" },
          { value: "cheap", label: "Where to Buy a Cheap Phone" },
        ],
        answer: "feeling",
        explanation:
          "마지막 문장이 글의 결론이고 제목은 그 결론을 줄인 것입니다. 나머지 셋은 글이 아예 다루지 않은 이야기입니다.",
      },
      {
        id: "en-p24-q2",
        prompt: "밤늦게까지 화면을 보는 습관의 위험을 경고하는 글입니다. 제목으로 가장 알맞은 것은?",
        choices: [
          { value: "cost", label: "The Hidden Cost of Late-Night Screens" },
          { value: "friend", label: "Screens: The Best Friend of Sleep" },
          { value: "neutral", label: "A Short History of the Smartphone" },
          { value: "more", label: "How to Watch More Videos at Night" },
        ],
        answer: "cost",
        explanation:
          "제목은 필자의 태도까지 담아야 합니다. 경고하는 글이라면 대가나 위험을 가리키는 표현이 제목에 들어갑니다.",
      },
      {
        id: "en-p24-q3",
        prompt: "23번 주제와 견줄 때 24번 제목의 특징으로 가장 알맞은 것은?",
        choices: [
          { value: "shorter", label: "같은 결론을 더 짧고 인상적인 표현으로 줄인다" },
          { value: "same", label: "주제와 완전히 같아서 아무거나 골라도 된다" },
          { value: "detail", label: "지문의 세부 사실 하나를 그대로 옮긴다" },
          { value: "korean", label: "제목만 한국어 선택지로 나온다" },
        ],
        answer: "shorter",
        explanation:
          "제목은 주제와 같은 결론을 가리키되 비유나 대비를 써서 짧게 줄입니다. 그래서 지문 표현을 그대로 옮긴 선택지는 오히려 답이 아닌 경우가 많습니다.",
      },
    ],
  },

  {
    id: "en-p25-chart",
    subject: "english",
    title: "25번 도표",
    summary: "도표의 숫자와 어긋나는 문장 하나를 찾습니다.",
    explanation:
      "25번은 막대나 선으로 된 도표와 그것을 설명하는 다섯 문장을 주고 도표와 다른 문장을 찾는 문제입니다. 영어 실력보다 숫자를 비교하는 정확함이 점수를 정합니다. 틀린 문장은 대개 큰 쪽과 작은 쪽을 뒤집거나, 배수를 잘못 말하거나, 늘었다와 줄었다를 반대로 씁니다. 지문처럼 통째로 읽을 필요가 없고 문장 하나마다 도표의 해당 숫자만 짚으면 됩니다. 45문항 중 가장 확실하게 맞힐 수 있는 자리입니다.",
    keyPoints: [
      "도표의 제목과 가로·세로축이 무엇을 재는지 먼저 읽습니다.",
      "문장을 하나 읽을 때마다 그 문장이 가리키는 막대나 점에 손가락을 짚습니다.",
      "문장에서 비교 표현(more than, twice, the largest, increased)만 뽑아 도표의 숫자와 맞춰 봅니다.",
    ],
    mistake:
      "twice나 three times 같은 배수 표현을 대충 넘깁니다. 큰지 작은지는 맞는데 배수만 틀리게 쓴 문장이 정답인 경우가 아주 흔합니다.",
    questions: [
      {
        id: "en-p25-q1",
        prompt:
          "어느 해 A 동아리 회원은 40명, B 동아리 회원은 25명입니다. 도표와 일치하지 않는 문장은?",
        choices: [
          { value: "twice", label: "Club A had twice as many members as Club B." },
          { value: "more", label: "Club A had more members than Club B." },
          { value: "fifteen", label: "Club A had fifteen more members than Club B." },
          { value: "fewer", label: "Club B had fewer members than Club A." },
        ],
        answer: "twice",
        explanation:
          "40은 25의 두 배가 아니라 1.6배입니다. 큰 쪽과 작은 쪽은 맞게 썼지만 배수를 틀리게 써서 도표와 어긋납니다.",
      },
      {
        id: "en-p25-q2",
        prompt: "어떤 항목이 2020년 30%에서 2023년 20%로 바뀌었습니다. 이를 바르게 설명한 문장은?",
        choices: [
          { value: "decreased", label: "The share decreased from 2020 to 2023." },
          { value: "increased", label: "The share increased from 2020 to 2023." },
          { value: "same", label: "The share stayed the same during the period." },
          { value: "doubled", label: "The share doubled during the period." },
        ],
        answer: "decreased",
        explanation:
          "30에서 20으로 내려갔으므로 줄었다고 써야 합니다. 도표 문제의 오답은 이렇게 변화의 방향을 뒤집는 경우가 많습니다.",
      },
      {
        id: "en-p25-q3",
        prompt: "25번을 푸는 순서로 가장 알맞은 것은?",
        choices: [
          { value: "one-by-one", label: "문장을 하나 읽고 그 문장이 가리키는 숫자만 바로 확인한다" },
          { value: "memorize", label: "도표의 모든 숫자를 외운 뒤에 문장을 읽는다" },
          { value: "longest", label: "가장 긴 문장을 먼저 답으로 고른다" },
          { value: "backward", label: "마지막 문장부터 읽고 앞은 넘긴다" },
        ],
        answer: "one-by-one",
        explanation:
          "도표는 문장마다 확인할 숫자가 정해져 있습니다. 문장 하나에 숫자 하나씩 짝지어 확인하면 도표를 여러 번 다시 볼 일이 없습니다.",
      },
    ],
  },

  {
    id: "en-p26-detail",
    subject: "english",
    title: "26번 내용 일치·불일치",
    summary: "인물 소개 글을 순서대로 훑어 다른 선택지 하나를 찾습니다.",
    explanation:
      "26번은 한 사람의 삶이나 어떤 대상을 소개하는 글을 주고 내용과 다른 선택지를 찾는 문제입니다. 선택지가 한국어이고, 그 순서가 지문에 나오는 순서와 같습니다. 그래서 지문을 통째로 읽지 말고 선택지 한 개마다 지문의 해당 줄로 내려가는 방식이 빠릅니다. 틀린 선택지는 대개 숫자, 지명, 순서, 또는 not 하나만 바꿔 놓습니다.",
    keyPoints: [
      "선택지 다섯 개에 번호를 매기고 각 선택지에서 확인할 낱말(연도·지명·숫자)에 표시합니다.",
      "1번 선택지부터 차례로, 지문을 위에서 아래로 한 번만 훑으며 근거 문장 옆에 번호를 적습니다.",
      "근거 문장과 선택지를 낱말 단위로 겹쳐 읽어 숫자나 부정 표현이 바뀐 곳을 찾습니다.",
    ],
    mistake:
      "뜻이 비슷하면 맞다고 넘어갑니다. 26번의 정답은 문장 전체가 아니라 숫자 하나, 또는 never·not 하나가 다른 자리에 숨어 있습니다.",
    questions: [
      {
        id: "en-p26-q1",
        prompt:
          "‘Ann Lee was born in a small town in 1930. She moved to the city at the age of ten and began to paint at twenty. She never studied art at school.’ 윗글의 내용과 일치하지 않는 것은?",
        choices: [
          { value: "school", label: "그녀는 학교에서 미술을 공부했다" },
          { value: "born", label: "그녀는 1930년에 작은 마을에서 태어났다" },
          { value: "moved", label: "그녀는 열 살에 도시로 이사했다" },
          { value: "paint", label: "그녀는 스무 살에 그림을 그리기 시작했다" },
        ],
        answer: "school",
        explanation:
          "지문은 She never studied art at school이라고 했습니다. never 하나만 빠뜨리면 정반대의 뜻이 되므로 부정 표현을 꼭 확인해야 합니다.",
      },
      {
        id: "en-p26-q2",
        prompt:
          "‘He worked as a teacher for five years before he became a writer.’와 일치하는 것은?",
        choices: [
          { value: "teacher-first", label: "교사로 일한 뒤에 작가가 되었다" },
          { value: "writer-first", label: "작가로 일한 뒤에 교사가 되었다" },
          { value: "both", label: "교사와 작가를 동시에 했다" },
          { value: "five-writer", label: "작가로 5년 동안 일했다" },
        ],
        answer: "teacher-first",
        explanation:
          "before는 앞에 나온 일이 먼저 일어났다는 뜻입니다. 순서를 뒤집은 선택지가 26번에서 가장 흔한 함정입니다.",
      },
      {
        id: "en-p26-q3",
        prompt: "26번에서 선택지를 확인하는 방법으로 가장 알맞은 것은?",
        choices: [
          { value: "in-order", label: "선택지 순서가 지문 순서와 같으므로 위에서 아래로 짝을 맞춘다" },
          { value: "memory", label: "지문을 다 읽은 뒤 기억에 기대어 고른다" },
          { value: "longest", label: "가장 긴 선택지를 정답으로 고른다" },
          { value: "first-only", label: "지문 첫 두 문장만 읽고 나머지는 넘긴다" },
        ],
        answer: "in-order",
        explanation:
          "26번 선택지는 지문에 나온 순서를 그대로 따릅니다. 확인이 끝난 자리부터 이어서 읽으면 지문을 한 번만 훑고 끝낼 수 있습니다.",
      },
    ],
  },

  {
    id: "en-p27-notice",
    subject: "english",
    title: "27·28번 안내문",
    summary: "행사 안내문의 항목을 찾아 선택지와 겹쳐 읽습니다.",
    explanation:
      "27·28번은 행사 안내문이나 참가 신청 안내처럼 목록으로 된 글을 주고 일치하거나 일치하지 않는 선택지를 찾는 문제입니다. 날짜, 시간, 장소, 참가비, 준비물이 항목으로 나뉘어 있어서 읽기보다 찾기에 가깝습니다. 틀린 선택지는 숫자를 바꾸거나, 제공된다와 각자 가져와야 한다를 맞바꾸거나, 되는 것을 안 된다고 씁니다. 답이 맨 아래 Note나 Registration 줄에 숨어 있는 경우가 많습니다.",
    keyPoints: [
      "발문이 일치하는 것을 찾는지 일치하지 않는 것을 찾는지 먼저 확인해 표시합니다.",
      "안내문에서 숫자와 요일, 금액에 모두 동그라미를 칩니다.",
      "선택지를 하나씩 읽으며 그 항목이 적힌 줄로 곧장 내려가 낱말을 겹쳐 읽습니다.",
    ],
    mistake:
      "맨 아래 작은 안내(사전 신청 필수, 환불 불가, 점심 미제공)를 안 읽고 넘깁니다. 정답이 바로 거기 있는 경우가 흔합니다.",
    questions: [
      {
        id: "en-p27-q1",
        prompt:
          "‘Spring Book Fair — Date: May 5 (Sat), 10 a.m. to 4 p.m. Place: City Library Hall. Fee: Free. Note: Lunch is not provided.’ 안내문과 일치하지 않는 것은?",
        choices: [
          { value: "lunch", label: "점심이 제공된다" },
          { value: "date", label: "5월 5일 토요일에 열린다" },
          { value: "place", label: "시립도서관 홀에서 열린다" },
          { value: "fee", label: "참가비는 없다" },
        ],
        answer: "lunch",
        explanation:
          "맨 아랫줄에 Lunch is not provided라고 적혀 있습니다. 안내문 문제의 답은 이렇게 Note 줄에 숨어 있는 경우가 많습니다.",
      },
      {
        id: "en-p27-q2",
        prompt: "‘Participants must bring their own water bottle.’과 일치하는 것은?",
        choices: [
          { value: "bring", label: "물병은 참가자가 각자 가져와야 한다" },
          { value: "provided", label: "물병이 무료로 제공된다" },
          { value: "sold", label: "현장에서 물병을 판다" },
          { value: "not-needed", label: "물병은 가져올 필요가 없다" },
        ],
        answer: "bring",
        explanation:
          "bring their own은 각자 준비해 오라는 뜻입니다. 안내문 문제는 제공된다와 가져와야 한다를 맞바꾼 선택지를 자주 냅니다.",
      },
      {
        id: "en-p27-q3",
        prompt: "27번과 28번을 풀기 전에 가장 먼저 할 일은?",
        choices: [
          { value: "check-ask", label: "일치하는 것을 묻는지 일치하지 않는 것을 묻는지 발문을 확인한다" },
          { value: "read-all", label: "안내문을 처음부터 끝까지 소리 내어 정독한다" },
          { value: "translate", label: "안내문을 전부 한국어로 옮겨 적는다" },
          { value: "guess", label: "가장 짧은 선택지를 먼저 고른다" },
        ],
        answer: "check-ask",
        explanation:
          "두 문항 중 하나는 일치를, 다른 하나는 불일치를 묻는 일이 많습니다. 발문을 확인하지 않으면 정확히 읽고도 반대쪽을 고르게 됩니다.",
      },
    ],
  },
];
