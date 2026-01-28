import { AnimationState, HashMapState, ArrayElement } from '@/types';
import { createArrayElements, createAnnotation, getColorByValue } from '@/utils/animationUtils';
import { COLORS } from '@/utils/constants';

/**
 * 前缀和+哈希表算法实现
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 */
export class HashMapAlgorithm {
  private nums: number[] = [];
  private k: number = 0;
  private currentIndex: number = 0;
  private prefixSum: number = 0;
  private count: number = 0;
  private hashMap: Map<number, number> = new Map();
  private validSubarrays: { start: number; end: number }[] = [];
  private stepCount: number = 0;

  /**
   * 初始化算法
   */
  initialize(nums: number[], k: number): AnimationState {
    this.nums = nums;
    this.k = k;
    this.currentIndex = 0;
    this.prefixSum = 0;
    this.count = 0;
    this.hashMap = new Map([[0, 1]]); // 初始化哈希表，前缀和0出现1次
    this.validSubarrays = [];
    this.stepCount = 0;

    const arrayElements = createArrayElements(nums);

    return {
      arrayElements,
      algorithmType: 'hash-map',
      stepCount: 0,
      isComplete: nums.length === 0,
      kValue: k,
      totalCount: 0,
      annotations: [
        createAnnotation(
          '前缀和+哈希表解法：O(n)时间复杂度，O(n)空间复杂度',
          { x: 50, y: 50 },
          true
        ),
        createAnnotation(
          '核心思想：sum(i,j) = prefix[j] - prefix[i-1] = k',
          { x: 50, y: 80 },
          true
        ),
        createAnnotation(
          '初始化哈希表：{0: 1}，表示前缀和0出现1次',
          { x: 400, y: 320 },
          true
        ),
      ],
      highlightedIndices: [],
      hashMap: {
        prefixSum: 0,
        currentSum: 0,
        hashMap: new Map([[0, 1]]),
        validSubarrays: [],
        currentKey: 0,
        targetKey: 0,
      },
      showPrefixSumTable: false,
      showHashTable: true,
    };
  }

  /**
   * 执行一步
   */
  step(currentState: AnimationState): AnimationState {
    if (this.currentIndex >= this.nums.length) {
      return {
        ...currentState,
        isComplete: true,
        annotations: [
          ...currentState.annotations.filter((a) => a.persistent),
          createAnnotation(
            `算法完成！共找到${this.count}个和为${this.k}的子数组`,
            { x: 50, y: 100 },
            false
          ),
          createAnnotation(
            `时间复杂度: O(n)，只需遍历数组一次`,
            { x: 50, y: 130 },
            false
          ),
          createAnnotation(
            `空间复杂度: O(n)，哈希表最坏情况下存储n个前缀和`,
            { x: 50, y: 160 },
            false
          ),
        ],
      };
    }

    const currentNum = this.nums[this.currentIndex];
    this.prefixSum += currentNum;
    const target = this.prefixSum - this.k;

    // 检查哈希表中是否存在target
    const targetCount = this.hashMap.get(target) || 0;
    this.count += targetCount;

    // 找到所有匹配的子数组（简化版，只记录数量）
    if (targetCount > 0) {
      // 这里我们简化处理，只记录当前索引作为结束位置
      // 实际的起始位置可以通过反向查找哈希表得到
      this.validSubarrays.push({
        start: 0, // 简化处理
        end: this.currentIndex,
      });
    }

    // 更新哈希表
    this.hashMap.set(this.prefixSum, (this.hashMap.get(this.prefixSum) || 0) + 1);

    // 高亮当前元素
    const arrayElements = currentState.arrayElements.map((el, idx) => ({
      ...el,
      highlight: idx === this.currentIndex,
      color: idx === this.currentIndex ? COLORS.HIGHLIGHT : getColorByValue(el.value),
    }));

    this.stepCount++;
    this.currentIndex++;

    return {
      ...currentState,
      arrayElements,
      stepCount: this.stepCount,
      totalCount: this.count,
      annotations: [
        ...currentState.annotations.filter((a) => a.persistent),
        createAnnotation(`当前前缀和 = ${this.prefixSum}`, { x: 300, y: 250 }, false),
        createAnnotation(
          `查询 target = ${this.prefixSum} - ${this.k} = ${target}${targetCount > 0 ? `，找到${targetCount}次` : '，未找到'}`,
          { x: 300, y: 280 },
          false
        ),
        targetCount > 0
          ? createAnnotation(`找到${targetCount}个子数组`, { x: 300, y: 310 }, false)
          : createAnnotation('', { x: 0, y: 0 }, false),
        createAnnotation(
          `更新哈希表：添加/更新前缀和${this.prefixSum}`,
          { x: 400, y: 350 },
          false
        ),
      ],
      hashMap: {
        prefixSum: this.prefixSum,
        currentSum: this.prefixSum,
        hashMap: new Map(this.hashMap),
        validSubarrays: [...this.validSubarrays],
        currentKey: this.prefixSum,
        targetKey: target,
      },
      highlightedIndices: [this.currentIndex - 1],
    };
  }

  /**
   * 执行完整算法（用于测试）
   */
  execute(nums: number[], k: number): { count: number; steps: number } {
    let state = this.initialize(nums, k);

    while (!state.isComplete) {
      state = this.step(state);
    }

    return {
      count: this.count,
      steps: this.stepCount,
    };
  }

  /**
   * 重置算法
   */
  reset(): void {
    this.currentIndex = 0;
    this.prefixSum = 0;
    this.count = 0;
    this.hashMap = new Map([[0, 1]]);
    this.validSubarrays = [];
    this.stepCount = 0;
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): {
    currentIndex: number;
    prefixSum: number;
    count: number;
    hashMap: Map<number, number>;
  } {
    return {
      currentIndex: this.currentIndex,
      prefixSum: this.prefixSum,
      count: this.count,
      hashMap: new Map(this.hashMap),
    };
  }
}

/**
 * 工厂函数：创建哈希表算法实例
 */
export function createHashMapAlgorithm(): HashMapAlgorithm {
  return new HashMapAlgorithm();
}
