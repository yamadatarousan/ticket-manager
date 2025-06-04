# ==============================================================================
# アプリケーションコントローラー
#
# 全てのAPIコントローラーの基底クラスです。
# JWT認証の共通機能、権限チェック、現在のユーザー管理など、
# コントローラー全体で使用する機能を提供します。
# ==============================================================================
class ApplicationController < ActionController::API
  before_action :authenticate_request

  # 現在のユーザーオブジェクト
  # @return [User, nil] 認証されたユーザー、または未認証の場合はnil
  attr_reader :current_user

  private

  # JWTトークンによるユーザー認証
  #
  # Authorizationヘッダーからトークンを取得し、ユーザーを認証します。
  # 認証に成功した場合は@current_userにユーザーオブジェクトを設定します。
  # 認証に失敗した場合は401 Unauthorizedを返します。
  #
  # @return [User] 認証されたユーザー
  # @raise [401] 認証失敗時
  # @example ヘッダー例
  #   Authorization: Bearer eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTYyMzQ1Njc4OX0=
  def authenticate_request
    header = request.headers["Authorization"]
    token = header.split(" ").last if header.present? && header.start_with?("Bearer ")

    if token.present?
      @current_user = User.decode_jwt_token(token)
      render json: { error: "認証が必要です" }, status: :unauthorized unless @current_user
    else
      render json: { error: "認証トークンが見つかりません" }, status: :unauthorized
    end
  end

  # 管理者権限のチェック
  #
  # 現在のユーザーが管理者(admin)であることを確認します。
  # 管理者でない場合は403 Forbiddenを返します。
  #
  # @return [nil] 権限チェック成功時
  # @raise [403] 権限不足時
  # @example 使用例
  #   before_action :authenticate_admin_request, only: [:destroy, :update_role]
  def authenticate_admin_request
    authenticate_request
    return if @current_user&.admin?

    render json: { error: "管理者権限が必要です" }, status: :forbidden
  end

  # マネージャー以上の権限チェック
  #
  # 現在のユーザーがマネージャー(manager)または管理者(admin)であることを確認します。
  # 該当しない場合は403 Forbiddenを返します。
  #
  # @return [nil] 権限チェック成功時
  # @raise [403] 権限不足時
  # @example 使用例
  #   before_action :authenticate_manager_or_admin_request, only: [:bulk_update, :reports]
  def authenticate_manager_or_admin_request
    authenticate_request
    return if @current_user&.admin? || @current_user&.manager?

    render json: { error: "マネージャー以上の権限が必要です" }, status: :forbidden
  end

  # 認証をスキップするメソッド
  #
  # 認証が不要なアクション（公開APIなど）で使用します。
  # このメソッドは継承先のコントローラーでオーバーライドすることを想定しています。
  #
  # @example 使用例
  #   skip_before_action :authenticate_request, only: [:index, :show]
  #   before_action :skip_authentication, only: [:index, :show]
  def skip_authentication
    # このメソッドが呼ばれた場合は認証をスキップ
  end

  protected

  # 現在のユーザーIDを取得
  #
  # @return [Integer, nil] 認証されたユーザーのID、または未認証の場合はnil
  # @example 使用例
  #   def create
  #     @ticket = Ticket.new(ticket_params.merge(created_by: current_user_id))
  #     # ...
  #   end
  def current_user_id
    @current_user&.id
  end

  # 現在のユーザーのロールを取得
  #
  # @return [String, nil] 認証されたユーザーのロール（'user', 'manager', 'admin'）、または未認証の場合はnil
  # @example 使用例
  #   def index
  #     @tickets = current_user_role == 'admin' ? Ticket.all : Ticket.by_created_by(current_user_id)
  #     # ...
  #   end
  def current_user_role
    @current_user&.role
  end
end
