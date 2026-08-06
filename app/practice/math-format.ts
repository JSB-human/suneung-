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
