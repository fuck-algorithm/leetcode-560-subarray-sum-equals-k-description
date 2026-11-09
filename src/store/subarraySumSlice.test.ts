import reducer, { advanceCurrentStep, pauseAnimation, resetAnimation, setAlgorithm, setCurrentStep, setPlaybackSpeed, startAnimation } from './subarraySumSlice';
import { TEST_DATA } from '@/utils/constants';

const initial = reducer(undefined, { type: '@@init' });

describe('animation playback controls', () => {
  it('advances snapshot index while playing and pauses at the last frame', () => {
    let state = reducer(initial, startAnimation());
    state = reducer(state, advanceCurrentStep());
    expect(state.currentStep).toBe(1);
    expect(state.isPlaying).toBe(true);
    state = reducer(state, pauseAnimation());
    expect(state.isPlaying).toBe(false);
  });

  it('stops autoplay when the user seeks or changes algorithm', () => {
    let state = reducer(initial, startAnimation());
    state = reducer(state, setCurrentStep(4));
    expect(state.currentStep).toBe(4);
    expect(state.isPlaying).toBe(false);
    state = reducer(state, startAnimation());
    state = reducer(state, setAlgorithm('prefix-sum'));
    expect(state.currentStep).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it('reinitializes a solution when input changes', () => {
    const state = reducer(initial, resetAnimation({ nums: [1, 1, 1], k: 2 }));
    expect(state.inputData).toEqual({ nums: [1, 1, 1], k: 2 });
    expect(state.currentStep).toBe(0);
    expect(state.totalSteps).toBe(3);
  });

  it('completes autoplay without advancing beyond the prebuilt frames', () => {
    const state = reducer(initial, advanceCurrentStep());
    expect(state.currentStep).toBe(initial.currentStep + 1);
  });

  it('clamps persisted playback speed to supported bounds', () => {
    expect(reducer(initial, setPlaybackSpeed(9)).playbackSpeed).toBe(2);
    expect(reducer(initial, setPlaybackSpeed(0)).playbackSpeed).toBe(0.5);
  });

  it('keeps the default fixture in sync with the reducer initial state', () => {
    expect(initial.inputData).toEqual({ nums: TEST_DATA.BASIC.nums, k: TEST_DATA.BASIC.k });
  });
});
