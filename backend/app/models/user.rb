class User < ApplicationRecord
  # パスワード認証機能を有効化
  has_secure_password
  
  # ロールのenum定義
  enum :role, {
    user: 0,
    admin: 1,
    manager: 2
  }

  # バリデーション
  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true
  validates :password, length: { minimum: 6 }, allow_nil: true

  # scope
  scope :by_role, ->(role) { where(role: role) }
  
  # JWT関連メソッド（簡易版）
  def generate_jwt_token
    # 簡易的なトークン生成（本来はJWTを使用）
    payload = {
      user_id: id,
      email: email,
      role: role,
      exp: 24.hours.from_now.to_i
    }
    # Base64エンコードで改行文字を除去
    Base64.strict_encode64(payload.to_json)
  end
  
  def self.decode_jwt_token(token)
    begin
      decoded_json = Base64.decode64(token)
      user_data = JSON.parse(decoded_json)
      
      # 有効期限チェック
      return nil if user_data['exp'] < Time.current.to_i
      
      find(user_data['user_id'])
    rescue JSON::ParserError, ActiveRecord::RecordNotFound
      nil
    end
  end
  
  # 認証メソッド
  def self.authenticate(email, password)
    user = find_by(email: email)
    user&.authenticate(password)
  end
end
