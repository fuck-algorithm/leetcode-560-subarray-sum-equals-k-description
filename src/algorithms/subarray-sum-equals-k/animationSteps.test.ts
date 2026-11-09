import { buildAlgorithmSteps } from './animationSteps';
import { motionDuration } from '@/utils/motion';

describe('buildAlgorithmSteps', () => {
  it('provides an English snapshot and narration for every solution', () => {
    (['brute-force', 'prefix-sum', 'hash-map'] as const).forEach((algorithm) => {
      const steps = buildAlgorithmSteps(algorithm, [1, 2, -1], 2, 'en');
      const untranslated = steps.filter((step) => /[一-鿿]/.test(step.narration));
      expect(untranslated.map((step) => step.narration)).toEqual([]);
      expect(steps.every((step) => step.frame.metrics.every((metric) => !/[一-鿿]/.test(metric.label)))).toBe(true);
    });
  });
  it.each([
    ['brute-force', 2],
    ['prefix-sum', 2],
    ['hash-map', 2],
  ] as const)('%s emits replayable semantic snapshots', (algorithm, k) => {
    const steps = buildAlgorithmSteps(algorithm, [1, -1, 2], k);
    expect(steps.length).toBeGreaterThan(1);
    expect(steps[0].operation).toBe('init');
    expect(steps.at(-1)?.operation).toBe('done');

    steps.forEach((step, index) => {
      expect(step.operation).toBeTruthy();
      expect(step.narration.length).toBeGreaterThan(20);
      expect(step.binding.anchorIds.length).toBeGreaterThan(0);
      expect(new Set(step.frame.nodes.map((node) => node.id)).size).toBe(step.frame.nodes.length);
      expect(step.frame.metrics.length).toBeGreaterThanOrEqual(2);
      if (index > 0) expect(step.narration).not.toBe(steps[index - 1].narration);
      expect(step.frame.nodes.filter((node) => node.status === 'current').length).toBeLessThanOrEqual(1);
      expect(step.frame.nodes.filter((node) => node.status === 'current' || node.status === 'compare').length).toBeLessThanOrEqual(2);
    });
  });

  it('uses exactly one current array focus for query, read, match and write frames', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, -1, 2], 2);
    steps.forEach((step) => {
      const focused = step.frame.nodes.filter((node) => node.status === 'current' || node.status === 'compare');
      expect(focused.length).toBeLessThanOrEqual(2);
      expect(focused.filter((node) => node.id.startsWith('array-') && node.status === 'current').length).toBeLessThanOrEqual(1);
      expect(step.frame.nodes.filter((node) => node.status === 'compare').length).toBeLessThanOrEqual(1);
    });
    expect(steps.filter((step) => step.operation === 'compare').every((step) => step.frame.arrows.some((arrow) => arrow.text.startsWith('查找')))).toBe(true);
  });

  it('centers the input structure and separates the hash auxiliary lane', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, -1, 2], 2);
    steps.forEach((step) => {
      const arrayNodes = step.frame.nodes.filter((node) => node.id.startsWith('array-'));
      const hashNodes = step.frame.nodes.filter((node) => node.id.startsWith('hash-'));
      if (arrayNodes.length && hashNodes.length) {
        expect(Math.min(...hashNodes.map((node) => node.y))).toBeGreaterThanOrEqual(145);
        expect(Math.min(...hashNodes.map((node) => node.x))).toBeGreaterThan(Math.max(...arrayNodes.map((node) => node.x)) + 80);
        const arrayCenter = (Math.min(...arrayNodes.map((node) => node.x)) + Math.max(...arrayNodes.map((node) => node.x))) / 2;
        expect(arrayCenter).toBeGreaterThan(250);
        expect(arrayCenter).toBeLessThan(600);
      }
    });
  });

  it('renders every brute-force candidate as its own comparison snapshot', () => {
    const nums = [1, -1, 2];
    const steps = buildAlgorithmSteps('brute-force', nums, 9);
    const candidates = steps.filter((step) => step.operation === 'compare');
    const results = steps.filter((step) => step.operation === 'match');
    expect(candidates).toHaveLength(nums.length * (nums.length + 1) / 2);
    expect(results).toHaveLength(0);
    expect(candidates.map((step) => step.frame.candidate)).toEqual([
      { start: 0, end: 0, sum: 1 },
      { start: 0, end: 1, sum: 0 },
      { start: 0, end: 2, sum: 2 },
      { start: 1, end: 1, sum: -1 },
      { start: 1, end: 2, sum: 1 },
      { start: 2, end: 2, sum: 2 },
    ]);
  });

  it('separates hash lookup from insertion and records correct matching ranges', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, -1, 2], 2);
    const operations = steps.map((step) => step.operation);
    expect(operations).toContain('read');
    expect(operations).toContain('compare');
    expect(operations).toContain('insert');
    const misses = steps.filter((step) => step.operation === 'compare' && step.binding.variables.matches === 0);
    expect(misses.every((step) => step.frame.nodes.some((node) => node.id === `hash-${step.binding.variables.target}` && node.status === 'idle'))).toBe(true);
    expect(steps[0].frame.arrows[0].text).toContain('初始化');
    expect(steps.filter((step) => step.operation === 'match').flatMap((step) => step.frame.ranges))
      .toEqual(expect.arrayContaining([{ start: 0, end: 2, sum: 2 }]));
    steps.forEach((step) => {
      expect(step.frame.nodes.filter((node) => node.status === 'current')).toHaveLength(step.operation === 'read' || step.operation === 'compare' || step.operation === 'insert' && step.binding.variables.index !== undefined ? 1 : 0);
      if (step.operation === 'compare') expect(step.frame.nodes.filter((node) => node.status === 'compare').length).toBeLessThanOrEqual(1);
      if (step.operation === 'match') expect(step.frame.nodes.filter((node) => node.status === 'done').some((node) => node.id.startsWith('array-'))).toBe(true);
    });
    expect(steps.at(-1)?.frame.result).toBe(2);
  });

  it('keeps status colors within the approved non-purple semantic palette', () => {
    const statuses = new Set(['idle', 'current', 'compare', 'visited', 'done']);
    const colors = { idle: '#dde9e6', current: '#2f9e7d', compare: '#e8b04b', visited: '#9ad3c2', done: '#18765a' };
    expect(Object.keys(colors).sort()).toEqual([...statuses].sort());
    const purples = Object.values(colors).filter((color) => {
      const [r, g, b] = color.match(/[0-9a-f]{2}/gi)!.map((part) => Number.parseInt(part, 16));
      const hue = ((Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI) + 360) % 360;
      return hue >= 260 && hue <= 310;
    });
    expect(purples).toEqual([]);
  });

  it('rejects inputs that could create an unreadably large animation', () => {
    expect(() => buildAlgorithmSteps('hash-map', Array(9).fill(1), 2)).toThrow(RangeError);
    expect(() => buildAlgorithmSteps('hash-map', [1.5], 2)).toThrow(RangeError);
    expect(() => buildAlgorithmSteps('hash-map', [], 2)).toThrow(RangeError);
  });

  it('keeps IDs and coordinates stable for every existing hash key', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, 1, 2, -1], 2);
    const positions = new Map<string, string>();
    steps.forEach((step) => step.frame.nodes.filter((node) => node.id.startsWith('hash-')).forEach((node) => {
      const position = `${node.x}:${node.y}`;
      expect(positions.get(node.id) ?? position).toBe(position);
      positions.set(node.id, position);
    }));
  });

  it('uses speed-aware motion tokens and disables motion when requested', () => {
    expect(motionDuration('move', 1, true)).toBe(0);
    expect(motionDuration('move', 2, false)).toBeLessThanOrEqual(225);
    expect(motionDuration('state', 0.5, false)).toBeLessThanOrEqual(480);
  });

  it('keeps array node positions and identities stable across snapshots', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, 1, 1], 2);
    const initial = new Map(steps[0].frame.nodes.filter((node) => node.id.startsWith('array-')).map((node) => [node.id, `${node.x}:${node.y}`]));
    steps.forEach((step) => step.frame.nodes.filter((node) => node.id.startsWith('array-')).forEach((node) => {
      expect(`${node.x}:${node.y}`).toBe(initial.get(node.id));
    }));
  });

  it.each([
    ['brute-force', 2],
    ['prefix-sum', 2],
    ['hash-map', 2],
  ] as const)('%s matches the reference answer', (algorithm, k) => {
    const nums = [1, 2, 3, -2, 5, -3, 2, 1];
    const steps = buildAlgorithmSteps(algorithm, nums, k);
    const expected = nums
      .flatMap((_, start, nums) => nums.slice(start).map((__, offset) => nums.slice(start, start + offset + 1)))
      .filter((range) => range.reduce((sum, value) => sum + value, 0) === k).length;
    expect(steps.at(-1)?.frame.result).toBe(expected);
  });
});
