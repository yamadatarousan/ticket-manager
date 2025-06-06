import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectCreateForm } from './ProjectCreateForm';

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    createProject: jest.fn(),
  },
}));

describe('ProjectCreateForm', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('フォームが正常に表示されること', () => {
    render(<ProjectCreateForm {...defaultProps} />);

    // フォームの主要な要素が表示されていることを確認
    expect(screen.getByText('新規プロジェクト作成')).toBeInTheDocument();
    expect(screen.getByLabelText(/プロジェクト名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ステータス/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作成する' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });
});
