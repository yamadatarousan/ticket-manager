import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('チケット管理システムのタイトルが表示される', () => {
  render(<App />);
  const titleElement = screen.getByText(/チケット管理システム/i);
  expect(titleElement).toBeInTheDocument();
});

test('ログインボタンが表示される', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /ログイン/i });
  expect(loginButton).toBeInTheDocument();
});

test('メールアドレス入力フィールドが表示される', () => {
  render(<App />);
  const emailInput = screen.getByLabelText(/メールアドレス/i);
  expect(emailInput).toBeInTheDocument();
});
