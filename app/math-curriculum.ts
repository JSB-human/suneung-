export type MathResourceLink = {
  id: string;
  title: string;
  href: string;
  label: string;
  note: string;
};

export type MathPrerequisite = {
  label: string;
  conceptId?: string;
};

export type MathWorkedExample = {
  prompt: string;
  steps: string[];
  answer: string;
};

export type MathPracticeChoice = {
  value: string;
  label: string;
};

export type MathPracticeQuestion = {
  id: string;
  type: "multipleChoice" | "numeric";
  prompt: string;
  inputLabel: string;
  placeholder?: string;
  choices?: MathPracticeChoice[];
  acceptableAnswers: string[];
  explanation: string;
};

export type MathConceptNode = {
  id: string;
  title: string;
  summary: string;
  prerequisites: MathPrerequisite[];
  corePrinciples: string[];
  workedExample: MathWorkedExample;
  practiceQuestions: MathPracticeQuestion[];
  resources: MathResourceLink[];
};

export type MathCurriculumUnit = {
  id: string;
  title: string;
  objective: string;
  concepts: MathConceptNode[];
};

export type MathCurriculumChapter = {
  id: string;
  title: string;
  objective: string;
  note?: string;
  units: MathCurriculumUnit[];
};

export type MathCurriculum = {
  title: string;
  subtitle: string;
  note: string;
  chapters: MathCurriculumChapter[];
};

export const EBSI_COMMON_MATH_INTRO: MathResourceLink = {
  id: "ebsi-common-math-intro",
  title: "EBSi 공통수학 입문",
  href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveCourseDetailNw.ebs?bookId=LB00000005472",
  label: "적합한 공식 과정/목록",
  note: "중학 연산과 식의 구조를 고교 공통수학 진입 관점에서 다시 묶어 볼 때 적합합니다.",
};

export const EBSI_OLYMPUS_ALGEBRA: MathResourceLink = {
  id: "ebsi-olympus-algebra",
  title: "EBSi 올림포스 유형편 대수",
  href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveCourseDetailNw.ebs?bookId=LB00000005905",
  label: "적합한 공식 과정/목록",
  note: "문자와 식, 방정식, 다항식 연결 문제를 유형 중심으로 보강할 때 적합합니다.",
};

export const EBSI_COURSE_GUIDE: MathResourceLink = {
  id: "ebsi-course-guide",
  title: "EBSi 공통/선택 과목 안내",
  href: "https://www.ebsi.co.kr/ebs/lms/lmsx/retriveAchievementLevelSearch.ebs",
  label: "적합한 공식 과정/목록",
  note: "현재 학년과 목표에 맞는 공식 과목군을 직접 고를 때 참고할 수 있는 안내 페이지입니다.",
};

