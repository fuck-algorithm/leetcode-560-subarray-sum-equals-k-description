import { HashMapAlgorithm } from '../algorithm';
import { TEST_DATA } from '@/utils/constants';

describe('HashMapAlgorithm', () => {
  let algorithm: HashMapAlgorithm;

  beforeEach(() => {
    algorithm = new HashMapAlgorithm();
  });

  describe('initialization', () => {
    it('should initialize with correct state', () => {
      const state = algorithm.initialize(TEST_DATA.BASIC.nums, TEST_DATA.BASIC.k);

      expect(state.arrayElements.length).toBe(TEST_DATA.BASIC.nums.length);
      expect(state.kValue).toBe(TEST_DATA.BASIC.k);
      expect(state.totalCount).toBe(0);
      expect(state.isComplete).toBe(false);
      expect(state.algorithmType).toBe('hash-map');
      expect(state.hashMap?.hashMap.size).toBe(1);
      expect(state.hashMap?.hashMap.get(0)).toBe(1);
    });

    it('should handle empty array', () => {
      const state = algorithm.initialize([], 5);

      expect(state.arrayElements.length).toBe(0);
      expect(state.isComplete).toBe(true);
    });
  });

  describe('step execution', () => {
    it('should process first element correctly', () => {
      const initState = algorithm.initialize([1, 2, 3], 3);
      const newState = algorithm.step(initState);

      expect(newState.stepCount).toBe(1);
      expect(newState.hashMap?.currentSum).toBe(1);
      expect(newState.hashMap?.hashMap.get(1)).toBe(1);
      expect(newState.totalCount).toBe(0);
    });

    it('should find subarray when prefix sum matches', () => {
      const initState = algorithm.initialize([1, 2, 3], 3);
      algorithm.step(initState);
      const state2 = algorithm.step(initState);

      expect(state2.hashMap?.currentSum).toBe(3);
      expect(state2.totalCount).toBe(1);
    });

    it('should mark as complete when all elements processed', () => {
      const initState = algorithm.initialize([1, 1, 1], 2);
      let state = initState;

      while (!state.isComplete) {
        state = algorithm.step(state);
      }

      expect(state.isComplete).toBe(true);
      expect(state.totalCount).toBe(2);
    });
  });

  describe('full algorithm execution', () => {
    it('should find correct count for basic test data', () => {
      const result = algorithm.execute(TEST_DATA.BASIC.nums, TEST_DATA.BASIC.k);

      expect(result.count).toBe(TEST_DATA.BASIC.expectedCount);
    });

    it('should find correct count for simple case', () => {
      const result = algorithm.execute(TEST_DATA.SIMPLE.nums, TEST_DATA.SIMPLE.k);

      expect(result.count).toBe(TEST_DATA.SIMPLE.expectedCount);
    });

    it('should handle negative numbers', () => {
      const result = algorithm.execute(TEST_DATA.NEGATIVE.nums, TEST_DATA.NEGATIVE.k);

      expect(result.count).toBe(TEST_DATA.NEGATIVE.expectedCount);
    });

    it('should handle empty array', () => {
      const result = algorithm.execute([], 5);

      expect(result.count).toBe(0);
      expect(result.steps).toBe(0);
    });

    it('should handle single element matching k', () => {
      const result = algorithm.execute([5], 5);

      expect(result.count).toBe(1);
    });

    it('should handle single element not matching k', () => {
      const result = algorithm.execute([3], 5);

      expect(result.count).toBe(0);
    });
  });

  describe('reset functionality', () => {
    it('should reset algorithm state', () => {
      algorithm.execute([1, 2, 3], 3);
      algorithm.reset();

      const currentState = algorithm.getCurrentState();

      expect(currentState.currentIndex).toBe(0);
      expect(currentState.count).toBe(0);
      expect(currentState.prefixSum).toBe(0);
      expect(currentState.hashMap.size).toBe(1);
    });
  });

  describe('performance', () => {
    it('should execute in reasonable time for large array', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => (i % 10) - 5);
      const startTime = performance.now();

      algorithm.execute(largeArray, 5);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});
