import React from 'react';

interface DeleteConfirmModalProps {
  /** モーダルの表示/非表示 */
  isOpen: boolean;
  /** 削除対象のアイテム名（例: "チケット #123: バグ修正"） */
  itemName: string;
  /** ローディング状態 */
  isLoading?: boolean;
  /** 削除実行時のコールバック */
  onConfirm: () => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
}

/**
 * 削除確認ダイアログコンポーネント
 * 
 * 危険なアクション（削除操作）の実行前に、ユーザーに確認を求めるモーダルダイアログです。
 * 
 * @example
 * ```tsx
 * <DeleteConfirmModal
 *   isOpen={showDeleteModal}
 *   itemName="チケット #123: バグ修正"
 *   isLoading={isDeleting}
 *   onConfirm={handleDeleteConfirm}
 *   onCancel={() => setShowDeleteModal(false)}
 * />
 * ```
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  itemName,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40"
        onClick={onCancel}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white z-50">
        <div className="mt-3 text-center">
          {/* 警告アイコン */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          {/* タイトル */}
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
            削除の確認
          </h3>
          
          {/* メッセージ */}
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              以下のアイテムを削除してもよろしいですか？
            </p>
            <p className="text-sm font-medium text-gray-900 mt-2">
              {itemName}
            </p>
            <p className="text-xs text-red-600 mt-2">
              ※ この操作は取り消せません
            </p>
          </div>
          
          {/* ボタン */}
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  削除中...
                </>
              ) : (
                '削除する'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 