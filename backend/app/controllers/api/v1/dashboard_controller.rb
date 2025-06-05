# ==============================================================================
# ダッシュボードコントローラー
#
# ダッシュボード表示に必要な統計情報を提供するコントローラーです。
# チケットの統計情報、最近の活動、担当者別の情報などを取得できます。
# ==============================================================================
class Api::V1::DashboardController < ApplicationController
  before_action :authenticate_request

  # ダッシュボード統計情報の取得
  #
  # @route GET /api/v1/dashboard/stats
  # @return [JSON] ダッシュボードの統計情報
  # @status 200 取得成功
  # @status 401 認証エラー
  # @example レスポンス
  #   {
  #     "ticket_stats": {
  #       "total": 150,
  #       "by_status": {
  #         "open": 45,
  #         "in_progress": 30,
  #         "resolved": 50,
  #         "closed": 25
  #       },
  #       "by_priority": {
  #         "low": 60,
  #         "medium": 50,
  #         "high": 30,
  #         "urgent": 10
  #       },
  #       "my_tickets": {
  #         "assigned_to_me": 8,
  #         "created_by_me": 12
  #       }
  #     },
  #     "recent_tickets": [
  #       {
  #         "id": 1,
  #         "title": "バグ修正",
  #         "status": "open",
  #         "priority": "high",
  #         "created_at": "2024-01-01T00:00:00.000Z"
  #       }
  #     ]
  #   }
  def stats
    # ステータス別チケット数を取得
    status_counts = get_ticket_counts_by_status

    # 基本的なチケット統計
    ticket_stats = {
      total: Ticket.count,
      open: status_counts["open"] || 0,
      in_progress: status_counts["in_progress"] || 0,
      resolved: status_counts["resolved"] || 0,
      closed: status_counts["closed"] || 0
    }

    # 最近のチケット（直近10件）
    recent_tickets = Ticket.includes(:assigned_user, :creator)
                          .order(created_at: :desc)
                          .limit(10)
                          .map { |ticket| ticket_summary(ticket) }

    # 現在のユーザーに割り当てられたチケット
    assigned_tickets = Ticket.includes(:assigned_user, :creator)
                           .where(assigned_to: @current_user.id)
                           .order(updated_at: :desc)
                           .limit(10)
                           .map { |ticket| ticket_summary(ticket) }

    render json: {
      ticket_stats: ticket_stats,
      recent_tickets: recent_tickets,
      assigned_tickets: assigned_tickets,
      generated_at: Time.current.iso8601
    }
  end

  private

  # ステータス別チケット数を取得
  #
  # @return [Hash] ステータス別のチケット数
  # @private
  def get_ticket_counts_by_status
    Ticket.group(:status).count
  end

  # チケットのサマリー情報を取得
  #
  # @param ticket [Ticket] チケットオブジェクト
  # @return [Hash] チケットのサマリー情報
  # @private
  def ticket_summary(ticket)
    {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assigned_to: ticket.assigned_to,
      created_by: ticket.created_by,
      created_at: ticket.created_at.iso8601,
      updated_at: ticket.updated_at.iso8601
    }
  end
end
