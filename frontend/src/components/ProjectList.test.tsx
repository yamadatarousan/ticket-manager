import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

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
    mockApiService.getProjects.mockReturnValue(new Promise(() => { }));

    renderWithRouter(<ProjectList {...defaultProps} />);

    // ローディングスピナーの確認（実際の実装に合わせて）
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-blue-500');

    // ローディング状態のコンテナの確認
    const loadingContainer = document.querySelector('.flex.justify-center.items-center.h-64');
    expect(loadingContainer).toBeInTheDocument();
  });
}); 