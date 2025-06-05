# == Schema Information
#
# Table name: users
#
# id            :bigint           not null, primary key
# name          :string           not null
# email         :string           not null
# password_digest :string         not null
# role          :integer          default(0), not null
# created_at    :datetime         not null
# updated_at    :datetime         not null
#
# Indexes:
#   index_users_on_email (email) UNIQUE
#
# ==============================================================================
# ユーザーモデル
#
# システムのユーザーアカウント情報を管理するモデル。
# ユーザー認証、権限制御、JWT認証トークンの生成などの機能を提供します。
# ==============================================================================
class User < ApplicationRecord
  # パスワード認証機能を有効化
  # @note has_secure_passwordはBCryptを使用してパスワードをハッシュ化し、
  #       authenticateメソッドを提供します
  has_secure_password

  # ロールのenum定義
  # @note 0: 一般ユーザー、1: マネージャー、2: 管理者
  enum :role, {
    user: 0,     # 一般ユーザー（チケットの作成・閲覧・編集）
    manager: 1,  # マネージャー（ユーザー管理、レポート閲覧）
    admin: 2     # 管理者（全ての操作・システム設定）
  }

  # バリデーション
  # @note 名前、メールアドレス、ロールは必須
  # @note メールアドレスは一意かつ有効な形式
  # @note パスワードは6文字以上（nil許容）
  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true
  validates :password, length: { minimum: 6 }, allow_nil: true

  # 関連定義
  # @note ユーザーは複数のチケットを担当できる
  has_many :assigned_tickets, class_name: "Ticket", foreign_key: "assigned_to", dependent: :nullify

  # @note ユーザーは複数のチケットを作成できる
  has_many :created_tickets, class_name: "Ticket", foreign_key: "created_by", dependent: :restrict_with_error

  # スコープ
  # @note 指定されたロールを持つユーザーを取得
  # @param role [String, Symbol] 取得するユーザーのロール
  # @return [ActiveRecord::Relation] 指定したロールを持つユーザーのコレクション
  scope :by_role, ->(role) { where(role: role) }

  # JWT関連メソッド（簡易版）
  # ユーザー情報を含むJWTトークンを生成
  #
  # @note 本来はJWTライブラリを使用するべきですが、簡易的な実装としてBase64エンコードを使用
  # @return [String] 認証トークン
  # @example
  #   user = User.find(1)
  #   token = user.generate_jwt_token
  #   # => "eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTYyMzQ1Njc4OX0="
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

  # JWTトークンをデコードしてユーザーを取得
  #
  # @param token [String] デコードするJWTトークン
  # @return [User, nil] 有効なトークンの場合はユーザーオブジェクト、無効な場合はnil
  # @example
  #   user = User.decode_jwt_token("eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTYyMzQ1Njc4OX0=")
  def self.decode_jwt_token(token)
    begin
      decoded_json = Base64.decode64(token)
      user_data = JSON.parse(decoded_json)

      # 有効期限チェック
      return nil if user_data["exp"] < Time.current.to_i

      find(user_data["user_id"])
    rescue JSON::ParserError, ActiveRecord::RecordNotFound
      nil
    end
  end

  # メールアドレスとパスワードでユーザーを認証
  #
  # @param email [String] 認証するユーザーのメールアドレス
  # @param password [String] 認証するユーザーのパスワード
  # @return [User, nil] 認証成功時はユーザーオブジェクト、失敗時はnil
  # @example
  #   user = User.authenticate('user@example.com', 'password123')
  #   if user
  #     # 認証成功
  #   else
  #     # 認証失敗
  #   end
  def self.authenticate(email, password)
    user = find_by(email: email)
    user&.authenticate(password) ? user : nil
  end
end
