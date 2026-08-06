import type { Rng } from "../rng.ts";
import type { Level, QuestionBody, QuestionGenerator } from "../types.ts";
import { formatFactor, formatFraction, formatQuadratic, reduceFraction } from "../math-format.ts";
import { buildChoices, type DistractorCandidate } from "./choice-builder.ts";

type LevelRange = {
  coefficientMax: number;
  solutionMax: number;
  constantMax: number;
  allowNegative: boolean;
};

const LEVEL_RANGE: Record<Level, LevelRange> = {
  1: { coefficientMax: 5, solutionMax: 6, constantMax: 9, allowNegative: false },
  2: { coefficientMax: 8, solutionMax: 9, constantMax: 14, allowNegative: true },
  3: { coefficientMax: 12, solutionMax: 12, constantMax: 20, allowNegative: true },
};

function integerCandidates(
  values: ReadonlyArray<{ value: number; mistakeTag: string }>,
  exclude: number,
): DistractorCandidate[] {
  return values
    .filter((item) => Number.isInteger(item.value) && item.value !== exclude)
    .map((item) => ({ value: String(item.value), mistakeTag: item.mistakeTag }));
}

const generateLinearEquation: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const range = LEVEL_RANGE[level];
  const coefficient = rng.int(2, range.coefficientMax);
  const solution = range.allowNegative
    ? rng.nonZeroInt(-range.solutionMax, range.solutionMax)
    : rng.int(1, range.solutionMax);
  const constant = rng.nonZeroInt(-range.constantMax, range.constantMax);
  const rightSide = coefficient * solution + constant;

  const prompt = `${coefficient}x ${constant < 0 ? "-" : "+"} ${Math.abs(constant)} = ${rightSide} 일 때, x의 값은?`;

  const candidates = integerCandidates(
    [
      { value: (rightSide + constant) / coefficient, mistakeTag: "sign-transpose" },
      { value: rightSide - constant, mistakeTag: "no-divide" },
      { value: -solution, mistakeTag: "sign-flip" },
      { value: solution + 1, mistakeTag: "off-by-one" },
      { value: solution - 1, mistakeTag: "off-by-one" },
    ],
    solution,
  );

  return {
    prompt,
    inputLabel: "x의 값",
    choices: buildChoices(rng, String(solution), candidates),
    acceptableAnswers: [String(solution)],
    steps: [
      `양변에서 ${constant < 0 ? `${Math.abs(constant)}를 더하면` : `${constant}를 빼면`} ${coefficient}x = ${coefficient * solution}`,
      `양변을 ${coefficient}로 나누면 x = ${solution}`,
      `검산: ${coefficient} × ${solution} ${constant < 0 ? "-" : "+"} ${Math.abs(constant)} = ${rightSide}`,
    ],
    hints: [
      "일차방정식이야. x가 있는 항만 왼쪽에 남기면 돼.",
      `상수항 ${constant}를 반대쪽으로 넘겨. 넘어갈 때 부호가 바뀌어.`,
      `${coefficient}x = ${coefficient * solution} 까지 왔으면 양변을 ${coefficient}로 나누면 끝이야.`,
    ],
  };
};

function formatBinomial(coefficient: number, constant: number): string {
  const head = coefficient === 1 ? "x" : coefficient === -1 ? "-x" : `${coefficient}x`;
  return `(${head} ${constant < 0 ? "-" : "+"} ${Math.abs(constant)})`;
}

const generatePolynomialExpansion: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const range = LEVEL_RANGE[level];
  const leadA = level === 1 ? 1 : rng.int(1, 3);
  const leadC = level === 3 ? rng.int(1, 3) : 1;
  const constantB = rng.nonZeroInt(-Math.min(range.constantMax, 9), Math.min(range.constantMax, 9));
  const constantD = rng.nonZeroInt(-Math.min(range.constantMax, 9), Math.min(range.constantMax, 9));

  const squareTerm = leadA * leadC;
  const middleTerm = leadA * constantD + constantB * leadC;
  const constantTerm = constantB * constantD;

  const answer = formatQuadratic(squareTerm, middleTerm, constantTerm);
  const prompt = `${formatBinomial(leadA, constantB)}${formatBinomial(leadC, constantD)} 를 전개하면?`;

  const candidates: DistractorCandidate[] = [
    { value: formatQuadratic(squareTerm, 0, constantTerm), mistakeTag: "missing-cross" },
    { value: formatQuadratic(squareTerm, middleTerm, -constantTerm), mistakeTag: "constant-sign" },
    { value: formatQuadratic(squareTerm, -middleTerm, constantTerm), mistakeTag: "middle-sign" },
    { value: formatQuadratic(squareTerm, constantB + constantD, constantTerm), mistakeTag: "cross-add-only" },
  ].filter((candidate) => candidate.value !== answer);

  return {
    prompt,
    inputLabel: "전개한 식",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps: [
      "앞의 각 항을 뒤의 각 항에 모두 곱한다 (분배법칙).",
      `x² 항: ${leadA} × ${leadC} = ${squareTerm}`,
      `x 항: ${leadA} × (${constantD}) + (${constantB}) × ${leadC} = ${middleTerm}`,
      `상수항: (${constantB}) × (${constantD}) = ${constantTerm}`,
      `정리하면 ${answer}`,
    ],
    hints: [
      "곱셈공식이야. 괄호 두 개를 항끼리 모두 곱해.",
      "빠뜨리기 쉬운 건 가운데 x항이야. 바깥끼리, 안쪽끼리 곱한 걸 더해야 해.",
      `x² 항은 ${squareTerm}, 상수항은 ${constantTerm}. 가운데 항만 남았어.`,
    ],
  };
};

