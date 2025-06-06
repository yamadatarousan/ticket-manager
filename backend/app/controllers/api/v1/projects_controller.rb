# frozen_string_literal: true

# ==============================================================================
# プロジェクト管理APIコントローラー
#
# プロジェクトのCRUD操作を提供するRESTful APIエンドポイント。
# 認証が必要で、適切な権限チェックを行います。
# ==============================================================================
class Api::V1::ProjectsController < ApplicationController
  before_action :set_project, only: [ :show, :update, :destroy ]
  before_action :ensure_admin_or_manager, only: [ :create, :update, :destroy ]

  # =begin
  # @swagger_api {
  #   "resource": "プロジェクト",
  #   "description": "プロジェクト管理API"
  # }
  # =end

  # =begin
  # @swagger_operation {
  #   "notes": "プロジェクト一覧を取得します。クエリパラメータでフィルタリングが可能です。",
  #   "parameters": [
  #     {
  #       "name": "status",
  #       "description": "ステータスでフィルタリング",
  #       "paramType": "query",
  #       "required": false,
  #       "dataType": "string",
  #       "allowableValues": {
  #         "valueType": "LIST",
  #         "values": ["planning", "active", "on_hold", "completed", "cancelled"]
  #       }
  #     },
  #     {
  #       "name": "created_by",
  #       "description": "作成者でフィルタリング",
  #       "paramType": "query",
  #       "required": false,
  #       "dataType": "integer"
  #     }
  #   ],
  #   "summary": "プロジェクト一覧取得",
  #   "responseClass": "Array[Project]"
  # }
  # =end
  def index
    @projects = Project.includes(:creator)

    # ステータスでフィルタリング
    @projects = @projects.by_status(params[:status]) if params[:status].present?

    # 作成者でフィルタリング
    @projects = @projects.created_by_user(params[:created_by]) if params[:created_by].present?

    # ページネーション（将来的に実装）
    # @projects = @projects.page(params[:page]).per(params[:per_page] || 20)

    render json: {
      projects: @projects.map do |project|
        {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          status_label: status_label(project.status),
          start_date: project.start_date,
          end_date: project.end_date,
          created_by: project.created_by,
          creator_name: project.creator.name,
          progress_rate: project.progress_rate,
          days_remaining: project.days_remaining,
          overdue: project.overdue?,
          duration_string: project.duration_string,
          created_at: project.created_at,
          updated_at: project.updated_at
        }
      end,
      meta: {
        total: @projects.count
      }
    }
  rescue StandardError => e
    render json: { error: "プロジェクト一覧の取得に失敗しました: #{e.message}" }, status: :internal_server_error
  end

  # =begin
  # @swagger_operation {
  #   "notes": "指定されたIDのプロジェクト詳細を取得します。",
  #   "parameters": [
  #     {
  #       "name": "id",
  #       "description": "プロジェクトID",
  #       "paramType": "path",
  #       "required": true,
  #       "dataType": "integer"
  #     }
  #   ],
  #   "summary": "プロジェクト詳細取得",
  #   "responseClass": "Project"
  # }
  # =end
  def show
    # プロジェクトに関連するチケットを取得
    tickets = @project.tickets.includes(:creator, :assigned_user)

    render json: {
      id: @project.id,
      name: @project.name,
      description: @project.description,
      status: @project.status,
      status_label: status_label(@project.status),
      start_date: @project.start_date,
      end_date: @project.end_date,
      created_by: @project.created_by,
      creator_name: @project.creator.name,
      progress_rate: @project.progress_rate,
      days_remaining: @project.days_remaining,
      overdue: @project.overdue?,
      duration_string: @project.duration_string,
      created_at: @project.created_at,
      updated_at: @project.updated_at,
      tickets: tickets.map do |ticket|
        {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          status_label: ticket.status&.humanize,
          priority: ticket.priority,
          priority_label: ticket.priority&.humanize,
          assigned_to: ticket.assigned_to,
          assigned_to_name: ticket.assigned_user&.name,
          creator_id: ticket.created_by,
          creator_name: ticket.creator&.name,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at
        }
      end
    }
  rescue StandardError => e
    render json: { error: "プロジェクト詳細の取得に失敗しました: #{e.message}" }, status: :internal_server_error
  end

  # =begin
  # @swagger_operation {
  #   "notes": "新しいプロジェクトを作成します。管理者またはマネージャー権限が必要です。",
  #   "parameters": [
  #     {
  #       "name": "project",
  #       "description": "プロジェクト情報",
  #       "paramType": "body",
  #       "required": true,
  #       "dataType": "ProjectRequest"
  #     }
  #   ],
  #   "summary": "プロジェクト作成",
  #   "responseClass": "Project"
  # }
  # =end
  def create
    @project = Project.new(project_params)
    @project.created_by = current_user.id

    if @project.save
      render json: {
        id: @project.id,
        name: @project.name,
        description: @project.description,
        status: @project.status,
        status_label: status_label(@project.status),
        start_date: @project.start_date,
        end_date: @project.end_date,
        created_by: @project.created_by,
        creator_name: @project.creator.name,
        progress_rate: @project.progress_rate,
        days_remaining: @project.days_remaining,
        overdue: @project.overdue?,
        duration_string: @project.duration_string,
        created_at: @project.created_at,
        updated_at: @project.updated_at
      }, status: :created
    else
      render json: {
        error: "プロジェクトの作成に失敗しました",
        details: @project.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue StandardError => e
    render json: { error: "プロジェクトの作成中にエラーが発生しました: #{e.message}" }, status: :internal_server_error
  end

  # =begin
  # @swagger_operation {
  #   "notes": "既存のプロジェクトを更新します。管理者またはマネージャー権限が必要です。",
  #   "parameters": [
  #     {
  #       "name": "id",
  #       "description": "プロジェクトID",
  #       "paramType": "path",
  #       "required": true,
  #       "dataType": "integer"
  #     },
  #     {
  #       "name": "project",
  #       "description": "更新するプロジェクト情報",
  #       "paramType": "body",
  #       "required": true,
  #       "dataType": "ProjectRequest"
  #     }
  #   ],
  #   "summary": "プロジェクト更新",
  #   "responseClass": "Project"
  # }
  # =end
  def update
    if @project.update(project_params)
      render json: {
        id: @project.id,
        name: @project.name,
        description: @project.description,
        status: @project.status,
        status_label: status_label(@project.status),
        start_date: @project.start_date,
        end_date: @project.end_date,
        created_by: @project.created_by,
        creator_name: @project.creator.name,
        progress_rate: @project.progress_rate,
        days_remaining: @project.days_remaining,
        overdue: @project.overdue?,
        duration_string: @project.duration_string,
        created_at: @project.created_at,
        updated_at: @project.updated_at
      }
    else
      render json: {
        error: "プロジェクトの更新に失敗しました",
        details: @project.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue StandardError => e
    render json: { error: "プロジェクトの更新中にエラーが発生しました: #{e.message}" }, status: :internal_server_error
  end

  # =begin
  # @swagger_operation {
  #   "notes": "指定されたプロジェクトを削除します。管理者またはマネージャー権限が必要です。",
  #   "parameters": [
  #     {
  #       "name": "id",
  #       "description": "プロジェクトID",
  #       "paramType": "path",
  #       "required": true,
  #       "dataType": "integer"
  #     }
  #   ],
  #   "summary": "プロジェクト削除"
  # }
  # =end
  def destroy
    @project.destroy!
    head :no_content
  rescue StandardError => e
    render json: { error: "プロジェクトの削除に失敗しました: #{e.message}" }, status: :internal_server_error
  end

  private

  # プロジェクトを取得
  def set_project
    @project = Project.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "プロジェクトが見つかりません" }, status: :not_found
  end

  # プロジェクト作成・更新時の許可パラメータ
  def project_params
    params.require(:project).permit(:name, :description, :status, :start_date, :end_date)
  end

  # 管理者またはマネージャー権限のチェック
  def ensure_admin_or_manager
    return if current_user&.admin? || current_user&.manager?

    render json: { error: "この操作には管理者またはマネージャー権限が必要です" }, status: :forbidden
  end

  # ステータスラベルを取得
  def status_label(status)
    case status
    when "planning"
      "計画中"
    when "active"
      "進行中"
    when "on_hold"
      "一時停止"
    when "completed"
      "完了"
    when "cancelled"
      "キャンセル"
    else
      status
    end
  end
end
