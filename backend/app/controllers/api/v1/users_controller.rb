# ==============================================================================
# ユーザーコントローラー
#
# ユーザー管理に関するAPIエンドポイントを提供するコントローラーです。
# ユーザーの一覧取得、詳細表示、作成、更新、削除機能を担当します。
# ==============================================================================
class Api::V1::UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [ :create ]
  before_action :set_user, only: %i[show update destroy]

  # ユーザー一覧の取得
  #
  # @route GET /api/v1/users
  # @param role [String] フィルタリングする役割（オプション）
  # @param limit [Integer] 取得する最大件数（デフォルト: 50）
  # @param offset [Integer] スキップする件数（デフォルト: 0）
  # @return [JSON] ユーザー一覧とメタ情報
  # @status 200 取得成功
  # @status 401 認証エラー
  # @example レスポンス
  #   {
  #     "users": [
  #       {
  #         "id": 1,
  #         "name": "管理者",
  #         "email": "admin@example.com",
  #         "role": "admin",
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
    @users = User.all

    # フィルタリング
    @users = @users.by_role(params[:role]) if params[:role].present?

    # ページネーション
    @users = @users.limit(params[:limit] || 50)
    @users = @users.offset(params[:offset] || 0)

    render json: {
      users: @users.map { |user| user_response(user) },
      meta: {
        total: User.count,
        count: @users.count
      }
    }
  end

  # ユーザー詳細の取得
  #
  # @route GET /api/v1/users/:id
  # @param id [Integer] 取得するユーザーのID
  # @return [JSON] ユーザー詳細情報
  # @status 200 取得成功
  # @status 404 ユーザーが見つからない
  # @status 401 認証エラー
  # @example レスポンス
  #   {
  #     "id": 1,
  #     "name": "管理者",
  #     "email": "admin@example.com",
  #     "role": "admin",
  #     "created_at": "2024-01-01T00:00:00.000Z",
  #     "updated_at": "2024-01-01T00:00:00.000Z"
  #   }
  def show
    render json: user_response(@user)
  end

  # ユーザーの新規作成（登録）
  #
  # @route POST /api/v1/users
  # @param user [Hash] ユーザー情報
  # @param user[:name] [String] ユーザー名（必須）
  # @param user[:email] [String] メールアドレス（必須、一意）
  # @param user[:password] [String] パスワード（必須、6文字以上）
  # @param user[:password_confirmation] [String] パスワード確認（必須、passwordと一致）
  # @param user[:role] [String] 役割（オプション、デフォルト: "user"）
  # @return [JSON] 作成されたユーザー情報とトークン
  # @status 201 作成成功
  # @status 422 バリデーションエラー
  # @example リクエスト
  #   {
  #     "user": {
  #       "name": "新規ユーザー",
  #       "email": "newuser@example.com",
  #       "password": "password123",
  #       "password_confirmation": "password123",
  #       "role": "user"
  #     }
  #   }
  # @example レスポンス（成功）
  #   {
  #     "user": {
  #       "id": 10,
  #       "name": "新規ユーザー",
  #       "email": "newuser@example.com",
  #       "role": "user",
  #       "created_at": "2024-01-01T00:00:00.000Z",
  #       "updated_at": "2024-01-01T00:00:00.000Z"
  #     },
  #     "token": "jwt_token_string",
  #     "message": "ユーザーが正常に作成されました"
  #   }
  def create
    @user = User.new(user_params)

    if @user.save
      token = @user.generate_jwt_token
      render json: {
        user: user_response(@user),
        token: token,
        message: "ユーザーが正常に作成されました"
      }, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # ユーザー情報の更新
  #
  # @route PATCH/PUT /api/v1/users/:id
  # @param id [Integer] 更新するユーザーのID
  # @param user [Hash] 更新するユーザー情報
  # @param user[:name] [String] ユーザー名（オプション）
  # @param user[:email] [String] メールアドレス（オプション、一意）
  # @param user[:password] [String] パスワード（オプション、6文字以上）
  # @param user[:password_confirmation] [String] パスワード確認（オプション、passwordと一致）
  # @param user[:role] [String] 役割（オプション）
  # @return [JSON] 更新されたユーザー情報
  # @status 200 更新成功
  # @status 404 ユーザーが見つからない
  # @status 401 認証エラー
  # @status 422 バリデーションエラー
  # @example リクエスト
  #   {
  #     "user": {
  #       "name": "更新後の名前",
  #       "role": "manager"
  #     }
  #   }
  def update
    if @user.update(user_params)
      render json: user_response(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # ユーザーの削除
  #
  # @route DELETE /api/v1/users/:id
  # @param id [Integer] 削除するユーザーのID
  # @return [void]
  # @status 204 削除成功
  # @status 404 ユーザーが見つからない
  # @status 401 認証エラー
  # @status 403 権限エラー（自分自身や管理者を削除しようとした場合など）
  def destroy
    @user.destroy!
  end

  private

  # IDからユーザーを取得するプライベートメソッド
  #
  # @param id [Integer] 取得するユーザーのID
  # @return [User] 取得したユーザーオブジェクト
  # @raise [ActiveRecord::RecordNotFound] ユーザーが見つからない場合
  # @private
  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  # パラメータを安全に取得するプライベートメソッド
  #
  # @return [ActionController::Parameters] 許可されたパラメータ
  # @private
  def user_params
    params.require(:user).permit(:name, :email, :role, :password, :password_confirmation)
  end

  # ユーザー情報をレスポンス形式に変換するプライベートメソッド
  #
  # パスワードダイジェストなどの機密情報を除外した
  # ユーザー情報を返します
  #
  # @param user [User] 変換するユーザーオブジェクト
  # @return [Hash] レスポンス用にフォーマットされたユーザー情報
  # @private
  def user_response(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  end
end
