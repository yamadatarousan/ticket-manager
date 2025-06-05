import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectList } from './ProjectList';

// AuthContextをモック
const mockUser = {
  id: 1,
  email: 'user@example.com',
  role: 'user' as const,
  name: 'Test User'
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    getProjects: jest.fn()
  }
}));

const mockApiService = require('../services/api').apiService;

describe('ProjectList', () => {
  const defaultProps = {
    onProjectClick: jest.fn(),
    onProjectEdit: jest.fn(),
    onCreateProject: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ローディング状態が正常に表示されること', () => {
    // APIが遅延するようにモック設定
    mockApiService.getProjects.mockReturnValue(new Promise(() => {}));

    render(<ProjectList {...defaultProps} />);

    // ローディング表示の確認
    expect(screen.getByText('プロジェクトを読み込み中...')).toBeInTheDocument();
  });
}); 