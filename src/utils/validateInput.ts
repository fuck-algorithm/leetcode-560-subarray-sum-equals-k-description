export interface ValidatedInput {
  nums: number[];
  k: number;
}

export type InputValidation =
  | { valid: true; value: ValidatedInput }
  | { valid: false; error: string };

const INVALID_INPUT = 'Enter integers as “1, 2, -1; k=2” (1–8 values within -100..100).';

export function validateInput(raw: string): InputValidation {
  const match = raw.match(/^([\d\s,+-]+);\s*k\s*=\s*(-?\d+)$/i);
  if (!match) return { valid: false, error: INVALID_INPUT };

  const nums = match[1].split(/[\s,]+/).filter(Boolean).map(Number);
  const k = Number(match[2]);
  if (!nums.length || nums.length > 8 || !nums.every((number) => Number.isInteger(number) && Math.abs(number) <= 100) || Math.abs(k) > 100) {
    return { valid: false, error: INVALID_INPUT };
  }

  return { valid: true, value: { nums, k } };
}
