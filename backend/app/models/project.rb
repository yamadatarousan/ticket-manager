# == Schema Information
#
# Table name: projects
#
# id           :bigint           not null, primary key
# name         :string(255)      not null
# description  :text
# status       :integer          default(0), not null
# created_by   :bigint           not null
# start_date   :date
# end_date     :date
# created_at   :datetime         not null
# updated_at   :datetime         not null
#
# Indexes:
#   index_projects_on_name (name) UNIQUE
#   index_projects_on_status (status)
#   index_projects_on_created_by (created_by)
#   index_projects_on_start_date (start_date)
#   index_projects_on_end_date (end_date)
#
# ==============================================================================
# プロジェクトモデル
#
# チケット管理システムでのプロジェクト情報を管理するモデル。
# プロジェクトのステータス管理、期間設定、メンバー管理などの機能を提供します。
# ==============================================================================
class Project < ApplicationRecord
  # ステータスのenum定義
  # @note プロジェクトの進行状態を表します
  enum :status, {
    planning: 0,    # 計画中
    active: 1,      # 進行中
    on_hold: 2,     # 一時停止
    completed: 3,   # 完了
    cancelled: 4    # キャンセル
  }

  # バリデーション
  validates :name, presence: true, length: { maximum: 255 }, uniqueness: true
  validates :status, presence: true
  validates :created_by, presence: true
  validates :end_date, comparison: { greater_than_or_equal_to: :start_date },
            allow_blank: true, if: :start_date?

  # 関連定義
  # @note プロジェクトは複数のチケットを持つ
  has_many :tickets, dependent: :destroy

  # プロジェクト作成者との関連
  belongs_to :creator, class_name: "User", foreign_key: "created_by"

  # スコープ定義

  # 指定されたステータスのプロジェクトを取得
  # @param status [String, Symbol] 取得するプロジェクトのステータス
  # @return [ActiveRecord::Relation] 指定したステータスのプロジェクトのコレクション
  scope :by_status, ->(status) { where(status: status) }

  # アクティブなプロジェクト（計画中または進行中）を取得
  # @return [ActiveRecord::Relation] アクティブなプロジェクトのコレクション
  scope :active_projects, -> { where(status: [ :planning, :active ]) }

  # 完了したプロジェクトを取得
  # @return [ActiveRecord::Relation] 完了したプロジェクトのコレクション
  scope :completed_projects, -> { where(status: [ :completed, :cancelled ]) }

  # 指定されたユーザーが作成したプロジェクトを取得
  # @param user [Integer] 作成者のユーザーID
  # @return [ActiveRecord::Relation] 指定したユーザーが作成したプロジェクトのコレクション
  scope :created_by_user, ->(user) { where(created_by: user) }

  # 期間でフィルタリング
  scope :start_after, ->(date) { where("start_date >= ?", date) }
  scope :end_before, ->(date) { where("end_date <= ?", date) }

  # インスタンスメソッド

  # プロジェクトの進行率を計算（チケットのステータスベース）
  # @return [Float] 進行率（0.0〜1.0）
  def progress_rate
    return 1.0 if completed?
    return 0.0 if tickets.count == 0

    total_tickets = tickets.count
    completed_tickets = tickets.where(status: [ :resolved, :closed ]).count

    completed_tickets.to_f / total_tickets
  end

  # プロジェクトの残り日数を計算
  # @return [Integer, nil] 残り日数（終了日が設定されていない場合はnil）
  def days_remaining
    return nil unless end_date

    (end_date - Date.current).to_i
  end

  # プロジェクトが期限を過ぎているかチェック
  # @return [Boolean] 期限を過ぎている場合true
  def overdue?
    end_date && end_date < Date.current && !completed?
  end

  # プロジェクトの期間を文字列で取得
  # @return [String] 期間の文字列表現
  def duration_string
    if start_date && end_date
      "#{start_date.strftime('%Y/%m/%d')} - #{end_date.strftime('%Y/%m/%d')}"
    elsif start_date
      "#{start_date.strftime('%Y/%m/%d')} -"
    elsif end_date
      "- #{end_date.strftime('%Y/%m/%d')}"
    else
      "期間未設定"
    end
  end
end
