import React from 'react';
import type { AlgorithmStep } from '@/algorithms/subarray-sum-equals-k/animationSteps';

interface Props {
  step: AlgorithmStep;
  current: number;
  total: number;
  algorithmName: string;
  labels: { index: string; result: string; ranges: string; current: string; compare: string; visited: string; done: string; idle: string };
}

export const StepExplanation: React.FC<Props> = ({ step, current, total, algorithmName, labels }) => (
  <section className="lesson-panel" aria-live="polite">
    <header className="lesson-heading">
      <div>
        <small>{algorithmName} · {current + 1} / {total}</small>
        <h2>{step.operation === 'lookup' ? '查找目标前缀和' : step.operation === 'compare' ? '确认未命中' : step.operation === 'insert' ? '记录当前前缀和' : step.operation === 'match' ? '匹配子数组' : step.operation === 'read' ? '读取并更新前缀和' : step.operation === 'inspect' ? '读取当前数组值' : step.operation === 'done' ? '扫描完成' : step.title}</h2>
      </div>
    </header>
    <strong className="step-title-label">{step.title}</strong>
    <span className="operation-badge" data-operation={step.operation}>{step.operation}</span>
    <p className="step-narration">{step.narration}</p>
    <dl className="variable-list">
      {Object.entries(step.binding.variables).slice(0, 4).map(([name, value]) => (
        <div key={name}><dt>{name}</dt><dd>{value}</dd></div>
      ))}
    </dl>
    <div className="canvas-metrics">
      {step.frame.metrics.map((metric, index) => {
        const metricLabel = metric.label === 'Index' || metric.label === '当前索引' ? labels.index : metric.label === 'Count' || metric.label === '累计答案' ? labels.result : labels.ranges;
        return <div key={`${metric.label}-${index}`}><small>{metricLabel}</small><strong>{metric.value}</strong></div>;
      })}
    </div>
  </section>
);

export default StepExplanation;