function pickFactorRoots(
  rng: Rng,
  bound: number,
  requireDistinct = false,
): [number, number] {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const first = rng.nonZeroInt(-bound, bound);
    const second = rng.nonZeroInt(-bound, bound);
    if (first + second === 0) {
      continue;
    }
    if (requireDistinct && first === second) {
      continue;
    }
    return first <= second ? [first, second] : [second, first];
  }
  return [1, 2];
}

const generateFactoring: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const bound = level === 1 ? 5 : level === 2 ? 8 : 11;
  const [rootA, rootB] = pickFactorRoots(rng, bound);

  const middleTerm = rootA + rootB;
  const constantTerm = rootA * rootB;
  const answer = `${formatFactor(rootA)}${formatFactor(rootB)}`;
  const prompt = `${formatQuadratic(1, middleTerm, constantTerm)} 를 인수분해하면?`;

  const candidates: DistractorCandidate[] = [
    { value: `${formatFactor(-rootA)}${formatFactor(-rootB)}`, mistakeTag: "both-signs" },
    { value: `${formatFactor(rootA)}${formatFactor(-rootB)}`, mistakeTag: "one-sign" },
    { value: `${formatFactor(-rootA)}${formatFactor(rootB)}`, mistakeTag: "one-sign" },
    { value: `${formatFactor(rootA + 1)}${formatFactor(rootB - 1)}`, mistakeTag: "sum-only" },
    { value: `${formatFactor(rootA - 1)}${formatFactor(rootB + 1)}`, mistakeTag: "sum-only" },
  ].filter((candidate) => candidate.value !== answer);

  return {
    prompt,
    inputLabel: "인수분해한 식",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps: [
      `곱해서 ${constantTerm}, 더해서 ${middleTerm}이 되는 두 수를 찾는다.`,
      `그 두 수는 ${rootA} 와 ${rootB} 이다.`,
      `따라서 ${answer}`,
      `검산: 전개하면 ${formatQuadratic(1, middleTerm, constantTerm)}`,
    ],
    hints: [
      "x²+(a+b)x+ab = (x+a)(x+b) 꼴이야.",
      `곱해서 ${constantTerm}이 되는 두 정수 짝을 모두 적어 봐.`,
      `그중 더해서 ${middleTerm}이 되는 짝이 답이야.`,
    ],
  };
};

function formatRoots(rootA: number, rootB: number): string {
  return rootA === rootB ? `x = ${rootA}` : `x = ${rootA} 또는 x = ${rootB}`;
}

const generateQuadraticEquation: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const bound = level === 1 ? 5 : level === 2 ? 8 : 11;
  const [rootA, rootB] = pickFactorRoots(rng, bound, true);

  const middleTerm = -(rootA + rootB);
  const constantTerm = rootA * rootB;
  const answer = formatRoots(rootA, rootB);
  const prompt = `${formatQuadratic(1, middleTerm, constantTerm)} = 0 의 해는?`;

  const candidates: DistractorCandidate[] = [
    { value: formatRoots(-rootA, -rootB), mistakeTag: "root-sign" },
    { value: formatRoots(rootA, -rootB), mistakeTag: "one-root-sign" },
    { value: formatRoots(-rootA, rootB), mistakeTag: "one-root-sign" },
    { value: formatRoots(rootA + 1, rootB), mistakeTag: "factor-pair" },
    { value: formatRoots(rootA, rootB + 1), mistakeTag: "factor-pair" },
  ].filter((candidate) => candidate.value !== answer);

  return {
    prompt,
    inputLabel: "x의 값",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps: [
      `좌변을 인수분해하면 ${formatFactor(-rootA)}${formatFactor(-rootB)} = 0`,
      "AB = 0 이면 A = 0 또는 B = 0 이다.",
      `따라서 ${answer}`,
    ],
    hints: [
      "우변이 0이니까 좌변을 인수분해부터 해 봐.",
      `곱해서 ${constantTerm}, 더해서 ${middleTerm}이 되는 두 수를 찾아.`,
      "인수분해했으면 각 괄호를 0으로 놓으면 돼. 부호가 반대로 나오는 것에 주의해.",
    ],
  };
};

