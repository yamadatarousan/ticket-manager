# ==============================================================================
# チケットコントローラー
#
# チケット関連のAPIエンドポイントを提供するコントローラーです。
# チケットの一覧取得、詳細表示、作成、更新、削除機能を担当します。
# ==============================================================================
class Api::V1::TicketsController < ApplicationController
  before_action :set_ticket, only: [ :show, :update, :destroy ]

  # チケット一覧の取得
  #
  # @route GET /api/v1/tickets
  # @param status [String] フィルタリングするステータス（オプション）
  # @param priority [String] フィルタリングする優先度（オプション）
  # @param assigned_to [String] 担当者のメールアドレスでフィルタリング（オプション）
  # @param created_by [String] 作成者のメールアドレスでフィルタリング（オプション）
  # @param limit [Integer] 取得する最大件数（デフォルト: 50）
  # @param offset [Integer] スキップする件数（デフォルト: 0）
  # @return [JSON] チケット一覧とメタ情報
  # @example レスポンス
  #   {
  #     "tickets": [
  #       {
  #         "id": 1,
  #         "title": "バグ修正",
  #         "description": "ログイン画面のエラーを修正",
  #         "status": "open",
  #         "priority": "high",
  #         "assigned_to": "user@example.com",
  #         "created_by": "manager@example.com",
  #         "created_at": "2024-01-01T00:00:00.000Z",
  #         "updated_at": "2024-01-01T00:00:00.000Z"
  #       },
  #       ...
  #     ],
  #     "meta": {
  #       "total": 100,
  #       "count": 50
  #     }
  #   }
  def index
    @tickets = Ticket.includes(:project, :creator, :assigned_user)

    # フィルタリング
    @tickets = @tickets.by_status(params[:status]) if params[:status].present?
    @tickets = @tickets.by_priority(params[:priority]) if params[:priority].present?
    @tickets = @tickets.assigned_to_user(params[:assigned_to]) if params[:assigned_to].present?
    @tickets = @tickets.created_by_user(params[:created_by]) if params[:created_by].present?
    @tickets = @tickets.by_project(params[:project_id]) if params[:project_id].present?

    # ページネーション（将来的に実装可能）
    @tickets = @tickets.limit(params[:limit] || 50)
    @tickets = @tickets.offset(params[:offset] || 0)

    render json: {
      tickets: @tickets.map { |ticket| ticket_with_associations(ticket) },
      meta: {
        total: Ticket.count,
        count: @tickets.count
      }
    }
  end

  # チケット詳細の取得
  #
  # @route GET /api/v1/tickets/:id
  # @param id [Integer] 取得するチケットのID
  # @return [JSON] チケット詳細情報
  # @status 200 取得成功
  # @status 404 チケットが見つからない
  # @example レスポンス
  #   {
  #     "ticket": {
  #       "id": 1,
  #       "title": "バグ修正",
  #       "description": "ログイン画面のエラーを修正",
  #       "status": "open",
  #       "priority": "high",
  #       "assigned_to": "user@example.com",
  #       "created_by": "manager@example.com",
  #       "created_at": "2024-01-01T00:00:00.000Z",
  #       "updated_at": "2024-01-01T00:00:00.000Z"
  #     }
  #   }
  def show
    render json: { ticket: @ticket }
  end

  # チケットの新規作成
  #
  # @route POST /api/v1/tickets
  # @param ticket [Hash] チケット情報
  # @param ticket[:title] [String] チケットのタイトル（必須）
  # @param ticket[:description] [String] チケットの詳細説明（必須）
  # @param ticket[:status] [String] チケットのステータス（オプション、デフォルト: "open"）
  # @param ticket[:priority] [String] チケットの優先度（オプション、デフォルト: "medium"）
  # @param ticket[:assigned_to] [String] 担当者のメールアドレス（オプション）
  # @return [JSON] 作成されたチケット情報
  # @status 201 作成成功
  # @status 422 バリデーションエラー
  # @example リクエスト
  #   {
  #     "ticket": {
  #       "title": "新規機能",
  #       "description": "検索機能の実装",
  #       "priority": "high",
  #       "assigned_to": "user@example.com"
  #     }
  #   }
  # @example レスポンス（成功）
  #   {
  #     "ticket": {
  #       "id": 10,
  #       "title": "新規機能",
  #       "description": "検索機能の実装",
  #       "status": "open",
  #       "priority": "high",
  #       "assigned_to": "user@example.com",
  #       "created_by": "admin@example.com",
  #       "created_at": "2024-01-01T00:00:00.000Z",
  #       "updated_at": "2024-01-01T00:00:00.000Z"
  #     }
  #   }
  def create
    @ticket = Ticket.new(ticket_params)
    @ticket.created_by = @current_user.id

    if @ticket.save
      render json: { ticket: @ticket }, status: :created
    else
      render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # チケットの更新
  #
  # @route PATCH/PUT /api/v1/tickets/:id
  # @param id [Integer] 更新するチケットのID
  # @param ticket [Hash] 更新するチケット情報
  # @param ticket[:title] [String] チケットのタイトル（オプション）
  # @param ticket[:description] [String] チケットの詳細説明（オプション）
  # @param ticket[:status] [String] チケットのステータス（オプション）
  # @param ticket[:priority] [String] チケットの優先度（オプション）
  # @param ticket[:assigned_to] [String] 担当者のメールアドレス（オプション）
  # @return [JSON] 更新されたチケット情報
  # @status 200 更新成功
  # @status 404 チケットが見つからない
  # @status 422 バリデーションエラー
  # @example リクエスト
  #   {
  #     "ticket": {
  #       "status": "in_progress",
  #       "assigned_to": "user@example.com"
  #     }
  #   }
  def update
    if @ticket.update(ticket_params)
      render json: { ticket: @ticket }
    else
      render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # チケットの削除
  #
  # @route DELETE /api/v1/tickets/:id
  # @param id [Integer] 削除するチケットのID
  # @return [void]
  # @status 204 削除成功
  # @status 404 チケットが見つからない
  def destroy
    @ticket.destroy
    head :no_content
  end

  private

  # IDからチケットを取得するプライベートメソッド
  #
  # @param id [Integer] 取得するチケットのID
  # @return [Ticket] 取得したチケットオブジェクト
  # @raise [ActiveRecord::RecordNotFound] チケットが見つからない場合
  # @private
  def set_ticket
    @ticket = Ticket.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Ticket not found" }, status: :not_found
  end

  # パラメータを安全に取得するプライベートメソッド
  #
  # @return [ActionController::Parameters] 許可されたパラメータ
  # @private
  def ticket_params
    params.require(:ticket).permit(:title, :description, :status, :priority, :assigned_to, :project_id)
  end

  # チケット情報に関連データを含めて返すヘルパーメソッド
  def ticket_with_associations(ticket)
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
      project_id: ticket.project_id,
      project_name: ticket.project&.name,
      creator_id: ticket.created_by,
      creator_name: ticket.creator&.name,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      created_by: ticket.created_by,
      created_by_name: ticket.creator&.name
    }
  end
end
