import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { advanceCurrentStep, pauseAnimation, setAlgorithm, setCurrentStep, setPlaybackSpeed, startAnimation, resetAnimation } from '@/store/subarraySumSlice';
import { AlgorithmCanvas } from '@/components/AlgorithmCanvas';
import StepExplanation from '@/components/StepExplanation';
import { buildAlgorithmSteps } from '@/algorithms/subarray-sum-equals-k/animationSteps';
import type { AlgorithmType } from '@/types';
import { codeLines, CODE_LANGUAGE_LABEL, type CodeLanguage, type UiLocale, UI_TEXT } from '@/utils/productUi';
import { fetchStarCount } from '@/utils/starCount';
import { COMPLEXITY_INFO } from '@/utils/constants';

const ALGORITHMS: AlgorithmType[] = ['brute-force', 'prefix-sum', 'hash-map'];
const CODE_LANGUAGES: CodeLanguage[] = ['java', 'python', 'go', 'javascript'];
const UI_PREFS = 'leetcode-560-ui-preferences';
const CODE_PREF = 'leetcode-560-code-language';
const IDEA_CODE = `prefix = 0\ncount = 0\nfreq = {0: 1}\nfor value in nums:\n    prefix += value\n    count += freq.get(prefix - k, 0)\n    freq[prefix] = freq.get(prefix, 0) + 1`;

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { currentAlgorithm, isPlaying, playbackSpeed, currentStep, inputData } = useSelector((state: RootState) => state.subarraySum);
  const [locale, setLocale] = useState<UiLocale>('en');
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('java');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inputError, setInputError] = useState('');
  const [inputDraft, setInputDraft] = useState(`${inputData.nums.join(', ')}; k=${inputData.k}`);
  const [storageWarning, setStorageWarning] = useState('');
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const [starCount, setStarCount] = useState<number>();
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  const [watchValues, setWatchValues] = useState<Record<string, string | number>>({});
  const text = UI_TEXT[locale];
  const steps = useMemo(() => buildAlgorithmSteps(currentAlgorithm, inputData.nums, inputData.k, locale), [currentAlgorithm, inputData, locale]);
  const activeIndex = Math.min(currentStep, steps.length - 1);
  const step = steps[Math.max(0, activeIndex)];
  const algorithmNames: Record<UiLocale, Record<AlgorithmType, string>> = {
    en: { 'brute-force': 'Brute force O(n²)', 'prefix-sum': 'Prefix sums O(n²)', 'hash-map': 'Prefix sum + hash map O(n)' },
    'zh-CN': { 'brute-force': '暴力枚举 O(n²)', 'prefix-sum': '前缀和 O(n²)', 'hash-map': '前缀和 + 哈希表 O(n)' },
  };

  useEffect(() => {
    try {
      const ui = JSON.parse(localStorage.getItem(UI_PREFS) ?? '{}') as { locale?: UiLocale; speed?: number };
      const code = localStorage.getItem(CODE_PREF) as CodeLanguage | null;
      if (ui.locale === 'en' || ui.locale === 'zh-CN') setLocale(ui.locale);
      if (ui.speed === 0.5 || ui.speed === 1 || ui.speed === 2) dispatch(setPlaybackSpeed(ui.speed));
      if (code && CODE_LANGUAGES.includes(code)) setCodeLanguage(code);
    } catch { setStorageWarning(text.storage); }
    setIsPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!isPreferencesLoaded) return;
    try {
      localStorage.setItem(UI_PREFS, JSON.stringify({ locale, speed: playbackSpeed }));
      localStorage.setItem(CODE_PREF, codeLanguage);
    } catch { setStorageWarning(text.storage); }
  }, [locale, codeLanguage, playbackSpeed, isPreferencesLoaded, text.storage]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStarCount(controller.signal).then(setStarCount).catch(() => setStarCount(0));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    setWatchValues(step.binding.variables);
  }, [step]);

  useEffect(() => {
    if (!steps.length) return;
    if (activeIndex >= steps.length) dispatch(setCurrentStep(steps.length - 1));
  }, [activeIndex, steps.length, dispatch]);

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
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
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
  const name = algorithmNames[locale];
  const setAlgorithmType = (type: AlgorithmType) => { dispatch(pauseAnimation()); dispatch(setAlgorithm(type)); };
  const togglePlay = () => dispatch(isPlaying || activeIndex >= steps.length - 1 ? pauseAnimation() : startAnimation());
  const visibleCode = codeLines(codeLanguage, currentAlgorithm);
  const currentCodeLine = visibleCode.findIndex((line) => step.binding.anchorIds.includes(line.anchor));
  const currentStepUsesMatch = step.operation === 'match';
  const watchLabels = locale === 'en' ? { index: 'Index', result: 'Count', ranges: 'Matched ranges', current: 'Current', compare: 'Lookup / compare', visited: 'Visited', done: 'Answer', idle: 'Idle / absent' } : { index: '索引', result: '计数', ranges: '命中区间', current: '当前', compare: '查询 / 比较', visited: '已访问', done: '答案', idle: '未处理 / 不存在' };
  const currentArrayCount = step.frame.nodes.filter((node) => node.id.startsWith('array-')).filter((node) => node.status === 'current').length;
  const submitInput = (value: string) => {
    const match = value.match(/^([\d\s,+-]+);\s*k\s*=\s*(-?\d+)$/i);
    const nums = match?.[1].split(/[\s,]+/).filter(Boolean).map(Number) ?? [];
    if (match && nums.length && nums.length <= 8 && nums.every((n) => Number.isInteger(n) && Math.abs(n) <= 100) && Math.abs(Number(match[2])) <= 100) {
      setInputError(''); dispatch(resetAnimation({ nums, k: Number(match[2]) })); return;
    }
    setInputError(text.invalid);
  };
  const sample = () => { setInputDraft('1, 1, 1; k=2'); setInputError(''); dispatch(resetAnimation({ nums: [1, 1, 1], k: 2 })); };
  const random = () => { const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) - 4); setInputDraft(`${nums.join(', ')}; k=2`); setInputError(''); dispatch(resetAnimation({ nums, k: 2 })); };

  return <main className="app-container">
    <header className="app-header">
      <a className="header-left" href="https://fuck-algorithm.github.io/leetcode-hot-100/" target="_blank" rel="noreferrer">{text.hot100}</a>
      <a className="problem-title-link" href="https://leetcode.com/problems/subarray-sum-equals-k/" target="_blank" rel="noreferrer"><h1>{text.problem}</h1></a>
      <div className="header-right">
        <button className="header-button" onClick={() => setIdeaOpen(true)}>{text.ideas}</button>
        <a className="github-link" href="https://github.com/fuck-algorithm/leetcode-560-subarray-sum-equals-k-description" target="_blank" rel="noreferrer" aria-label={text.github}>{text.github} <span className="star-count">★ {starCount ?? 0} {text.stars}</span></a>
        <label className="locale-switch"><span className="sr-only">{text.language}</span><select aria-label={text.language} value={locale} onChange={(event) => setLocale(event.target.value as UiLocale)}><option value="en">EN</option><option value="zh-CN">简中</option></select></label>
      </div>
    </header>
    <div className="input-bar"><span>{text.array}</span><code>[{inputData.nums.join(', ')}]</code><span>{text.target} = {inputData.k}</span><div className="algorithm-tabs">{ALGORITHMS.map((type) => <button key={type} className={currentAlgorithm === type ? 'selected' : ''} onClick={() => setAlgorithmType(type)}>{name[type]}</button>)}</div></div>
    <div className="input-entry"><label htmlFor="nums-input">{text.input}</label><input id="nums-input" value={inputDraft} onChange={(event) => setInputDraft(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitInput(event.currentTarget.value); }} /><button onClick={sample}>{text.sample}</button><button onClick={random}>{text.random}</button>{inputError && <small role="alert" className="input-error">{inputError}</small>}{storageWarning && <small className="input-warning">{storageWarning}</small>}</div>
    <section className="workspace">
      <article className="canvas-card">
        <div className="canvas-heading"><strong>{text.canvas}</strong><span data-testid="step-counter">{activeIndex + 1} / {steps.length}{currentStepUsesMatch ? ` · ${text.answer}` : ''}</span><span>{text.complexity}: {COMPLEXITY_INFO[currentAlgorithm].time} · {COMPLEXITY_INFO[currentAlgorithm].space}</span></div>
        <AlgorithmCanvas step={step} reducedMotion={reducedMotion} speed={playbackSpeed} />
        <div className="structure-status" aria-live="polite">{locale === 'en' ? `${currentArrayCount} current array focus${currentArrayCount === 1 ? '' : 'es'}` : `数组当前焦点：${currentArrayCount}`}</div>
        <StepExplanation step={step} current={activeIndex} total={steps.length} algorithmName={name[currentAlgorithm]} labels={watchLabels} />
      </article>
      <aside className="code-panel">
        <div className="code-title"><span>{text.code}</span><label><span className="sr-only">{text.codeLanguage}</span><select aria-label={text.codeLanguage} value={codeLanguage} onChange={(event) => setCodeLanguage(event.target.value as CodeLanguage)}>{CODE_LANGUAGES.map((language) => <option key={language} value={language}>{CODE_LANGUAGE_LABEL[language]}</option>)}</select></label></div>
        <div className="watch-panel"><button className="watch-toggle" aria-expanded={watchOpen} onClick={() => setWatchOpen(!watchOpen)}>{text.watch}</button>{watchOpen && <dl>{Object.entries(watchValues).slice(0, 4).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}</div>
        <pre>{visibleCode.map((line, index) => <div key={`${line.anchor}-${index}`} className={index === currentCodeLine ? 'code-line active' : 'code-line'}><span>{String(index + 1).padStart(2, '0')}</span><code>{line.text}</code></div>)}</pre>
      </aside>
    </section>
    <footer className="control-bar"><div className="button-group"><button onClick={() => dispatch(setCurrentStep(activeIndex - 1))} disabled={activeIndex === 0}>← {text.back}</button><button onClick={togglePlay}>{isPlaying ? text.pause : text.play}</button><button onClick={() => dispatch(setCurrentStep(activeIndex + 1))} disabled={activeIndex >= steps.length - 1}>{text.next} →</button><button onClick={() => dispatch(resetAnimation(inputData))}>{text.reset}</button></div><input aria-label={text.step} type="range" min={0} max={steps.length - 1} value={activeIndex} onChange={(event) => { dispatch(setCurrentStep(Number(event.target.value))); if (isPlaying) dispatch(pauseAnimation()); }} /><span className="step-counter">{activeIndex + 1} / {steps.length}</span><label>{text.speed} <select aria-label={text.speed} value={playbackSpeed} onChange={(event) => dispatch(setPlaybackSpeed(Number(event.target.value)))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label></footer>
    {ideaOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIdeaOpen(false); }}><section className="idea-modal" role="dialog" aria-modal="true" aria-labelledby="idea-title"><button className="modal-close" onClick={() => setIdeaOpen(false)}>{text.close}</button><h2 id="idea-title">{text.ideaTitle}</h2><p>{text.ideaBody}</p><pre>{IDEA_CODE}</pre></section></div>}
    <aside className="community-float"><button aria-label={text.community}><img src="/assets/qrcode-community.png" alt="" /></button><div className="community-card"><strong>{text.community} · leetcode</strong><img src="/assets/qrcode-community.png" alt={text.qrAlt} /></div></aside>
  </main>;
};

export default App;
