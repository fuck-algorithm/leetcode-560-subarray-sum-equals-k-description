import React, { useRef } from 'react';

interface Props {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export const StepSlider: React.FC<Props> = ({ label, value, max, onChange }) => {
  const track = useRef<HTMLDivElement>(null);
  const percent = max > 0 ? (value / max) * 100 : 0;
  const updateFromPointer = (clientX: number) => {
    const bounds = track.current?.getBoundingClientRect();
    if (!bounds || max <= 0) return;
    onChange(Math.round(Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)) * max));
  };

  return <div
    ref={track}
    className="step-slider"
    role="slider"
    tabIndex={0}
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-valuenow={value}
    onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); updateFromPointer(event.clientX); }}
    onPointerMove={(event) => { if (event.buttons === 1) updateFromPointer(event.clientX); }}
    onClick={(event) => updateFromPointer(event.clientX)}
    onKeyDown={(event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); onChange(Math.min(max, value + 1)); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); onChange(Math.max(0, value - 1)); }
      if (event.key === 'Home') { event.preventDefault(); onChange(0); }
      if (event.key === 'End') { event.preventDefault(); onChange(max); }
    }}
  >
    <span className="step-slider-track"><span className="step-slider-fill" style={{ width: `${percent}%` }} /><span className="step-slider-thumb" style={{ left: `${percent}%` }} /></span>
  </div>;
};
