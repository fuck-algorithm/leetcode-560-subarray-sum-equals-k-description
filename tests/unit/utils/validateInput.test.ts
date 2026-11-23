import { describe, expect, it } from 'vitest';
import { validateInput } from '@/utils/validateInput';

describe('validateInput', () => {
  it('parses a valid sample', () => {
    expect(validateInput('1, 2, -1; k=2')).toEqual({ valid: true, value: { nums: [1, 2, -1], k: 2 } });
  });

  it.each([
    '',
    '1, nope; k=2',
    '1, 2; k=x',
    '; k=0',
    `${Array(9).fill('1').join(', ')}; k=1`,
    '101; k=1',
    '1; k=101',
    '1.5; k=1',
  ])('rejects invalid input: %s', (input) => {
    expect(validateInput(input)).toMatchObject({ valid: false });
  });
});
