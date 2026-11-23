import { validateInput } from './validateInput';

describe('validateInput', () => {
  it('parses a valid sample without mutating its values', () => {
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
  ])('rejects invalid or out-of-range input: %s', (value) => {
    expect(validateInput(value).valid).toBe(false);
  });
});
