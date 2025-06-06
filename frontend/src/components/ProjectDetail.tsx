/**
 * プロジェクト詳細コンポーネント
 * 
 * プロジェクトの詳細情報を表示し、関連するチケットの一覧も表示します。
 * 管理者・マネージャーにはプロジェクト編集・削除機能も提供します。
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, Ticket } from '../types/index';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canManageProjects = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchProject();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProject = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const [projectData, ticketsData] = await Promise.all([
        apiService.getProject(parseInt(id, 10)),
        apiService.getTickets({ project_id: parseInt(id, 10) })
      ]);
      setProject(projectData);
      setTickets(ticketsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロジェクトの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!project) return;
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      await apiService.deleteProject(project.id);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロジェクトの削除に失敗しました');
    }
  };

  const handleCreateTicket = () => {
    if (!project) return;
    navigate(`/tickets/new?project_id=${project.id}`);
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarClass = (progressRate: number) => {
    if (progressRate >= 0.8) return 'bg-green-500';
    if (progressRate >= 0.5) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTicketStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">プロジェクトを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm whitespace-pre-line">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">プロジェクトが見つかりません</h3>
        <p className="mt-1 text-sm text-gray-500">
          指定されたプロジェクトは存在しないか、アクセス権限がありません。
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            プロジェクト一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            作成者: {project.creator_name}
          </p>
        </div>
        {canManageProjects && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              削除
            </button>
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* ステータスと進捗 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                {project.status_label}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">進捗:</span>
                <span className="text-sm font-medium">{Math.round(project.progress_rate * 100)}%</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressBarClass(project.progress_rate)}`}
                  style={{ width: `${project.progress_rate * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 説明 */}
          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">説明</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{project.description}</p>
            </div>
          )}

          {/* 期間情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">期間</h3>
              <p className="text-sm text-gray-600">{project.duration_string}</p>
            </div>
            {project.days_remaining !== null && project.days_remaining !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">残り期間</h3>
                <p className={`text-sm font-medium ${project.overdue ? 'text-red-600' : project.days_remaining <= 7 ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {project.overdue ? '期限超過' : `${project.days_remaining}日`}
                </p>
              </div>
            )}
          </div>

          {/* 作成・更新日時 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">作成日時</h3>
              <p className="text-sm text-gray-600">
                {new Date(project.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">最終更新日時</h3>
              <p className="text-sm text-gray-600">
                {new Date(project.updated_at).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* チケット一覧 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">関連チケット</h2>
            <button
              onClick={handleCreateTicket}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              チケットを作成
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">チケットがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                このプロジェクトにはまだチケットが作成されていません。
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateTicket}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  最初のチケットを作成
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      チケット
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      優先度
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      担当者
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                        <div className="text-sm text-gray-500">#{ticket.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTicketStatusBadgeClass(ticket.status)}`}>
                          {ticket.status_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTicketPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ticket.assigned_to_name || '未割り当て'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.updated_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={true}
          itemName={`プロジェクト: ${project.name}`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
