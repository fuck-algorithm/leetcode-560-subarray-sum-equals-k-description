import type { ReactNode } from 'react';

// 核心数据类型
export interface ArrayElement {
  value: number;
  index: number;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  highlight: boolean;
  isSelected: boolean;
  animationProps?: {
    opacity?: number;
    scale?: number;
    rotation?: number;
  };
}

export interface PrefixSumElement {
  value: number;
  index: number;
  isCurrent: boolean;
  color: string;
}

export interface HashTableEntry {
  key: number; // prefix sum value
  count: number; // frequency
  isCurrent: boolean;
  lastAccessed: boolean;
}

// 算法特定状态
export interface BruteForceState {
  currentStart: number;
  currentEnd: number;
  currentSum: number;
  validSubarrays: { start: number; end: number }[];
}

export interface PrefixSumState {
  prefixSums: number[];
  currentI: number;
  currentJ: number;
  validSubarrays: { start: number; end: number }[];
}

export interface HashMapState {
  prefixSum: number;
  currentSum: number;
  hashMap: Map<number, number>; // key: prefix sum, value: count
  validSubarrays: { start: number; end: number }[];
  currentKey: number;
  targetKey: number;
}

// 通用动画状态
export interface AnimationState {
  arrayElements: ArrayElement[];
  algorithmType: 'brute-force' | 'prefix-sum' | 'hash-map';
  stepCount: number;
  isComplete: boolean;
  kValue: number;
  totalCount: number;
  annotations: {
    text: string;
    position: { x: number; y: number };
    persistent: boolean;
    id: string;
  }[];
  highlightedIndices: number[];
  // 算法特定状态
  bruteForce?: BruteForceState;
  prefixSum?: PrefixSumState;
  hashMap?: HashMapState;
  // 可视化控制
  showPrefixSumTable: boolean;
  showHashTable: boolean;
}

// Redux状态
export interface SubarraySumState {
  currentAlgorithm: 'brute-force' | 'prefix-sum' | 'hash-map';
  animationState: AnimationState;
  playbackSpeed: number; // 0.5x to 2x
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  inputData: {
    nums: number[];
    k: number;
  };
  history: AnimationState[];
  timeComplexity: string;
  spaceComplexity: string;
}

// Action类型
export type AlgorithmAction =
  | { type: 'SET_ALGORITHM'; payload: 'brute-force' | 'prefix-sum' | 'hash-map' }
  | { type: 'START_ANIMATION' }
  | { type: 'PAUSE_ANIMATION' }
  | { type: 'RESET_ANIMATION'; payload: { nums: number[]; k: number } }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'UPDATE_STATE'; payload: AnimationState }
  | { type: 'SET_INPUT_DATA'; payload: { nums: number[]; k: number } }
  | { type: 'UPDATE_COMPLEXITY'; payload: { time: string; space: string } };

// 自定义算法配置
export interface CustomAlgorithmConfig {
  onFrameUpdate?: (state: AnimationState) => void;
  onAlgorithmComplete?: (result: AlgorithmResult) => void;
  customVisualization?: (element: ArrayElement, state: AnimationState) => ReactNode;
  comparisonFunction?: (a: number, b: number) => boolean;
  animationSpeed?: number;
  enableDebugMode?: boolean;
}

export interface AlgorithmResult {
  count: number;
  subarrays: { start: number; end: number }[];
  timeComplexity: string;
  spaceComplexity: string;
}

// Hook返回类型
export interface AlgorithmHookResult {
  currentState: AnimationState;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  setAlgorithmType: (type: 'brute-force' | 'prefix-sum' | 'hash-map') => void;
  updateInputData: (nums: number[], k: number) => void;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
}
