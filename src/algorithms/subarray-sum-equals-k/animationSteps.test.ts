import { buildAlgorithmSteps } from './animationSteps';
import { motionDuration } from '@/utils/motion';
import { routeBetweenNodes } from '@/utils/arrowGeometry';

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
    expect(steps.filter((step) => step.operation === 'lookup').every((step) => step.frame.arrows.some((arrow) => arrow.text.startsWith('查找')))).toBe(true);
  });

  it('uses distinct horizontal lanes for the array and hash structure', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, -1, 2, 0, 3, -2, 4, 1], 2);
    steps.forEach((step) => {
      const arrayNodes = step.frame.nodes.filter((node) => node.id.startsWith('array-'));
      const hashNodes = step.frame.nodes.filter((node) => node.id.startsWith('hash-'));
      const arrayCenter = (Math.min(...arrayNodes.map((node) => node.x)) + Math.max(...arrayNodes.map((node) => node.x))) / 2;
      expect(arrayCenter).toBe(600);
      expect(arrayNodes.every((node) => node.y === 250 && node.width === 72 && node.height === 48)).toBe(true);
      expect(hashNodes.every((node) => node.y >= 412 && node.width === 84 && node.height === 48)).toBe(true);
      expect(Math.max(...arrayNodes.map((node) => node.y + (node.height ?? 48) / 2))).toBeLessThan(
        Math.min(...hashNodes.map((node) => node.y - (node.height ?? 48) / 2)),
      );
      const mainNodes = step.frame.nodes.filter((node) => !node.id.startsWith('hash-'));
      mainNodes.forEach((node, index) => mainNodes.slice(index + 1).forEach((other) => {
        const nodeWidth = node.width ?? 72;
        const otherWidth = other.width ?? 72;
        const separatedHorizontally = Math.abs(node.x - other.x) >= (nodeWidth + otherWidth) / 2 + 8;
        const separatedVertically = Math.abs(node.y - other.y) >= 56;
        expect(separatedHorizontally || separatedVertically).toBe(true);
      }));
      step.frame.arrows.forEach((arrow) => {
        const source = step.frame.nodes.find((node) => node.id === `array-${step.binding.variables.index}`);
        expect(arrow.text.trim().length).toBeGreaterThan(0);
        expect(arrow.kind).toBe('data-flow');
        expect(source).toBeDefined();
        const target = step.frame.nodes.find((node) => node.id === `hash-${step.binding.variables.target ?? step.binding.variables.sum}`);
        expect(target).toBeDefined();
        expect(arrow.fromId).toBe(source?.id);
        expect(arrow.toId).toBe(target?.id);
        expect(arrow.fromId).not.toEqual(arrow.toId);
      });
    });
  });

  it('keeps the widest supported arrays within the logical canvas bounds', () => {
    (['brute-force', 'prefix-sum', 'hash-map'] as const).forEach((algorithm) => {
      const steps = buildAlgorithmSteps(algorithm, Array(8).fill(1), 2);
      steps.forEach((step) => step.frame.nodes.forEach((node) => {
        const width = node.width ?? (node.id.startsWith('hash-') ? 84 : node.id.startsWith('prefix-') ? 92 : 72);
        expect(node.x - width / 2).toBeGreaterThanOrEqual(0);
        expect(node.x + width / 2).toBeLessThanOrEqual(1200);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThanOrEqual(720);
      }));
    });
  });

  it('renders every brute-force candidate as its own comparison snapshot', () => {
    const nums = [1, -1, 2];
    const steps = buildAlgorithmSteps('brute-force', nums, 9);
    const candidates = steps.filter((step) => step.operation === 'compare');
    const results = steps.filter((step) => step.operation === 'match');
    expect(candidates).toHaveLength(nums.length * (nums.length + 1) / 2);
    expect(steps.filter((step) => step.operation === 'read')).toHaveLength(candidates.length);
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

  it('shows hash values in a compact, centered three-column grid with stable slots', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, 2, 3, 4, 5, 6, 7, 8], 99);
    steps.forEach((step) => {
      const hashNodes = step.frame.nodes.filter((node) => node.id.startsWith('hash-'));
      hashNodes.forEach((node) => {
        expect(node.x).toBeGreaterThanOrEqual(376);
        expect(node.x).toBeLessThanOrEqual(824);
        expect(node.y).toBeGreaterThanOrEqual(412);
        expect(node.y).toBeLessThanOrEqual(736);
      });
    });
  });

  it('derives lookup endpoints from the source and target node IDs per frame', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, 2, 3], 3);
    const lookup = steps.find((step) => step.operation === 'lookup' && step.binding.variables.index === 1)!;
    const arrow = lookup.frame.arrows[0];
    const nodeBounds = new Map(lookup.frame.nodes.map((node) => [node.id, { x: node.x, y: node.y, width: node.width!, height: node.height! }]));
    const geometry = routeBetweenNodes(arrow, nodeBounds)!;
    const movedNodes = new Map([...nodeBounds.entries()].map(([id, node]) => [id, { ...node, y: node.y + 20 }]));
    const movedGeometry = routeBetweenNodes(arrow, movedNodes)!;
    expect(arrow.fromId).toBe('array-1');
    expect(arrow.toId).toBe('hash-0');
    expect(geometry.from.y).toBe(nodeBounds.get(arrow.fromId)!.y + 24);
    expect(geometry.to.y).toBe(nodeBounds.get(arrow.toId)!.y - 24);
    expect(movedGeometry.from.y).toBe(geometry.from.y + 20);
    expect(movedGeometry.to.y).toBe(geometry.to.y + 20);
  });

  it('uses a stable idle sentinel node for every hash frame before reads', () => {
    const steps = buildAlgorithmSteps('hash-map', [2], 9);
    steps.filter((step) => step.id <= 2).forEach((step) => {
      expect(step.frame.nodes.some((node) => node.id === 'hash-0' && node.label === '0 × 1')).toBe(true);
      expect(step.frame.nodes.find((node) => node.id === 'hash-0')?.x).toBe(488);
    });
  });

  it('separates hash lookup from insertion and records correct matching ranges', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, -1, 2], 2);
    const operations = steps.map((step) => step.operation);
    expect(operations).toContain('read');
    expect(operations).toContain('compare');
    expect(operations).toContain('insert');
    const misses = steps.filter((step) => step.operation === 'compare' && step.binding.variables.matches === 0);
    expect(misses.every((step) => step.frame.nodes.some((node) => node.id === `hash-${step.binding.variables.target}` && node.status === 'idle'))).toBe(true);
    expect(steps[0].frame.nodes.some((node) => node.id === 'hash-0' && node.label === '0 × 1')).toBe(true);
    expect(steps[0].frame.arrows).toHaveLength(0);
    expect(steps.filter((step) => step.operation === 'read' && step.binding.variables.result !== undefined).flatMap((step) => step.frame.ranges))
      .toEqual(expect.arrayContaining([{ start: 0, end: 2, sum: 2 }]));
    steps.forEach((step) => {
      expect(step.frame.nodes.filter((node) => node.status === 'current')).toHaveLength(step.operation === 'inspect' || step.operation === 'read' || step.operation === 'compare' || step.operation === 'lookup' || step.operation === 'insert' && step.binding.variables.index !== undefined ? 1 : 0);
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

  it('exposes prefix-boundary snapshots before enumerating prefix differences', () => {
    const steps = buildAlgorithmSteps('prefix-sum', [1, 2, -1], 2);
    const prefixBuilds = steps.filter((step) => step.operation === 'read' && step.binding.variables.nextPrefix !== undefined);
    expect(prefixBuilds.map((step) => step.binding.variables.nextPrefix)).toEqual([1, 3, 2]);
    expect(prefixBuilds.map((step) => step.frame.nodes.filter((node) => node.id.startsWith('prefix-')).length)).toEqual([2, 3, 4]);
    expect(steps.filter((step) => step.operation === 'compare')).toHaveLength(6);
    const comparison = steps.find((step) => step.operation === 'compare')!;
    expect(comparison.frame.nodes.filter((node) => node.status === 'compare' && node.id.startsWith('prefix-')).map((node) => node.id)).toEqual(['prefix-0', 'prefix-1']);
    expect(comparison.frame.nodes.filter((node) => node.status === 'current')).toHaveLength(0);
  });

  it('adds inspection, accumulation, comparison and answer frames for brute force', () => {
    const steps = buildAlgorithmSteps('brute-force', [1, 2], 3);
    expect(steps.filter((step) => step.operation === 'inspect')).toHaveLength(3);
    expect(steps.filter((step) => step.operation === 'read')).toHaveLength(3);
    expect(steps.filter((step) => step.operation === 'compare')).toHaveLength(3);
    expect(steps.filter((step) => step.operation === 'match')).toHaveLength(1);
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
    expect(motionDuration('enter', 1, true)).toBe(0);
    expect(motionDuration('move', 1, true)).toBe(0);
    expect(motionDuration('arrow', 1, true)).toBe(0);
    expect(motionDuration('move', 2, false)).toBeLessThanOrEqual(225);
    expect(motionDuration('state', 0.5, false)).toBeLessThanOrEqual(480);
  });

  it('routes long and vertical arrows along a smooth quadratic curve', () => {
    const steps = buildAlgorithmSteps('hash-map', [1, -1, 2], 2);
    const lookupArrows = steps.filter((step) => step.operation === 'lookup').flatMap((step) => step.frame.arrows);
    expect(lookupArrows.length).toBeGreaterThan(0);
    expect(lookupArrows.every((arrow) => arrow.route === 'rounded-elbow' && arrow.kind === 'data-flow' && arrow.curve === undefined)).toBe(true);
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
