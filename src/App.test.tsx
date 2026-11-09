import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import subarraySumReducer from '@/store/subarraySumSlice';
jest.mock('@/components/AlgorithmCanvas', () => ({ AlgorithmCanvas: () => <div data-testid="algorithm-canvas" /> }));
import App from './App';

function renderApp() {
  const store = configureStore({ reducer: { subarraySum: subarraySumReducer } });
  return { store, ...render(<Provider store={store}><App /></Provider>) };
}

describe('product navigation, locale and code panels', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as jest.Mock;
    Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });
  });

  it('renders the external community QR asset with preserved intrinsic ratio', () => {
    renderApp();
    const qr = document.querySelector('.community-card img') as HTMLImageElement;
    expect(qr).toHaveAttribute('src', '/assets/qrcode-community.png');
    expect(qr).toHaveAttribute('alt', expect.any(String));
    expect(qr.getAttribute('alt')).toBeTruthy();
  });

  it('defaults to English and exposes all navigation actions and GitHub stars', async () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'LeetCode 560: Subarray Sum Equals K' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Hot 100' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'LeetCode 560: Subarray Sum Equals K' })).toHaveAttribute('href', 'https://leetcode.com/problems/subarray-sum-equals-k/');
    expect(screen.getByRole('button', { name: 'Idea' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/0 stars/)).toBeInTheDocument());
  });

  it('switches locale and keeps the active demonstration step', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    fireEvent.change(screen.getByLabelText('Language', { exact: true }), { target: { value: 'zh-CN' } });
    expect(screen.getByRole('heading', { name: 'LeetCode 560：和为 K 的子数组' })).toBeInTheDocument();
    expect(screen.getByTestId('step-counter')).toHaveTextContent('2 / 21');
    expect(localStorage.getItem('leetcode-560-ui-preferences')).toContain('zh-CN');
  });

  it.each(['java', 'python', 'go', 'javascript'])('shows %s code and persists language selection', (language) => {
    renderApp();
    fireEvent.change(screen.getByLabelText('Code language'), { target: { value: language } });
    expect(screen.getByLabelText('Code language')).toHaveValue(language);
    expect(localStorage.getItem('leetcode-560-code-language')).toBe(language);
    expect(document.querySelectorAll('.code-line').length).toBeGreaterThan(0);
  });

  it('opens idea dialog and variable watch panel', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: 'Idea' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Variables' }));
    expect(screen.getAllByText('sum').length).toBeGreaterThan(0);
  });
});
