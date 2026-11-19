import React, { useEffect, useRef, useState } from 'react';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function CustomSelect<T extends string | number>({ label, value, options, onChange, className = '' }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.findIndex((option) => option.value === value)));
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
  };

  return <div className={`custom-select ${className}`} ref={root}>
    <button
      type="button"
      className="select-trigger"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={open}
      data-value={String(value)}
      onClick={() => { setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value))); setOpen(!open); }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!open) setOpen(true);
          setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
        } else if (event.key === 'Enter' || event.key === ' ') {
          if (open) { event.preventDefault(); choose(activeIndex); }
        } else if (event.key === 'Escape') setOpen(false);
      }}
    >
      <span>{selected?.label}</span><span className="select-caret" aria-hidden="true" />
    </button>
    {open && <div className="select-menu" role="listbox" aria-label={label}>
      {options.map((option, index) => <button
        type="button"
        role="option"
        aria-selected={option.value === value}
        className={`select-option${option.value === value ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`}
        key={String(option.value)}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => choose(index)}
      >{option.label}<span aria-hidden="true">{option.value === value ? '✓' : ''}</span></button>)}
    </div>}
  </div>;
}
