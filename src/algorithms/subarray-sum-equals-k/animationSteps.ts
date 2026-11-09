import type { AlgorithmType } from '@/types';
import type { UiLocale } from '@/utils/productUi';

export type StepOperation = 'init' | 'read' | 'compare' | 'match' | 'insert' | 'done';
export type NodeStatus = 'idle' | 'current' | 'compare' | 'visited' | 'done';

function resolveArrayStatus(algorithm: AlgorithmType, operation: StepOperation, index: number, focus: number[]): NodeStatus {
  if (!focus.includes(index)) return 'idle';
  if (operation === 'match') return 'done';
  if (algorithm === 'prefix-sum' && operation === 'compare') return 'compare';
  if (algorithm === 'brute-force' && operation === 'compare' && focus.length > 1 && index === focus[0]) return 'compare';
  if (operation === 'insert') return 'visited';
  return 'current';
}

export interface StepNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: NodeStatus;
  badge?: string;
}

export interface StepRange {
  start: number;
  end: number;
  sum: number;
}

export const algorithmCode: Record<AlgorithmType, { anchor: string; text: string }[]> = {
  'brute-force': [
    { anchor: 'brute-init', text: 'int count = 0;' },
    { anchor: 'brute-outer', text: 'for (int left = 0; left < nums.length; left++) {' },
    { anchor: 'brute-outer', text: '  int sum = 0;' },
    { anchor: 'brute-inner', text: '  for (int right = left; right < nums.length; right++) {' },
    { anchor: 'brute-add', text: '    sum += nums[right];' },
    { anchor: 'brute-match', text: '    if (sum == k) count++;' },
    { anchor: 'brute-done', text: 'return count;' },
  ],
  'prefix-sum': [
    { anchor: 'prefix-init', text: 'int[] prefix = buildPrefix(nums);' },
    { anchor: 'prefix-outer', text: 'for (int left = 0; left < nums.length; left++) {' },
    { anchor: 'prefix-outer', text: '  for (int right = left; right < nums.length; right++) {' },
    { anchor: 'prefix-subtract', text: '    int sum = prefix[right + 1] - prefix[left];' },
    { anchor: 'prefix-match', text: '    if (sum == k) count++;' },
    { anchor: 'prefix-done', text: 'return count;' },
  ],
  'hash-map': [
    { anchor: 'hash-declare', text: 'Map<Integer, Integer> freq = new HashMap<>();' },
    { anchor: 'hash-init', text: 'freq.put(0, 1);' },
    { anchor: 'hash-loop', text: 'for (int value : nums) {' },
    { anchor: 'hash-prefix', text: '  prefix += value;' },
    { anchor: 'hash-query', text: '  count += freq.getOrDefault(prefix - k, 0);' },
    { anchor: 'hash-insert', text: '  freq.merge(prefix, 1, Integer::sum);' },
    { anchor: 'hash-done', text: 'return count;' },
  ],
};

export interface AlgorithmStep {
  id: number;
  title: string;
  description: string;
  operation: StepOperation;
  narration: string;
  binding: { anchorIds: string[]; variables: Record<string, string | number> };
  frame: {
    nodes: StepNode[];
    arrows: { id: string; from: { x: number; y: number }; to: { x: number; y: number }; text: string }[];
    ranges: StepRange[];
    candidate?: StepRange;
    result: number;
    metrics: { label: string; value: string }[];
  };
}

