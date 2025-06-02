# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# サンプルユーザーを作成
puts "Creating users..."
admin_user = User.create!(
  name: "管理者",
  email: "admin@example.com",
  role: "admin"
)

manager_user = User.create!(
  name: "マネージャー",
  email: "manager@example.com",
  role: "manager"
)

regular_user = User.create!(
  name: "一般ユーザー",
  email: "user@example.com",
  role: "user"
)

puts "Created #{User.count} users"

# サンプルチケットを作成
puts "Creating tickets..."
tickets_data = [
  {
    title: "ログイン機能の不具合修正",
    description: "ログイン時にエラーが発生するため、修正が必要です。",
    status: "open",
    priority: "high",
    assigned_to: manager_user.email,
    created_by: admin_user.email
  },
  {
    title: "新機能の要件定義",
    description: "ダッシュボード機能の要件を定義し、仕様書を作成する。",
    status: "in_progress",
    priority: "medium",
    assigned_to: manager_user.email,
    created_by: admin_user.email
  },
  {
    title: "データベースのパフォーマンス最適化",
    description: "クエリの実行速度が遅いため、インデックスの追加など最適化を行う。",
    status: "open",
    priority: "low",
    assigned_to: regular_user.email,
    created_by: manager_user.email
  },
  {
    title: "UIの改善提案",
    description: "ユーザビリティ向上のためのUI改善案を検討する。",
    status: "resolved",
    priority: "medium",
    assigned_to: regular_user.email,
    created_by: admin_user.email
  },
  {
    title: "セキュリティ脆弱性の対応",
    description: "発見されたセキュリティ問題の緊急対応を行う。",
    status: "closed",
    priority: "urgent",
    assigned_to: admin_user.email,
    created_by: admin_user.email
  }
]

tickets_data.each do |ticket_attrs|
  Ticket.create!(ticket_attrs)
end

puts "Created #{Ticket.count} tickets"
puts "Seed data creation completed!"
puts ""
puts "Sample data:"
puts "- Users: #{User.count}"
puts "- Tickets: #{Ticket.count}"
puts ""
puts "You can access the API at:"
puts "- GET /api/v1/users"
puts "- GET /api/v1/tickets"
