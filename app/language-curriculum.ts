export type LanguageSubject = "korean" | "english";

export type LanguageResourceLink = {
  id: string;
  title: string;
  href: string;
  label: string;
  note: string;
};

export type LanguagePrerequisite = {
  label: string;
  conceptId?: string;
};

export type LanguageSelfCheckChoice = {
  value: string;
  label: string;
};

export type LanguageSelfCheckQuestion = {
  id: string;
  type: "multipleChoice" | "input";
  prompt: string;
  inputLabel: string;
  placeholder?: string;
  choices?: LanguageSelfCheckChoice[];
  acceptableAnswers: string[];
  answer: string;
  explanation: string;
};

export type LanguageConceptNode = {
  id: string;
  title: string;
  summary: string;
  prerequisites: LanguagePrerequisite[];
  corePoints: string[];
  recommendedRoutine: string[];
  passCriteria: string[];
  selfCheckQuestion: LanguageSelfCheckQuestion;
  resources: LanguageResourceLink[];
};

export type LanguageCurriculumUnit = {
  id: string;
  title: string;
  objective: string;
  concepts: LanguageConceptNode[];
};

export type LanguageCurriculumChapter = {
  id: string;
  title: string;
  objective: string;
  starterAction: string;
  note?: string;
  units: LanguageCurriculumUnit[];
};

export type LanguageCurriculum = {
  subject: LanguageSubject;
  title: string;
  subtitle: string;
  note: string;
  guideBullets: string[];
  chapters: LanguageCurriculumChapter[];
};

const prereq = (label: string, conceptId?: string): LanguagePrerequisite =>
  conceptId ? { label, conceptId } : { label };

const mc = (
  id: string,
  prompt: string,
  choices: LanguageSelfCheckChoice[],
  answer: string,
  explanation: string,
): LanguageSelfCheckQuestion => ({
  id,
  type: "multipleChoice",
  prompt,
  inputLabel: "정답 선택",
  choices,
  acceptableAnswers: [answer],
  answer,
  explanation,
});

const input = (
  id: string,
  prompt: string,
  answer: string,
  explanation: string,
  acceptableAnswers: string[] = [answer],
  placeholder?: string,
): LanguageSelfCheckQuestion => ({
  id,
  type: "input",
  prompt,
  inputLabel: "답 입력",
  acceptableAnswers,
  answer,
  explanation,
  placeholder,
});

const EBSI_COURSE_GUIDE: LanguageResourceLink = {
  id: "ebsi-course-guide",
  title: "EBSi 과목별 강좌 탐색",
  href: "https://www.ebsi.co.kr/ebs/lms/lmsx/retriveAchievementLevelSearch.ebs",
  label: "공식 강좌 안내",
  note: "학년과 과목을 직접 골라 현재 열려 있는 공식 강좌를 확인할 때 쓰는 기준 링크입니다.",
};

const EBSI_ALL_COURSES: LanguageResourceLink = {
  id: "ebsi-all-courses",
  title: "EBSi 전체 강좌 메인",
  href: "https://www.ebsi.co.kr/ebs/lms/subMain/subMain.ebs?cookieGradeVal=high",
  label: "전체 강좌",
  note: "국어·영어 강좌를 한 화면에서 다시 찾거나 실전 강좌로 넘어갈 때 연결합니다.",
};

const EBSI_KOREAN_INTRO: LanguageResourceLink = {
  id: "ebsi-korean-intro",
  title: "공통국어 입문",
  href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveCourseDetailNw.ebs?bookId=LB00000005652",
  label: "국어 입문",
  note: "고1 기초와 공통국어 감각을 가볍게 여는 입문형 공식 강좌입니다.",
};

const EBSI_KOREAN_PORTAL: LanguageResourceLink = {
  id: "ebsi-korean-portal",
  title: "EBSi 국어 강좌 모아보기",
  href: "https://cloud-www.ebsi.co.kr/ebs/pot/potn/retrieveSbjtListByArea.ebs?categoryCode=A100",
  label: "국어 영역",
  note: "공통국어1·2, 화법과 언어, 독서와 작문, 문학 강좌를 과목별로 찾는 공식 화면입니다.",
};

const EBSI_ENGLISH_PORTAL: LanguageResourceLink = {
  id: "ebsi-english-portal",
  title: "EBSi 영어 강좌 모아보기",
  href: "https://cloud-www.ebsi.co.kr/ebs/pot/potn/retrieveSbjtListByArea.ebs?categoryCode=B200&cookieGradeVal=high1",
  label: "영어 영역",
  note: "공통영어1·2, 영어I·II, 영어 독해와 작문 강좌를 한 곳에서 탐색하는 공식 화면입니다.",
};

const EBSI_ENGLISH_LISTENING: LanguageResourceLink = {
  id: "ebsi-english-listening",
  title: "영어듣기 대표 페이지",
  href: "https://www.ebsi.co.kr/ebs/pot/potg/EnglishListening01.ebs?cookieGradeVal=high1&seriesGrpNo=0&targetCd=PM03",
  label: "영어 듣기",
  note: "듣기 기본 문제와 듣기 파트 적응을 바로 시작할 수 있는 공식 듣기 페이지입니다.",
};

const EBSI_ENGLISH_LISTENING_BOOK: LanguageResourceLink = {
  id: "ebsi-english-listening-book",
  title: "Listening 실력",
  href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveCourseDetailNw.ebs?bookId=LB00000005659",
  label: "듣기 교재",
  note: "노베이스 학습자가 듣기 기본 문항을 반복하기 좋은 EBSi 공식 강좌입니다.",
};

const EBSI_SUNEUNG_SERIES: LanguageResourceLink = {
  id: "ebsi-suneung-series",
  title: "수능 연계 시리즈",
  href: "https://www.ebsi.co.kr/ebs/pot/potg/retrieveSeriesSubjectList.ebs?seriesGrpId=PKG_0336&seriesId=PRO_1764",
  label: "연계 교재",
  note: "EBS 연계 교재와 강좌를 묶어서 찾아 실전 적용으로 넘어갈 때 쓰는 공식 시리즈 페이지입니다.",
};

const KOREAN_BASE_RESOURCES = [EBSI_KOREAN_INTRO, EBSI_KOREAN_PORTAL, EBSI_COURSE_GUIDE];
const KOREAN_EBS_RESOURCES = [EBSI_KOREAN_PORTAL, EBSI_SUNEUNG_SERIES, EBSI_ALL_COURSES];
const ENGLISH_BASE_RESOURCES = [EBSI_ENGLISH_PORTAL, EBSI_COURSE_GUIDE, EBSI_ALL_COURSES];
const ENGLISH_LISTENING_RESOURCES = [EBSI_ENGLISH_LISTENING, EBSI_ENGLISH_LISTENING_BOOK, EBSI_ENGLISH_PORTAL];
const ENGLISH_EBS_RESOURCES = [EBSI_ENGLISH_PORTAL, EBSI_SUNEUNG_SERIES, EBSI_ALL_COURSES];

