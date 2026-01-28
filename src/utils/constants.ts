// 颜色常量
export const COLORS = {
  POSITIVE: '#3498db',
  NEGATIVE: '#e74c3c',
  ZERO: '#95a5a6',
  HIGHLIGHT: '#f1c40f',
  SUBARRAY: '#2ecc71',
  HASH_KEY: '#3498db',
  HASH_VALUE: '#9b59b6',
  POINTER: '#e74c3c',
  BACKGROUND: '#f8f9fa',
  BORDER: '#bdc3c7',
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  ELEMENT_WIDTH: 70,
  ELEMENT_HEIGHT: 70,
  ELEMENT_SPACING: 15,
  CHART_PADDING: 30,
  TRANSITION_DURATION: 400,
  PULSE_DURATION: 1000,
  FLASH_DURATION: 300,
  MAX_FRAME_TIME: 16, // 60fps
  MAX_HISTORY_FRAMES: 100,
} as const;

// 测试数据
export const TEST_DATA = {
  BASIC: {
    nums: [1, 2, 3, -2, 5, -3, 2, 1, -1, 4],
    k: 3,
    expectedCount: 9, // 正确答案：9个子数组和为3
  },
  SIMPLE: {
    nums: [1, 1, 1],
    k: 2,
    expectedCount: 2,
  },
  NEGATIVE: {
    nums: [1, -1, 0],
    k: 0,
    expectedCount: 3,
  },
  EMPTY: {
    nums: [] as number[],
    k: 0,
    expectedCount: 0,
  },
  LARGE: {
    nums: Array.from({ length: 1000 }, (_, i) => (i % 10) - 5),
    k: 5,
    expectedCount: -1, // to be calculated
  },
};

// 复杂度信息
export const COMPLEXITY_INFO = {
  'brute-force': {
    time: 'O(n²)',
    space: 'O(1)',
    description: '暴力解法：枚举所有子数组并计算和',
  },
  'prefix-sum': {
    time: 'O(n²)',
    space: 'O(n)',
    description: '前缀和优化：使用前缀和数组加速子数组和计算',
  },
  'hash-map': {
    time: 'O(n)',
    space: 'O(n)',
    description: '最优解：前缀和+哈希表，单次遍历',
  },
} as const;

// 初始测试数据
export const initialTestData = TEST_DATA.BASIC;
