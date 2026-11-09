import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { SubarraySumState, AnimationState } from '@/types';
import { createHashMapAlgorithm } from '@/algorithms/subarray-sum-equals-k/hash-map/algorithm';
import { createPrefixSumAlgorithm } from '@/algorithms/subarray-sum-equals-k/prefix-sum/algorithm';
import { createBruteForceAlgorithm } from '@/algorithms/subarray-sum-equals-k/brute-force/algorithm';
import { TEST_DATA, COMPLEXITY_INFO } from '@/utils/constants';

// 算法实例
const algorithms = {
  'hash-map': createHashMapAlgorithm(),
  'prefix-sum': createPrefixSumAlgorithm(),
  'brute-force': createBruteForceAlgorithm(),
};

const initialState: SubarraySumState = {
  currentAlgorithm: 'hash-map',
  animationState: algorithms['hash-map'].initialize([...TEST_DATA.BASIC.nums], TEST_DATA.BASIC.k),
  playbackSpeed: 1.0,
  isPlaying: false,
  currentStep: 0,
  totalSteps: TEST_DATA.BASIC.nums.length,
  inputData: {
    nums: [...TEST_DATA.BASIC.nums],
    k: TEST_DATA.BASIC.k,
  },
  history: [],
  timeComplexity: COMPLEXITY_INFO['hash-map'].time,
  spaceComplexity: COMPLEXITY_INFO['hash-map'].space,
};

const subarraySumSlice = createSlice({
  name: 'subarraySum',
  initialState,
  reducers: {
    setAlgorithm: (state, action: PayloadAction<'brute-force' | 'prefix-sum' | 'hash-map'>) => {
      const algorithmType = action.payload;
      state.currentAlgorithm = algorithmType;
      // Use current() to get plain values instead of draft proxies
      const inputData = current(state.inputData);
      state.animationState = algorithms[algorithmType].initialize(
        inputData.nums,
        inputData.k
      );
      state.currentStep = 0;
      state.isPlaying = false;
      state.timeComplexity = COMPLEXITY_INFO[algorithmType].time;
      state.spaceComplexity = COMPLEXITY_INFO[algorithmType].space;
      state.history = [state.animationState];
    },

    startAnimation: (state) => {
      state.isPlaying = true;
    },

    pauseAnimation: (state) => {
      state.isPlaying = false;
    },

    resetAnimation: (state, action: PayloadAction<{ nums: number[]; k: number }>) => {
      const { nums, k } = action.payload;
      state.inputData = { nums, k };
      state.animationState = algorithms[state.currentAlgorithm].initialize(nums, k);
      state.currentStep = 0;
      state.isPlaying = false;
      state.totalSteps = nums.length;
      state.history = [state.animationState];
      algorithms[state.currentAlgorithm].reset();
    },

    stepForward: (state) => {
      if (!state.animationState.isComplete) {
        const algorithm = algorithms[state.currentAlgorithm];
        // Use current() to get a plain object instead of the Immer draft proxy
        const currentAnimationState = current(state.animationState);
        const newState = algorithm.step(currentAnimationState);
        state.animationState = newState;
        state.currentStep++;
        
        // 保存历史记录（限制最多100帧）
        state.history.push(newState);
        if (state.history.length > 100) {
          state.history.shift();
        }

        if (newState.isComplete) {
          state.isPlaying = false;
        }
      }
    },

    stepBackward: (state) => {
      if (state.history.length > 1) {
        state.history.pop();
        state.animationState = state.history[state.history.length - 1];
        state.currentStep = Math.max(0, state.currentStep - 1);
      }
    },

    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(0, action.payload);
      state.isPlaying = false;
    },

    advanceCurrentStep: (state) => {
      state.currentStep += 1;
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = Math.max(0.5, Math.min(2.0, action.payload));
    },

    updateState: (state, action: PayloadAction<AnimationState>) => {
      state.animationState = action.payload;
    },

    setInputData: (state, action: PayloadAction<{ nums: number[]; k: number }>) => {
      const { nums, k } = action.payload;
      state.inputData = { nums, k };
      state.animationState = algorithms[state.currentAlgorithm].initialize(nums, k);
      state.currentStep = 0;
      state.totalSteps = nums.length;
      state.history = [state.animationState];
      algorithms[state.currentAlgorithm].reset();
    },

    updateComplexity: (state, action: PayloadAction<{ time: string; space: string }>) => {
      state.timeComplexity = action.payload.time;
      state.spaceComplexity = action.payload.space;
    },
  },
});

export const {
  setAlgorithm,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  stepForward,
  stepBackward,
  setPlaybackSpeed,
  setCurrentStep,
  advanceCurrentStep,
  updateState,
  setInputData,
  updateComplexity,
} = subarraySumSlice.actions;

export default subarraySumSlice.reducer;