const KOREAN_CURRICULUM: LanguageCurriculum = {
  subject: "korean",
  title: "국어 기초 역량 지식 지도",
  subtitle: "고1 수준 / 2028학년도 통합형 수능 체제 대비용으로 읽기, 문학, 언어, 화법·작문·매체를 기초 역량 중심으로 다시 묶었습니다.",
  note: "현행 과목명과 2028 체계 안내가 섞여 있어 단원 이름보다 실제로 문제를 풀게 하는 기초 역량을 기준으로 정직하게 구성했습니다.",
  guideBullets: [
    "현행 수능 국어, 공통국어1·2, 화법과 언어, 독서와 작문, 문학 체계가 함께 보이지만 여기서는 기초 역량을 먼저 세웁니다.",
    "첫 흐름은 읽기 기초 → 비문학/문학 → 언어(문법) → 화법/작문/매체 → 문제 적용/EBS입니다.",
    "전문 용어는 괄호로 쉬운 풀이를 붙였고, 첫 개념과 첫 자가진단은 바로 맞힐 수 있을 정도로 낮은 난도에서 시작합니다.",
  ],
  chapters: [
    {
      id: "korean-reading-basics",
      title: "읽기 기초",
      objective: "문장을 끊어 읽고, 연결어와 지시어를 따라가며, 한 문단의 중심 문장을 찾는 가장 기본 읽기 힘을 만듭니다.",
      starterAction: "지문 첫 문장에서 지시어(이것, 그는)와 연결어(하지만, 그래서)만 형광펜처럼 표시하세요.",
      units: [
        {
          id: "korean-text-signals",
          title: "글의 표지(신호) 읽기",
          objective: "문장 속 작은 신호를 먼저 잡아 내용 전개를 놓치지 않습니다.",
          concepts: [
            {
              id: "korean-signal-reading",
              title: "지시어·연결어 찾기",
              summary: "가장 쉬운 출발입니다. '이것', '그러나', '따라서' 같은 작은 신호만 잡아도 글 흐름이 훨씬 덜 흔들립니다.",
              prerequisites: [prereq("없음 - 가장 쉬운 시작 개념")],
              corePoints: [
                "지시어(앞말을 다시 가리키는 말)는 바로 앞 문장 핵심어를 다시 찾게 합니다.",
                "연결어(하지만, 그래서, 또한)는 문장 관계를 바로 알려 주는 표지판입니다.",
                "처음에는 모든 뜻을 해석하려 하지 말고 신호 단어만 표시해도 읽기 부담이 크게 줄어듭니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 글 2개에서 지시어와 연결어만 동그라미 치기",
                "15분: 표시한 단어 옆에 '반전/이유/결론'처럼 한 단어 메모 붙이기",
                "10분: 표시한 신호만 보고 글 흐름을 한 줄로 다시 말하기",
              ],
              passCriteria: [
                "짧은 글 3개에서 연결어 역할을 80% 이상 맞힙니다.",
                "지시어가 가리키는 말을 3문항 중 2문항 이상 찾습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-signal-reading-q1",
                "문장 '비가 왔다. 그래서 길이 젖었다.'에서 '그래서'의 역할은 무엇인가요?",
                [
                  { value: "contrast", label: "반대(앞말을 뒤집기)" },
                  { value: "cause", label: "이유-결과 이어 주기" },
                  { value: "example", label: "예시 들기" },
                ],
                "cause",
                "정답은 '이유-결과 이어 주기'입니다. '그래서'는 앞 문장을 원인, 뒤 문장을 결과로 묶어 줍니다. 다음 단계로는 '하지만', '또한'도 같은 방식으로 기능을 말해 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-sentence-paragraph",
          title: "문장과 문단 묶기",
          objective: "한 문단 안에서 중심 문장과 보조 문장을 구분합니다.",
          concepts: [
            {
              id: "korean-main-sentence",
              title: "중심 문장과 뒷받침 문장",
              summary: "문단은 보통 한 핵심 말과 그 이유·예시로 이루어집니다. 핵심 문장을 먼저 잡으면 긴 글도 덜 막힙니다.",
              prerequisites: [prereq("지시어·연결어 찾기", "korean-signal-reading")],
              corePoints: [
                "중심 문장은 문단 전체가 하고 싶은 말을 가장 압축해서 말합니다.",
                "예시, 이유, 설명 문장은 중심 문장을 도와주는 역할입니다.",
                "첫 문장만 보지 말고 마지막 문장까지 확인해야 실제 중심 문장을 놓치지 않습니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 문단 3개에서 핵심이라고 생각한 문장 밑줄 긋기",
                "15분: 나머지 문장을 이유·예시·설명으로 분류하기",
                "15분: 문단 전체를 15자 안쪽 한 줄 요약으로 바꾸기",
              ],
              passCriteria: [
                "문단 4개 중 3개 이상에서 중심 문장을 고릅니다.",
                "문단 요약을 원문 핵심과 크게 어긋나지 않게 씁니다.",
              ],
              selfCheckQuestion: input(
                "korean-main-sentence-q1",
                "문단 요약의 가장 중요한 목적을 한 단어로 쓰세요: '핵심 ______ 찾기'",
                "문장",
                "정답은 '문장'입니다. 문단 요약은 결국 중심 문장을 찾아 다시 말하는 일입니다. 다음에는 이유 문장과 예시 문장을 색깔로 나눠 보세요.",
                ["문장"],
                "예: 문장",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "korean-nonfiction",
      title: "독서/비문학",
      objective: "인문, 사회, 과학기술, 통합 지문을 읽을 때 분야가 달라도 같은 읽기 절차로 구조를 잡는 연습을 합니다.",
      starterAction: "제목과 첫 문장만 보고 '무엇을 설명하는 글인가'를 5초 안에 말해 보세요.",
      note: "비문학은 배경지식보다 구조 파악이 먼저입니다. 모르는 용어가 있어도 정의, 비교, 원인-결과 표시를 먼저 잡습니다.",
      units: [
        {
          id: "korean-humanities",
          title: "인문 독서",
          objective: "개념 정의와 관점 비교를 중심으로 읽습니다.",
          concepts: [
            {
              id: "korean-humanities-reading",
              title: "인문 지문 읽기(개념 정의와 관점 비교)",
              summary: "인문 지문은 '무엇을 어떻게 정의하는가', '어떤 관점이 어떻게 다른가'를 따라가면 안정적으로 읽힙니다.",
              prerequisites: [prereq("중심 문장과 뒷받침 문장", "korean-main-sentence")],
              corePoints: [
                "정의 문장은 'A란 B이다'처럼 개념 경계를 세웁니다.",
                "관점 비교는 기준, 대상, 결론이 각각 어떻게 다른지 표처럼 정리하면 쉽습니다.",
                "추상어가 많을수록 예시 문장을 찾아 추상 개념을 구체화해야 합니다.",
              ],
              recommendedRoutine: [
                "15분: 인문 지문 1개에서 정의 문장과 비교 문장만 표시하기",
                "20분: 관점 A/B를 기준·주장·근거 세 칸 표로 정리하기",
                "10분: 마지막에 '이 글의 쟁점은 무엇인가'를 한 줄로 말하기",
              ],
              passCriteria: [
                "정의 문장과 비교 기준을 각각 놓치지 않습니다.",
                "서로 다른 두 관점을 한 문장씩 요약할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-humanities-reading-q1",
                "인문 지문에서 가장 먼저 확인할 대상으로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "definition", label: "핵심 개념의 정의" },
                  { value: "speed", label: "읽는 속도" },
                  { value: "mood", label: "글쓴이 기분" },
                ],
                "definition",
                "정답은 '핵심 개념의 정의'입니다. 인문 지문은 개념 경계를 놓치면 뒤 내용을 다르게 읽기 쉽습니다. 다음 단계로 관점 A와 B를 두 칸 표로 나눠 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-social",
          title: "사회 독서",
          objective: "제도, 원리, 사례 적용 관계를 읽습니다.",
          concepts: [
            {
              id: "korean-social-reading",
              title: "사회 지문 읽기(원리와 사례 적용)",
              summary: "사회 지문은 제도나 원리를 먼저 잡고, 사례가 그 원리에 맞는지 확인하는 방식으로 읽으면 흔들리지 않습니다.",
              prerequisites: [prereq("인문 지문 읽기(개념 정의와 관점 비교)", "korean-humanities-reading")],
              corePoints: [
                "원리 문장과 사례 문장을 분리하면 보기 판단이 쉬워집니다.",
                "조건이 하나라도 바뀌면 사례 해석이 달라지므로 조건어를 반드시 표시합니다.",
                "사회 지문은 개념끼리의 관계도(누가 무엇을 통해 무엇을 하는가)를 그리면 기억이 오래갑니다.",
              ],
              recommendedRoutine: [
                "15분: 원리 문장과 사례 문장에 서로 다른 표시하기",
                "20분: 조건어(만약, 경우, 일정한)를 네모 치기",
                "10분: 사례가 원리에 맞는 이유를 입으로 설명하기",
              ],
              passCriteria: [
                "원리와 사례를 섞지 않고 구분합니다.",
                "조건 변화가 답을 바꾸는 보기에서 2문항 이상 맞힙니다.",
              ],
              selfCheckQuestion: mc(
                "korean-social-reading-q1",
                "사회 지문에서 사례를 볼 때 가장 먼저 연결해야 할 것은 무엇인가요?",
                [
                  { value: "principle", label: "앞에서 제시한 원리" },
                  { value: "emotion", label: "등장인물 감정" },
                  { value: "rhythm", label: "문장 리듬" },
                ],
                "principle",
                "정답은 '앞에서 제시한 원리'입니다. 사례는 원리를 시험하는 장면인 경우가 많습니다. 다음 단계로는 사례 옆에 적용된 조건을 따로 적어 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-science-tech",
          title: "과학기술 독서",
          objective: "과정, 원리, 실험, 비교를 구조적으로 읽습니다.",
          concepts: [
            {
              id: "korean-science-tech-reading",
              title: "과학기술 지문 읽기(과정과 원리)",
              summary: "과학기술 지문은 순서와 원인-결과가 뚜렷해서, 단계도만 그리면 낯선 내용도 버틸 수 있습니다.",
              prerequisites: [prereq("사회 지문 읽기(원리와 사례 적용)", "korean-social-reading")],
              corePoints: [
                "과정 설명은 단계 순서를 화살표로 정리하면 기억이 잘 남습니다.",
                "실험 지문은 변수(바뀌는 것)와 결과(달라진 것)를 분리해야 합니다.",
                "용어가 낯설어도 정의, 과정, 결과 세 축만 남기면 문제 풀이가 가능합니다.",
              ],
              recommendedRoutine: [
                "15분: 과정 지문 1개를 화살표 4칸 도식으로 바꾸기",
                "20분: 실험 조건과 결과를 표로 나누기",
                "10분: '무엇이 왜 달라졌는가'를 한 문장으로 요약하기",
              ],
              passCriteria: [
                "과정 순서를 바꾸는 선지에 흔들리지 않습니다.",
                "실험 변수와 결과를 서로 바꾸지 않습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-science-tech-reading-q1",
                "과학기술 지문을 읽을 때 가장 바로 도식화하기 좋은 것은 무엇인가요?",
                [
                  { value: "sequence", label: "과정의 순서" },
                  { value: "feeling", label: "필자의 기분" },
                  { value: "meter", label: "운율" },
                ],
                "sequence",
                "정답은 '과정의 순서'입니다. 과정 순서를 잡으면 낯선 용어가 많아도 지문이 무너지지 않습니다. 다음 단계로 변수와 결과를 따로 적어 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-integrated",
          title: "통합 독서",
          objective: "두 지문 이상을 묶어 공통점과 차이점을 정리합니다.",
          concepts: [
            {
              id: "korean-integrated-reading",
              title: "통합 지문 읽기(공통점과 차이점 묶기)",
              summary: "통합 지문은 각각을 따로 읽고 끝내지 말고, 비교 기준을 세워 한 장 표로 합쳐야 안정됩니다.",
              prerequisites: [prereq("과학기술 지문 읽기(과정과 원리)", "korean-science-tech-reading")],
              corePoints: [
                "통합 독서는 지문별 핵심을 먼저 한 줄씩 정리한 뒤 비교해야 합니다.",
                "비교 기준은 대상, 관점, 근거, 결론처럼 같은 위치끼리 맞춥니다.",
                "하나의 지문 정보를 다른 지문에 섞어 넣지 않도록 색을 달리 표시하는 것이 안전합니다.",
              ],
              recommendedRoutine: [
                "10분: 각 지문 핵심을 한 줄씩 쓰기",
                "20분: 공통점 2개, 차이점 2개를 표로 작성하기",
                "10분: 보기 선지를 어느 지문 근거로 판단했는지 표시하기",
              ],
              passCriteria: [
                "공통점과 차이점을 뒤섞지 않습니다.",
                "근거 문장을 지문별로 정확히 되짚습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-integrated-reading-q1",
                "통합 지문에서 가장 먼저 해야 할 일로 알맞은 것은 무엇인가요?",
                [
                  { value: "each", label: "각 지문 핵심을 따로 한 줄 정리하기" },
                  { value: "guess", label: "바로 정답 추측하기" },
                  { value: "skip", label: "두 번째 지문 건너뛰기" },
                ],
                "each",
                "정답은 '각 지문 핵심을 따로 한 줄 정리하기'입니다. 각각을 분리해야 비교가 정확해집니다. 다음 단계로 비교 기준 표를 만들어 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "korean-literature",
      title: "문학",
      objective: "갈래(글의 종류)별 읽는 기준을 세워 현대시, 현대소설, 고전시가, 고전소설, 극·수필을 안정적으로 구분합니다.",
      starterAction: "작품을 보자마자 '말하는 이/이야기/장면' 중 무엇이 중심인지 하나만 먼저 고르세요.",
      units: [
        {
          id: "korean-modern-poetry",
          title: "현대시",
          objective: "화자, 정서, 이미지(떠오르는 장면)를 잡습니다.",
          concepts: [
            {
              id: "korean-modern-poetry",
              title: "현대시 읽기(화자와 이미지)",
              summary: "현대시는 모든 표현을 해석하려 하기보다 화자가 무엇을 보고 어떻게 느끼는지부터 잡는 것이 안전합니다.",
              prerequisites: [prereq("통합 지문 읽기(공통점과 차이점 묶기)", "korean-integrated-reading")],
              corePoints: [
                "화자(말하는 이)가 누구인지, 무엇을 바라보는지 먼저 확인합니다.",
                "이미지(눈앞에 그려지는 장면)와 정서(느낌)를 따로 메모하면 해석이 정리됩니다.",
                "시어 하나에만 매달리기보다 반복되는 장면과 분위기를 묶어 읽어야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 시 한 편에서 화자, 대상, 정서 한 단어씩 적기",
                "15분: 반복되는 시어와 이미지 3개 표시하기",
                "10분: 마지막 연을 보고 시 전체 정서 변화 말하기",
              ],
              passCriteria: [
                "화자와 대상이 누구인지 혼동하지 않습니다.",
                "정서 변화가 있는 작품에서 전환 지점을 찾습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-modern-poetry-q1",
                "현대시를 처음 읽을 때 가장 먼저 적어 두기 좋은 것은 무엇인가요?",
                [
                  { value: "speaker", label: "화자가 누구인지" },
                  { value: "author", label: "작가 생년월일" },
                  { value: "meter", label: "압운 이름" },
                ],
                "speaker",
                "정답은 '화자가 누구인지'입니다. 화자를 놓치면 감정과 대상도 흔들립니다. 다음 단계로 화자가 보는 장면 2개를 적어 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-modern-fiction",
          title: "현대소설",
          objective: "인물, 사건, 시점(누가 보는가)을 정리합니다.",
          concepts: [
            {
              id: "korean-modern-fiction",
              title: "현대소설 읽기(인물과 사건 흐름)",
              summary: "현대소설은 줄거리보다 인물 관계와 사건 전개를 간단한 선으로 그리면 훨씬 정리됩니다.",
              prerequisites: [prereq("현대시 읽기(화자와 이미지)", "korean-modern-poetry")],
              corePoints: [
                "인물 관계를 먼저 정리하면 행동 이유를 읽기 쉬워집니다.",
                "시점(누가 보고 말하는가)에 따라 드러나는 정보 양이 달라집니다.",
                "사건의 앞-뒤 순서를 한 줄 타임라인으로 적으면 선지 판단이 빨라집니다.",
              ],
              recommendedRoutine: [
                "10분: 주요 인물 2~3명 관계를 화살표로 표시하기",
                "20분: 사건 3단계를 타임라인으로 쓰기",
                "10분: 시점 때문에 숨겨진 정보를 한 줄로 정리하기",
              ],
              passCriteria: [
                "사건 순서를 바꾸는 선지에 속지 않습니다.",
                "시점 때문에 알 수 없는 정보와 알 수 있는 정보를 구분합니다.",
              ],
              selfCheckQuestion: mc(
                "korean-modern-fiction-q1",
                "현대소설 정리의 기본으로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "timeline", label: "인물 관계와 사건 순서" },
                  { value: "meter", label: "운율 이름" },
                  { value: "formula", label: "공식 외우기" },
                ],
                "timeline",
                "정답은 '인물 관계와 사건 순서'입니다. 소설은 누가 무엇을 왜 했는지 정리되면 보기 판단이 쉬워집니다. 다음 단계로 시점을 한 줄로 적어 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-classical-poetry",
          title: "고전시가(옛 노래 글)",
          objective: "옛말 표현을 현대어 감각으로 바꿔 읽습니다.",
          concepts: [
            {
              id: "korean-classical-poetry",
              title: "고전시가 읽기(옛말과 상황 바꾸기)",
              summary: "고전시가는 낯선 표현을 겁내기보다 화자의 상황과 소망을 현대어로 옮겨 보는 것이 핵심입니다.",
              prerequisites: [prereq("현대소설 읽기(인물과 사건 흐름)", "korean-modern-fiction")],
              corePoints: [
                "고전 어휘는 전부 외우기보다 자주 나오는 표현을 상황과 함께 익힙니다.",
                "자연물은 감정과 태도를 비유하는 장치로 자주 쓰입니다.",
                "작품의 상황, 화자의 바람, 정서를 현재 말로 바꾸면 훨씬 이해가 쉬워집니다.",
              ],
              recommendedRoutine: [
                "10분: 낯선 어휘 3개를 현대어 한 단어로 바꾸기",
                "15분: 화자의 상황과 바람을 한 문장으로 쓰기",
                "10분: 자연물 표현이 어떤 감정을 돕는지 표시하기",
              ],
              passCriteria: [
                "핵심 고전 어휘를 상황과 함께 설명할 수 있습니다.",
                "화자의 태도와 소망을 현대어로 옮겨 말할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-classical-poetry-q1",
                "고전시가를 읽을 때 가장 먼저 해야 할 일로 알맞은 것은 무엇인가요?",
                [
                  { value: "modern", label: "상황을 현대어로 바꿔 보기" },
                  { value: "ignore", label: "모르는 말은 전부 무시하기" },
                  { value: "biography", label: "작가 전기만 읽기" },
                ],
                "modern",
                "정답은 '상황을 현대어로 바꿔 보기'입니다. 상황을 바꾸면 낯선 표현이 훨씬 덜 부담스럽습니다. 다음 단계로 화자의 바람을 한 줄로 써 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-classical-fiction",
          title: "고전소설",
          objective: "전형적 인물과 사건 구조를 익힙니다.",
          concepts: [
            {
              id: "korean-classical-fiction",
              title: "고전소설 읽기(전형과 사건 구조)",
              summary: "고전소설은 인물 성격이 비교적 또렷하고 사건 구조가 반복되는 경우가 많아, 전형을 잡으면 읽기 속도가 빨라집니다.",
              prerequisites: [prereq("고전시가 읽기(옛말과 상황 바꾸기)", "korean-classical-poetry")],
              corePoints: [
                "선인/악인, 충/효 같은 가치 구도가 자주 드러납니다.",
                "사건 전개는 시련, 도움, 해결 같은 반복 구조를 보이기 쉽습니다.",
                "서술자 설명과 인물 행동을 함께 봐야 가치 판단을 정확히 읽습니다.",
              ],
              recommendedRoutine: [
                "10분: 인물 역할을 한 단어씩 붙이기",
                "15분: 사건 전개를 시련-전환-해결로 나누기",
                "10분: 작품이 긍정/부정하는 가치가 무엇인지 적기",
              ],
              passCriteria: [
                "인물 역할과 사건 구조를 엮어 설명합니다.",
                "작품이 지지하는 가치 판단을 근거와 함께 말합니다.",
              ],
              selfCheckQuestion: mc(
                "korean-classical-fiction-q1",
                "고전소설을 정리할 때 가장 먼저 적기 좋은 것은 무엇인가요?",
                [
                  { value: "role", label: "인물 역할과 사건 단계" },
                  { value: "meter", label: "운율 공식" },
                  { value: "science", label: "실험 변수" },
                ],
                "role",
                "정답은 '인물 역할과 사건 단계'입니다. 고전소설은 전형과 구조가 보이면 문제 적용이 쉬워집니다. 다음 단계로 작품이 긍정하는 가치를 써 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-drama-essay",
          title: "극/수필",
          objective: "대사, 장면, 서술 태도를 중심으로 읽습니다.",
          concepts: [
            {
              id: "korean-drama-essay",
              title: "극·수필 읽기(장면과 태도)",
              summary: "극은 대사와 장면 지시를, 수필은 필자의 태도와 경험 해석을 따라가면 갈래 차이가 분명해집니다.",
              prerequisites: [prereq("고전소설 읽기(전형과 사건 구조)", "korean-classical-fiction")],
              corePoints: [
                "극은 인물 대사와 무대 지시가 성격과 갈등을 보여 줍니다.",
                "수필은 사실 나열보다 경험을 바라보는 태도가 핵심입니다.",
                "갈래별 장치를 구분해야 표현상 특징 문제를 정확히 풉니다.",
              ],
              recommendedRoutine: [
                "10분: 극 대사에서 갈등 드러나는 말 찾기",
                "15분: 수필에서 필자의 태도를 보여 주는 표현 표시하기",
                "10분: 극과 수필의 표현 차이를 한 줄씩 적기",
              ],
              passCriteria: [
                "극과 수필의 읽는 기준을 섞지 않습니다.",
                "태도와 갈등을 근거 표현으로 설명할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-drama-essay-q1",
                "극 작품을 읽을 때 특히 주의해서 봐야 하는 것은 무엇인가요?",
                [
                  { value: "dialogue", label: "대사와 장면 지시" },
                  { value: "formula", label: "수학 공식" },
                  { value: "dictionary", label: "사전 뜻만" },
                ],
                "dialogue",
                "정답은 '대사와 장면 지시'입니다. 극은 말과 장면이 인물 관계를 직접 보여 줍니다. 다음 단계로 갈등이 가장 드러나는 대사를 표시해 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "korean-language",
      title: "언어",
      objective: "음운, 형태소, 품사, 문장, 규범을 기초부터 연결해 문법 문항을 작은 규칙 문제로 바꿔 풉니다.",
      starterAction: "문법 용어를 외우기 전에 예문 한 줄을 보고 '소리 / 말조각 / 역할 / 문장' 중 어디 문제인지 먼저 고르세요.",
      units: [
        {
          id: "korean-phonology",
          title: "음운(소리 단위)",
          objective: "말소리와 발음 변화를 가장 기초적으로 읽습니다.",
          concepts: [
            {
              id: "korean-phonology",
              title: "음운과 발음 변화",
              summary: "문법이 막막할 때는 '글자'가 아니라 '소리'를 본다고 생각하면 첫걸음이 쉬워집니다.",
              prerequisites: [prereq("극·수필 읽기(장면과 태도)", "korean-drama-essay")],
              corePoints: [
                "음운은 뜻을 구별하는 가장 작은 소리 단위입니다.",
                "발음 변화는 실제 소리가 편하게 이어지며 달라지는 현상입니다.",
                "문제에서는 이름보다 예문에서 소리가 어떻게 바뀌는지 확인하는 것이 우선입니다.",
              ],
              recommendedRoutine: [
                "10분: 예문 5개를 소리 나는 대로 천천히 읽기",
                "15분: 바뀐 소리를 원래 표기와 비교해 보기",
                "10분: 된소리되기, 비음화처럼 자주 나오는 변화 이름 붙이기",
              ],
              passCriteria: [
                "예문에서 실제 발음을 말할 수 있습니다.",
                "대표 발음 변화 2~3가지를 예와 함께 구분합니다.",
              ],
              selfCheckQuestion: mc(
                "korean-phonology-q1",
                "음운을 가장 쉽게 설명한 것은 무엇인가요?",
                [
                  { value: "sound", label: "뜻을 가르는 가장 작은 소리" },
                  { value: "chapter", label: "책의 큰 단원" },
                  { value: "ending", label: "문장 끝표지" },
                ],
                "sound",
                "정답은 '뜻을 가르는 가장 작은 소리'입니다. 개념을 정확히 잡았습니다. 다음 단계로 예문을 실제 소리대로 읽어 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-morpheme",
          title: "형태소(뜻을 가진 가장 작은 말조각)",
          objective: "단어를 작은 뜻 조각으로 나눕니다.",
          concepts: [
            {
              id: "korean-morpheme",
              title: "형태소와 단어 나누기",
              summary: "형태소는 단어를 작은 뜻 조각으로 보는 훈련입니다. 손으로 쪼개 보면 금방 감이 생깁니다.",
              prerequisites: [prereq("음운과 발음 변화", "korean-phonology")],
              corePoints: [
                "형태소는 뜻이나 문법 기능을 가진 가장 작은 단위입니다.",
                "하나의 단어도 여러 형태소로 나뉠 수 있습니다.",
                "문법 문제에서는 줄긋기보다 실제로 조각을 나눠 적는 것이 정확합니다.",
              ],
              recommendedRoutine: [
                "10분: 쉬운 단어 5개를 형태소로 나누기",
                "15분: 각각 뜻 조각인지 문법 조각인지 표시하기",
                "10분: 틀린 분해 한 개를 왜 틀렸는지 설명하기",
              ],
              passCriteria: [
                "대표 예문에서 형태소 경계를 찾습니다.",
                "어휘 형태소와 문법 형태소를 기본 수준에서 구분합니다.",
              ],
              selfCheckQuestion: input(
                "korean-morpheme-q1",
                "'먹었다'를 형태소로 나눌 때 첫 번째 형태소를 쓰세요.",
                "먹",
                "정답은 '먹'입니다. '먹-었-다'처럼 뜻 조각과 문법 조각으로 나눌 수 있습니다. 다음 단계로 뒤의 두 조각 역할도 말해 보세요.",
                ["먹"],
                "예: 먹",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-parts-of-speech",
          title: "품사(단어 역할 분류)",
          objective: "단어가 문장에서 어떤 역할을 하는지 구분합니다.",
          concepts: [
            {
              id: "korean-parts-of-speech",
              title: "품사와 역할 읽기",
              summary: "품사는 단어 이름 외우기가 아니라, 문장에서 어떤 일을 하는지를 보는 분류법입니다.",
              prerequisites: [prereq("형태소와 단어 나누기", "korean-morpheme")],
              corePoints: [
                "명사, 동사, 형용사처럼 기본 품사를 예문 속 역할과 함께 익혀야 오래갑니다.",
                "같은 단어라도 문장 안 위치와 쓰임에 따라 판단 근거를 확인해야 합니다.",
                "품사 문제는 문장 안에서 꾸미는 말, 움직이는 말, 이름 붙이는 말을 분리하면 쉬워집니다.",
              ],
              recommendedRoutine: [
                "10분: 한 문장씩 읽으며 명사·동사·형용사 먼저 표시하기",
                "15분: 조사와 어미까지 덧붙여 문장 속 역할 말하기",
                "10분: 헷갈린 품사 2개를 비교 메모로 정리하기",
              ],
              passCriteria: [
                "기본 품사를 예문에서 설명할 수 있습니다.",
                "품사 판단 근거를 '무엇을 가리키는가/어떤 상태인가'처럼 말할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-parts-of-speech-q1",
                "문장 '꽃이 예쁘다'에서 '꽃'의 기본 품사는 무엇인가요?",
                [
                  { value: "noun", label: "명사" },
                  { value: "verb", label: "동사" },
                  { value: "adverb", label: "부사" },
                ],
                "noun",
                "정답은 '명사'입니다. 대상의 이름을 나타내는 역할을 정확히 잡았습니다. 다음 단계로 '예쁘다'는 어떤 역할인지 이어서 말해 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-sentence",
          title: "문장",
          objective: "문장 성분과 호응 관계를 읽습니다.",
          concepts: [
            {
              id: "korean-sentence",
              title: "문장 성분과 호응",
              summary: "문장은 누가, 무엇을, 어떻게 하는지 자리로 읽으면 훨씬 단순해집니다.",
              prerequisites: [prereq("품사와 역할 읽기", "korean-parts-of-speech")],
              corePoints: [
                "주어, 서술어, 목적어, 부사어처럼 문장 성분을 자리에 따라 봅니다.",
                "호응은 앞말과 뒷말이 서로 자연스럽게 짝을 이루는 관계입니다.",
                "문법 문제는 성분 이름을 외우는 것보다 예문을 쪼개는 연습이 더 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 문장 5개에서 주어와 서술어만 먼저 찾기",
                "15분: 목적어와 부사어를 덧붙여 자리 구분하기",
                "10분: 어색한 호응 문장을 자연스럽게 고쳐 보기",
              ],
              passCriteria: [
                "주어와 서술어를 안정적으로 찾습니다.",
                "호응이 어색한 문장을 근거와 함께 고칩니다.",
              ],
              selfCheckQuestion: mc(
                "korean-sentence-q1",
                "문장 '민지가 책을 읽는다'에서 서술어는 무엇인가요?",
                [
                  { value: "subject", label: "민지가" },
                  { value: "object", label: "책을" },
                  { value: "predicate", label: "읽는다" },
                ],
                "predicate",
                "정답은 '읽는다'입니다. 동작이나 상태를 말하는 자리를 정확히 찾았습니다. 다음 단계로 목적어도 함께 표시해 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "korean-norms",
          title: "규범",
          objective: "맞춤법, 표준어, 띄어쓰기의 기본 원리를 확인합니다.",
          concepts: [
            {
              id: "korean-norms",
              title: "맞춤법과 띄어쓰기 기본",
              summary: "규범 문제는 외워서 버티기보다 틀리기 쉬운 형태를 자주 비교하는 방식이 효율적입니다.",
              prerequisites: [prereq("문장 성분과 호응", "korean-sentence")],
              corePoints: [
                "맞춤법은 실제 발음이 아니라 기본 형태를 기준으로 적는 경우가 많습니다.",
                "띄어쓰기는 단어 단위와 문법 단위를 함께 봐야 합니다.",
                "한 번에 모든 규칙을 외우기보다 자주 틀리는 예를 모아 비교하는 편이 효과적입니다.",
              ],
              recommendedRoutine: [
                "10분: 자주 틀리는 표기 5개를 맞는 형태와 비교하기",
                "15분: 띄어쓰기 예문 5개를 직접 써 보기",
                "10분: 틀린 이유를 규칙 이름 대신 쉬운 말로 설명하기",
              ],
              passCriteria: [
                "대표 맞춤법 오류를 이유와 함께 고칩니다.",
                "띄어쓰기 5문항 중 4문항 이상을 맞힙니다.",
              ],
              selfCheckQuestion: mc(
                "korean-norms-q1",
                "다음 중 띄어쓰기가 맞는 것은 무엇인가요?",
                [
                  { value: "together", label: "할수있다" },
                  { value: "correct", label: "할 수 있다" },
                  { value: "mixed", label: "할수 있다" },
                ],
                "correct",
                "정답은 '할 수 있다'입니다. 규범은 짧게 자주 비교할수록 빨리 늘어납니다. 다음 단계로 비슷한 표현 3개를 더 써 보세요.",
              ),
              resources: KOREAN_BASE_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "korean-speech-writing-media",
      title: "화법/작문/매체",
      objective: "말하기, 글쓰기, 자료 해석을 따로 보지 않고 '의도-구성-표현' 흐름으로 묶어 읽습니다.",
      starterAction: "자료를 보기 전에 '이 말/글의 목적이 무엇인가'를 한 단어로 먼저 적으세요.",
      units: [
        {
          id: "korean-speech",
          title: "화법",
          objective: "대화 목적과 반응 적절성을 읽습니다.",
          concepts: [
            {
              id: "korean-speech",
              title: "화법 읽기(의도와 반응)",
              summary: "화법 문제는 좋은 말하기 기술보다 '이 사람이 지금 무엇을 하려는가'를 먼저 파악하는 것이 핵심입니다.",
              prerequisites: [prereq("맞춤법과 띄어쓰기 기본", "korean-norms")],
              corePoints: [
                "발화 의도(설득, 요청, 설명, 반박)를 먼저 잡습니다.",
                "적절한 반응은 앞말의 의도와 조건을 이어 받아야 합니다.",
                "표현 방식보다 대화 흐름에서 기능이 맞는지를 보는 것이 우선입니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 대화에서 각 발화 의도를 한 단어로 적기",
                "15분: 반응 문장이 왜 적절/부적절한지 근거 찾기",
                "10분: 비슷한 상황에서 자신의 한 문장 답변 만들어 보기",
              ],
              passCriteria: [
                "발화 의도를 4문항 중 3문항 이상 맞힙니다.",
                "반응 적절성을 이유와 함께 설명할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-speech-q1",
                "화법 문제를 풀 때 가장 먼저 볼 것은 무엇인가요?",
                [
                  { value: "intent", label: "말하는 사람의 의도" },
                  { value: "length", label: "문장 길이" },
                  { value: "font", label: "글자 모양" },
                ],
                "intent",
                "정답은 '말하는 사람의 의도'입니다. 의도를 잡았기 때문에 반응 판단도 쉬워집니다. 다음 단계로 대화 목적을 한 단어로 적어 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-writing",
          title: "작문",
          objective: "목적에 맞는 구성과 자료 활용을 연습합니다.",
          concepts: [
            {
              id: "korean-writing",
              title: "작문 읽기(목적과 구성)",
              summary: "작문은 잘 쓰는 감각보다 '누구에게 무엇을 왜 쓰는가'를 먼저 정리하는 구조 문제입니다.",
              prerequisites: [prereq("화법 읽기(의도와 반응)", "korean-speech")],
              corePoints: [
                "글의 목적과 독자를 먼저 정해야 내용 선택이 쉬워집니다.",
                "도입-전개-마무리 구조가 목적에 맞는지 확인해야 합니다.",
                "자료 활용은 많이 넣는 것보다 주장을 뒷받침하는 데 맞게 쓰는 것이 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 제시문 목적과 독자를 한 줄로 쓰기",
                "15분: 도입-전개-마무리 핵심 문장씩 메모하기",
                "10분: 자료 1개를 어디에 넣을지 이유와 함께 정하기",
              ],
              passCriteria: [
                "목적과 독자에 맞는 구성을 고릅니다.",
                "자료 활용 위치와 이유를 말할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-writing-q1",
                "작문 계획에서 가장 먼저 정해야 할 것은 무엇인가요?",
                [
                  { value: "purpose", label: "목적과 독자" },
                  { value: "decoration", label: "예쁜 표현만" },
                  { value: "length", label: "줄 수만" },
                ],
                "purpose",
                "정답은 '목적과 독자'입니다. 이 두 가지가 정해져야 내용과 구성이 흔들리지 않습니다. 다음 단계로 도입 한 문장을 직접 써 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-media",
          title: "매체",
          objective: "표, 그래프, 게시물, 이미지 자료의 의도와 효과를 읽습니다.",
          concepts: [
            {
              id: "korean-media",
              title: "매체 읽기(자료와 의도)",
              summary: "매체 문제는 정보만 읽는 것이 아니라, 자료 배치와 표현 방식이 어떤 효과를 노리는지 함께 봐야 합니다.",
              prerequisites: [prereq("작문 읽기(목적과 구성)", "korean-writing")],
              corePoints: [
                "매체는 글, 그림, 표가 함께 의미를 만듭니다.",
                "같은 정보라도 배치와 강조 방식에 따라 전달 효과가 달라집니다.",
                "신뢰도 판단에서는 출처, 목적, 편집 방식까지 함께 봐야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 자료에서 가장 크게 강조된 요소 찾기",
                "15분: 표/그래프 수치와 본문 주장을 연결하기",
                "10분: 자료가 설득, 안내, 홍보 중 무엇에 가까운지 말하기",
              ],
              passCriteria: [
                "자료와 본문 주장을 함께 읽습니다.",
                "표현 방식의 효과를 구체적으로 설명할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "korean-media-q1",
                "매체 자료를 볼 때 함께 확인해야 할 것으로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "effect", label: "정보와 표현 효과" },
                  { value: "paper", label: "종이 두께" },
                  { value: "noise", label: "배경 소리" },
                ],
                "effect",
                "정답은 '정보와 표현 효과'입니다. 매체는 내용과 보여 주는 방식이 함께 의미를 만듭니다. 다음 단계로 강조된 요소를 표시해 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "korean-application-ebs",
      title: "문제 적용/EBS",
      objective: "배운 개념을 실제 수능형 문제와 EBS 연계 학습으로 옮깁니다.",
      starterAction: "문제를 풀기 전에 이 문항이 독서·문학·문법·화법작문매체 중 어디인지 먼저 분류하세요.",
      note: "EBS 연계는 암기가 아니라 익숙한 소재와 구조를 통해 낯선 문항 적응력을 올리는 데 목적이 있습니다.",
      units: [
        {
          id: "korean-problem-application",
          title: "문제 적용",
          objective: "개념을 문항 유형 판단과 시간 관리로 연결합니다.",
          concepts: [
            {
              id: "korean-problem-application",
              title: "국어 문제 적용 루틴",
              summary: "국어 실전력은 더 많이 읽는 것보다, 문항이 어떤 개념을 묻는지 먼저 분류하는 루틴에서 올라갑니다.",
              prerequisites: [prereq("매체 읽기(자료와 의도)", "korean-media")],
              corePoints: [
                "문항을 갈래와 요구 기능으로 먼저 분류해야 시간을 줄일 수 있습니다.",
                "오답 검토는 '모른 개념'보다 '잘못 본 근거'를 찾는 데 집중해야 효과가 큽니다.",
                "실전에서는 완벽한 해석보다 근거 문장 확인 속도가 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 문항 5개를 갈래별로만 먼저 분류하기",
                "20분: 틀린 문항에서 근거 문장을 다시 찾기",
                "10분: 다음에 쓸 한 줄 규칙(예: 먼저 관점 표 만들기) 적기",
              ],
              passCriteria: [
                "문항 유형을 빠르게 분류합니다.",
                "오답 이유를 근거 부족, 개념 혼동, 시간 부족으로 구분합니다.",
              ],
              selfCheckQuestion: mc(
                "korean-problem-application-q1",
                "실전 국어 문제를 풀 때 가장 먼저 하면 좋은 일은 무엇인가요?",
                [
                  { value: "classify", label: "문항이 묻는 갈래와 기능 분류" },
                  { value: "panic", label: "모르는 단어에 오래 머무르기" },
                  { value: "guess", label: "바로 감으로 찍기" },
                ],
                "classify",
                "정답은 '문항이 묻는 갈래와 기능 분류'입니다. 시작 방향을 정확히 잡았습니다. 다음 단계로 오답 이유를 한 줄로 분류해 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "korean-ebs-linkage",
          title: "EBS 연계",
          objective: "공식 강좌와 연계 교재를 개념 복습 도구로 씁니다.",
          concepts: [
            {
              id: "korean-ebs-linkage",
              title: "국어 EBS 연계 활용",
              summary: "EBS는 작품·지문을 외우는 도구가 아니라, 읽는 절차와 자주 나오는 배경 소재를 익히는 도구로 써야 효율적입니다.",
              prerequisites: [prereq("국어 문제 적용 루틴", "korean-problem-application")],
              corePoints: [
                "강좌는 취약 갈래 하나씩 골라 짧게 반복하는 방식이 효율적입니다.",
                "연계 지문은 주제와 구조를 다시 말하는 복습용으로 써야 합니다.",
                "작품/지문 이름보다 어떤 읽기 절차를 적용했는지가 더 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 오늘 약한 갈래 한 개만 골라 EBS 강좌 연결하기",
                "20분: 연계 지문 한 개를 읽고 구조를 말로 복원하기",
                "10분: 다음 실전에서 쓸 읽기 규칙 1개 정리하기",
              ],
              passCriteria: [
                "취약 갈래 기준으로 강좌를 선택합니다.",
                "연계 지문을 구조 중심으로 복습합니다.",
              ],
              selfCheckQuestion: mc(
                "korean-ebs-linkage-q1",
                "국어 EBS 연계 학습의 핵심으로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "process", label: "읽는 절차와 구조 복습" },
                  { value: "memorize", label: "작품 제목만 암기" },
                  { value: "skip", label: "해설 없이 답만 확인" },
                ],
                "process",
                "정답은 '읽는 절차와 구조 복습'입니다. 연계 학습 방향을 정확히 잡았습니다. 다음 단계로 오늘 본 지문 구조를 한 줄로 적어 보세요.",
              ),
              resources: KOREAN_EBS_RESOURCES,
            },
          ],
        },
      ],
    },
  ],
};

const ENGLISH_CURRICULUM: LanguageCurriculum = {
  subject: "english",
  title: "영어 기초 역량 지식 지도",
  subtitle: "고1 수준 / 2028학년도 수능 체제 기준으로 소리·듣기·문장 문법·구문·독해 유형·EBS/실전을 한 흐름으로 연결했습니다.",
  note: "수능 영어는 듣기 파트와 읽기 파트를 중심으로 구성됩니다. 영어 체제 자체는 2028 개편의 직접 변경 대상은 아니므로, 기초 순서를 안정적으로 밟는 것이 중요합니다.",
  guideBullets: [
    "노베이스 권장 순서는 소리·발음 → 쉬운 듣기 → 어휘 → 문장 문법 → 구문 → 유형 독해 → EBS/실전입니다.",
    "공통영어1·2, 영어I·II, 영어 독해와 작문으로 연결되는 기본기를 먼저 만들고, 수능형 읽기·듣기 문항에 적용합니다.",
    "어려운 문법 용어는 괄호로 쉬운 풀이를 붙였고, 첫 개념과 첫 자가진단은 가장 쉬운 난도에서 출발합니다.",
  ],
  chapters: [
    {
      id: "english-sound-vocab",
      title: "어휘/발음",
      objective: "철자와 소리를 연결하고, 단어를 덩어리(청크)로 익혀 듣기와 독해의 첫 저항을 낮춥니다.",
      starterAction: "모르는 단어가 보여도 먼저 천천히 소리 내 읽고, 아는 소리 조각이 있는지 확인하세요.",
      units: [
        {
          id: "english-sound-symbol",
          title: "소리-철자 연결",
          objective: "알파벳과 기본 소리 대응을 안정적으로 익힙니다.",
          concepts: [
            {
              id: "english-sound-symbol",
              title: "기본 소리와 철자 연결",
              summary: "가장 쉬운 출발입니다. 읽는 소리가 안정되면 듣기와 단어 암기가 동시에 쉬워집니다.",
              prerequisites: [prereq("없음 - 영어의 가장 쉬운 시작 개념")],
              corePoints: [
                "알파벳 이름과 실제 단어 속 소리는 다를 수 있습니다.",
                "모르는 단어도 아는 소리 조각으로 나누면 읽기 부담이 줄어듭니다.",
                "처음에는 완벽한 발음보다 소리-철자 대응을 꾸준히 확인하는 것이 더 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 쉬운 단어 10개를 소리 내 읽기",
                "10분: 비슷한 소리 철자 묶기(cat, map, bag처럼)",
                "10분: 들은 소리를 보고 알파벳으로 적어 보기",
              ],
              passCriteria: [
                "기본 단어를 주저 없이 소리 내 읽습니다.",
                "비슷한 철자 소리를 묶어 설명할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-sound-symbol-q1",
                "단어 'cat'의 첫 소리로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "k", label: "/k/ 소리" },
                  { value: "s", label: "/s/ 소리" },
                  { value: "f", label: "/f/ 소리" },
                ],
                "k",
                "정답입니다. /k/ 소리를 정확히 잡았습니다. 아주 좋은 시작입니다. 다음 단계로 비슷한 철자의 다른 단어도 소리 내 읽어 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "english-vocab-chunks",
          title: "어휘 덩어리",
          objective: "단어를 뜻과 쓰임이 함께 들어 있는 덩어리로 익힙니다.",
          concepts: [
            {
              id: "english-vocab-chunks",
              title: "어휘 청크(자주 같이 쓰는 덩어리)",
              summary: "단어 하나씩보다 짧은 덩어리로 외우면 듣기와 독해에서 바로 꺼내 쓰기 쉬워집니다.",
              prerequisites: [prereq("기본 소리와 철자 연결", "english-sound-symbol")],
              corePoints: [
                "어휘는 뜻만이 아니라 같이 붙는 말까지 함께 익혀야 오래갑니다.",
                "예문 한 줄과 함께 외우면 독해에서 바로 떠올리기 쉽습니다.",
                "발음까지 같이 확인해야 듣기에서 같은 단어를 놓치지 않습니다.",
              ],
              recommendedRoutine: [
                "10분: 오늘 단어 8개를 예문과 함께 읽기",
                "15분: 단어를 두 단어 청크(make a plan처럼)로 묶기",
                "10분: 청크를 소리 내 말하며 뜻 떠올리기",
              ],
              passCriteria: [
                "단어를 예문 속에서 이해합니다.",
                "청크 5개 이상을 뜻과 함께 말할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-vocab-chunks-q1",
                "어휘를 오래 기억하는 데 가장 도움이 되는 방법으로 알맞은 것은 무엇인가요?",
                [
                  { value: "chunk", label: "예문과 청크로 함께 익히기" },
                  { value: "spelling", label: "철자만 50번 쓰기" },
                  { value: "ignore", label: "발음은 무시하기" },
                ],
                "chunk",
                "정답입니다. 예문과 청크로 묶으면 실제 쓰임까지 같이 남습니다. 다음 단계로 오늘 단어 하나를 짧은 청크로 바꿔 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "english-listening",
      title: "듣기",
      objective: "목적, 관계, 숫자, 세부, 추론, 긴 대화를 듣기에서 자주 묻는 정보 단위로 나눠 반복합니다.",
      starterAction: "듣기 음원을 틀기 전 보기에서 숫자, 장소, 관계 단서만 먼저 눈으로 확인하세요.",
      note: "듣기는 대화의 맥락을 파악하는 파트이므로, 정답만 맞히기보다 누가 누구에게 왜 말하는지까지 함께 파악하는 것이 좋습니다.",
      units: [
        {
          id: "english-listening-purpose-relation",
          title: "목적·관계",
          objective: "대화의 목적과 화자 관계를 먼저 듣습니다.",
          concepts: [
            {
              id: "english-listening-purpose-relation",
              title: "듣기 목적·관계 파악",
              summary: "듣기의 첫 단계는 모든 말을 다 적는 것이 아니라, 왜 말하는지와 어떤 관계인지부터 듣는 것입니다.",
              prerequisites: [prereq("어휘 청크(자주 같이 쓰는 덩어리)", "english-vocab-chunks")],
              corePoints: [
                "대화 목적은 요청, 안내, 제안, 사과처럼 기능 단어로 정리할 수 있습니다.",
                "화자 관계는 호칭, 장소, 해야 할 일 단서에서 자주 드러납니다.",
                "처음부터 완벽히 안 들려도 핵심 기능 단어를 잡으면 정답률이 크게 오릅니다.",
              ],
              recommendedRoutine: [
                "10분: 보기에서 목적 후보 단어 먼저 읽기",
                "15분: 짧은 대화 3개를 듣고 목적 한 단어 적기",
                "10분: 관계 단서를 들은 표현과 함께 다시 말하기",
              ],
              passCriteria: [
                "목적 문제를 기능 단어 기준으로 푼다.",
                "관계 단서를 2개 이상 근거로 설명합니다.",
              ],
              selfCheckQuestion: mc(
                "english-listening-purpose-relation-q1",
                "듣기에서 가장 먼저 잡으면 좋은 것은 무엇인가요?",
                [
                  { value: "purpose", label: "말하는 목적" },
                  { value: "spelling", label: "철자 전체" },
                  { value: "grammar", label: "문장 성분만" },
                ],
                "purpose",
                "정답입니다. 목적을 먼저 잡아 대화의 방향을 정확히 세웠습니다. 다음 단계로 화자 관계 단서도 한 개 더 찾아 보세요.",
              ),
              resources: ENGLISH_LISTENING_RESOURCES,
            },
          ],
        },
        {
          id: "english-listening-number-detail",
          title: "숫자·세부",
          objective: "시간, 날짜, 가격, 위치 같은 세부 정보를 정확히 듣습니다.",
          concepts: [
            {
              id: "english-listening-number-detail",
              title: "듣기 숫자·세부 정보 잡기",
              summary: "숫자와 세부 정보는 듣는 순간 지나가므로, 보기에서 무엇을 기다릴지 먼저 정해야 놓칠 확률이 낮아집니다.",
              prerequisites: [prereq("듣기 목적·관계 파악", "english-listening-purpose-relation")],
              corePoints: [
                "숫자는 시간, 날짜, 가격, 인원처럼 묻는 축을 먼저 확인해야 합니다.",
                "세부 정보는 장소, 물건, 행동처럼 보기 핵심어를 미리 눈에 익히는 것이 중요합니다.",
                "틀렸을 때는 안 들린 것이 아니라 무엇을 기다려야 하는지 몰랐는지 점검해야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 보기에서 숫자 단위와 핵심 명사만 표시하기",
                "15분: 짧은 듣기 3개에서 숫자만 적어 보기",
                "10분: 세부 정보를 한국어 한 단어로 즉시 옮겨 쓰기",
              ],
              passCriteria: [
                "숫자 단위를 혼동하지 않습니다.",
                "세부 정보 문제를 보기 핵심어 기준으로 풉니다.",
              ],
              selfCheckQuestion: mc(
                "english-listening-number-detail-q1",
                "듣기 숫자 문제를 풀기 전에 가장 먼저 확인할 것은 무엇인가요?",
                [
                  { value: "unit", label: "무슨 단위인지(시간/가격 등)" },
                  { value: "mood", label: "화자의 기분만" },
                  { value: "order", label: "단어 철자 순서" },
                ],
                "unit",
                "정답입니다. 단위를 먼저 잡으면 숫자를 훨씬 덜 놓칩니다. 다음 단계로 보기에서 시간인지 가격인지 표시해 보세요.",
              ),
              resources: ENGLISH_LISTENING_RESOURCES,
            },
          ],
        },
        {
          id: "english-listening-inference",
          title: "추론",
          objective: "직접 말하지 않은 뜻을 단서로 짐작합니다.",
          concepts: [
            {
              id: "english-listening-inference",
              title: "듣기 추론(직접 안 한 말 짐작)",
              summary: "추론 문제는 모든 문장을 해석하려는 대신, 태도 변화나 반복된 이유를 찾는 것이 핵심입니다.",
              prerequisites: [prereq("듣기 숫자·세부 정보 잡기", "english-listening-number-detail")],
              corePoints: [
                "추론은 직접 말한 정보와 말투 단서를 합쳐 판단합니다.",
                "but, actually, I wish 같은 전환 표현이 의도 변화를 알려 줍니다.",
                "보기에 없는 표현으로 과하게 뛰어넘지 말고, 들은 근거 안에서만 판단해야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 대화에서 전환 표현만 골라 듣기",
                "15분: 들은 근거 2개로 화자 의도 추론하기",
                "10분: 추론 답과 직접 들은 문장을 연결해 말하기",
              ],
              passCriteria: [
                "근거 없는 추측을 줄입니다.",
                "추론 답의 근거를 영어 표현 1개 이상으로 설명합니다.",
              ],
              selfCheckQuestion: mc(
                "english-listening-inference-q1",
                "듣기 추론 문제에서 가장 중요하게 볼 것은 무엇인가요?",
                [
                  { value: "clue", label: "전환 표현과 반복된 단서" },
                  { value: "font", label: "글씨체" },
                  { value: "silence", label: "침묵 시간만" },
                ],
                "clue",
                "정답입니다. 단서를 잡았기 때문에 추론이 근거 위에 섭니다. 다음 단계로 but, actually 같은 신호를 들으면 바로 표시해 보세요.",
              ),
              resources: ENGLISH_LISTENING_RESOURCES,
            },
          ],
        },
        {
          id: "english-listening-long-dialogue",
          title: "긴 대화",
          objective: "긴 듣기에서 핵심 흐름을 유지합니다.",
          concepts: [
            {
              id: "english-listening-long-dialogue",
              title: "긴 대화 듣기(흐름 유지)",
              summary: "긴 대화는 모든 문장을 붙잡지 말고, 주제와 장면 변화만 따라가야 끝까지 버틸 수 있습니다.",
              prerequisites: [prereq("듣기 추론(직접 안 한 말 짐작)", "english-listening-inference")],
              corePoints: [
                "긴 대화는 장면 변화와 할 일 순서를 잡으면 핵심을 유지하기 쉽습니다.",
                "메모는 문장 전체보다 키워드 3~4개만 남기는 편이 안전합니다.",
                "중간에 놓쳐도 마지막에 다시 주제와 목적을 연결하면 회복할 수 있습니다.",
              ],
              recommendedRoutine: [
                "10분: 긴 대화 듣기 전 보기 순서만 확인하기",
                "20분: 키워드 3개씩만 메모하며 듣기",
                "10분: 듣기 후 흐름을 한국어 한 줄로 복원하기",
              ],
              passCriteria: [
                "메모 과다로 다음 문장을 놓치지 않습니다.",
                "긴 대화 주제와 순서를 한 줄로 설명할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-listening-long-dialogue-q1",
                "긴 대화를 들을 때 가장 좋은 메모 방식은 무엇인가요?",
                [
                  { value: "keyword", label: "키워드 몇 개만 적기" },
                  { value: "every", label: "모든 문장 받아쓰기" },
                  { value: "none", label: "아무것도 안 적기" },
                ],
                "keyword",
                "정답입니다. 키워드 메모는 흐름을 살리고 부담을 줄여 줍니다. 다음 단계로 주제와 장면 전환 키워드를 나눠 적어 보세요.",
              ),
              resources: ENGLISH_LISTENING_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "english-grammar",
      title: "문장 문법",
      objective: "품사, SVO, 시제·태, 준동사, 절·관계사를 작은 해석 규칙으로 연결합니다.",
      starterAction: "문장을 보면 뜻 해석 전에 동사부터 하나 찾고, 그 앞뒤에 누가/무엇을 적으세요.",
      units: [
        {
          id: "english-parts-of-speech",
          title: "품사",
          objective: "단어 역할을 문장 속 자리로 익힙니다.",
          concepts: [
            {
              id: "english-parts-of-speech",
              title: "품사(단어 역할) 기본",
              summary: "영어 품사는 이름보다 자리와 역할로 익혀야 독해와 문법 모두에 바로 연결됩니다.",
              prerequisites: [prereq("긴 대화 듣기(흐름 유지)", "english-listening-long-dialogue")],
              corePoints: [
                "명사, 동사, 형용사, 부사를 문장 자리와 함께 익힙니다.",
                "품사는 해석보다 먼저 구조를 세워 주는 뼈대 역할을 합니다.",
                "같은 단어도 자리와 기능에 따라 다르게 보일 수 있으니 문장 전체를 봐야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 문장 5개에서 동사와 명사만 먼저 표시하기",
                "15분: 형용사와 부사가 무엇을 꾸미는지 화살표로 적기",
                "10분: 헷갈린 단어 2개를 자리 기준으로 비교하기",
              ],
              passCriteria: [
                "기본 품사를 문장 속에서 설명합니다.",
                "꾸미는 말과 핵심 말을 구분합니다.",
              ],
              selfCheckQuestion: mc(
                "english-parts-of-speech-q1",
                "문장 'The student runs fast.'에서 'fast'의 역할로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "adverb", label: "부사(어떻게 뛰는지)" },
                  { value: "noun", label: "명사" },
                  { value: "verb", label: "동사" },
                ],
                "adverb",
                "정답입니다. 'fast'가 동작 방식을 꾸미는 부사 역할을 정확히 봤습니다. 다음 단계로 형용사 예문도 하나 찾아 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "english-svo",
          title: "SVO",
          objective: "주어-동사-목적어 뼈대를 빠르게 읽습니다.",
          concepts: [
            {
              id: "english-svo",
              title: "SVO(누가-무엇을-한다) 뼈대",
              summary: "문장을 길게 보지 말고 주어(S), 동사(V), 목적어(O)부터 잡으면 해석 속도가 크게 올라갑니다.",
              prerequisites: [prereq("품사(단어 역할) 기본", "english-parts-of-speech")],
              corePoints: [
                "영어 문장은 동사를 중심으로 뼈대가 서는 경우가 많습니다.",
                "주어와 동사를 먼저 잡고, 뒤에 목적어나 보어가 붙는지 확인합니다.",
                "수식어를 잠시 걷어 내고 뼈대만 읽는 습관이 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 문장 5개에서 동사 밑줄 긋기",
                "15분: S-V-O만 남기고 나머지 수식어 지우기",
                "10분: 뼈대만으로 한국어 한 줄 해석 만들기",
              ],
              passCriteria: [
                "긴 문장에서도 동사를 먼저 찾습니다.",
                "SVO 뼈대 해석을 빠르게 말할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-svo-q1",
                "SVO를 잡을 때 가장 먼저 찾는 것은 무엇인가요?",
                [
                  { value: "verb", label: "동사" },
                  { value: "article", label: "관사" },
                  { value: "comma", label: "쉼표" },
                ],
                "verb",
                "정답입니다. 동사를 먼저 찾으면 문장 뼈대가 바로 서기 시작합니다. 다음 단계로 동사 앞 주어와 뒤 목적어를 이어 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "english-tense-voice",
          title: "시제·태",
          objective: "시간과 동작 방향을 읽습니다.",
          concepts: [
            {
              id: "english-tense-voice",
              title: "시제·수동태(시간과 받는 동작)",
              summary: "시제는 언제의 일인지, 태는 누가 행동을 하거나 받는지 보여 주는 장치입니다.",
              prerequisites: [prereq("SVO(누가-무엇을-한다) 뼈대", "english-svo")],
              corePoints: [
                "시제는 시간 기준을, 태는 행동 주체 방향을 보여 줍니다.",
                "수동태는 'be + p.p.' 형태를 보고 바로 인식하는 연습이 필요합니다.",
                "문법 문제에서도 해석과 상황을 함께 봐야 시제 선택이 쉬워집니다.",
              ],
              recommendedRoutine: [
                "10분: 문장 5개에서 시간 단서와 동사 형태 같이 보기",
                "15분: 능동/수동 문장 짝지어 읽기",
                "10분: 왜 그 시제인지 상황 한 줄 쓰기",
              ],
              passCriteria: [
                "기본 시제와 수동태를 구분합니다.",
                "시간 단서와 동사 형태를 함께 설명합니다.",
              ],
              selfCheckQuestion: mc(
                "english-tense-voice-q1",
                "문장 'The window was broken.'의 핵심 특징으로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "passive", label: "수동태" },
                  { value: "future", label: "미래 시제" },
                  { value: "command", label: "명령문" },
                ],
                "passive",
                "정답입니다. be + p.p. 형태를 정확히 봤습니다. 다음 단계로 누가 행동을 한 쪽인지 따로 생각해 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "english-nonfinite",
          title: "준동사",
          objective: "동사에서 바뀐 말꼴을 문장 속 역할로 읽습니다.",
          concepts: [
            {
              id: "english-nonfinite",
              title: "준동사(동사에서 바뀐 말꼴)",
              summary: "to부정사, 동명사, 분사는 이름보다 '문장에서 무엇 역할을 하는가'로 묶어 보면 훨씬 덜 어렵습니다.",
              prerequisites: [prereq("시제·수동태(시간과 받는 동작)", "english-tense-voice")],
              corePoints: [
                "준동사는 동사 모양이지만 명사, 형용사, 부사 역할을 합니다.",
                "to부정사와 동명사는 자주 자리에 따라 기능이 갈립니다.",
                "분사는 앞이나 뒤에서 명사를 꾸미는 경우가 많습니다.",
              ],
              recommendedRoutine: [
                "10분: to부정사, 동명사, 분사를 색깔별로 표시하기",
                "15분: 각 형태가 문장에서 무슨 역할인지 적기",
                "10분: 헷갈리는 두 문장을 비교하며 해석하기",
              ],
              passCriteria: [
                "준동사 형태를 보고 역할을 말합니다.",
                "to부정사/동명사/분사를 기본 예문에서 구분합니다.",
              ],
              selfCheckQuestion: mc(
                "english-nonfinite-q1",
                "문장 'To read books is fun.'에서 'To read books'의 역할은 무엇인가요?",
                [
                  { value: "noun", label: "명사 역할" },
                  { value: "adverb", label: "부사 역할" },
                  { value: "article", label: "관사 역할" },
                ],
                "noun",
                "정답입니다. 문장 주어 자리에 있으므로 명사 역할을 합니다. 다음 단계로 같은 형태가 부사로 쓰인 예도 찾아 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "english-clauses",
          title: "절·관계사",
          objective: "주어+동사가 들어 있는 묶음과 연결 장치를 읽습니다.",
          concepts: [
            {
              id: "english-clauses",
              title: "절과 관계사(앞말 꾸며 주는 연결어)",
              summary: "긴 문장이 어려운 핵심 이유는 절 경계가 안 보이기 때문입니다. 관계사는 앞말을 꾸미는 묶음 시작 신호로 보면 됩니다.",
              prerequisites: [prereq("준동사(동사에서 바뀐 말꼴)", "english-nonfinite")],
              corePoints: [
                "절은 주어와 동사가 함께 있는 작은 문장 묶음입니다.",
                "관계사는 앞 명사를 꾸미는 절을 이끄는 연결어입니다.",
                "길고 어려운 문장도 절 경계선을 긋고 나면 해석이 쉬워집니다.",
              ],
              recommendedRoutine: [
                "10분: 긴 문장 3개에서 주어·동사 쌍 찾기",
                "15분: 관계사절 앞뒤에 대괄호 치기",
                "10분: 꾸밈 받는 명사를 화살표로 연결하기",
              ],
              passCriteria: [
                "절 경계를 표시할 수 있습니다.",
                "관계사절이 꾸미는 명사를 정확히 찾습니다.",
              ],
              selfCheckQuestion: mc(
                "english-clauses-q1",
                "문장 'The book that I bought is new.'에서 'that I bought'는 무엇인가요?",
                [
                  { value: "relative", label: "관계사절" },
                  { value: "main", label: "주절 전체" },
                  { value: "question", label: "의문문" },
                ],
                "relative",
                "정답입니다. 'book'을 꾸며 주는 관계사절을 정확히 찾았습니다. 다음 단계로 어떤 명사를 꾸미는지도 화살표로 표시해 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "english-syntax-reading",
      title: "구문 독해",
      objective: "긴 문장을 덩어리와 연결사 중심으로 끊어 읽습니다.",
      starterAction: "긴 문장을 보면 슬래시(/)를 치고, 동사와 접속사만 먼저 동그라미 치세요.",
      units: [
        {
          id: "english-chunking",
          title: "끊어 읽기",
          objective: "수식 덩어리와 핵심 덩어리를 분리합니다.",
          concepts: [
            {
              id: "english-chunking",
              title: "문장 덩어리(청크) 끊기",
              summary: "구문 독해는 단어 뜻을 다 아는지보다, 어디까지가 한 묶음인지 보이는지가 핵심입니다.",
              prerequisites: [prereq("절과 관계사(앞말 꾸며 주는 연결어)", "english-clauses")],
              corePoints: [
                "전치사구, 관계사절, 분사구문처럼 긴 수식 덩어리를 분리합니다.",
                "핵심 뼈대와 수식 덩어리를 나누면 해석이 훨씬 짧아집니다.",
                "슬래시 리딩은 번역 기술이 아니라 구조를 보이게 하는 훈련입니다.",
              ],
              recommendedRoutine: [
                "10분: 긴 문장 3개에 슬래시 치기",
                "15분: 핵심 뼈대만 따로 적고 수식 덩어리 이름 붙이기",
                "10분: 슬래시 단위로 끊어 읽으며 해석하기",
              ],
              passCriteria: [
                "슬래시 위치를 근거 있게 설명합니다.",
                "핵심 뼈대와 수식 덩어리를 섞지 않습니다.",
              ],
              selfCheckQuestion: mc(
                "english-chunking-q1",
                "구문 독해에서 슬래시(/)를 치는 가장 큰 이유는 무엇인가요?",
                [
                  { value: "chunk", label: "문장 덩어리 경계를 보이기 위해" },
                  { value: "speed", label: "무조건 빨리 읽기 위해" },
                  { value: "decoration", label: "보기 좋게 꾸미기 위해" },
                ],
                "chunk",
                "정답입니다. 덩어리 경계가 보여야 긴 문장도 버틸 수 있습니다. 다음 단계로 핵심 뼈대와 수식 부분을 따로 읽어 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
        {
          id: "english-connectors",
          title: "연결사·지시어",
          objective: "문장 사이 논리 흐름을 읽습니다.",
          concepts: [
            {
              id: "english-connectors",
              title: "연결사와 지시어로 흐름 잡기",
              summary: "독해가 자꾸 끊긴다면 단어보다 however, therefore, this 같은 흐름 신호를 먼저 봐야 합니다.",
              prerequisites: [prereq("문장 덩어리(청크) 끊기", "english-chunking")],
              corePoints: [
                "however, therefore, for example은 논리 방향을 직접 알려 줍니다.",
                "this, such, these 같은 지시어는 바로 앞 내용과 연결됩니다.",
                "흐름 신호를 표시하면 빈칸·순서 문제에서도 근거 찾기가 쉬워집니다.",
              ],
              recommendedRoutine: [
                "10분: 짧은 지문에서 연결사와 지시어만 표시하기",
                "15분: 각 신호에 반전/결론/예시 같은 기능 메모 붙이기",
                "10분: 연결사만 보고 지문 흐름 한 줄 요약하기",
              ],
              passCriteria: [
                "논리 방향 신호를 놓치지 않습니다.",
                "지시어가 가리키는 내용을 문맥에서 찾습니다.",
              ],
              selfCheckQuestion: mc(
                "english-connectors-q1",
                "영어 지문에서 'however'를 보면 가장 먼저 떠올려야 할 것은 무엇인가요?",
                [
                  { value: "contrast", label: "앞내용과 반전 또는 대비" },
                  { value: "example", label: "예시 추가" },
                  { value: "ending", label: "문장 끝" },
                ],
                "contrast",
                "정답입니다. 반전 신호를 정확히 잡았습니다. 다음 단계로 therefore, for example도 같은 방식으로 기능을 적어 보세요.",
              ),
              resources: ENGLISH_BASE_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "english-reading-types",
      title: "독해 유형",
      objective: "주제·요지, 빈칸, 순서·삽입, 어휘·문법, 장문 유형을 각각 다른 읽기 규칙으로 풉니다.",
      starterAction: "문항을 보기 전에 이 문제가 '큰 뜻 / 연결 / 문법' 중 무엇을 묻는지 먼저 분류하세요.",
      units: [
        {
          id: "english-main-idea",
          title: "주제·요지",
          objective: "지문이 가장 하고 싶은 말을 잡습니다.",
          concepts: [
            {
              id: "english-main-idea",
              title: "주제·요지 찾기",
              summary: "주제 문제는 모든 문장을 번역하는 문제가 아니라, 반복되는 핵심어와 결론 문장을 잡는 문제입니다.",
              prerequisites: [prereq("연결사와 지시어로 흐름 잡기", "english-connectors")],
              corePoints: [
                "주제는 지문 전체를 한 문장으로 묶는 가장 큰 생각입니다.",
                "반복되는 핵심어와 결론 문장이 주제를 강하게 드러냅니다.",
                "너무 좁은 보기와 너무 넓은 보기를 함께 거르는 습관이 중요합니다.",
              ],
              recommendedRoutine: [
                "10분: 첫 문장과 끝 문장만 먼저 읽기",
                "15분: 반복 단어 3개 표시하기",
                "10분: 너무 좁은 보기와 너무 넓은 보기 지우기",
              ],
              passCriteria: [
                "반복 핵심어를 근거로 주제를 고릅니다.",
                "과도하게 좁거나 넓은 선지를 구분합니다.",
              ],
              selfCheckQuestion: mc(
                "english-main-idea-q1",
                "주제·요지 문제에서 가장 먼저 확인하면 좋은 것은 무엇인가요?",
                [
                  { value: "repeated", label: "반복 핵심어와 결론 문장" },
                  { value: "numbers", label: "숫자만" },
                  { value: "comma", label: "쉼표 개수" },
                ],
                "repeated",
                "정답입니다. 큰 뜻을 잡는 기준을 정확히 세웠습니다. 다음 단계로 너무 좁은 보기 하나를 직접 지워 보세요.",
              ),
              resources: ENGLISH_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "english-gap",
          title: "빈칸",
          objective: "앞뒤 논리와 핵심어를 연결합니다.",
          concepts: [
            {
              id: "english-gap",
              title: "빈칸 추론(앞뒤 논리 연결)",
              summary: "빈칸 문제는 빈칸 자체를 맞히는 것이 아니라, 빈칸 앞뒤 문장이 어떤 관계인지 읽는 문제입니다.",
              prerequisites: [prereq("주제·요지 찾기", "english-main-idea")],
              corePoints: [
                "빈칸 앞뒤의 논리 관계를 먼저 파악해야 합니다.",
                "지시어, 연결사, 반복 단어가 빈칸 힌트가 됩니다.",
                "선지는 단어 뜻보다 문맥 방향에 맞는지 먼저 검사해야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 빈칸 앞뒤 문장만 먼저 읽기",
                "15분: 반전/결론/예시 방향 표시하기",
                "10분: 선지를 문맥 방향 기준으로 먼저 두 개 지우기",
              ],
              passCriteria: [
                "빈칸 앞뒤 논리 방향을 설명합니다.",
                "선지를 문맥 기준으로 거를 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-gap-q1",
                "빈칸 문제에서 가장 먼저 해야 할 일은 무엇인가요?",
                [
                  { value: "logic", label: "앞뒤 논리 관계 확인" },
                  { value: "memorize", label: "선지 암기" },
                  { value: "translate", label: "지문 전체 완역" },
                ],
                "logic",
                "정답입니다. 빈칸 앞뒤 논리를 먼저 본 판단이 정확합니다. 다음 단계로 반전인지 결론인지 한 단어 메모를 붙여 보세요.",
              ),
              resources: ENGLISH_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "english-order-insertion",
          title: "순서·삽입",
          objective: "문장 흐름과 연결 신호를 기준으로 위치를 정합니다.",
          concepts: [
            {
              id: "english-order-insertion",
              title: "순서·삽입 문제 풀이",
              summary: "순서·삽입은 해석 양보다 연결 고리 찾기 싸움입니다. 대명사, 연결사, 반복어가 가장 강한 단서입니다.",
              prerequisites: [prereq("빈칸 추론(앞뒤 논리 연결)", "english-gap")],
              corePoints: [
                "대명사와 지시어는 앞에 있어야 할 정보를 알려 줍니다.",
                "연결사는 문장 사이 논리 방향을 제한합니다.",
                "반복어와 주제어는 이어질 자리를 자연스럽게 좁혀 줍니다.",
              ],
              recommendedRoutine: [
                "10분: 삽입 문장과 주변 문장에서 지시어 찾기",
                "15분: 연결사와 반복어 기준으로 후보 자리 2곳 남기기",
                "10분: 실제로 끼워 넣고 어색한 자리 지우기",
              ],
              passCriteria: [
                "지시어와 연결사를 근거로 위치를 정합니다.",
                "근거 없는 감으로 끼워 넣지 않습니다.",
              ],
              selfCheckQuestion: mc(
                "english-order-insertion-q1",
                "순서·삽입 문제의 강한 단서로 가장 알맞은 것은 무엇인가요?",
                [
                  { value: "reference", label: "대명사·연결사·반복어" },
                  { value: "length", label: "문장 길이만" },
                  { value: "sound", label: "읽는 소리만" },
                ],
                "reference",
                "정답입니다. 연결 고리 단서를 정확히 잡았습니다. 다음 단계로 지시어가 가리키는 앞내용을 표시해 보세요.",
              ),
              resources: ENGLISH_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "english-vocab-grammar",
          title: "어휘·문법",
          objective: "문맥과 문장 구조로 어휘·문법 선택지를 판단합니다.",
          concepts: [
            {
              id: "english-vocab-grammar",
              title: "어휘·문법 선택지 판단",
              summary: "어휘·문법 문제는 외운 규칙 확인이 아니라, 문맥과 구조에 실제로 맞는지를 보는 문제입니다.",
              prerequisites: [prereq("순서·삽입 문제 풀이", "english-order-insertion")],
              corePoints: [
                "어휘는 문맥 방향과 어울리는 의미장을 확인해야 합니다.",
                "문법은 동사 형태, 수 일치, 수식 관계를 함께 봐야 합니다.",
                "선택지는 하나만 맞는 것이 아니라 나머지가 왜 틀렸는지도 봐야 실력이 늡니다.",
              ],
              recommendedRoutine: [
                "10분: 선택지에서 문법 포인트 먼저 표시하기",
                "15분: 문맥 방향과 어울리지 않는 어휘 지우기",
                "10분: 오답 선택지가 왜 틀렸는지 한 줄씩 적기",
              ],
              passCriteria: [
                "문맥과 구조를 함께 근거로 사용합니다.",
                "오답 이유를 구체적으로 말할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-vocab-grammar-q1",
                "어휘·문법 문제를 풀 때 가장 중요한 기준으로 알맞은 것은 무엇인가요?",
                [
                  { value: "context", label: "문맥과 구조가 모두 맞는지" },
                  { value: "memory", label: "단어 철자 길이" },
                  { value: "speed", label: "제일 빨리 찍는 것" },
                ],
                "context",
                "정답입니다. 문맥과 구조를 함께 본 접근이 정확합니다. 다음 단계로 틀린 선택지가 왜 안 되는지도 적어 보세요.",
              ),
              resources: ENGLISH_EBS_RESOURCES,
            },
          ],
        },
        {
          id: "english-long-passage",
          title: "장문",
          objective: "긴 글에서도 중심 흐름을 잃지 않습니다.",
          concepts: [
            {
              id: "english-long-passage",
              title: "장문 독해(큰 흐름 유지)",
              summary: "장문은 한 문장씩 완벽히 읽는 것이 아니라, 문단별 역할을 붙이며 큰 흐름을 지키는 것이 핵심입니다.",
              prerequisites: [prereq("어휘·문법 선택지 판단", "english-vocab-grammar")],
              corePoints: [
                "문단마다 역할(문제 제기, 예시, 반박, 결론)을 붙이면 길이가 줄어듭니다.",
                "모르는 문장이 있어도 문단 역할과 연결사로 큰 흐름을 유지할 수 있습니다.",
                "장문은 멈춤보다 진행이 중요하므로, 막히는 부분은 표시 후 앞으로 나아가야 합니다.",
              ],
              recommendedRoutine: [
                "10분: 각 문단 역할을 한 단어로 적기",
                "20분: 문단 간 연결사를 표시하며 흐름 정리하기",
                "10분: 전체 글을 세 문장 요약으로 줄이기",
              ],
              passCriteria: [
                "문단별 역할을 설명합니다.",
                "장문에서 막혀도 흐름을 유지하며 끝까지 읽습니다.",
              ],
              selfCheckQuestion: mc(
                "english-long-passage-q1",
                "장문 독해에서 가장 먼저 하면 좋은 것은 무엇인가요?",
                [
                  { value: "paragraph", label: "문단 역할을 붙이며 읽기" },
                  { value: "dictionary", label: "모르는 단어마다 멈추기" },
                  { value: "erase", label: "앞문단 잊기" },
                ],
                "paragraph",
                "정답입니다. 문단 역할을 붙이면 긴 글도 훨씬 가벼워집니다. 다음 단계로 각 문단에 한 단어 제목을 붙여 보세요.",
              ),
              resources: ENGLISH_EBS_RESOURCES,
            },
          ],
        },
      ],
    },
    {
      id: "english-ebs-practice",
      title: "EBS/실전",
      objective: "EBS 강좌와 연계 교재를 실제 듣기·독해 루틴에 연결하고, 수능형 문제 감각으로 마무리합니다.",
      starterAction: "오늘 약한 파트 하나만 정해서 EBS 강좌 1개와 문제 3개를 연결하세요.",
      note: "EBS는 많은 강좌를 보는 것보다 약한 파트를 정해 반복하는 편이 훨씬 효율적입니다.",
      units: [
        {
          id: "english-ebs-linkage",
          title: "EBS 연계",
          objective: "공식 강좌를 취약 파트 복습 도구로 씁니다.",
          concepts: [
            {
              id: "english-ebs-linkage",
              title: "영어 EBS 연계 활용",
              summary: "듣기와 독해 모두 EBS를 '아는 지문 확인'이 아니라 '같은 절차 반복' 도구로 써야 실전력이 올라갑니다.",
              prerequisites: [prereq("장문 독해(큰 흐름 유지)", "english-long-passage")],
              corePoints: [
                "듣기 취약자는 듣기 페이지와 Listening 실력 강좌를 먼저 반복하는 것이 좋습니다.",
                "독해 취약자는 유형 하나씩 골라 같은 풀이 절차를 되풀이해야 합니다.",
                "강좌를 본 뒤 반드시 본인 언어로 핵심 절차를 다시 말해야 남습니다.",
              ],
              recommendedRoutine: [
                "10분: 오늘 약한 파트 하나 정하고 EBS 강좌 고르기",
                "20분: 강좌 또는 연계 지문 1개를 보고 핵심 절차 메모하기",
                "10분: 같은 절차로 문제 2~3개 바로 적용하기",
              ],
              passCriteria: [
                "취약 파트 기준으로 강좌를 선택합니다.",
                "강좌 내용을 자기 절차로 다시 설명할 수 있습니다.",
              ],
              selfCheckQuestion: mc(
                "english-ebs-linkage-q1",
                "영어 EBS 연계 학습에서 가장 중요한 방향은 무엇인가요?",
                [
                  { value: "repeat", label: "같은 풀이 절차 반복하기" },
                  { value: "title", label: "강좌 제목만 외우기" },
                  { value: "skip", label: "문제는 안 풀기" },
                ],
                "repeat",
                "정답입니다. 절차 반복 중심으로 방향을 정확히 잡았습니다. 다음 단계로 오늘 취약 파트 한 개를 바로 선택해 보세요.",
              ),
              resources: [EBSI_ENGLISH_LISTENING, EBSI_ENGLISH_LISTENING_BOOK, ...ENGLISH_EBS_RESOURCES],
            },
          ],
        },
        {
          id: "english-practical",
          title: "실전 적용",
          objective: "시간 안에 듣기와 독해를 묶어 적용합니다.",
          concepts: [
            {
              id: "english-practical",
              title: "영어 실전 적용 루틴",
              summary: "실전 영어는 새 지식을 넣는 시간이 아니라, 이미 만든 절차를 시간 안에 그대로 실행하는 시간입니다.",
              prerequisites: [prereq("영어 EBS 연계 활용", "english-ebs-linkage")],
              corePoints: [
                "듣기는 목적/세부/추론 기준으로, 독해는 유형 기준으로 먼저 분류합니다.",
                "막히는 한 문항에 오래 머무르지 않고 회수 가능한 문항부터 정리해야 합니다.",
                "오답은 단어 부족, 구조 실패, 시간 배분 중 어디서 무너졌는지 기록해야 다음 훈련이 선명해집니다.",
              ],
              recommendedRoutine: [
                "10분: 듣기 2문항, 독해 2문항을 유형별로 먼저 분류하기",
                "20분: 제한 시간 안에 풀고 멈춘 지점 표시하기",
                "10분: 오답 원인을 단어/구조/시간으로 나눠 기록하기",
              ],
              passCriteria: [
                "문항 유형에 맞는 절차를 바로 꺼냅니다.",
                "오답 원인을 구체적으로 분류합니다.",
              ],
              selfCheckQuestion: mc(
                "english-practical-q1",
                "영어 실전 훈련 직후 가장 먼저 해야 할 일은 무엇인가요?",
                [
                  { value: "analyze", label: "오답 원인을 단어·구조·시간으로 분류" },
                  { value: "forget", label: "바로 잊고 다음 세트 풀기" },
                  { value: "copy", label: "정답만 베껴 쓰기" },
                ],
                "analyze",
                "정답입니다. 오답 원인을 구분해야 다음 훈련이 정확해집니다. 다음 단계로 오늘 틀린 문항 하나를 어디서 무너졌는지 적어 보세요.",
              ),
              resources: ENGLISH_EBS_RESOURCES,
            },
          ],
        },
      ],
    },
  ],
};

export const LANGUAGE_KNOWLEDGE_CURRICULA: Record<LanguageSubject, LanguageCurriculum> = {
  korean: KOREAN_CURRICULUM,
  english: ENGLISH_CURRICULUM,
};
