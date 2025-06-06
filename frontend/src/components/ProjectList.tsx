/**
 * プロジェクト一覧 - ハイセンスデザイン
 * 
 * プロジェクトを美しいカードレイアウトで表示し、直感的な操作を提供します。
 * モダンなデザインシステムを適用し、ユーザビリティと視覚的魅力を両立します。
 * 
 * 主な機能：
 * - カードベースのレスポンシブレイアウト
 * - プロジェクト進捗状況の視覚的表示
 * - 最近のアクティビティと概要の表示
 * - スムーズなアニメーション効果
 * - アクセシビリティ対応
 */
import React, { useState, useEffect } from 'react';
import { Project } from '../types/index';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProjectListProps {
  /** プロジェクトクリック時のコールバック関数 */
  onProjectClick: (project: Project) => void;
  /** プロジェクト編集時のコールバック関数 */
  onProjectEdit: (project: Project) => void;
  /** プロジェクト作成ボタンクリック時のコールバック関数 */
  onCreateProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onProjectClick,
  onProjectEdit,
  onCreateProject
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const projectsData = await apiService.getProjects();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'プロジェクトの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // プロジェクトのステータスラベルを取得
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return '計画中';
      case 'active': return '進行中';
      case 'on_hold': return '保留中';
      case 'completed': return '完了';
      case 'cancelled': return '中止';
      default: return status;
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '未定義';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // プロジェクト期間の表示
  const getProjectPeriod = (startDate?: string, endDate?: string) => {
    if (!startDate) return '日程未定';
    if (!endDate) return `${formatDate(startDate)} 〜 継続中`;
    return `${formatDate(startDate)} 〜 ${formatDate(endDate)}`;
  };

  // 進捗率に基づいたカラークラスを取得
  const getProgressColorClass = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-500';
    if (rate >= 75) return 'bg-green-500';
    if (rate >= 50) return 'bg-lime-500';
    if (rate >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-8 w-40 rounded-lg"></div>
          <div className="loading-skeleton h-10 w-40 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="card-body space-y-4">
                <div className="loading-skeleton h-6 w-3/4 rounded"></div>
                <div className="loading-skeleton h-4 w-full rounded"></div>
                <div className="loading-skeleton h-4 w-2/3 rounded"></div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="loading-skeleton h-2 w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">プロジェクト管理</h1>
          <p className="text-gray-600 mt-2">
            <span className="font-semibold text-gray-900">{projects.length}</span> 個のプロジェクト
          </p>
        </div>
        <button
          onClick={onCreateProject}
          className="btn-primary hover-lift flex items-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>新規プロジェクト</span>
        </button>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50 animate-bounce-in">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* プロジェクトカードグリッド */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="card hover-lift cursor-pointer animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onProjectClick(project)}
            >
              <div className="card-body">
                {/* プロジェクトヘッダー */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                      {project.name}
                    </h3>
                    <span className={`status-badge ${project.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                      project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on_hold' ? 'bg-amber-100 text-amber-800' :
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectEdit(project);
                    }}
                    className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="編集"
                  >
                    <span className="text-gray-400 hover:text-gray-600">✏️</span>
                  </button>
                </div>

                {/* プロジェクト説明 */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {project.description || 'プロジェクトの説明はありません。'}
                </p>

                {/* 進捗状況 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">進捗状況</span>
                    <span className="text-xs font-semibold text-gray-900">{project.progress_rate || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${getProgressColorClass(project.progress_rate || 0)}`}
                      style={{ width: `${project.progress_rate || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* プロジェクト情報 */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">👤</span>
                    <span>担当: {project.creator_name || '未割り当て'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">📅</span>
                    <span>{getProjectPeriod(project.start_date, project.end_date)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-amber-600">🎫</span>
                    <span>チケット数: {0}</span>
                  </div>
                </div>
              </div>

              {/* プロジェクトフッター */}
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>#{project.id}</span>
                    <span>•</span>
                    <span>作成日: {formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <span className="text-xs">詳細を見る</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📁</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              プロジェクトがまだありません
            </h3>
            <p className="text-gray-600 mb-6">
              最初のプロジェクトを作成して、チームの作業を管理しましょう。
            </p>
            <button
              onClick={onCreateProject}
              className="btn-primary"
            >
              最初のプロジェクトを作成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 