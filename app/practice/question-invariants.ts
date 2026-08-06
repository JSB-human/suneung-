import type { GeneratedQuestion, QuestionBody } from "./types.ts";

export function findQuestionViolations(
  question: GeneratedQuestion | QuestionBody,
): string[] {
  const violations: string[] = [];

  if (!question.prompt?.trim()) {
    violations.push("prompt is empty");
  }
  if (!question.inputLabel?.trim()) {
    violations.push("inputLabel is empty");
  }
  if (!question.acceptableAnswers?.length) {
    violations.push("acceptableAnswers is empty");
  } else if (question.acceptableAnswers.some((answer) => !answer.trim())) {
    violations.push("acceptableAnswers has a blank entry");
  }
  if (!question.steps?.length) {
    violations.push("steps is empty");
  } else if (question.steps.some((step) => !step.trim())) {
    violations.push("steps has a blank entry");
  }
  if (!Array.isArray(question.hints) || question.hints.length !== 3) {
    violations.push("hints must have exactly 3 entries");
  } else if (question.hints.some((hint) => !hint.trim())) {
    violations.push("hints has a blank entry");
  }

  const choices = question.choices;
  if (choices) {
    if (choices.length < 3) {
      violations.push("choices must have at least 3 entries");
    }
    if (choices.some((choice) => !choice.label.trim())) {
      violations.push("choices have a blank label");
    }
    const values = choices.map((choice) => choice.value);
    if (new Set(values).size !== values.length) {
      violations.push("choices have duplicate values");
    }
    const labels = choices.map((choice) => choice.label);
    if (new Set(labels).size !== labels.length) {
      violations.push("choices have duplicate labels");
    }
    const correctCount = choices.filter((choice) =>
      question.acceptableAnswers.includes(choice.value),
    ).length;
    if (correctCount !== 1) {
      violations.push(`exactly one choice must be correct, found ${correctCount}`);
    }
  }

  return violations;
}
