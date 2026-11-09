import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { advanceCurrentStep, pauseAnimation, setAlgorithm, setCurrentStep, setPlaybackSpeed, startAnimation, resetAnimation } from '@/store/subarraySumSlice';
import { AlgorithmCanvas } from '@/components/AlgorithmCanvas';
import StepExplanation from '@/components/StepExplanation';
import { algorithmCode, buildAlgorithmSteps } from '@/algorithms/subarray-sum-equals-k/animationSteps';
import type { AlgorithmType } from '@/types';
import { COMPLEXITY_INFO } from '@/utils/constants';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { currentAlgorithm, isPlaying, playbackSpeed, currentStep, inputData } = useSelector((state: RootState) => state.subarraySum);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inputError, setInputError] = useState('');
  const [inputDraft, setInputDraft] = useState(`${inputData.nums.join(', ')}; k=${inputData.k}`);
  const [storageWarning, setStorageWarning] = useState('');
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const steps = useMemo(() => buildAlgorithmSteps(currentAlgorithm, inputData.nums, inputData.k), [currentAlgorithm, inputData]);
  const activeIndex = Math.min(currentStep, steps.length - 1);
  const step = steps[Math.max(0, activeIndex)];
  const algorithmNames: Record<AlgorithmType, string> = { 'brute-force': '暴力枚举 O(n²)', 'prefix-sum': '前缀和 O(n²)', 'hash-map': '前缀和 + 哈希表 O(n)' };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('leetcode-560-player-preferences');
      if (saved) {
        const preferences = JSON.parse(saved) as { speed?: number; algorithm?: AlgorithmType };
        if (preferences.speed === 0.5 || preferences.speed === 1 || preferences.speed === 2) dispatch(setPlaybackSpeed(preferences.speed));
        if (preferences.algorithm && ['brute-force', 'prefix-sum', 'hash-map'].includes(preferences.algorithm)) dispatch(setAlgorithm(preferences.algorithm));
      }
    } catch {
      setStorageWarning('本地偏好无法读取；本次设置仍可使用。');
    } finally {
      setIsPreferencesLoaded(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isPreferencesLoaded) return;
    try {
      localStorage.setItem('leetcode-560-player-preferences', JSON.stringify({ speed: playbackSpeed, algorithm: currentAlgorithm }));
    } catch {
      setStorageWarning('本地存储不可用；关闭页面后不会保留速度或解法选择。');
    }
  }, [playbackSpeed, currentAlgorithm, isPreferencesLoaded]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      if (activeIndex + 1 < steps.length) dispatch(advanceCurrentStep());
      else dispatch(pauseAnimation());
    }, 1000 / playbackSpeed);
    return () => window.clearTimeout(timer);
  }, [isPlaying, activeIndex, steps.length, playbackSpeed, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight' && activeIndex + 1 < steps.length) dispatch(setCurrentStep(activeIndex + 1));
      else if (event.key === 'ArrowLeft' && activeIndex > 0) dispatch(setCurrentStep(activeIndex - 1));
      else if (event.key === ' ') dispatch(isPlaying || activeIndex >= steps.length - 1 ? pauseAnimation() : startAnimation());
      else if (event.key.toLowerCase() === 'r') dispatch(resetAnimation(inputData));
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, activeIndex, steps.length, isPlaying, inputData]);

  if (!step) return null;
  const handleAlgorithmChange = (type: AlgorithmType) => dispatch(setAlgorithm(type));
  const handleSeek = (index: number) => dispatch(setCurrentStep(index));

  return <main className="app-container">
    <header className="app-header"><a href="https://fuck-algorithm.github.io/leetcode-hot-100/" target="_blank" rel="noreferrer">← Hot 100</a><h1>LeetCode 560：和为 K 的子数组</h1><a href="https://github.com/fuck-algorithm/leetcode-560-subarray-sum-equals-k-description" target="_blank" rel="noreferrer">GitHub</a></header>
    <div className="input-bar"><span>数组</span><code>[{inputData.nums.join(', ')}]</code><span>目标 K = {inputData.k}</span><div className="algorithm-tabs">{(['brute-force', 'prefix-sum', 'hash-map'] as AlgorithmType[]).map((type) => <button key={type} className={currentAlgorithm === type ? 'selected' : ''} onClick={() => handleAlgorithmChange(type)}>{algorithmNames[type]}</button>)}</div></div>
    <div className="input-entry"><label htmlFor="nums-input">输入 nums / k</label><input id="nums-input" value={inputDraft} onChange={(event) => setInputDraft(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') { const match = event.currentTarget.value.match(/^([\d\s,+-]+);\s*k\s*=\s*(-?\d+)$/i); if (match) { const nums = match[1].split(/[\s,]+/).filter(Boolean).map(Number); if (nums.length && nums.length <= 8 && nums.every((value) => Number.isInteger(value) && Math.abs(value) <= 100) && Math.abs(Number(match[2])) <= 100) { setInputError(''); dispatch(resetAnimation({ nums, k: Number(match[2]) })); } else setInputError('请输入 1–8 个 -100 到 100 的整数。'); } else setInputError('格式示例：1, -1, 2; k=2'); } }} /><button onClick={() => { setInputError(''); const nums = [1, 1, 1]; setInputDraft('1, 1, 1; k=2'); dispatch(resetAnimation({ nums, k: 2 })); }}>样例</button><button onClick={() => { setInputError(''); const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) - 4); setInputDraft(`${nums.join(', ')}; k=2`); dispatch(resetAnimation({ nums, k: 2 })); }}>随机</button>{inputError && <small role="alert" className="input-error">{inputError}</small>}{storageWarning && <small className="input-warning">{storageWarning}</small>}</div>
    <section className="workspace">
      <article className="canvas-card">
        <div className="canvas-heading"><strong>执行画布</strong><span>{step.id + 1} / {steps.length}</span><span>{COMPLEXITY_INFO[currentAlgorithm].time} 时间 · {COMPLEXITY_INFO[currentAlgorithm].space} 空间</span></div>
        <AlgorithmCanvas step={step} reducedMotion={reducedMotion} speed={playbackSpeed} />
        <StepExplanation step={step} current={activeIndex} total={steps.length} algorithmName={algorithmNames[currentAlgorithm]} />
      </article>
      <aside className="code-panel"><div className="code-title">执行锚点 <span>Java</span></div><pre>{algorithmCode[currentAlgorithm].map((line, index) => <div key={`${line.anchor}-${index}`} className={step.binding.anchorIds.includes(line.anchor) ? 'code-line active' : 'code-line'}><span>{String(index + 1).padStart(2, '0')}</span><code>{line.text}</code></div>)}</pre></aside>
    </section>
    <footer className="control-bar"><div className="button-group"><button onClick={() => dispatch(setCurrentStep(activeIndex - 1))} disabled={activeIndex === 0}>上一步</button><button onClick={() => dispatch(isPlaying || activeIndex >= steps.length - 1 ? pauseAnimation() : startAnimation())}>{isPlaying ? '暂停' : '播放'}</button><button onClick={() => dispatch(setCurrentStep(activeIndex + 1))} disabled={activeIndex >= steps.length - 1}>下一步</button><button onClick={() => dispatch(resetAnimation(inputData))}>重置</button></div><input aria-label="演示进度" type="range" min={0} max={steps.length - 1} value={activeIndex} onChange={(event) => handleSeek(Number(event.target.value))} /><span className="step-counter">{activeIndex + 1} / {steps.length}</span><label>速度 <select value={playbackSpeed} onChange={(event) => dispatch(setPlaybackSpeed(Number(event.target.value)))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label></footer>
  </main>;
};

export default App;
