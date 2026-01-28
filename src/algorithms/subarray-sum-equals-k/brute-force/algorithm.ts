import { AnimationState, BruteForceState } from '@/types';
import { createArrayElements, createAnnotation, getColorByValue, calculateSubarraySum } from '@/utils/animationUtils';
import { COLORS } from '@/utils/constants';

/**
 * 暴力解法算法实现
 * 时间复杂度: O(n²) (优化后) 或 O(n³) (未优化)
 * 空间复杂度: O(1)
 */
export class BruteForceAlgorithm {
  private nums: number[] = [];
  private k: number = 0;
  private currentStart: number = 0;
  private currentEnd: number = 0;
  private currentSum: number = 0;
  private count: number = 0;
  private validSubarrays: { start: number; end: number }[] = [];
  private stepCount: number = 0;

  /**
   * 初始化算法
   */
  initialize(nums: number[], k: number): AnimationState {
    this.nums = nums;
    this.k = k;
    this.currentStart = 0;
    this.currentEnd = 0;
    this.currentSum = nums.length > 0 ? nums[0] : 0;
    this.count = 0;
    this.validSubarrays = [];
    this.stepCount = 0;

    const arrayElements = createArrayElements(nums);

    return {
      arrayElements,
      algorithmType: 'brute-force',
      stepCount: 0,
      isComplete: nums.length === 0,
      kValue: k,
      totalCount: 0,
      annotations: [
        createAnnotation(
          '暴力解法：O(n²)时间复杂度，O(1)空间复杂度',
          { x: 50, y: 50 },
          true
        ),
        createAnnotation(
          '枚举所有可能的子数组，计算和并与k比较',
          { x: 50, y: 80 },
          true
        ),
      ],
      highlightedIndices: [],
      bruteForce: {
        currentStart: 0,
        currentEnd: 0,
        currentSum: this.currentSum,
        validSubarrays: [],
      },
      showPrefixSumTable: false,
      showHashTable: false,
    };
  }

  /**
   * 执行一步
   */
  step(currentState: AnimationState): AnimationState {
    if (this.currentStart >= this.nums.length) {
      return {
        ...currentState,
        isComplete: true,
        annotations: [
          ...currentState.annotations.filter((a) => a.persistent),
          createAnnotation(
            `算法完成！共找到${this.count}个和为${this.k}的子数组`,
            { x: 50, y: 110 },
            false
          ),
        ],
      };
    }

    // 检查当前子数组的和
    if (this.currentSum === this.k) {
      this.count++;
      this.validSubarrays.push({
        start: this.currentStart,
        end: this.currentEnd,
      });
    }

    // 高亮当前子数组
    const arrayElements = currentState.arrayElements.map((el, idx) => ({
      ...el,
      highlight: idx >= this.currentStart && idx <= this.currentEnd,
      color:
        idx >= this.currentStart && idx <= this.currentEnd
          ? this.currentSum === this.k
            ? COLORS.SUBARRAY
            : COLORS.HIGHLIGHT
          : getColorByValue(el.value),
    }));

    this.stepCount++;

    // 移动到下一个子数组
    this.currentEnd++;
    if (this.currentEnd >= this.nums.length) {
      this.currentStart++;
      this.currentEnd = this.currentStart;
      if (this.currentStart < this.nums.length) {
        this.currentSum = this.nums[this.currentStart];
      }
    } else {
      this.currentSum += this.nums[this.currentEnd];
    }

    return {
      ...currentState,
      arrayElements,
      stepCount: this.stepCount,
      totalCount: this.count,
      annotations: [
        ...currentState.annotations.filter((a) => a.persistent),
        createAnnotation(
          `当前子数组：[${this.currentStart}, ${this.currentEnd - 1}]`,
          { x: 300, y: 250 },
          false
        ),
        createAnnotation(
          `子数组和 = ${this.currentSum - this.nums[this.currentEnd] || 0}`,
          { x: 300, y: 280 },
          false
        ),
        this.currentSum - this.nums[this.currentEnd] === this.k
          ? createAnnotation(`找到一个子数组！`, { x: 300, y: 310 }, false)
          : createAnnotation('', { x: 0, y: 0 }, false),
      ],
      bruteForce: {
        currentStart: this.currentStart,
        currentEnd: this.currentEnd - 1,
        currentSum: this.currentSum - this.nums[this.currentEnd] || 0,
        validSubarrays: [...this.validSubarrays],
      },
      highlightedIndices: Array.from(
        { length: this.currentEnd - this.currentStart },
        (_, i) => this.currentStart + i
      ),
    };
  }

  /**
   * 执行完整算法
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
    this.currentStart = 0;
    this.currentEnd = 0;
    this.currentSum = this.nums.length > 0 ? this.nums[0] : 0;
    this.count = 0;
    this.validSubarrays = [];
    this.stepCount = 0;
  }
}

/**
 * 工厂函数
 */
export function createBruteForceAlgorithm(): BruteForceAlgorithm {
  return new BruteForceAlgorithm();
}
