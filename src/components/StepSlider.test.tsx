import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { StepSlider } from './StepSlider';

describe('StepSlider', () => {
  it('seeks by pointer and keyboard without a native range input', () => {
    const onChange = jest.fn();
    render(<StepSlider label="Step" value={0} max={10} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    const bounds = { left: 10, width: 100, right: 110, top: 0, bottom: 8, height: 8, x: 10, y: 0, toJSON: () => ({}) };
    jest.spyOn(slider, 'getBoundingClientRect').mockReturnValue(bounds);
    fireEvent(slider, new MouseEvent('pointerdown', { clientX: 60, buttons: 1, bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(5);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
});
