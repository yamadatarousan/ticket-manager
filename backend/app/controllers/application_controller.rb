class ApplicationController < ActionController::API
  before_action :authenticate_request
  
  attr_reader :current_user
  
  private
  
  def authenticate_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header.present? && header.start_with?('Bearer ')
    
    if token.present?
      @current_user = User.decode_jwt_token(token)
      render json: { error: '認証が必要です' }, status: :unauthorized unless @current_user
    else
      render json: { error: '認証トークンが見つかりません' }, status: :unauthorized
    end
  end
  
  def authenticate_admin_request
    authenticate_request
    return if @current_user&.admin?
    
    render json: { error: '管理者権限が必要です' }, status: :forbidden
  end
  
  def authenticate_manager_or_admin_request
    authenticate_request
    return if @current_user&.admin? || @current_user&.manager?
    
    render json: { error: 'マネージャー以上の権限が必要です' }, status: :forbidden
  end
  
  # 認証をスキップするコントローラー用のメソッド
  def skip_authentication
    # このメソッドが呼ばれた場合は認証をスキップ
  end
  
  protected
  
  def current_user_id
    @current_user&.id
  end
  
  def current_user_role
    @current_user&.role
  end
end
