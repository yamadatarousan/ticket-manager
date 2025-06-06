/**
 * プロジェクト一覧コンポーネント
 * 
 * プロジェクトの一覧表示、フィルタリング、ソート機能を提供します。
 * 管理者・マネージャーにはプロジェクト作成・編集・削除機能も提供します。
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types/index';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ProjectListProps {
  onProjectClick?: (project: Project) => void;
  onProjectEdit: (project: Project) => void;
  onCreateProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onProjectClick,
  onProjectEdit,
  onCreateProject
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Project>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const canManageProjects = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, searchTerm, statusFilter, sortField, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectList = await apiService.getProjects();

      // レスポンスが配列であることを確認
      if (Array.isArray(projectList)) {
        setProjects(projectList);
      } else {
        console.error('Unexpected API response format:', projectList);
        setProjects([]);
        setError('APIレスポンスの形式が不正です');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロジェクトの取得に失敗しました');
      console.error('Error fetching projects:', err);
      setProjects([]); // エラー時は空配列を設定
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    // projectsが配列でない場合は空配列を使用
    if (!Array.isArray(projects)) {
      setFilteredProjects([]);
      return;
    }

    let filtered = [...projects];

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'start_date' || sortField === 'end_date') {
        aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
        bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProjects(filtered);
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;

    try {
      await apiService.deleteProject(deleteProject.id);
      setDeleteProject(null);
      await fetchProjects(); // リストを再取得
    } catch (err) {
      alert(err instanceof Error ? err.message : 'プロジェクトの削除に失敗しました');
    }
  };

  const getStatusBadgeClass = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarClass = (progress: number) => {
    if (progress >= 0.8) return 'bg-green-500';
    if (progress >= 0.5) return 'bg-yellow-500';
    if (progress >= 0.2) return 'bg-blue-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プロジェクト一覧</h1>
          <p className="mt-1 text-sm text-gray-600">
            {filteredProjects.length}件のプロジェクトが見つかりました
          </p>
        </div>
        {canManageProjects && (
          <Link
            to="/projects/new"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新規プロジェクト
          </Link>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {/* フィルター・検索エリア */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="プロジェクト名、説明、作成者で検索..."
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* ステータスフィルター */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">すべて</option>
              <option value="planning">計画中</option>
              <option value="active">進行中</option>
              <option value="on_hold">一時停止</option>
              <option value="completed">完了</option>
            </select>
          </div>

          {/* ソート */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              並び順
            </label>
            <div className="flex space-x-2">
              <select
                id="sort"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as keyof Project)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="created_at">作成日時</option>
                <option value="name">プロジェクト名</option>
                <option value="status">ステータス</option>
                <option value="end_date">終了日</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
          >
            <div className="p-6">
              {/* プロジェクト名とステータス */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => onProjectClick?.(project)}
                  >
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    作成者: {project.creator_name}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                  {project.status_label}
                </span>
              </div>

              {/* 説明 */}
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>
              )}

              {/* 進捗バー */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>進捗</span>
                  <span>{Math.round(project.progress_rate * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressBarClass(project.progress_rate)}`}
                    style={{ width: `${project.progress_rate * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 期間情報 */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">期間:</span>
                  <span className="text-gray-900">{project.duration_string}</span>
                </div>
                {project.days_remaining !== null && project.days_remaining !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">残り:</span>
                    <span className={`font-medium ${project.overdue ? 'text-red-600' : project.days_remaining <= 7 ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {project.overdue ? '期限超過' : `${project.days_remaining}日`}
                    </span>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  詳細を見る
                </Link>
                {canManageProjects && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-500"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => setDeleteProject(project)}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空の状態 */}
      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">プロジェクトが見つかりません</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter ? '検索条件を変更してお試しください。' : 'まだプロジェクトが作成されていません。'}
          </p>
          {canManageProjects && !searchTerm && !statusFilter && (
            <div className="mt-6">
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                最初のプロジェクトを作成
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteProject && (
        <DeleteConfirmModal
          isOpen={true}
          itemName={`プロジェクト: ${deleteProject.name}`}
          onCancel={() => setDeleteProject(null)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
}; 