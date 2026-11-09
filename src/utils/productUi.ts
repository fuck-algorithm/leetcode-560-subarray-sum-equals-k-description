import type { AlgorithmType } from '@/types';

type Locale = 'en' | 'zh-CN';

export const UI_TEXT = {
  en: {
    hot100: '← Hot 100', problem: 'LeetCode 560: Subarray Sum Equals K', ideas: 'Idea', github: 'GitHub',
    array: 'Array', target: 'Target K', input: 'nums / k', sample: 'Sample', random: 'Random',
    invalid: 'Enter 1–8 integers from -100 to 100. Format: 1, -1, 2; k=2',
    canvas: 'Algorithm canvas', code: 'Solution code', watch: 'Variables', step: 'Step',
    current: 'Current', compare: 'Compare / lookup', visited: 'Visited', done: 'Answer', idle: 'Unprocessed / absent',
    index: 'Index', result: 'Count', ranges: 'Matched ranges',
    back: 'Previous', play: 'Play', pause: 'Pause', next: 'Next', reset: 'Reset', speed: 'Speed',
    close: 'Close', ideaTitle: 'Core idea', ideaBody: 'A running prefix sum lets us detect a target-sum interval by looking up prefixSum − k. Record each prefix only after the lookup, so an interval cannot reuse its own endpoint.',
    loading: 'Loading stars…', stars: 'stars', answer: 'answer', storage: 'Preferences could not be saved in this browser.',
    language: 'Language', codeLanguage: 'Code language', complexity: 'Time / space', qrAlt: 'Community QR code', community: 'Community',
  },
  'zh-CN': {
    hot100: '← Hot 100', problem: 'LeetCode 560：和为 K 的子数组', ideas: '思路', github: 'GitHub',
    array: '数组', target: '目标 K', input: '输入 nums / k', sample: '样例', random: '随机',
    invalid: '请输入 1–8 个 -100 到 100 的整数，格式：1, -1, 2; k=2',
    canvas: '算法画布', code: '解法代码', watch: '变量观察', step: '步骤',
    current: '当前焦点', compare: '比较 / 查询', visited: '已访问', done: '答案区间', idle: '未处理 / 不存在',
    index: '索引', result: '累计答案', ranges: '命中区间',
    back: '上一步', play: '播放', pause: '暂停', next: '下一步', reset: '重置', speed: '速度',
    close: '关闭', ideaTitle: '核心思路', ideaBody: '遍历时维护前缀和。若此前出现过 prefixSum − k，就说明两者之间的连续区间和为 k。先查询再记录当前前缀和，避免区间重复使用当前端点。',
    loading: '正在读取 Star…', stars: 'Star', answer: '命中答案', storage: '当前浏览器无法保存偏好设置。',
    language: '界面语言', codeLanguage: '代码语言', complexity: '时间 / 空间复杂度', qrAlt: '交流群二维码', community: '交流群',
  },
} satisfies Record<Locale, Record<string, string>>;

export type UiLocale = Locale;
export type CodeLanguage = 'java' | 'python' | 'go' | 'javascript';
export const CODE_LANGUAGE_LABEL: Record<CodeLanguage, string> = { java: 'Java', python: 'Python', go: 'Go', javascript: 'JavaScript' };

const implementations: Record<CodeLanguage, Record<AlgorithmType, string[]>> = {
  java: {
    'brute-force': ['int count = 0;', 'for (int left = 0; left < nums.length; left++) {', '  int sum = 0;', '  for (int right = left; right < nums.length; right++) {', '    sum += nums[right];', '    if (sum == k) count++;', 'return count;'],
    'prefix-sum': ['int[] prefix = buildPrefix(nums);', 'for (int left = 0; left < nums.length; left++) {', '  for (int right = left; right < nums.length; right++) {', '    int sum = prefix[right + 1] - prefix[left];', '    if (sum == k) count++;', 'return count;'],
    'hash-map': ['Map<Integer, Integer> freq = new HashMap<>();', 'freq.put(0, 1);', 'for (int value : nums) {', '  prefix += value;', '  count += freq.getOrDefault(prefix - k, 0);', '  freq.merge(prefix, 1, Integer::sum);', 'return count;'],
  },
  python: {
    'brute-force': ['count = 0', 'for left in range(len(nums)):', '    total = 0', '    for right in range(left, len(nums)):', '        total += nums[right]', '        if total == k: count += 1', 'return count'],
    'prefix-sum': ['prefix = build_prefix(nums)', 'for left in range(len(nums)):', '    for right in range(left, len(nums)):', '        total = prefix[right + 1] - prefix[left]', '        if total == k: count += 1', 'return count'],
    'hash-map': ['freq = {0: 1}', 'prefix = count = 0', 'for value in nums:', '    prefix += value', '    count += freq.get(prefix - k, 0)', '    freq[prefix] = freq.get(prefix, 0) + 1', 'return count'],
  },
  go: {
    'brute-force': ['count := 0', 'for left := range nums {', '    sum := 0', '    for right := left; right < len(nums); right++ {', '        sum += nums[right]', '        if sum == k { count++ }', 'return count'],
    'prefix-sum': ['prefix := buildPrefix(nums)', 'for left := range nums {', '    for right := left; right < len(nums); right++ {', '        sum := prefix[right+1] - prefix[left]', '        if sum == k { count++ }', 'return count'],
    'hash-map': ['freq := map[int]int{0: 1}', 'prefix, count := 0, 0', 'for _, value := range nums {', '    prefix += value', '    count += freq[prefix-k]', '    freq[prefix]++', 'return count'],
  },
  javascript: {
    'brute-force': ['let count = 0;', 'for (let left = 0; left < nums.length; left++) {', '  let sum = 0;', '  for (let right = left; right < nums.length; right++) {', '    sum += nums[right];', '    if (sum === k) count++;', 'return count;'],
    'prefix-sum': ['const prefix = buildPrefix(nums);', 'for (let left = 0; left < nums.length; left++) {', '  for (let right = left; right < nums.length; right++) {', '    const sum = prefix[right + 1] - prefix[left];', '    if (sum === k) count++;', 'return count;'],
    'hash-map': ['const freq = new Map([[0, 1]]);', 'let prefix = 0, count = 0;', 'for (const value of nums) {', '  prefix += value;', '  count += freq.get(prefix - k) ?? 0;', '  freq.set(prefix, (freq.get(prefix) ?? 0) + 1);', 'return count;'],
  },
};

const anchorByLine: Record<AlgorithmType, string[]> = {
  'brute-force': ['brute-init', 'brute-extend', 'brute-extend', 'brute-extend', 'brute-extend', 'brute-match', 'brute-done'],
  'prefix-sum': ['prefix-init', 'prefix-compare', 'prefix-compare', 'prefix-compare', 'prefix-match', 'prefix-done'],
  'hash-map': ['hash-init', 'hash-init', 'hash-read', 'hash-read', 'hash-query', 'hash-insert', 'hash-done'],
};
export function codeLines(language: CodeLanguage, algorithm: AlgorithmType) {
  return implementations[language][algorithm].map((text, index) => ({ anchor: anchorByLine[algorithm][index] ?? anchorByLine[algorithm].at(-1)!, text }));
}
