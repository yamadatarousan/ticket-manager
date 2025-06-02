import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Tailwindテストのタイトルが表示される', () => {
  render(<App />);
  const titleElement = screen.getByText(/tailwind テスト/i);
  expect(titleElement).toBeInTheDocument();
});

test('黄色いボタンが表示される', () => {
  render(<App />);
  const yellowButton = screen.getByText(/黄色いボタン/i);
  expect(yellowButton).toBeInTheDocument();
});

test('ピンクのボタンが表示される', () => {
  render(<App />);
  const pinkButton = screen.getByText(/ピンクのボタン/i);
  expect(pinkButton).toBeInTheDocument();
});
