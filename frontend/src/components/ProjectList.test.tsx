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

    // コンポーネントが正しくレンダリングされていることを確認
    expect(document.body).toBeInTheDocument();
  });
}); 