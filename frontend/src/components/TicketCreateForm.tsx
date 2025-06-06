import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Ticket, CreateTicketRequest, Project } from '../types/index';

interface TicketCreateFormProps {
  /** チケット作成後のコールバック関数 */
  onSuccess?: (ticket: Ticket) => void;
  /** チケット作成をキャンセルするコールバック関数 */
  onCancel?: () => void;
  /** プロジェクトID（指定された場合、そのプロジェクトに紐づくチケットを作成） */
  projectId?: number;
}

/**
 * チケット作成フォームコンポーネント
 * 
 * 新しいチケットを作成するためのフォームを提供します。
 * プロジェクトIDが指定された場合、そのプロジェクトに紐づくチケットを作成します。
 */
export const TicketCreateForm: React.FC<TicketCreateFormProps> = ({
  onSuccess,
  onCancel,
  projectId
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTicketRequest>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    project_id: projectId || 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // プロジェクト一覧を取得
  useEffect(() => {
    const fetchProjects = async () => {
      if (projectId) return; // プロジェクトIDが指定されている場合は取得不要

      setIsLoadingProjects(true);
      try {
        const projectsData = await apiService.getProjects();
        setProjects(projectsData || []);
      } catch (err) {
        console.error('プロジェクト一覧の取得に失敗しました:', err);
        setError('プロジェクト一覧の取得に失敗しました');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'project_id' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 必須項目のバリデーション
      if (!formData.title.trim()) {
        throw new Error('タイトルは必須です');
      }
      if (!formData.description.trim()) {
        throw new Error('説明は必須です');
      }
      if (!formData.project_id) {
        throw new Error('プロジェクトを選択してください');
      }

      const ticketData: CreateTicketRequest = {
        ...formData,
        project_id: formData.project_id
      };

      const newTicket = await apiService.createTicket(ticketData);
      if (onSuccess) {
        onSuccess(newTicket);
      }
      navigate(`/tickets/${newTicket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チケットの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          新規チケット作成
        </h3>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* プロジェクト選択（プロジェクトIDが指定されていない場合のみ表示） */}
          {!projectId && (
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
                プロジェクト
              </label>
              {isLoadingProjects ? (
                <div className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-50">
                  プロジェクト一覧を読み込み中...
                </div>
              ) : (
                <select
                  id="project_id"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">プロジェクトを選択してください</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              優先度
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 