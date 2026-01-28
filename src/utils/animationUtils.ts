import { ArrayElement, AnimationState } from '@/types';
import { COLORS, ANIMATION_CONFIG } from './constants';

/**
 * 根据数值获取颜色
 */
export function getColorByValue(value: number): string {
  if (value > 0) return COLORS.POSITIVE;
  if (value < 0) return COLORS.NEGATIVE;
  return COLORS.ZERO;
}

/**
 * 创建数组元素
 */
export function createArrayElements(nums: number[]): ArrayElement[] {
  return nums.map((value, index) => ({
    value,
    index,
    color: getColorByValue(value),
    position: {
      x: ANIMATION_CONFIG.CHART_PADDING + index * (ANIMATION_CONFIG.ELEMENT_WIDTH + ANIMATION_CONFIG.ELEMENT_SPACING),
      y: 200,
    },
    size: {
      width: ANIMATION_CONFIG.ELEMENT_WIDTH,
      height: ANIMATION_CONFIG.ELEMENT_HEIGHT,
    },
    highlight: false,
    isSelected: false,
    animationProps: {
      opacity: 1,
      scale: 1,
      rotation: 0,
    },
  }));
}

/**
 * 高亮指定范围的元素
 */
export function highlightElements(
  elements: ArrayElement[],
  start: number,
  end: number,
  color: string = COLORS.HIGHLIGHT
): ArrayElement[] {
  return elements.map((el, idx) => ({
    ...el,
    highlight: idx >= start && idx <= end,
    color: idx >= start && idx <= end ? color : getColorByValue(el.value),
  }));
}

/**
 * 测量动画帧时间
 */
export function measureAnimationFrameTime(operation: () => void): number {
  const start = performance.now();
  operation();
  const end = performance.now();
  return end - start;
}

/**
 * 估算内存使用（简化版）
 */
export function estimateMemoryUsage(data: unknown): number {
  const jsonString = JSON.stringify(data);
  // 粗略估算：每个字符约2字节
  return (jsonString.length * 2) / (1024 * 1024); // 返回MB
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 序列化Map对象
 */
export function serializeMap<K, V>(map: Map<K, V>): [K, V][] {
  return Array.from(map.entries());
}

/**
 * 反序列化Map对象
 */
export function deserializeMap<K, V>(entries: [K, V][]): Map<K, V> {
  return new Map(entries);
}

/**
 * 计算子数组和
 */
export function calculateSubarraySum(nums: number[], start: number, end: number): number {
  let sum = 0;
  for (let i = start; i <= end && i < nums.length; i++) {
    sum += nums[i];
  }
  return sum;
}

/**
 * 创建注释对象
 */
export function createAnnotation(
  text: string,
  position: { x: number; y: number },
  persistent: boolean = false
) {
  return {
    id: generateId(),
    text,
    position,
    persistent,
  };
}
