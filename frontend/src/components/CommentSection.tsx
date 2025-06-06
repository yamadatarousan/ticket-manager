import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Comment, CreateCommentRequest } from '../types';

interface CommentSectionProps {
  /** コメントを表示するチケットのID */
  ticketId: number;
}

/**
 * コメントセクションコンポーネント
 * 
 * BacklogやRedmineのようなチケットコメント機能を提供します。
 * - コメント一覧の表示
 * - 新規コメントの作成
 * - コメントの編集・削除（自分のコメントのみ）
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.ticketId - コメントを表示するチケットのID
 */
export const CommentSection: React.FC<CommentSectionProps> = ({ ticketId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // デバッグ用ログ
  console.log('CommentSection - received ticketId:', ticketId, 'type:', typeof ticketId);

  // コメント一覧を取得
  const fetchComments = useCallback(async () => {
    // デバッグ情報を詳しく出力
    console.log('CommentSection fetchComments - ticketId:', ticketId);
    console.log('CommentSection fetchComments - type:', typeof ticketId);
    console.log('CommentSection fetchComments - !ticketId:', !ticketId);
    console.log('CommentSection fetchComments - ticketId <= 0:', ticketId <= 0);
    console.log('CommentSection fetchComments - Number(ticketId):', Number(ticketId));

    // ticketIdが有効でない場合は処理を停止
    const numericTicketId = Number(ticketId);
    if (!ticketId || isNaN(numericTicketId) || numericTicketId <= 0) {
      console.log('CommentSection - Invalid ticketId detected:', ticketId);
      setError('無効なチケットIDです');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getComments(ticketId);
      setComments(response.comments);
    } catch (err) {
      console.error('fetchComments error:', err);
      setError(err instanceof Error ? err.message : 'コメントの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  // 新規コメントを作成
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('handleSubmitComment - ticketId:', ticketId, 'type:', typeof ticketId);

    if (!ticketId || ticketId <= 0) {
      setError('無効なチケットIDです');
      return;
    }

    if (!newComment.trim()) {
      setError('コメント内容を入力してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const commentData: CreateCommentRequest = {
        content: newComment.trim()
      };

      console.log('Creating comment with ticketId:', ticketId, 'data:', commentData);
      const response = await apiService.createComment(ticketId, commentData);

      // コメント一覧を更新
      setComments(prev => [...prev, response.comment]);
      setNewComment('');
    } catch (err) {
      console.error('handleSubmitComment error:', err);
      setError(err instanceof Error ? err.message : 'コメントの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 日時フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // コンポーネントマウント時にコメントを取得
  useEffect(() => {
    fetchComments();
  }, [ticketId, fetchComments]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">コメント</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">コメントを読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        コメント ({comments.length}) - DEBUG: ticketId={ticketId}
      </h3>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* コメント一覧 */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            まだコメントがありません。最初のコメントを追加してください。
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {comment.user_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({comment.user_email})
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 新規コメント作成フォーム */}
      <form onSubmit={handleSubmitComment} className="border-t pt-6">
        <div className="mb-4">
          <label htmlFor="new-comment" className="block text-sm font-medium text-gray-700 mb-2">
            新しいコメントを追加 (DEBUG: ticketId={ticketId})
          </label>
          <textarea
            id="new-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力してください..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                投稿中...
              </>
            ) : (
              'コメントを投稿'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}; 