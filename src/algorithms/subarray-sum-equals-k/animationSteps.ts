import type { AlgorithmType } from '@/types';
import type { UiLocale } from '@/utils/productUi';
import { verticalNodeEdge } from '@/utils/arrowGeometry';

export type StepOperation = 'init' | 'inspect' | 'read' | 'compare' | 'lookup' | 'match' | 'insert' | 'done';
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
  width?: number;
  height?: number;
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
    arrows: { id: string; fromId: string; toId: string; text: string; kind: 'data-flow'; route: 'rounded-elbow'; from?: never; to?: never }[];
    ranges: StepRange[];
    candidate?: StepRange;
    result: number;
    metrics: { label: string; value: string }[];
  };
}

export function buildAlgorithmSteps(algorithm: AlgorithmType, nums: number[], k: number, locale: UiLocale = 'zh-CN'): AlgorithmStep[] {
  const phrase = locale === 'en' ? {
    initBrute: 'Enumerate contiguous ranges and extend each right boundary to maintain the running sum.',
    notFound: (target: number, kValue: number) => `No earlier prefix ${target} exists, so the current prefix cannot form a range summing to ${kValue} yet.`,
    recordHits: (matches: number, target: number, count: number) => `Record ${matches} matches for prior prefix ${target}; the total answer count is now ${count}.`,
    operation: ['Initialize', 'Inspect', 'Read', 'Compare', 'Lookup', 'Match', 'Record', 'Done'],
    initPrefix: 'Build prefix sums so any contiguous range is computed by subtracting two boundaries.',
    initHash: 'Seed prefix sum 0 with frequency 1 because a range may start at the first array element.',
    read: (index: number, value: number, sum: number) => `Read nums[${index}]=${value} and add it to the prefix total to get ${sum}.`,
    inspect: (index: number, value: number) => `Inspect nums[${index}]=${value} before changing the running total, so the input value and accumulated state stay distinct.`,
    prefixStart: 'Start with prefix[0]=0; each next prefix value will add exactly one array element.',
    prefixBuild: (index: number, _value: number, total: number) => `Build prefix[${index + 1}] = prefix[${index}] + nums[${index}] = ${total}, recording the boundary after this value.`,
    extend: (left: number, right: number, value: number, sum: number) => `Extend [${left},${right}] with nums[${right}]=${value}; the running sum is now ${sum}, ready for comparison with k.`,
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
    notFound: (target: number, kValue: number) => `没有历史前缀和 ${target}，当前前缀暂时无法配出目标 ${kValue}。`,
    recordHits: (matches: number, target: number, count: number) => `记录由历史前缀和 ${target} 命中的 ${matches} 个区间，答案总数更新为 ${count}。`,
    operation: ['初始化', '检查', '读取', '比较', '查询', '命中', '记录', '完成'],
    initPrefix: '先构造前缀和数组，使任一区间和都能由两个前缀相减得到。',
    inspect: (index: number, value: number) => `先读取 nums[${index}]=${value}，再决定如何扩展区间，避免把输入值和当前累计和混淆。`,
    prefixStart: '建立边界 prefix[0]=0；之后每读入一个元素，就生成下一个前缀和。',
    prefixBuild: (index: number, _value: number, total: number) => `计算 prefix[${index + 1}] = prefix[${index}] + nums[${index}] = ${total}，记录该元素之后的边界。`,
    initHash: '先将前缀和 0 记录一次，因为从数组开头就能构成目标和。',
    read: (index: number, value: number, sum: number) => `读取 nums[${index}]=${value} 并累加，得到前缀和 ${sum}。`,
    extend: (left: number, right: number, value: number, sum: number) => `将 nums[${right}]=${value} 加入区间 [${left},${right}]，当前和变为 ${sum}，接下来判断是否等于 k。`,
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
    init: phrase.operation[0], inspect: phrase.operation[1], read: phrase.operation[2], compare: phrase.operation[3], lookup: phrase.operation[4], match: phrase.operation[5], insert: phrase.operation[6], done: phrase.operation[7],
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
  let visiblePrefixCount = 0;
  const arrayPitch = nums.length === 1 ? 0 : Math.min(220, 1040 / (nums.length - 1));
  const prefixPitch = Math.min(220, 1040 / nums.length);
  const arrayCenterX = 600;
  const arrayY = algorithm === 'prefix-sum' ? 220 : 250;
  const prefixY = 360;
  const hashX = 600;
  const hashY = 412;
  const hashColumns = 3;
  const arrayWidth = 72;
  const hashWidth = 84;
  const prefixWidth = 92;
  const hashSlotPitchX = 112;
  const hashSlotPitchY = 54;

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
      y: arrayY,
      width: arrayWidth,
      height: 48,
      status: operation === 'inspect' && focus.includes(index) ? 'current' : algorithm === 'prefix-sum' && operation === 'compare' ? 'idle' : focus.includes(index) ? resolveArrayStatus(algorithm, operation, index, focus) : visited.has(index) ? 'visited' : 'idle',
      badge: String(index),
    }));
    if (algorithm === 'prefix-sum') {
      for (let index = 0; index < visiblePrefixCount; index++) {
        nodes.push({
          id: `prefix-${index}`,
          label: `P${index}=${prefix[index]}`,
          x: arrayCenterX + (index - (visiblePrefixCount - 1) / 2) * prefixPitch,
          y: prefixY,
          width: prefixWidth,
          height: 48,
          status: operation === 'compare' && candidate && (index === candidate.start || index === candidate.end + 1) ? 'compare' : 'idle',
          badge: `P${index}`,
        });
      }
    }
    if (algorithm === 'hash-map') {
      const visibleKeys = new Set(frequencies.keys());
      if (targetPrefix !== undefined && (operation === 'lookup' || operation === 'compare' || operation === 'match')) visibleKeys.add(targetPrefix);
      Array.from(visibleKeys).forEach((key) => {
        const slot = hashPositions.get(key) ?? hashPositions.size;
        hashPositions.set(key, slot);
        const count = frequencies.get(key) ?? 0;
        nodes.push({
          id: `hash-${key}`,
          label: `${key} × ${count}`,
          x: hashX + (slot % hashColumns - (hashColumns - 1) / 2) * hashSlotPitchX,
          y: hashY + Math.floor(slot / hashColumns) * hashSlotPitchY,
          width: hashWidth,
          height: 48,
          status: key === targetPrefix && operation === 'lookup' && count > 0 ? 'compare' : operation === 'match' && key === targetPrefix ? 'done' : operation === 'insert' && key === variables.sum ? 'current' : count === 0 ? 'idle' : 'visited',
          badge: key === targetPrefix ? 'sum−k' : 'sum',
        });
      });
    }
    const current = focus.length > 0 ? nodes.find((node) => node.id === `array-${focus[0]}`) : undefined;
    const targetNode = algorithm === 'hash-map' && targetPrefix !== undefined ? nodes.find((node) => node.id === `hash-${targetPrefix}`) : undefined;
    const pendingHashNode = algorithm === 'hash-map' && operation === 'insert' ? nodes.find((node) => node.id === `hash-${variables.sum}`) : undefined;
    const arrowTargetNode = operation === 'lookup' ? targetNode : operation === 'insert' ? pendingHashNode : undefined;
    steps.push({
      id: steps.length,
      title: operationLabels[operation],
      description: narration,
      operation,
      narration,
      binding: { anchorIds: [anchor], variables },
      frame: {
        nodes,
        arrows: current && arrowTargetNode ? [{ id: `flow-${steps.length}-${current.id}-${arrowTargetNode.id}`, fromId: current.id, toId: arrowTargetNode.id, kind: 'data-flow', route: 'rounded-elbow', text: locale === 'en' ? operation === 'lookup' ? `Lookup ${targetPrefix}` : `Store ${variables.sum}` : operation === 'lookup' ? `查找 ${targetPrefix}` : `记录 ${variables.sum}` }] : [],
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
      addStep('inspect', [index], phrase.inspect(index, nums[index]), 'hash-read', { index, value: nums[index], sum });
      sum += nums[index];
      visited.add(index);
      addStep('read', [index], phrase.read(index, nums[index], sum), 'hash-prefix', { index, value: nums[index], sum });
      const target = sum - k;
      const matches = frequencies.get(target) ?? 0;
      addStep('lookup', [index], phrase.query(target, k), 'hash-query', { index, sum, target, matches }, target);
      if (matches === 0) {
        addStep('compare', [index], phrase.notFound(target, k), 'hash-query', { index, sum, target, matches }, target);
      }
      if (matches > 0) {
        addStep('match', [index], phrase.hit(target, matches, k), 'hash-match', { index, sum, target, matches }, target);
        result += matches;
        const starts = Array.from({ length: index + 1 }, (_, start) => start)
          .filter((start) => prefix[index + 1] - prefix[start] === k);
        starts.forEach((start) => ranges.push({ start, end: index, sum: k }));
        addStep('read', [index], phrase.recordHits(matches, target, result), 'hash-query', { index, sum, target, matches, result });
      }
      frequencies.set(sum, (frequencies.get(sum) ?? 0) + 1);
      addStep('insert', [index], phrase.insert(sum), 'hash-insert', { index, sum, count: frequencies.get(sum) ?? 0 });
    }
    addStep('done', [], phrase.done(result, k), 'hash-done', { result });
    return steps;
  }

  if (algorithm === 'brute-force') addStep('init', [], phrase.initBrute, 'brute-init', { target: k });
  if (algorithm === 'prefix-sum') {
    visiblePrefixCount = 1;
    addStep('init', [], phrase.prefixStart, 'prefix-init', { prefixIndex: 0, prefix: 0 });
    for (let index = 0; index < nums.length; index++) {
      addStep('inspect', [index], phrase.inspect(index, nums[index]), 'prefix-init', { index, value: nums[index], prefix: prefix[index] });
      visiblePrefixCount = index + 2;
      addStep('read', [index], phrase.prefixBuild(index, nums[index], prefix[index + 1]), 'prefix-init', { index, value: nums[index], prefix: prefix[index], nextPrefix: prefix[index + 1] });
    }
  }
  for (let start = 0; start < nums.length; start++) {
    let running = 0;
    for (let end = start; end < nums.length; end++) {
      running += nums[end];
      const sum = algorithm === 'prefix-sum' ? prefix[end + 1] - prefix[start] : running;
      visited.add(end);
      const focus = start === end ? [end] : [start, end];
      const anchor = algorithm === 'prefix-sum' ? 'prefix-compare' : 'brute-extend';
      const candidate = { start, end, sum };
      if (algorithm === 'brute-force') {
        addStep('inspect', [end], phrase.inspect(end, nums[end]), 'brute-extend', { start, end, value: nums[end], sum: sum - nums[end] });
        addStep('read', [end], phrase.extend(start, end, nums[end], sum), 'brute-extend', { start, end, value: nums[end], sum }, undefined, candidate);
      }
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
