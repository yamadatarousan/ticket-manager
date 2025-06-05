import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { apiService } from '../services/api';

interface TicketEditFormProps {
  ticket: Ticket;
  onSuccess: (ticket: Ticket) => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
}

/**
 * チケット編集フォームコンポーネント
 * 
 * 既存のチケット情報を編集するためのフォームコンポーネントです。
 * 以下の機能を提供します：
 * - チケット情報の表示と編集
 * - バリデーション機能
 * - エラーハンドリング
 * - 読み込み状態の表示
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.ticket - 編集対象のチケット情報
 * @param props.onSuccess - 編集成功時のコールバック関数
 * @param props.onCancel - キャンセル時のコールバック関数
 * @returns チケット編集フォームのReactコンポーネント
 * 
 * @example
 * ```tsx
 * <TicketEditForm
 *   ticket={selectedTicket}
 *   onSuccess={(updatedTicket) => {
 *     console.log('チケットが更新されました:', updatedTicket);
 *     navigate('/tickets');
 *   }}
 *   onCancel={() => {
 *     navigate('/tickets');
 *   }}
 * />
 * ```
 */
export const TicketEditForm: React.FC<TicketEditFormProps> = ({
  ticket,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    assigned_to: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // チケット情報でフォームを初期化
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assigned_to ? ticket.assigned_to.toString() : ''
      });
    }
  }, [ticket]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('説明を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ticketData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : undefined
      };
      
      const response = await apiService.updateTicket(ticket.id, ticketData);
      onSuccess(response.ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チケットの更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">チケット編集</h2>
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← 一覧に戻る
          </button>
        </div>

        {/* チケット情報 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">チケットID:</span>
              <span className="ml-2 text-gray-900">#{ticket.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">作成者:</span>
              <span className="ml-2 text-gray-900">{ticket.created_by}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">作成日:</span>
              <span className="ml-2 text-gray-900">
                {new Date(ticket.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">最終更新:</span>
              <span className="ml-2 text-gray-900">
                {new Date(ticket.updated_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="チケットのタイトルを入力してください"
              required
            />
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="チケットの詳細な説明を入力してください"
              required
            />
          </div>

          {/* ステータスと優先度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="open">オープン</option>
                <option value="in_progress">進行中</option>
                <option value="resolved">解決済み</option>
                <option value="closed">クローズ</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>
          </div>

          {/* 担当者 */}
          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-2">
              担当者（メールアドレス）
            </label>
            <input
              type="email"
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="担当者のメールアドレス（任意）"
            />
            <p className="mt-1 text-sm text-gray-500">
              担当者を指定しない場合は空欄のままにしてください
            </p>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  更新中...
                </>
              ) : (
                'チケットを更新'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 