export function buildAlgorithmSteps(algorithm: AlgorithmType, nums: number[], k: number, locale: UiLocale = 'zh-CN'): AlgorithmStep[] {
  const phrase = locale === 'en' ? {
    initBrute: 'Enumerate contiguous ranges and extend each right boundary to maintain the running sum.',
    operation: ['Initialize', 'Read', 'Compare', 'Match', 'Record', 'Done'],
    initPrefix: 'Build prefix sums so any contiguous range is computed by subtracting two boundaries.',
    initHash: 'Seed prefix sum 0 with frequency 1 because a range may start at the first array element.',
    read: (index: number, value: number, sum: number) => `Read nums[${index}]=${value} and add it to the prefix total to get ${sum}.`,
    query: (target: number, kValue: number) => `Look up prefix sum ${target}; subtracting it from the current total would leave the target ${kValue}.`,
    hit: (target: number, matches: number, kValue: number) => `Prefix sum ${target} occurred ${matches} time(s), so ${matches} new contiguous range(s) sum to ${kValue}.`,
    insert: (sum: number) => `Record prefix sum ${sum} for later ranges because future totals may need this boundary.`,
    done: (count: number, kValue: number) => `The scan is complete: ${count} contiguous range(s) sum to ${kValue}.`,
    prefixCompare: (right: number, left: number, sum: number, kValue: number) => `Compare prefix[${right + 1}]−prefix[${left}]=${sum} with ${kValue}, because subtracting the boundaries gives this range sum.`,
    bruteCompare: (left: number, right: number, sum: number) => `Check range [${left},${right}] with sum ${sum}, because brute force verifies every contiguous candidate.`,
    matchRange: (left: number, right: number, kValue: number) => `Range [${left},${right}] sums to ${kValue}, so add it to the answer.`,
    metrics: ['Index', 'Count', 'Ranges'],
  } : {
    initBrute: '从左到右枚举连续区间，每次扩展右端点并维护当前和。',
    operation: ['初始化', '读取', '比较', '命中', '记录', '完成'],
    initPrefix: '先构造前缀和数组，使任一区间和都能由两个前缀相减得到。',
    initHash: '先将前缀和 0 记录一次，因为从数组开头就能构成目标和。',
    read: (index: number, value: number, sum: number) => `读取 nums[${index}]=${value} 并累加，得到前缀和 ${sum}。`,
    query: (target: number, kValue: number) => `查询前缀和 ${target} 是否已出现，因为当前和减去它等于目标 ${kValue}。`,
    hit: (target: number, matches: number, kValue: number) => `前缀和 ${target} 出现 ${matches} 次，因此新增 ${matches} 个和为 ${kValue} 的连续区间。`,
    insert: (sum: number) => `把前缀和 ${sum} 的出现次数加一，因为后续区间可能从这里开始。`,
    done: (count: number, kValue: number) => `扫描结束，共找到 ${count} 个和为 ${kValue} 的子数组。`,
    prefixCompare: (right: number, left: number, sum: number, kValue: number) => `比较 prefix[${right + 1}]−prefix[${left}]=${sum} 与目标 ${kValue}，因为前缀差就是该连续区间的和。`,
    bruteCompare: (left: number, right: number, sum: number) => `检查区间 [${left},${right}] 的和 ${sum}，因为暴力法必须逐一验证每个连续区间。`,
    matchRange: (left: number, right: number, kValue: number) => `区间 [${left},${right}] 的和正好是 ${kValue}，因此将它加入答案。`,
    metrics: ['当前索引', '累计答案', '已记录区间'],
  };
  const operationLabels: Record<StepOperation, string> = {
    init: phrase.operation[0], read: phrase.operation[1], compare: phrase.operation[2], match: phrase.operation[3], insert: phrase.operation[4], done: phrase.operation[5],
  };
  const maxLength = 8;
  if (nums.length === 0 || nums.length > maxLength || nums.some((value) => !Number.isInteger(value) || Math.abs(value) > 100) || !Number.isInteger(k) || Math.abs(k) > 100) {
    throw new RangeError(`Animation input requires 1–${maxLength} integers within [-100, 100].`);
  }
  const steps: AlgorithmStep[] = [];
  const prefix = [0];
  nums.forEach((value) => prefix.push(prefix[prefix.length - 1] + value));
  let result = 0;
  const ranges: StepRange[] = [];
  const visited = new Set<number>();
  const frequencies = new Map<number, number>();
  const hashPositions = new Map<number, number>();
  const hasHashLane = algorithm === 'hash-map';
  const arrayPitch = hasHashLane ? (nums.length <= 5 ? 144 : 96) : 220;
  const arrayCenterX = hasHashLane ? 360 : 600;
  const hashX = hasHashLane ? (nums.length <= 5 ? 760 : 850) : 1000;
  const hashY = 175;

  const addStep = (
    operation: StepOperation,
    focus: number[],
    narration: string,
    anchor: string,
    variables: Record<string, number | string> = {},
    targetPrefix?: number,
    candidate?: StepRange,
  ) => {
    const nodes: StepNode[] = nums.map((value, index) => ({
      id: `array-${index}`,
      label: String(value),
      x: arrayCenterX + (index - (nums.length - 1) / 2) * arrayPitch,
      y: 175,
      status: focus.includes(index) ? resolveArrayStatus(algorithm, operation, index, focus) : visited.has(index) ? 'visited' : 'idle',
      badge: String(index),
    }));
    if (algorithm === 'hash-map') {
      const visibleKeys = new Set(frequencies.keys());
      if (operation === 'compare' && targetPrefix !== undefined) visibleKeys.add(targetPrefix);
      Array.from(visibleKeys).forEach((key) => {
        const slot = hashPositions.get(key) ?? hashPositions.size;
        hashPositions.set(key, slot);
        const count = frequencies.get(key) ?? 0;
        nodes.push({
          id: `hash-${key}`,
          label: `${key} × ${count}`,
          x: hashX + (slot % 2) * 92,
          y: hashY + Math.floor(slot / 2) * 68,
          status: key === targetPrefix && operation === 'compare' && count > 0 ? 'compare' : operation === 'match' && key === targetPrefix ? 'done' : operation === 'insert' && key === variables.sum ? 'current' : count === 0 ? 'idle' : 'visited',
          badge: key === targetPrefix ? 'sum−k' : 'sum',
        });
      });
    }
    const current = focus.length > 0 ? nodes.find((node) => node.id === `array-${focus[0]}`) : undefined;
    const targetNode = algorithm === 'hash-map' && targetPrefix !== undefined ? nodes.find((node) => node.id === `hash-${targetPrefix}`) : undefined;
    const pendingHashNode = algorithm === 'hash-map' && operation === 'insert' ? nodes.find((node) => node.id === `hash-${variables.sum}`) : undefined;
    steps.push({
      id: steps.length,
      title: operationLabels[operation],
      description: narration,
      operation,
      narration,
      binding: { anchorIds: [anchor], variables },
      frame: {
        nodes,
        arrows: current ? [{ id: `focus-${steps.length}-${current.id}`, from: { x: current.x, y: current.y + 48 }, to: algorithm === 'hash-map' && operation === 'compare' ? { x: targetNode?.x ?? hashX, y: targetNode?.y ?? hashY } : operation === 'insert' && pendingHashNode ? { x: pendingHashNode.x, y: pendingHashNode.y } : { x: current.x, y: current.y + 24 }, text: algorithm === 'hash-map' && operation === 'compare' ? `查找 ${targetPrefix}` : operation === 'insert' ? `记录 ${variables.sum}` : operationLabels[operation] }] : operation === 'init' && algorithm === 'hash-map' ? [{ id: `seed-${steps.length}-${hashPositions.size}`, from: { x: hashX - 48, y: hashY }, to: { x: hashX, y: hashY }, text: '初始化频次 1' }] : [],
        ranges: ranges.map((range) => ({ ...range })),
        candidate,
        result,
        metrics: [
          { label: phrase.metrics[0], value: variables.index === undefined ? '—' : String(variables.index) },
          { label: phrase.metrics[1], value: String(result) },
          { label: phrase.metrics[2], value: String(ranges.length) },
        ],
      },
    });
  };

  if (algorithm === 'hash-map') {
    frequencies.set(0, 1);
    addStep('init', [], phrase.initHash, 'hash-init', { sum: 0 });
    for (let index = 0, sum = 0; index < nums.length; index++) {
      sum += nums[index];
      visited.add(index);
      addStep('read', [index], phrase.read(index, nums[index], sum), 'hash-read', { index, value: nums[index], sum });
      const target = sum - k;
      const matches = frequencies.get(target) ?? 0;
      addStep('compare', [index], phrase.query(target, k), 'hash-query', { index, sum, target, matches }, target);
      if (matches > 0) {
        result += matches;
        const starts = Array.from({ length: index + 1 }, (_, start) => start)
          .filter((start) => prefix[index + 1] - prefix[start] === k);
        starts.forEach((start) => ranges.push({ start, end: index, sum: k }));
        addStep('match', [index], phrase.hit(target, matches, k), 'hash-match', { index, sum, target, matches }, target);
      }
      frequencies.set(sum, (frequencies.get(sum) ?? 0) + 1);
      addStep('insert', [index], phrase.insert(sum), 'hash-insert', { index, sum, count: frequencies.get(sum) ?? 0 });
    }
    addStep('done', [], phrase.done(result, k), 'hash-done', { result });
    return steps;
  }

  addStep('init', [], algorithm === 'brute-force' ? phrase.initBrute : phrase.initPrefix, algorithm === 'brute-force' ? 'brute-init' : 'prefix-init', { target: k });
  for (let start = 0; start < nums.length; start++) {
    let running = 0;
    for (let end = start; end < nums.length; end++) {
      running += nums[end];
      const sum = algorithm === 'prefix-sum' ? prefix[end + 1] - prefix[start] : running;
      visited.add(end);
      const focus = start === end ? [end] : [start, end];
      const anchor = algorithm === 'prefix-sum' ? 'prefix-compare' : 'brute-extend';
      const candidate = { start, end, sum };
      addStep('compare', focus, algorithm === 'prefix-sum'
        ? phrase.prefixCompare(end, start, sum, k)
        : phrase.bruteCompare(start, end, sum), anchor, { start, end, sum }, undefined, candidate);
      if (sum === k) {
        result++;
        ranges.push({ start, end, sum });
        addStep('match', focus, phrase.matchRange(start, end, k), algorithm === 'prefix-sum' ? 'prefix-match' : 'brute-match', { start, end, sum }, undefined, candidate);
      }
    }
  }
  addStep('done', [], phrase.done(result, k), algorithm === 'prefix-sum' ? 'prefix-done' : 'brute-done', { result });
  return steps;
}
