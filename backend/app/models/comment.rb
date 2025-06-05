# == Schema Information
#
# Table name: comments
#
# id           :bigint           not null, primary key
# content      :text             not null
# ticket_id    :bigint           not null
# user_email   :string           not null
# created_at   :datetime         not null
# updated_at   :datetime         not null
#
# Indexes:
#   index_comments_on_ticket_id (ticket_id)
#
# ==============================================================================
# コメントモデル
#
# チケットに対するコメント（BacklogやRedmineのようなコメント機能）を管理するモデル。
# チケットの進捗報告、質疑応答、ディスカッションなどに使用されます。
# ==============================================================================
class Comment < ApplicationRecord
  # 関連定義
  belongs_to :ticket

  # バリデーション
  # @note コメント内容、チケットID、ユーザーメールアドレスは必須
  validates :content, presence: true, length: { minimum: 1, maximum: 1000 }
  validates :ticket_id, presence: true
  validates :user_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  # スコープ定義
  # @note チケットIDによるコメント取得（作成日時順）
  scope :by_ticket, ->(ticket_id) { where(ticket_id: ticket_id).order(:created_at) }
  scope :recent, -> { order(created_at: :desc) }

  # インスタンスメソッド
  
  # コメント作成者の名前を取得
  # @return [String] ユーザー名、またはメールアドレスの@マーク前の部分
  def author_name
    # 実際のプロダクションではUserモデルから名前を取得する
    user_email.split('@').first.humanize
  end

  # コメントの短縮版を取得
  # @param length [Integer] 短縮する文字数（デフォルト: 100文字）
  # @return [String] 短縮されたコメント内容
  def excerpt(length = 100)
    content.truncate(length)
  end
end
