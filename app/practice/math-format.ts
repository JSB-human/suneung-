export type Fraction = { numerator: number; denominator: number };

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }
  return x === 0 ? 1 : x;
}

export function lcm(a: number, b: number): number {
  return Math.abs((a * b) / gcd(a, b));
}

export function reduceFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new Error("denominator must not be zero");
  }
  if (numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
  };
}

export function formatFraction(fraction: Fraction): string {
  return fraction.denominator === 1
    ? String(fraction.numerator)
    : `${fraction.numerator}/${fraction.denominator}`;
}

export function formatQuadratic(a: number, b: number, c: number): string {
  const parts: string[] = [];

  if (a !== 0) {
    const body = Math.abs(a) === 1 ? "x^2" : `${Math.abs(a)}x^2`;
    parts.push(a < 0 ? `-${body}` : body);
  }
  if (b !== 0) {
    const body = Math.abs(b) === 1 ? "x" : `${Math.abs(b)}x`;
    if (parts.length === 0) {
      parts.push(b < 0 ? `-${body}` : body);
    } else {
      parts.push(`${b < 0 ? "-" : "+"} ${body}`);
    }
  }
  if (c !== 0) {
    if (parts.length === 0) {
      parts.push(String(c));
    } else {
      parts.push(`${c < 0 ? "-" : "+"} ${Math.abs(c)}`);
    }
  }

  return parts.length === 0 ? "0" : parts.join(" ");
}

export function formatFactor(offset: number): string {
  return offset < 0 ? `(x - ${Math.abs(offset)})` : `(x + ${offset})`;
}

/**
 * 숫자 뒤에 붙는 한국어 조사를 고른다.
 *
 * 받침 유무는 숫자를 읽는 소리로 정해진다. 3은 "삼"이라 받침이 있고
 * 4는 "사"라 없다. 0으로 끝나면 십·백·천·만 모두 받침이 있다.
 * `-으로/로`만 규칙이 다르다 — 1(일)과 8(팔)은 ㄹ 받침이라 "로"를 쓴다.
 *
 * 이걸 안 쓰면 "3로 나누면", "4이 되는" 같은 문장이 학습자에게 그대로 보인다.
 */
export type Josa = "을/를" | "이/가" | "은/는" | "와/과" | "으로/로";

/** 읽었을 때 받침으로 끝나는 마지막 자리 숫자. 0은 십·백·천·만이라 포함된다. */
const FINAL_CONSONANT_DIGITS = new Set([0, 1, 3, 6, 7, 8]);
/** ㄹ 받침으로 끝나는 자리 숫자. 1(일)·8(팔). "1로", "8로"가 맞다. */
const RIEUL_DIGITS = new Set([1, 8]);

export function josa(value: number, kind: Josa): string {
  const lastDigit = Math.abs(Math.trunc(value)) % 10;
  const hasFinalConsonant = FINAL_CONSONANT_DIGITS.has(lastDigit);

  switch (kind) {
    case "을/를":
      return hasFinalConsonant ? "을" : "를";
    case "이/가":
      return hasFinalConsonant ? "이" : "가";
    case "은/는":
      return hasFinalConsonant ? "은" : "는";
    case "와/과":
      return hasFinalConsonant ? "과" : "와";
    case "으로/로":
      // ㄹ 받침이면 "으로"가 아니라 "로"다.
      return hasFinalConsonant && !RIEUL_DIGITS.has(lastDigit) ? "으로" : "로";
  }
}

/**
 * 수식 문자열 뒤에 붙는 조사. 소리 내어 읽을 때 마지막에 오는 숫자로 정한다.
 *
 * `(x + 2)`처럼 괄호로 끝나도 읽을 때는 "…이"로 끝나므로, 뒤에서부터
 * 첫 숫자를 찾는다. 숫자가 없으면 받침 없는 쪽으로 둔다.
 */
export function josaAfterExpression(expression: string, kind: Josa): string {
  const lastDigit = [...expression].reverse().find((char) => /[0-9]/.test(char));
  return josa(lastDigit ? Number(lastDigit) : 2, kind);
}
