# == Schema Information
#
# Table name: tickets
#
# id           :bigint           not null, primary key
# title        :string           not null
# description  :text             not null
# status       :integer          default(0), not null
# priority     :integer          default(1), not null
# assigned_to  :bigint
# created_by   :bigint           not null
# created_at   :datetime         not null
# updated_at   :datetime         not null
#
# Indexes:
#   index_tickets_on_assigned_to (assigned_to)
#   index_tickets_on_created_by (created_by)
#   index_tickets_on_status (status)
#   index_tickets_on_priority (priority)
#
# ==============================================================================
# チケットモデル
#
# システム内のタスク、問題、要望を管理するためのチケットモデル。
# ステータス管理、優先度設定、担当者割り当てなどの機能を提供します。
# ==============================================================================
class Ticket < ApplicationRecord
  # ステータスのenum定義
  # @note チケットの進行状態を表します
  enum :status, {
    open: 0,         # 新規作成・未着手
    in_progress: 1,  # 作業中
    resolved: 2,     # 解決済み（レビュー待ち）
    closed: 3        # 完了・クローズ
  }

  # 優先度のenum定義
  # @note チケットの重要度を表します
  enum :priority, {
    low: 0,      # 低優先度（緊急性なし）
    medium: 1,   # 中優先度（通常の作業）
    high: 2,     # 高優先度（早急な対応が必要）
    urgent: 3    # 緊急（即座の対応が必要）
  }

  # バリデーション
  # @note タイトル、説明、ステータス、優先度、作成者は必須
  validates :title, presence: true, length: { maximum: 255 }
  validates :description, presence: true
  validates :status, presence: true
  validates :priority, presence: true

  # 関連定義
  # @note チケットは複数のコメントを持つ
  has_many :comments, dependent: :destroy

  # @note チケットには担当者（ユーザー）が設定される（オプショナル）
  belongs_to :assigned_user, class_name: "User", foreign_key: "assigned_to", optional: true

  # @note チケットには作成者（ユーザー）が設定される（必須）
  belongs_to :creator, class_name: "User", foreign_key: "created_by", required: true

  # スコープ定義
  # @note これらのスコープを使用してチケットをフィルタリングできます

  # 指定されたステータスのチケットを取得
  # @param status [String, Symbol] 取得するチケットのステータス
  # @return [ActiveRecord::Relation] 指定したステータスのチケットのコレクション
  # @example
  #   Ticket.by_status(:open) # 未着手のチケットを取得
  scope :by_status, ->(status) { where(status: status) }

  # 指定された優先度のチケットを取得
  # @param priority [String, Symbol] 取得するチケットの優先度
  # @return [ActiveRecord::Relation] 指定した優先度のチケットのコレクション
  # @example
  #   Ticket.by_priority(:high) # 高優先度のチケットを取得
  scope :by_priority, ->(priority) { where(priority: priority) }

  # 指定されたユーザーに割り当てられたチケットを取得
  # @param user [Integer] 担当者のユーザーID
  # @return [ActiveRecord::Relation] 指定したユーザーに割り当てられたチケットのコレクション
  # @example
  #   Ticket.assigned_to_user(1) # ユーザーID:1に割り当てられたチケットを取得
  scope :assigned_to_user, ->(user) { where(assigned_to: user) }

  # 指定されたユーザーによって作成されたチケットを取得
  # @param user [Integer] 作成者のユーザーID
  # @return [ActiveRecord::Relation] 指定したユーザーによって作成されたチケットのコレクション
  # @example
  #   Ticket.created_by_user(1) # ユーザーID:1が作成したチケットを取得
  scope :created_by_user, ->(user) { where(created_by: user) }
end