export const MATH_KNOWLEDGE_CURRICULUM: MathCurriculum = {
  title: "수학 노베이스 지식 지도 · 고1 기초 수준",
  subtitle: "고1 기초 수준 / 2028학년도 통합형 수능 체제 기준으로, 대단원 → 중단원 → 세부 개념 순서에서 중학 기초부터 고교 공통수학 연결까지 한 번에 정리합니다.",
  note: "고1 기초 수준 / 2028학년도 통합형 수능 체제 기준 안내: 수학은 선택과목 없는 공통 체제로 운영되고 심화수학(미적분Ⅱ·기하)은 출제 범위에서 제외되므로, 공교육 범위 안의 공통 기초를 차분히 익히는 데 초점을 둡니다.",
  chapters: [
    {
      id: "numbers-and-operations",
      title: "수와 연산",
      objective: "부호, 분수, 비율을 흔들리지 않게 다져 이후 식 계산의 바닥을 만듭니다.",
      note: "가장 쉬운 출발 단원입니다. 3분 시작 행동: 부호가 섞인 식 3개에서 곱셈 먼저 표시하고, -(-a)를 +a로 바꿔 읽어 보세요.",
      units: [
        {
          id: "signed-number-basics",
          title: "정수와 부호 계산",
          objective: "음수와 양수가 섞인 계산에서 순서와 부호를 안정적으로 처리합니다.",
          concepts: [
            {
              id: "signed-number-operations",
              title: "정수의 사칙연산과 부호 규칙",
              summary: "가장 쉬운 출발 개념입니다. 정수 계산은 숫자 크기보다 부호와 연산 순서를 먼저 읽는 습관이 핵심입니다. 3분 시작 행동: 부호가 섞인 식 3개에서 곱셈 먼저 표시하고, -(-a)를 +a로 바꿔 읽어 보세요.",
              prerequisites: [{ label: "없음 - 출발 개념" }],
              corePrinciples: [
                "덧셈과 뺄셈에서는 같은 부호끼리 크기를 더하고, 다른 부호끼리는 큰 절댓값에서 작은 절댓값을 뺀 뒤 큰 절댓값의 부호를 따릅니다.",
                "곱셈과 나눗셈에서는 부호만 먼저 판단합니다. 같은 부호면 양수, 다른 부호면 음수입니다.",
                "괄호가 있으면 괄호 안, 곱셈/나눗셈, 덧셈/뺄셈 순서로 계산합니다.",
              ],
              workedExample: {
                prompt: "-8 + 3 × 2 - (-5)를 계산해 봅시다.",
                steps: [
                  "곱셈을 먼저 계산하면 3 × 2 = 6입니다.",
                  "식은 -8 + 6 - (-5)가 됩니다.",
                  "-(-5)는 +5와 같으므로 -8 + 6 + 5가 됩니다.",
                  "-8 + 6 = -2, 이어서 -2 + 5 = 3입니다.",
                ],
                answer: "정답: 3",
              },
              practiceQuestions: [
                {
                  id: "q-signed-1",
                  type: "multipleChoice",
                  prompt: "-4 + 7의 값은 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "1", label: "1" },
                    { value: "3", label: "3" },
                    { value: "-3", label: "-3" },
                    { value: "11", label: "11" },
                  ],
                  acceptableAnswers: ["3"],
                  explanation: "-4에서 7만큼 오른쪽으로 가면 3입니다.",
                },
                {
                  id: "q-signed-2",
                  type: "numeric",
                  prompt: "3 - (-6)의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 9",
                  acceptableAnswers: ["9"],
                  explanation: "음수를 빼면 더하기가 됩니다. 3 - (-6) = 3 + 6 = 9입니다.",
                },
                {
                  id: "q-signed-3",
                  type: "numeric",
                  prompt: "-2 × 5의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: -10",
                  acceptableAnswers: ["-10"],
                  explanation: "부호가 다르므로 음수, 2 × 5 = 10이므로 -10입니다.",
                },
              ],
              resources: [EBSI_COMMON_MATH_INTRO, EBSI_COURSE_GUIDE],
            },
          ],
        },
        {
          id: "fraction-ratio-basics",
          title: "분수, 비율, 퍼센트",
          objective: "부분과 전체를 분수와 퍼센트로 바꾸어 읽고 계산합니다.",
          concepts: [
            {
              id: "fraction-ratio-percent",
              title: "분수 계산과 비율·퍼센트 연결",
              summary: "분수는 나누기, 비율은 비교, 퍼센트는 100을 기준으로 한 비율이라는 관점을 연결합니다.",
              prerequisites: [{ label: "정수의 사칙연산과 부호 규칙", conceptId: "signed-number-operations" }],
              corePrinciples: [
                "분수의 덧셈은 분모를 통일한 뒤 분자끼리 계산합니다.",
                "a:b는 a/b와 같은 비교를 뜻하고, 가장 간단한 비로 약분할 수 있습니다.",
                "퍼센트 p%는 p/100이며, '전체 × 비율 = 부분' 구조로 해석합니다.",
              ],
              workedExample: {
                prompt: "20의 3/4은 얼마인지 구하고, 이것이 전체의 몇 퍼센트인지 말해 봅시다.",
                steps: [
                  "20의 3/4은 20 × 3/4 = 15입니다.",
                  "15는 20 중 15이므로 15/20 = 3/4입니다.",
                  "3/4 = 75/100이므로 75%입니다.",
                ],
                answer: "정답: 15, 그리고 75%",
              },
              practiceQuestions: [
                {
                  id: "q-fraction-1",
                  type: "multipleChoice",
                  prompt: "1/2 + 1/4의 값은 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "2/6", label: "2/6" },
                    { value: "3/4", label: "3/4" },
                    { value: "1/8", label: "1/8" },
                    { value: "2/4", label: "2/4" },
                  ],
                  acceptableAnswers: ["3/4"],
                  explanation: "1/2를 2/4로 바꾸면 2/4 + 1/4 = 3/4입니다.",
                },
                {
                  id: "q-fraction-2",
                  type: "numeric",
                  prompt: "12의 25%를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 3",
                  acceptableAnswers: ["3"],
                  explanation: "25%는 1/4이므로 12 × 1/4 = 3입니다.",
                },
                {
                  id: "q-fraction-3",
                  type: "numeric",
                  prompt: "비 4:10을 가장 간단한 비로 입력하세요.",
                  inputLabel: "비 정답 입력",
                  placeholder: "예: 2:5",
                  acceptableAnswers: ["2:5"],
                  explanation: "4와 10을 2로 나누면 2:5가 됩니다.",
                },
              ],
              resources: [EBSI_COMMON_MATH_INTRO, EBSI_COURSE_GUIDE],
            },
          ],
        },
      ],
    },
    {
      id: "expressions-and-equations",
      title: "문자와 식/방정식",
      objective: "문자를 두려워하지 않고 식의 구조와 방정식 풀이 순서를 익힙니다.",
      units: [
        {
          id: "expression-reading",
          title: "문자식 읽기",
          objective: "문자식이 상황을 어떻게 압축하는지 읽어 냅니다.",
          concepts: [
            {
              id: "variables-and-expressions",
              title: "문자식 만들기와 동류항 정리",
              summary: "문자식은 '반복되는 수량'을 짧게 쓰는 도구이고, 동류항 정리는 같은 종류를 모으는 작업입니다.",
              prerequisites: [{ label: "분수 계산과 비율·퍼센트 연결", conceptId: "fraction-ratio-percent" }],
              corePrinciples: [
                "문자는 아직 정해지지 않은 수를 나타냅니다.",
                "같은 문자가 같은 거듭제곱으로 묶인 항끼리만 더하고 뺄 수 있습니다.",
                "수량 관계를 먼저 말로 만들고, 그다음 식으로 옮기면 해석이 쉬워집니다.",
              ],
              workedExample: {
                prompt: "연필 한 자루가 500원이고 x자루를 산 뒤, 봉투값 1000원을 더 낸 상황을 식으로 나타내고 간단히 해 봅시다.",
                steps: [
                  "연필값은 500 × x이므로 500x입니다.",
                  "봉투값 1000원을 더하면 전체는 500x + 1000입니다.",
                  "같은 종류의 항이 아니므로 더 줄일 수 없습니다.",
                ],
                answer: "정답: 500x + 1000",
              },
              practiceQuestions: [
                {
                  id: "q-expression-1",
                  type: "multipleChoice",
                  prompt: "2x + 3x를 간단히 하면 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "5x", label: "5x" },
                    { value: "6x", label: "6x" },
                    { value: "5x2", label: "5x2" },
                    { value: "x5", label: "x5" },
                  ],
                  acceptableAnswers: ["5x"],
                  explanation: "동류항이므로 계수만 더해 5x가 됩니다.",
                },
                {
                  id: "q-expression-2",
                  type: "numeric",
                  prompt: "사과가 x개, 배가 3개 있을 때 전체 개수를 식으로 입력하세요.",
                  inputLabel: "식 정답 입력",
                  placeholder: "예: x+3",
                  acceptableAnswers: ["x+3", "3+x"],
                  explanation: "사과 x개와 배 3개를 합치면 x + 3개입니다.",
                },
                {
                  id: "q-expression-3",
                  type: "numeric",
                  prompt: "4a - a를 간단히 한 식을 입력하세요.",
                  inputLabel: "식 정답 입력",
                  placeholder: "예: 3a",
                  acceptableAnswers: ["3a"],
                  explanation: "같은 문자 a가 4개에서 1개 빠지므로 3a입니다.",
                },
              ],
              resources: [EBSI_OLYMPUS_ALGEBRA, EBSI_COURSE_GUIDE],
            },
          ],
        },
        {
          id: "equation-solving",
          title: "일차방정식 풀이",
          objective: "등식의 양변을 같은 규칙으로 다루며 미지수를 고립시킵니다.",
          concepts: [
            {
              id: "linear-equations",
              title: "일차방정식 풀이 순서",
              summary: "방정식은 '양변이 같다'는 약속이므로 양쪽에 같은 연산을 해야 균형이 유지됩니다.",
              prerequisites: [{ label: "문자식 만들기와 동류항 정리", conceptId: "variables-and-expressions" }],
              corePrinciples: [
                "등식의 양변에 같은 수를 더하거나 빼도 등식은 유지됩니다.",
                "양변에 0이 아닌 같은 수를 곱하거나 나누어도 등식은 유지됩니다.",
                "미지수를 한쪽으로, 숫자는 다른 쪽으로 모아 마지막에 계수로 나눕니다.",
              ],
              workedExample: {
                prompt: "2x + 5 = 17을 풀어 봅시다.",
                steps: [
                  "양변에서 5를 빼면 2x = 12입니다.",
                  "양변을 2로 나누면 x = 6입니다.",
                  "검산하면 2 × 6 + 5 = 17이므로 맞습니다.",
                ],
                answer: "정답: x = 6",
              },
              practiceQuestions: [
                {
                  id: "q-equation-1",
                  type: "numeric",
                  prompt: "x + 7 = 12를 풀어 x의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 5",
                  acceptableAnswers: ["5"],
                  explanation: "양변에서 7을 빼면 x = 5입니다.",
                },
                {
                  id: "q-equation-2",
                  type: "multipleChoice",
                  prompt: "3x = 15일 때 x는 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "3", label: "3" },
                    { value: "5", label: "5" },
                    { value: "12", label: "12" },
                    { value: "45", label: "45" },
                  ],
                  acceptableAnswers: ["5"],
                  explanation: "양변을 3으로 나누면 x = 5입니다.",
                },
                {
                  id: "q-equation-3",
                  type: "numeric",
                  prompt: "2x - 4 = 10을 풀어 x의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 7",
                  acceptableAnswers: ["7"],
                  explanation: "양변에 4를 더해 2x = 14, 다시 2로 나누면 x = 7입니다.",
                },
              ],
              resources: [EBSI_OLYMPUS_ALGEBRA, EBSI_COMMON_MATH_INTRO],
            },
          ],
        },
      ],
    },
    {
      id: "functions",
      title: "함수",
      objective: "입력과 출력의 관계를 표, 식, 그래프로 연결해 봅니다.",
      units: [
        {
          id: "function-intuition",
          title: "대응 관계와 함수",
          objective: "한 입력에 한 출력이 대응되는 구조를 이해합니다.",
          concepts: [
            {
              id: "relation-and-function",
              title: "함수의 뜻과 표 읽기",
              summary: "함수는 x가 하나 정해지면 y가 하나로 결정되는 관계입니다.",
              prerequisites: [{ label: "일차방정식 풀이 순서", conceptId: "linear-equations" }],
              corePrinciples: [
                "입력값 x 하나에 출력값 y 하나가 대응되면 함수라고 볼 수 있습니다.",
                "표, 식, 좌표는 같은 관계를 서로 다르게 보여 주는 표현입니다.",
                "x가 바뀌면 y가 어떻게 바뀌는지 규칙을 말할 수 있어야 합니다.",
              ],
              workedExample: {
                prompt: "x에 1, 2, 3을 넣을 때 y = 2x + 1의 값을 표로 채워 봅시다.",
                steps: [
                  "x = 1이면 y = 2 × 1 + 1 = 3입니다.",
                  "x = 2이면 y = 5입니다.",
                  "x = 3이면 y = 7입니다.",
                  "따라서 표는 (1,3), (2,5), (3,7)입니다.",
                ],
                answer: "정답: y값은 3, 5, 7",
              },
              practiceQuestions: [
                {
                  id: "q-function-1",
                  type: "multipleChoice",
                  prompt: "다음 중 함수라고 볼 수 있는 것은 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "a", label: "x = 1일 때 y가 2와 3 두 개가 된다." },
                    { value: "b", label: "x = 1일 때 y가 2 하나로 정해진다." },
                    { value: "c", label: "입력 없이 y만 적혀 있다." },
                    { value: "d", label: "같은 x에 대해 y가 계속 바뀐다." },
                  ],
                  acceptableAnswers: ["b"],
                  explanation: "함수는 같은 입력 하나에 출력이 하나로 정해져야 합니다.",
                },
                {
                  id: "q-function-2",
                  type: "numeric",
                  prompt: "y = x + 4에서 x = 5일 때 y의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 9",
                  acceptableAnswers: ["9"],
                  explanation: "5 + 4 = 9입니다.",
                },
                {
                  id: "q-function-3",
                  type: "numeric",
                  prompt: "y = 3x에서 x = 4일 때 y의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 12",
                  acceptableAnswers: ["12"],
                  explanation: "3 × 4 = 12입니다.",
                },
              ],
              resources: [EBSI_COMMON_MATH_INTRO, EBSI_COURSE_GUIDE],
            },
          ],
        },
        {
          id: "linear-function-basics",
          title: "일차함수의 기울기",
          objective: "그래프에서 변화율을 읽고 식으로 옮깁니다.",
          concepts: [
            {
              id: "linear-function-slope",
              title: "기울기와 일차함수 식",
              summary: "일차함수는 y = ax + b 꼴이고, a는 x가 1 늘 때 y가 얼마나 변하는지 보여 줍니다.",
              prerequisites: [{ label: "함수의 뜻과 표 읽기", conceptId: "relation-and-function" }],
              corePrinciples: [
                "일차함수의 기울기 a는 변화량의 비, 즉 Δy/Δx입니다.",
                "기울기가 양수면 오른쪽으로 갈수록 올라가고, 음수면 내려갑니다.",
                "한 점과 기울기를 알면 y = ax + b에서 b를 찾을 수 있습니다.",
              ],
              workedExample: {
                prompt: "두 점 (1, 3), (4, 9)를 지나는 일차함수의 기울기와 식을 구해 봅시다.",
                steps: [
                  "기울기 a = (9 - 3) / (4 - 1) = 6 / 3 = 2입니다.",
                  "(1, 3)을 y = 2x + b에 대입하면 3 = 2 + b이므로 b = 1입니다.",
                  "따라서 식은 y = 2x + 1입니다.",
                ],
                answer: "정답: 기울기 2, 식은 y = 2x + 1",
              },
              practiceQuestions: [
                {
                  id: "q-linear-function-1",
                  type: "multipleChoice",
                  prompt: "y = 3x + 2의 기울기는 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "3", label: "3" },
                    { value: "2", label: "2" },
                    { value: "5", label: "5" },
                    { value: "-3", label: "-3" },
                  ],
                  acceptableAnswers: ["3"],
                  explanation: "y = ax + b에서 a가 기울기이므로 3입니다.",
                },
                {
                  id: "q-linear-function-2",
                  type: "numeric",
                  prompt: "y = 2x + 1에서 x = 5일 때 y의 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 11",
                  acceptableAnswers: ["11"],
                  explanation: "2 × 5 + 1 = 11입니다.",
                },
                {
                  id: "q-linear-function-3",
                  type: "numeric",
                  prompt: "기울기가 4이고 y절편이 -1인 일차함수를 x 없이 상수항까지 적으면, b의 값은 무엇인가요?",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: -1",
                  acceptableAnswers: ["-1"],
                  explanation: "y = 4x - 1 꼴이므로 b = -1입니다.",
                },
              ],
              resources: [EBSI_COMMON_MATH_INTRO, EBSI_COURSE_GUIDE],
            },
          ],
        },
      ],
    },
    {
      id: "geometry",
      title: "도형",
      objective: "공통 문제 해결을 위한 선수 개념으로, 각·삼각형·직각삼각형 성질을 이용해 그림을 식처럼 읽습니다.",
      note: "이 단원은 2028학년도 통합형 수능 공통 수학 문제를 읽기 위한 선수 개념으로 두며, 심화 기하 확장이 아니라 기본 관계 해석에 집중합니다.",
      units: [
        {
          id: "triangle-basics",
          title: "삼각형과 각",
          objective: "삼각형의 기본 각 관계를 빠르게 떠올립니다.",
          concepts: [
            {
              id: "triangle-angle-properties",
              title: "삼각형의 내각과 외각",
              summary: "삼각형 한 개 안에는 내각의 합 180도, 바깥에는 외각 = 떨어진 두 내각의 합이라는 기본 구조가 있습니다.",
              prerequisites: [{ label: "정수의 사칙연산과 부호 규칙", conceptId: "signed-number-operations" }],
              corePrinciples: [
                "삼각형의 세 내각의 합은 항상 180도입니다.",
                "삼각형의 한 외각은 그와 이웃하지 않은 두 내각의 합과 같습니다.",
                "등변삼각형에서는 밑각이 서로 같습니다.",
              ],
              workedExample: {
                prompt: "삼각형의 두 내각이 50도와 60도일 때 나머지 한 각과, 50도에 이웃한 외각을 구해 봅시다.",
                steps: [
                  "세 내각의 합이 180도이므로 나머지 각은 180 - 50 - 60 = 70도입니다.",
                  "50도에 이웃한 외각은 180 - 50 = 130도입니다.",
                  "또는 떨어진 두 내각 60도와 70도를 더해도 130도입니다.",
                ],
                answer: "정답: 나머지 각 70도, 외각 130도",
              },
              practiceQuestions: [
                {
                  id: "q-triangle-1",
                  type: "numeric",
                  prompt: "삼각형의 두 내각이 40도, 65도일 때 나머지 한 각을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 75",
                  acceptableAnswers: ["75"],
                  explanation: "180 - 40 - 65 = 75도입니다.",
                },
                {
                  id: "q-triangle-2",
                  type: "multipleChoice",
                  prompt: "삼각형의 외각이 110도이고 한 떨어진 내각이 45도일 때 다른 떨어진 내각은 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "55", label: "55도" },
                    { value: "65", label: "65도" },
                    { value: "70", label: "70도" },
                    { value: "155", label: "155도" },
                  ],
                  acceptableAnswers: ["65"],
                  explanation: "외각 = 떨어진 두 내각의 합이므로 110 - 45 = 65도입니다.",
                },
                {
                  id: "q-triangle-3",
                  type: "numeric",
                  prompt: "등변삼각형의 꼭짓각이 40도일 때 밑각 하나의 크기를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 70",
                  acceptableAnswers: ["70"],
                  explanation: "남은 각의 합은 140도이고 밑각 두 개가 같으므로 각각 70도입니다.",
                },
              ],
              resources: [EBSI_COMMON_MATH_INTRO, EBSI_COURSE_GUIDE],
            },
          ],
        },
        {
          id: "right-triangle-and-area",
          title: "직각삼각형과 넓이",
          objective: "피타고라스 정리와 넓이 공식을 연결해 활용합니다.",
          concepts: [
            {
              id: "pythagorean-and-area",
              title: "피타고라스 정리와 직각삼각형 넓이",
              summary: "직각삼각형은 변 길이 관계와 넓이 공식을 함께 쓰면 훨씬 빠르게 풀립니다.",
              prerequisites: [{ label: "삼각형의 내각과 외각", conceptId: "triangle-angle-properties" }],
              corePrinciples: [
                "직각삼각형에서 빗변의 제곱은 다른 두 변의 제곱의 합과 같습니다.",
                "삼각형의 넓이는 밑변 × 높이 ÷ 2입니다.",
                "3-4-5, 5-12-13 같은 기본 직각삼각형 수를 익혀 두면 계산이 빨라집니다.",
              ],
              workedExample: {
                prompt: "직각삼각형의 두 직각변이 3, 4일 때 빗변과 넓이를 구해 봅시다.",
                steps: [
                  "피타고라스 정리에 따라 빗변의 제곱은 3² + 4² = 9 + 16 = 25입니다.",
                  "따라서 빗변은 5입니다.",
                  "넓이는 3 × 4 ÷ 2 = 6입니다.",
                ],
                answer: "정답: 빗변 5, 넓이 6",
              },
              practiceQuestions: [
                {
                  id: "q-pythagorean-1",
                  type: "numeric",
                  prompt: "직각삼각형의 두 직각변이 6과 8일 때 빗변의 길이를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 10",
                  acceptableAnswers: ["10"],
                  explanation: "6² + 8² = 36 + 64 = 100이므로 빗변은 10입니다.",
                },
                {
                  id: "q-pythagorean-2",
                  type: "multipleChoice",
                  prompt: "밑변이 10, 높이가 6인 삼각형의 넓이는 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "16", label: "16" },
                    { value: "30", label: "30" },
                    { value: "60", label: "60" },
                    { value: "20", label: "20" },
                  ],
                  acceptableAnswers: ["30"],
                  explanation: "10 × 6 ÷ 2 = 30입니다.",
                },
                {
                  id: "q-pythagorean-3",
                  type: "numeric",
                  prompt: "직각삼각형의 빗변이 13이고 한 직각변이 5일 때 다른 직각변의 길이를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 12",
                  acceptableAnswers: ["12"],
                  explanation: "13² - 5² = 169 - 25 = 144이므로 다른 직각변은 12입니다.",
                },
              ],
              resources: [EBSI_COMMON_MATH_INTRO, EBSI_COURSE_GUIDE],
            },
          ],
        },
      ],
    },
    {
      id: "counting-and-probability",
      title: "경우의 수/확률",
      objective: "세는 규칙과 확률의 기본 틀을 익혀 선택지형 문제를 차분히 해석합니다.",
      units: [
        {
          id: "counting-basics",
          title: "경우의 수 기본 원리",
          objective: "더하기 원리와 곱하기 원리를 상황에 맞게 구분합니다.",
          concepts: [
            {
              id: "counting-principles",
              title: "합의 법칙과 곱의 법칙",
              summary: "서로 겹치지 않는 선택은 더하고, 연속해서 모두 해야 하는 선택은 곱합니다.",
              prerequisites: [{ label: "분수 계산과 비율·퍼센트 연결", conceptId: "fraction-ratio-percent" }],
              corePrinciples: [
                "A 또는 B처럼 서로 다른 갈래 중 하나를 고르면 더하기 원리를 씁니다.",
                "A를 한 뒤 B도 해야 하면 곱하기 원리를 씁니다.",
                "먼저 상황을 표나 나무그림으로 그리면 중복과 누락을 줄일 수 있습니다.",
              ],
              workedExample: {
                prompt: "셔츠 3벌과 바지 2벌이 있을 때 서로 다른 옷차림 수를 구해 봅시다.",
                steps: [
                  "셔츠를 3가지 중 하나 고릅니다.",
                  "각 셔츠마다 바지를 2가지 중 하나 고를 수 있습니다.",
                  "따라서 3 × 2 = 6가지입니다.",
                ],
                answer: "정답: 6가지",
              },
              practiceQuestions: [
                {
                  id: "q-counting-1",
                  type: "multipleChoice",
                  prompt: "빨간 모자 2개와 파란 모자 3개 중 하나를 고르는 경우의 수는 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "5", label: "5" },
                    { value: "6", label: "6" },
                    { value: "8", label: "8" },
                    { value: "12", label: "12" },
                  ],
                  acceptableAnswers: ["5"],
                  explanation: "하나만 고르므로 2 + 3 = 5가지입니다.",
                },
                {
                  id: "q-counting-2",
                  type: "numeric",
                  prompt: "숫자 1, 2, 3 중 하나와 문자 A, B 중 하나를 이어 붙일 때 경우의 수를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 6",
                  acceptableAnswers: ["6"],
                  explanation: "숫자 3가지와 문자 2가지를 차례대로 고르므로 3 × 2 = 6가지입니다.",
                },
                {
                  id: "q-counting-3",
                  type: "numeric",
                  prompt: "아이스크림 맛 4가지 중 하나와 토핑 3가지 중 하나를 고르는 경우의 수를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 12",
                  acceptableAnswers: ["12"],
                  explanation: "맛 4가지와 토핑 3가지를 차례로 고르므로 4 × 3 = 12가지입니다.",
                },
              ],
              resources: [EBSI_COURSE_GUIDE, EBSI_COMMON_MATH_INTRO],
            },
          ],
        },
        {
          id: "probability-basics",
          title: "확률의 첫걸음",
          objective: "전체 경우와 원하는 경우를 분수로 비교합니다.",
          concepts: [
            {
              id: "simple-probability",
              title: "동등한 경우의 확률",
              summary: "확률은 '원하는 경우의 수 / 전체 경우의 수'라는 기본 분수 구조에서 출발합니다.",
              prerequisites: [{ label: "합의 법칙과 곱의 법칙", conceptId: "counting-principles" }],
              corePrinciples: [
                "모든 경우가 공평하면 확률 = 원하는 경우의 수 ÷ 전체 경우의 수입니다.",
                "확률은 0 이상 1 이하이며, 퍼센트로 바꿀 수도 있습니다.",
                "분모가 전체, 분자가 원하는 경우인지 항상 먼저 확인합니다.",
              ],
              workedExample: {
                prompt: "주머니에 빨간 공 2개, 파란 공 3개가 있을 때 빨간 공 1개를 뽑을 확률을 구해 봅시다.",
                steps: [
                  "전체 공은 2 + 3 = 5개입니다.",
                  "원하는 경우는 빨간 공 2개입니다.",
                  "따라서 확률은 2/5입니다.",
                ],
                answer: "정답: 2/5",
              },
              practiceQuestions: [
                {
                  id: "q-probability-1",
                  type: "multipleChoice",
                  prompt: "동전을 한 번 던질 때 앞면이 나올 확률은 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "1/4", label: "1/4" },
                    { value: "1/3", label: "1/3" },
                    { value: "1/2", label: "1/2" },
                    { value: "2", label: "2" },
                  ],
                  acceptableAnswers: ["1/2"],
                  explanation: "앞면과 뒷면 두 경우가 공평하므로 앞면 확률은 1/2입니다.",
                },
                {
                  id: "q-probability-2",
                  type: "numeric",
                  prompt: "1부터 6까지 적힌 주사위를 한 번 던질 때 6이 나올 확률을 입력하세요.",
                  inputLabel: "확률 정답 입력",
                  placeholder: "예: 1/6",
                  acceptableAnswers: ["1/6"],
                  explanation: "전체 6가지 중 원하는 경우는 1가지이므로 1/6입니다.",
                },
                {
                  id: "q-probability-3",
                  type: "numeric",
                  prompt: "카드 10장 중 당첨 카드가 3장일 때 당첨 카드를 뽑을 확률을 입력하세요.",
                  inputLabel: "확률 정답 입력",
                  placeholder: "예: 3/10",
                  acceptableAnswers: ["3/10"],
                  explanation: "원하는 경우 3, 전체 경우 10이므로 3/10입니다.",
                },
              ],
              resources: [EBSI_COURSE_GUIDE, EBSI_COMMON_MATH_INTRO],
            },
          ],
        },
      ],
    },
    {
      id: "high-school-common-math-bridge",
      title: "고교 공통수학 연결",
      objective: "중학 개념을 공통수학의 다항식, 방정식, 그래프 읽기로 자연스럽게 넘깁니다.",
      note: "고1 기초 수준 / 2028학년도 통합형 수능 체제 기준에서는 '중학 따로, 고교 따로'가 아니라 식의 구조와 그래프 해석을 한 줄로 이어 보는 연습이 중요합니다.",
      units: [
        {
          id: "polynomial-bridge",
          title: "다항식과 인수분해 준비",
          objective: "문자식 정리에서 곱셈 구조 읽기까지 연결합니다.",
          concepts: [
            {
              id: "polynomial-expansion-factorization",
              title: "전개와 인수분해의 첫 연결",
              summary: "전개는 괄호를 펼치는 과정이고, 인수분해는 거꾸로 묶어 곱의 꼴을 찾는 과정입니다.",
              prerequisites: [
                { label: "문자식 만들기와 동류항 정리", conceptId: "variables-and-expressions" },
                { label: "일차방정식 풀이 순서", conceptId: "linear-equations" },
              ],
              corePrinciples: [
                "(x + a)(x + b)를 전개하면 x² + (a + b)x + ab가 됩니다.",
                "인수분해는 가운데 항의 계수와 상수항을 동시에 만족하는 두 수를 찾는 과정으로 시작합니다.",
                "중학의 분배법칙 감각이 고교 다항식 전개와 인수분해로 그대로 이어집니다.",
              ],
              workedExample: {
                prompt: "(x + 3)(x + 2)를 전개하고, x² + 5x + 6을 인수분해해 봅시다.",
                steps: [
                  "전개: x·x + x·2 + 3·x + 3·2 = x² + 2x + 3x + 6 = x² + 5x + 6입니다.",
                  "인수분해: 곱이 6이고 합이 5인 두 수는 2와 3입니다.",
                  "따라서 x² + 5x + 6 = (x + 2)(x + 3)입니다.",
                ],
                answer: "정답: 전개 결과 x² + 5x + 6, 인수분해 결과 (x + 2)(x + 3)",
              },
              practiceQuestions: [
                {
                  id: "q-polynomial-1",
                  type: "multipleChoice",
                  prompt: "(x + 1)(x + 4)를 전개한 식은 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "x2+5x+4", label: "x² + 5x + 4" },
                    { value: "x2+4", label: "x² + 4" },
                    { value: "x2+4x+1", label: "x² + 4x + 1" },
                    { value: "2x+5", label: "2x + 5" },
                  ],
                  acceptableAnswers: ["x2+5x+4"],
                  explanation: "전개하면 x² + 4x + x + 4 = x² + 5x + 4입니다.",
                },
                {
                  id: "q-polynomial-2",
                  type: "numeric",
                  prompt: "x² + 7x + 10을 인수분해할 때 필요한 두 수의 합을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 7",
                  acceptableAnswers: ["7"],
                  explanation: "가운데 항 계수인 7이 두 수의 합입니다. 곱은 10이어야 합니다.",
                },
                {
                  id: "q-polynomial-3",
                  type: "multipleChoice",
                  prompt: "x² + 5x + 6의 인수분해 결과는 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "(x+1)(x+6)", label: "(x + 1)(x + 6)" },
                    { value: "(x+2)(x+3)", label: "(x + 2)(x + 3)" },
                    { value: "(x-2)(x-3)", label: "(x - 2)(x - 3)" },
                    { value: "x(x+5)+6", label: "x(x + 5) + 6" },
                  ],
                  acceptableAnswers: ["(x+2)(x+3)"],
                  explanation: "곱이 6, 합이 5인 두 수는 2와 3입니다.",
                },
              ],
              resources: [EBSI_OLYMPUS_ALGEBRA, EBSI_COMMON_MATH_INTRO],
            },
          ],
        },
        {
          id: "equation-inequality-bridge",
          title: "방정식·부등식·그래프 연결",
          objective: "일차 개념에서 고교 공통수학의 해석 방향을 미리 익힙니다.",
          concepts: [
            {
              id: "equation-inequality-bridge",
              title: "일차방정식에서 부등식과 좌표 해석으로",
              summary: "해를 하나 찾는 감각에서 '어떤 범위가 답인지' 읽는 감각으로 확장하면 고교 공통수학 적응이 쉬워집니다.",
              prerequisites: [
                { label: "일차방정식 풀이 순서", conceptId: "linear-equations" },
                { label: "기울기와 일차함수 식", conceptId: "linear-function-slope" },
              ],
              corePrinciples: [
                "부등식은 방정식과 비슷하게 풀지만, 범위 형태의 해를 얻습니다.",
                "좌표평면에서는 식의 해가 점, 선, 구간으로 보일 수 있습니다.",
                "고교 공통수학에서는 이 감각이 이차방정식, 이차함수, 부등식 해석으로 확장됩니다.",
              ],
              workedExample: {
                prompt: "2x + 1 > 7을 풀고, 해를 말로 설명해 봅시다.",
                steps: [
                  "양변에서 1을 빼면 2x > 6입니다.",
                  "양변을 2로 나누면 x > 3입니다.",
                  "즉 3보다 큰 모든 수가 답입니다. 하나의 수가 아니라 범위가 답이라는 점이 중요합니다.",
                ],
                answer: "정답: x > 3",
              },
              practiceQuestions: [
                {
                  id: "q-bridge-1",
                  type: "multipleChoice",
                  prompt: "x - 2 > 5의 해는 무엇인가요?",
                  inputLabel: "정답 선택",
                  choices: [
                    { value: "x>3", label: "x > 3" },
                    { value: "x>7", label: "x > 7" },
                    { value: "x<7", label: "x < 7" },
                    { value: "x=7", label: "x = 7" },
                  ],
                  acceptableAnswers: ["x>7"],
                  explanation: "양변에 2를 더하면 x > 7입니다.",
                },
                {
                  id: "q-bridge-2",
                  type: "numeric",
                  prompt: "y = 2x + 1에서 x = 0일 때 y절편 값을 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 1",
                  acceptableAnswers: ["1"],
                  explanation: "x = 0을 넣으면 y = 1이므로 y절편은 1입니다.",
                },
                {
                  id: "q-bridge-3",
                  type: "numeric",
                  prompt: "2x + 1 > 7의 해 중 가장 작은 정수를 입력하세요.",
                  inputLabel: "숫자 정답 입력",
                  placeholder: "예: 4",
                  acceptableAnswers: ["4"],
                  explanation: "해는 x > 3이므로 가장 작은 정수 해는 4입니다.",
                },
              ],
              resources: [EBSI_COURSE_GUIDE, EBSI_OLYMPUS_ALGEBRA],
            },
          ],
        },
      ],
    },
  ],
};