const generateFractionArithmetic: QuestionGenerator = (rng: Rng, level: Level): QuestionBody => {
  const denominatorMax = level === 1 ? 8 : level === 2 ? 11 : 14;
  const operators = level === 1 ? ["+", "-"] : ["+", "-", "×", "÷"];
  const operator = rng.pick(operators);

  const denominatorB = rng.int(2, denominatorMax);
  const denominatorD = rng.int(2, denominatorMax);
  const numeratorA = rng.int(1, denominatorB * 2);
  const numeratorC = rng.int(1, denominatorD * 2);

  let rawNumerator: number;
  let rawDenominator: number;
  if (operator === "+") {
    rawNumerator = numeratorA * denominatorD + numeratorC * denominatorB;
    rawDenominator = denominatorB * denominatorD;
  } else if (operator === "-") {
    rawNumerator = numeratorA * denominatorD - numeratorC * denominatorB;
    rawDenominator = denominatorB * denominatorD;
  } else if (operator === "×") {
    rawNumerator = numeratorA * numeratorC;
    rawDenominator = denominatorB * denominatorD;
  } else {
    rawNumerator = numeratorA * denominatorD;
    rawDenominator = denominatorB * numeratorC;
  }

  const result = reduceFraction(rawNumerator, rawDenominator);
  const answer = formatFraction(result);
  const prompt = `${numeratorA}/${denominatorB} ${operator} ${numeratorC}/${denominatorD} 를 계산하면? (기약분수로)`;

  const naive =
    operator === "+"
      ? formatFraction(reduceFraction(numeratorA + numeratorC, denominatorB + denominatorD))
      : operator === "-"
        ? formatFraction(reduceFraction(numeratorA - numeratorC, denominatorB - denominatorD || 1))
        : formatFraction(reduceFraction(rawDenominator, rawNumerator || 1));

  const candidates: DistractorCandidate[] = [
    { value: naive, mistakeTag: "denominator-shortcut" },
    { value: formatFraction(reduceFraction(-result.numerator, result.denominator)), mistakeTag: "sign" },
    { value: formatFraction({ numerator: rawNumerator, denominator: rawDenominator === 0 ? 1 : rawDenominator }), mistakeTag: "not-reduced" },
    { value: formatFraction(reduceFraction(result.numerator + 1, result.denominator)), mistakeTag: "off-by-one" },
    { value: formatFraction(reduceFraction(result.numerator, result.denominator + 1)), mistakeTag: "off-by-one" },
  ].filter((candidate) => candidate.value !== answer);

  const steps =
    operator === "+" || operator === "-"
      ? [
          `분모를 ${denominatorB} 와 ${denominatorD} 의 공통분모 ${denominatorB * denominatorD} 로 맞춘다.`,
          `${numeratorA * denominatorD}/${denominatorB * denominatorD} ${operator} ${numeratorC * denominatorB}/${denominatorB * denominatorD}`,
          `분자끼리 계산하면 ${rawNumerator}/${rawDenominator}`,
          `약분하면 ${answer}`,
        ]
      : operator === "×"
        ? [
            "분자는 분자끼리, 분모는 분모끼리 곱한다.",
            `${numeratorA * numeratorC}/${denominatorB * denominatorD}`,
            `약분하면 ${answer}`,
          ]
        : [
            "나눗셈은 뒤 분수를 뒤집어 곱한다.",
            `${numeratorA}/${denominatorB} × ${denominatorD}/${numeratorC} = ${rawNumerator}/${rawDenominator}`,
            `약분하면 ${answer}`,
          ];

  const hints: [string, string, string] =
    operator === "+" || operator === "-"
      ? [
          "분모가 다르면 바로 더하거나 뺄 수 없어.",
          `공통분모 ${denominatorB * denominatorD} 로 통분부터 해.`,
          "통분했으면 분자끼리만 계산하고, 마지막에 약분하는 걸 잊지 마.",
        ]
      : operator === "×"
        ? [
            "곱셈은 통분이 필요 없어.",
            "분자는 분자끼리, 분모는 분모끼리 곱해.",
            "곱한 뒤 약분하면 끝이야.",
          ]
        : [
            "나눗셈은 곱셈으로 바꿔서 풀어.",
            `뒤에 있는 ${numeratorC}/${denominatorD} 를 뒤집으면 ${denominatorD}/${numeratorC} 야.`,
            "뒤집어 곱한 다음 약분하면 끝이야.",
          ];

  return {
    prompt,
    inputLabel: "계산 결과",
    choices: buildChoices(rng, answer, candidates),
    acceptableAnswers: [answer],
    steps,
    hints,
  };
};

export const MATH_GENERATORS: Record<string, QuestionGenerator> = {
  "ma-linear-eq": generateLinearEquation,
  "ma-poly-expand": generatePolynomialExpansion,
  "ma-factor": generateFactoring,
  "ma-quad-eq": generateQuadraticEquation,
  "ma-frac-arith": generateFractionArithmetic,
};
