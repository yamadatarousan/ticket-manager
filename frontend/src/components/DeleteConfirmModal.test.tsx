import React from 'react';
import { render, screen } from '@testing-library/react';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    itemName: 'テストアイテム',
    onConfirm: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('モーダルが正常に表示されること', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    
    // モーダルの主要な要素が表示されていることを確認
    expect(screen.getByText('削除の確認')).toBeInTheDocument();
    expect(screen.getByText('テストアイテム')).toBeInTheDocument();
    expect(screen.getByText('削除する')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  test('isOpenがfalseの場合、モーダルが表示されないこと', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
    
    // モーダルが表示されていないことを確認
    expect(screen.queryByText('削除の確認')).not.toBeInTheDocument();
  });
}); 