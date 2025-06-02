class User < ApplicationRecord
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

  # scope
  scope :by_role, ->(role) { where(role: role) }
end
