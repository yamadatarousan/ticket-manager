/**
 * プロジェクト詳細 - ハイセンスデザイン
 * 
 * プロジェクトの詳細情報を美しいレイアウトで表示し、関連するチケットを一覧表示します。
 * モダンなデザインシステムを適用し、ユーザビリティと視覚的魅力を両立します。
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'on_hold':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('ja-JP');
  };

  const getTicketStatusLabel = (status: string) => {
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

  const getPriorityLabel = (priority: string) => {
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-10 w-56 rounded-lg"></div>
          <div className="loading-skeleton h-10 w-32 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="card animate-pulse">
              <div className="card-body space-y-4">
                <div className="loading-skeleton h-6 w-3/4 rounded"></div>
                <div className="loading-skeleton h-4 w-full rounded"></div>
                <div className="loading-skeleton h-4 w-full rounded"></div>
                <div className="loading-skeleton h-4 w-2/3 rounded"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="card animate-pulse">
              <div className="card-body space-y-4">
                <div className="loading-skeleton h-6 w-1/2 rounded"></div>
                <div className="loading-skeleton h-20 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 animate-bounce-in">
        <div className="card-body">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-800">エラーが発生しました</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card animate-bounce-in">
        <div className="card-body text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📁</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">プロジェクトが見つかりません</h3>
          <p className="text-gray-600 mb-6">
            指定されたプロジェクトは存在しないか、アクセス権限がありません。
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="btn-primary"
          >
            プロジェクト一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">{project.name}</h1>
          <div className="flex items-center mt-2">
            <span className={`status-badge ${project.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                project.status === 'on_hold' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
              }`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-600">作成日: {formatDate(project.created_at)}</span>
          </div>
        </div>
        <button
          onClick={handleEdit}
          className="btn-secondary hover-lift flex items-center space-x-2"
        >
          <span className="text-lg">✏️</span>
          <span>プロジェクトを編集</span>
        </button>
      </div>

      {/* プロジェクト情報と統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左側：プロジェクト詳細 */}
        <div className="md:col-span-2 space-y-6">
          {/* プロジェクト説明 */}
          <div className="card hover-lift">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">プロジェクト詳細</h3>
            </div>
            <div className="card-body">
              <div className="prose max-w-none">
                {project.description ? (
                  <p className="whitespace-pre-wrap">{project.description}</p>
                ) : (
                  <p className="text-gray-500 italic">説明はありません</p>
                )}
              </div>
            </div>
          </div>

          {/* チケット一覧 */}
          <div className="card hover-lift">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">チケット一覧</h3>
              <button
                onClick={handleCreateTicket}
                className="btn-primary flex items-center space-x-2 py-2"
              >
                <span className="text-lg">➕</span>
                <span>チケット作成</span>
              </button>
            </div>
            <div className="card-body">
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`status-badge ${ticket.status === 'open' ? 'status-open' :
                            ticket.status === 'in_progress' ? 'status-in-progress' :
                              ticket.status === 'resolved' ? 'status-resolved' : 'status-closed'
                            }`}>
                            {getTicketStatusLabel(ticket.status)}
                          </span>
                          <span className={`status-badge ${ticket.priority === 'low' ? 'priority-low' :
                            ticket.priority === 'medium' ? 'priority-medium' :
                              ticket.priority === 'high' ? 'priority-high' : 'priority-urgent'
                            }`}>
                            {getPriorityLabel(ticket.priority)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 ml-4 flex flex-col items-end">
                        <span>{formatDate(ticket.created_at)}</span>
                        {ticket.assigned_to_name && (
                          <span className="mt-1">担当: {ticket.assigned_to_name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎫</span>
                  </div>
                  <p className="text-gray-500 mb-4">このプロジェクトにはまだチケットがありません</p>
                  <button
                    onClick={handleCreateTicket}
                    className="btn-secondary"
                  >
                    最初のチケットを作成
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：プロジェクト情報・統計 */}
        <div className="space-y-6">
          {/* プロジェクト統計 */}
          <div className="card hover-lift">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">プロジェクト統計</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <p className="text-xs text-blue-100 uppercase tracking-wide">総チケット数</p>
                  <p className="text-2xl font-bold mt-1">{tickets.length}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
                  <p className="text-xs text-emerald-100 uppercase tracking-wide">完了チケット</p>
                  <p className="text-2xl font-bold mt-1">
                    {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                  <p className="text-xs text-amber-100 uppercase tracking-wide">進行中</p>
                  <p className="text-2xl font-bold mt-1">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                  <p className="text-xs text-red-100 uppercase tracking-wide">未対応</p>
                  <p className="text-2xl font-bold mt-1">
                    {tickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* プロジェクト情報 */}
          <div className="card hover-lift">
            <div className="card-header">
              <h3 className="text-xl font-bold text-gray-900">プロジェクト情報</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">プロジェクトID</p>
                  <p className="font-medium">#{project.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">作成者</p>
                  <p className="font-medium">{project.creator_name || '不明'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">作成日</p>
                  <p className="font-medium">{formatDate(project.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">最終更新日</p>
                  <p className="font-medium">{formatDate(project.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      {/* 削除機能は現在このビューでは使用しません */}
      {/* {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={true}
          itemName={`プロジェクト: ${project.name}`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )} */}
    </div>
  );
};
