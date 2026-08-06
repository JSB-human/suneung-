export type Rng = {
  next: () => number;
  int: (minInclusive: number, maxInclusive: number) => number;
  nonZeroInt: (minInclusive: number, maxInclusive: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
  bool: () => boolean;
};

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed: number): Rng {
  let state = (seed >>> 0) || 1;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (minInclusive: number, maxInclusive: number): number =>
    minInclusive + Math.floor(next() * (maxInclusive - minInclusive + 1));

  const nonZeroInt = (minInclusive: number, maxInclusive: number): number => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const value = int(minInclusive, maxInclusive);
      if (value !== 0) {
        return value;
      }
    }
    return maxInclusive > 0 ? maxInclusive : 1;
  };

  const pick = <T>(items: readonly T[]): T => items[int(0, items.length - 1)];

  const shuffle = <T>(items: readonly T[]): T[] => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapWith = int(0, index);
      const held = result[index];
      result[index] = result[swapWith];
      result[swapWith] = held;
    }
    return result;
  };

  return { next, int, nonZeroInt, pick, shuffle, bool: () => next() < 0.5 };
}
