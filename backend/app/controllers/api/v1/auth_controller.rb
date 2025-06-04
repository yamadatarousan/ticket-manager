# ==============================================================================
# 認証コントローラー
#
# ユーザー認証に関するAPIエンドポイントを提供するコントローラーです。
# ログイン、ログアウト、現在のユーザー情報取得の機能を担当します。
# ==============================================================================
class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [ :login ]
  before_action :authenticate_request, only: [ :logout, :me ]

  # ユーザーログイン処理
  #
  # @route POST /api/v1/auth/login
  # @param user [Hash] ユーザー認証情報
  # @param user[:email] [String] メールアドレス
  # @param user[:password] [String] パスワード
  # @return [JSON] 認証結果（ユーザー情報、トークン、メッセージ）
  # @status 200 ログイン成功
  # @status 401 認証失敗
  # @example リクエスト
  #   POST /api/v1/auth/login
  #   {
  #     "user": {
  #       "email": "user@example.com",
  #       "password": "password123"
  #     }
  #   }
  # @example 成功レスポンス
  #   {
  #     "user": {
  #       "id": 1,
  #       "name": "テストユーザー",
  #       "email": "user@example.com",
  #       "role": "user",
  #       "created_at": "2024-01-01T00:00:00.000Z",
  #       "updated_at": "2024-01-01T00:00:00.000Z"
  #     },
  #     "token": "eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTYyMzQ1Njc4OX0=",
  #     "message": "ログインに成功しました"
  #   }
  def login
    user = User.authenticate(login_params[:email], login_params[:password])

    if user
      token = user.generate_jwt_token
      render json: {
        user: user_response(user),
        token: token,
        message: "ログインに成功しました"
      }, status: :ok
    else
      render json: {
        error: "メールアドレスまたはパスワードが間違っています"
      }, status: :unauthorized
    end
  end

  # ユーザーログアウト処理
  #
  # @route POST /api/v1/auth/logout
  # @header Authorization [String] Bearer + JWTトークン
  # @return [JSON] ログアウト結果（メッセージ）
  # @status 200 ログアウト成功
  # @status 401 未認証
  # @note JWTはステートレスなため、サーバー側での処理は最小限です
  # @example リクエスト
  #   POST /api/v1/auth/logout
  #   Header: Authorization: Bearer eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTYyMzQ1Njc4OX0=
  # @example レスポンス
  #   {
  #     "message": "ログアウトしました"
  #   }
  def logout
    # JWTは stateless なので、クライアント側でトークンを削除するだけ
    render json: {
      message: "ログアウトしました"
    }, status: :ok
  end

  # 現在のユーザー情報取得
  #
  # @route GET /api/v1/auth/me
  # @header Authorization [String] Bearer + JWTトークン
  # @return [JSON] 現在のユーザー情報
  # @status 200 取得成功
  # @status 401 未認証
  # @example リクエスト
  #   GET /api/v1/auth/me
  #   Header: Authorization: Bearer eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTYyMzQ1Njc4OX0=
  # @example レスポンス
  #   {
  #     "user": {
  #       "id": 1,
  #       "name": "テストユーザー",
  #       "email": "user@example.com",
  #       "role": "user",
  #       "created_at": "2024-01-01T00:00:00.000Z",
  #       "updated_at": "2024-01-01T00:00:00.000Z"
  #     }
  #   }
  def me
    render json: {
      user: user_response(current_user)
    }, status: :ok
  end

  private

  # ログインパラメータを取得する
  #
  # @return [ActionController::Parameters] メールアドレスとパスワードを含むパラメータ
  # @private
  def login_params
    params.require(:user).permit(:email, :password)
  end

  # ユーザー情報のレスポンス形式を統一する
  #
  # @param user [User] レスポンスに含めるユーザーオブジェクト
  # @return [Hash] クライアントに返すユーザー情報
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
