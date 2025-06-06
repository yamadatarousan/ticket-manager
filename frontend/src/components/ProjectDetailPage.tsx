/**
 * プロジェクト詳細ページコンポーネント
 *
 * 指定されたプロジェクトの詳細情報を表示します。
 * プロジェクト名、説明、ステータス、期間、進捗率などを表示します。
 * 編集や削除などのアクションへの導線も提供します（権限に応じて）。
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManageProject = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('プロジェクトIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedProject = await apiService.getProject(parseInt(id, 10));
        setProject(fetchedProject);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'プロジェクトの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDeleteProject = async () => {
    if (!project) return;

    if (window.confirm(`プロジェクト「${project.name}」を削除しますか？この操作は元に戻せません。`)) {
      try {
        await apiService.deleteProject(project.id);
        alert('プロジェクトが削除されました');
        navigate('/projects');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'プロジェクトの削除に失敗しました');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarClass = (progressRate: number) => {
    if (progressRate >= 0.8) return 'bg-green-500';
    if (progressRate >= 0.5) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">プロジェクト情報を読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <Link to="/projects" className="text-sm text-red-600 hover:text-red-500 mt-2 block">
          プロジェクト一覧に戻る
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">プロジェクトが見つかりません。</p>
        <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-500 mt-2 block">
          プロジェクト一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-800 text-white px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold truncate" title={project.name}>
            {project.name}
          </h1>
          <span className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(project.status)}`}>
            {project.status_label}
          </span>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6 space-y-6">
        {/* プロジェクト概要 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">プロジェクト概要</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">作成者:</span>
              <span className="ml-2 text-gray-800">{project.creator_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">作成日:</span>
              <span className="ml-2 text-gray-800">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">開始日:</span>
              <span className="ml-2 text-gray-800">{project.start_date ? new Date(project.start_date).toLocaleDateString() : '未設定'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">終了日:</span>
              <span className="ml-2 text-gray-800">{project.end_date ? new Date(project.end_date).toLocaleDateString() : '未設定'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">期間:</span>
              <span className="ml-2 text-gray-800">{project.duration_string}</span>
            </div>
            {project.days_remaining !== null && project.days_remaining !== undefined && (
              <div>
                <span className="font-medium text-gray-600">残り日数:</span>
                <span className={`ml-2 font-semibold ${project.overdue ? 'text-red-600' : project.days_remaining <= 7 ? 'text-yellow-700' : 'text-gray-800'}`}>
                  {project.overdue ? `期限超過 (${Math.abs(project.days_remaining)}日)` : `${project.days_remaining}日`}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 説明 */}
        {project.description && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">詳細説明</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {project.description}
            </p>
          </section>
        )}

        {/* 進捗 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">進捗状況</h2>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
              <div
                className={`h-4 rounded-full ${getProgressBarClass(project.progress_rate)} transition-all duration-500 ease-out`}
                style={{ width: `${project.progress_rate * 100}%` }}
              ></div>
            </div>
            <span className="text-lg font-semibold text-gray-800">
              {Math.round(project.progress_rate * 100)}%
            </span>
          </div>
        </section>

        {/* アクションボタン */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <Link
            to="/projects"
            className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            一覧に戻る
          </Link>
          {canManageProject && (
            <>
              <button
                // onClick={() => navigate(`/projects/${project.id}/edit`)} // TODO: 編集ページへの導線
                onClick={() => alert('プロジェクト編集機能は未実装です')}
                className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                プロジェクト編集
              </button>
              <button
                onClick={handleDeleteProject}
                className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                プロジェクト削除
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
