class Api::V1::UsersController < ApplicationController
  skip_before_action :authenticate_request, only: [ :create ]
  before_action :set_user, only: %i[show update destroy]

  # GET /api/v1/users
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

  # GET /api/v1/users/1
  def show
    render json: user_response(@user)
  end

  # POST /api/v1/users
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

  # PATCH/PUT /api/v1/users/1
  def update
    if @user.update(user_params)
      render json: user_response(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/users/1
  def destroy
    @user.destroy!
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:name, :email, :role, :password, :password_confirmation)
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
