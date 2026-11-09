import React from 'react';
import type { AlgorithmStep } from '@/algorithms/subarray-sum-equals-k/animationSteps';

interface Props {
  step: AlgorithmStep;
  current: number;
  total: number;
  algorithmName: string;
}

export const StepExplanation: React.FC<Props> = ({ step, current, total, algorithmName }) => (
  <section className="lesson-panel" aria-live="polite">
    <header className="lesson-heading">
      <div>
        <small>{algorithmName} · 第 {current + 1} / {total} 步</small>
        <h2>{step.title}</h2>
      </div>
      <span className="operation-badge" data-operation={step.operation}>{step.operation}</span>
    </header>
    <p className="step-narration">{step.narration}</p>
    <dl className="variable-list">
      {Object.entries(step.binding.variables).slice(0, 4).map(([name, value]) => (
        <div key={name}><dt>{name}</dt><dd>{value}</dd></div>
      ))}
    </dl>
    <div className="canvas-metrics">
      {step.frame.metrics.map((metric) => <div key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></div>)}
    </div>
  </section>
);

export default StepExplanation;
