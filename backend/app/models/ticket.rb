class Ticket < ApplicationRecord
  # ステータスのenum定義
  enum :status, {
    open: 0,
    in_progress: 1,
    resolved: 2,
    closed: 3
  }

  # 優先度のenum定義
  enum :priority, {
    low: 0,
    medium: 1,
    high: 2,
    urgent: 3
  }

  # バリデーション
  validates :title, presence: true, length: { maximum: 255 }
  validates :description, presence: true
  validates :status, presence: true
  validates :priority, presence: true
  validates :created_by, presence: true

  # scope
  scope :by_status, ->(status) { where(status: status) }
  scope :by_priority, ->(priority) { where(priority: priority) }
  scope :assigned_to_user, ->(user) { where(assigned_to: user) }
  scope :created_by_user, ->(user) { where(created_by: user) }
end
