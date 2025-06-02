class Api::V1::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:login]
  before_action :authenticate_request, only: [:logout, :me]

  # POST /api/v1/auth/login
  def login
    user = User.authenticate(login_params[:email], login_params[:password])
    
    if user
      token = user.generate_jwt_token
      render json: {
        user: user_response(user),
        token: token,
        message: 'ログインに成功しました'
      }, status: :ok
    else
      render json: {
        error: 'メールアドレスまたはパスワードが間違っています'
      }, status: :unauthorized
    end
  end

  # POST /api/v1/auth/logout
  def logout
    # JWTは stateless なので、クライアント側でトークンを削除するだけ
    render json: {
      message: 'ログアウトしました'
    }, status: :ok
  end

  # GET /api/v1/auth/me
  def me
    render json: {
      user: user_response(current_user)
    }, status: :ok
  end

  private

  def login_params
    params.require(:user).permit(:email, :password)
  end

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
