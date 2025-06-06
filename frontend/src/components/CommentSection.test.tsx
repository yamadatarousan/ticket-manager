import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommentSection } from './CommentSection';
import { Comment } from '../types/index';

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    getComments: jest.fn(),
    createComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  }),
}));

const const _mockApiService = // require('../services/api').apiService;

describe('CommentSection', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  test('ローディング状態が正常に表示されること', () => {
    // コメントを空配列として提供（型を明示的に指定）
    const mockComments: Comment[] = [];

    render(
      <CommentSection
        ticketId={1}
        comments={mockComments}
        onCommentAdded={jest.fn()}
        onCommentDeleted={jest.fn()}
      />
    );

    // コメントセクションの要素確認
    expect(screen.getByText('まだコメントはありません')).toBeInTheDocument();
    expect(screen.getByText('最初のコメントを投稿しましょう')).toBeInTheDocument();
  });
});
