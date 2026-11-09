import { codeLines, UI_TEXT } from './productUi';

describe('localized product UI data', () => {
  it('defines matching English and Chinese content for every localized label', () => {
    expect(Object.keys(UI_TEXT.en).sort()).toEqual(Object.keys(UI_TEXT['zh-CN']).sort());
    expect(UI_TEXT.en.problem).toContain('Subarray Sum');
    expect(UI_TEXT['zh-CN'].problem).toContain('和为 K');
  });

  it.each(['java', 'python', 'go', 'javascript'] as const)('maps every semantic code anchor for %s', (language) => {
    for (const algorithm of ['brute-force', 'prefix-sum', 'hash-map'] as const) {
      const lines = codeLines(language, algorithm);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.every((line) => line.text.length > 0 && line.anchor.length > 0)).toBe(true);
      expect(lines.at(-1)?.text).toMatch(/return/);
    }
  });
});
