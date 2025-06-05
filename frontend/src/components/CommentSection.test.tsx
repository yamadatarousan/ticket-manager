import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommentSection } from './CommentSection';

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    getComments: jest.fn()
  }
}));

const mockApiService = require('../services/api').apiService;

describe('CommentSection', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  test('ローディング状態が正常に表示されること', () => {
    // APIが遅延するようにモック設定
    mockApiService.getComments.mockReturnValue(new Promise(() => {}));

    render(<CommentSection ticketId={1} />);

    // ローディング表示の確認
    expect(screen.getByText('コメント')).toBeInTheDocument();
    expect(screen.getByText('コメントを読み込み中...')).toBeInTheDocument();
  });
}); 