class Api::V1::UsersController < ApplicationController
  before_action :set_user, only: [ :show, :update, :destroy ]

  # GET /api/v1/users
  def index
    @users = User.all

    # フィルタリング
    @users = @users.by_role(params[:role]) if params[:role].present?

    # ページネーション
    @users = @users.limit(params[:limit] || 50)
    @users = @users.offset(params[:offset] || 0)

    render json: {
      users: @users,
      meta: {
        total: User.count,
        count: @users.count
      }
    }
  end

  # GET /api/v1/users/1
  def show
    render json: @user
  end

  # POST /api/v1/users
  def create
    @user = User.new(user_params)

    if @user.save
      render json: @user, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/users/1
  def update
    if @user.update(user_params)
      render json: @user
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/users/1
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:name, :email, :role)
  end
end
