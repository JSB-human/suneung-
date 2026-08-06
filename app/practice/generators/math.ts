import type { Rng } from "../rng.ts";
import type { Level, QuestionBody, QuestionGenerator } from "../types.ts";
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

export const MATH_GENERATORS: Record<string, QuestionGenerator> = {
  "ma-linear-eq": generateLinearEquation,
};
