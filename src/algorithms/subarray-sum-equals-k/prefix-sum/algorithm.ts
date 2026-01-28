import { AnimationState, PrefixSumState } from '@/types';
import { createArrayElements, createAnnotation, getColorByValue } from '@/utils/animationUtils';
import { COLORS } from '@/utils/constants';

/**
 * 前缀和算法实现
 * 时间复杂度: O(n²)
 * 空间复杂度: O(n)
 */
export class PrefixSumAlgorithm {
  private nums: number[] = [];
  private k: number = 0;
  private prefixSums: number[] = [];
  private currentI: number = 0;
  private currentJ: number = 0;
  private count: number = 0;
  private validSubarrays: { start: number; end: number }[] = [];
  private stepCount: number = 0;

  /**
   * 初始化算法
   */
  initialize(nums: number[], k: number): AnimationState {
    this.nums = nums;
    this.k = k;
    this.currentI = 0;
    this.currentJ = 0;
    this.count = 0;
    this.validSubarrays = [];
    this.stepCount = 0;

    // 计算前缀和数组
    this.prefixSums = [0];
    for (let i = 0; i < nums.length; i++) {
      this.prefixSums.push(this.prefixSums[i] + nums[i]);
    }

    const arrayElements = createArrayElements(nums);

    return {
      arrayElements,
      algorithmType: 'prefix-sum',
      stepCount: 0,
      isComplete: nums.length === 0,
      kValue: k,
      totalCount: 0,
      annotations: [
        createAnnotation(
          '前缀和解法：O(n²)时间复杂度，O(n)空间复杂度',
          { x: 50, y: 50 },
          true
        ),
        createAnnotation(
          '核心思想：sum(i,j) = prefix[j+1] - prefix[i]',
          { x: 50, y: 80 },
          true
        ),
        createAnnotation(
          `前缀和数组已计算：[${this.prefixSums.join(', ')}]`,
          { x: 50, y: 110 },
          true
        ),
      ],
      highlightedIndices: [],
      prefixSum: {
        prefixSums: [...this.prefixSums],
        currentI: 0,
        currentJ: 0,
        validSubarrays: [],
      },
      showPrefixSumTable: true,
      showHashTable: false,
    };
  }

  /**
   * 执行一步
   */
  step(currentState: AnimationState): AnimationState {
    // 双重循环遍历所有子数组
    if (this.currentI >= this.nums.length) {
      return {
        ...currentState,
        isComplete: true,
        annotations: [
          ...currentState.annotations.filter((a) => a.persistent),
          createAnnotation(
            `算法完成！共找到${this.count}个和为${this.k}的子数组`,
            { x: 50, y: 140 },
            false
          ),
        ],
      };
    }

    // 使用前缀和计算子数组和：sum(i, j) = prefix[j+1] - prefix[i]
    const subarraySum = this.prefixSums[this.currentJ + 1] - this.prefixSums[this.currentI];

    if (subarraySum === this.k) {
      this.count++;
      this.validSubarrays.push({
        start: this.currentI,
        end: this.currentJ,
      });
    }

    // 高亮当前处理的子数组
    const arrayElements = currentState.arrayElements.map((el, idx) => ({
      ...el,
      highlight: idx >= this.currentI && idx <= this.currentJ,
      color:
        idx >= this.currentI && idx <= this.currentJ
          ? subarraySum === this.k
            ? COLORS.SUBARRAY
            : COLORS.HIGHLIGHT
          : getColorByValue(el.value),
    }));

    this.stepCount++;

    // 移动到下一个位置
    this.currentJ++;
    if (this.currentJ >= this.nums.length) {
      this.currentI++;
      this.currentJ = this.currentI;
    }

    return {
      ...currentState,
      arrayElements,
      stepCount: this.stepCount,
      totalCount: this.count,
      annotations: [
        ...currentState.annotations.filter((a) => a.persistent),
        createAnnotation(
          `当前子数组：[${this.currentI}, ${this.currentJ - 1}]`,
          { x: 300, y: 250 },
          false
        ),
        createAnnotation(
          `子数组和 = prefix[${this.currentJ}] - prefix[${this.currentI}] = ${subarraySum}`,
          { x: 300, y: 280 },
          false
        ),
        subarraySum === this.k
          ? createAnnotation(`找到一个子数组！`, { x: 300, y: 310 }, false)
          : createAnnotation('', { x: 0, y: 0 }, false),
      ],
      prefixSum: {
        prefixSums: [...this.prefixSums],
        currentI: this.currentI,
        currentJ: this.currentJ - 1,
        validSubarrays: [...this.validSubarrays],
      },
      highlightedIndices: Array.from(
        { length: this.currentJ - this.currentI },
        (_, i) => this.currentI + i
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
    this.currentI = 0;
    this.currentJ = 0;
    this.count = 0;
    this.validSubarrays = [];
    this.stepCount = 0;
  }
}

/**
 * 工厂函数
 */
export function createPrefixSumAlgorithm(): PrefixSumAlgorithm {
  return new PrefixSumAlgorithm();
}
