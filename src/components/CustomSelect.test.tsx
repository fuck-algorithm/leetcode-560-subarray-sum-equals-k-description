import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CustomSelect } from './CustomSelect';

describe('CustomSelect', () => {
  it('opens a listbox and commits a selection with mouse or keyboard', () => {
    const onChange = jest.fn();
    render(<CustomSelect label="Speed" value={1} onChange={onChange} options={[{ value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]} />);
    const trigger = screen.getByRole('button', { name: 'Speed' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: '2×' }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(0.5);
  });
});
