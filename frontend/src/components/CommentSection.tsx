/**
 * コメントセクション - ハイセンスデザイン
 * 
 * チケットに対するコメントを表示し、新しいコメントを追加するための機能を提供します。
 * モダンなデザインシステムを適用し、視覚的な魅力とユーザビリティを向上させています。
 */
import React, { useState } from 'react';
import { Comment } from '../types/index';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CommentSectionProps {
  /** チケットID */
  ticketId: number;
  /** コメント一覧 */
  comments: Comment[];
  /** コメント追加時のコールバック */
  onCommentAdded: (comment: Comment) => void;
  /** コメント削除時のコールバック */
  onCommentDeleted: (commentId: number) => void;
}

/**
 * コメントセクションコンポーネント
 */
export const CommentSection: React.FC<CommentSectionProps> = ({
  ticketId,
  comments,
  onCommentAdded,
  onCommentDeleted
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新規コメント送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await apiService.createComment(ticketId, {
        content: newComment
      });

      onCommentAdded(response.comment);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメント削除
  const handleDelete = async (commentId: number) => {
    if (window.confirm('このコメントを削除してもよろしいですか？')) {
      try {
        setError(null);
        await apiService.deleteComment(commentId);
        onCommentDeleted(commentId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'コメントの削除に失敗しました');
      }
    }
  };

  // コメントの編集権限チェック
  const canEditComment = (comment: Comment) => {
    if (!user) return false;

    // 管理者は全て編集可能
    if (user.role === 'admin') return true;

    // 自分のコメントのみ編集可能
    return comment.user_id === user.id;
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 時間差を表示（〜分前、〜時間前など）
  const getTimeAgo = (dateString: string) => {
    const commentDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - commentDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    if (diffHour < 24) return `${diffHour}時間前`;
    if (diffDay < 30) return `${diffDay}日前`;

    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md animate-fade-in">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* コメント入力フォーム */}
      <form onSubmit={handleSubmit} className="animate-fade-in">
        <div className="card-glass mb-6">
          <div className="card-body">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="form-input w-full h-24 rounded-lg resize-none transition-all"
                  placeholder="コメントを入力..."
                  required
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className={`btn-primary flex items-center ${isSubmitting || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        送信中...
                      </>
                    ) : '投稿する'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* コメント一覧 */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-500">まだコメントはありません</p>
            <p className="text-sm text-gray-400 mt-1">最初のコメントを投稿しましょう</p>
          </div>
        ) : (
          comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((comment) => (
            <div key={comment.id} className="flex space-x-4 animate-slide-up" style={{ animationDelay: `${comment.id * 0.05}s` }}>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold">
                  {comment.user_name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
              <div className="flex-grow">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{comment.user_name}</span>
                      <span className="text-xs text-gray-500 ml-2" title={formatDate(comment.created_at)}>
                        {getTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    {canEditComment(comment) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="コメントを削除"
                      >
                        <span className="text-sm">🗑️</span>
                      </button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 