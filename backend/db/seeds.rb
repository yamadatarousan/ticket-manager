# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# サンプルユーザーを作成（パスワード付き）
puts "Creating users..."
admin_user = User.find_or_create_by!(email: "admin@example.com") do |user|
  user.name = "管理者"
  user.role = "admin"
  user.password = "password123"
  user.password_confirmation = "password123"
end

manager_user = User.find_or_create_by!(email: "manager@example.com") do |user|
  user.name = "マネージャー"
  user.role = "manager"
  user.password = "password123"
  user.password_confirmation = "password123"
end

regular_user = User.find_or_create_by!(email: "user@example.com") do |user|
  user.name = "一般ユーザー"
  user.role = "user"
  user.password = "password123"
  user.password_confirmation = "password123"
end

puts "Created #{User.count} users"

# 既存のチケットを削除してから新しく作成
Ticket.destroy_all

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
puts "認証テスト用のユーザー情報:"
puts "管理者: email: admin@example.com, password: password123"
puts "マネージャー: email: manager@example.com, password: password123"
puts "一般ユーザー: email: user@example.com, password: password123"
puts ""
puts "You can access the API at:"
puts "- POST /api/v1/auth/login (ログイン)"
puts "- GET /api/v1/auth/me (現在のユーザー情報)"
puts "- POST /api/v1/auth/logout (ログアウト)"
puts "- GET /api/v1/users (認証必須)"
puts "- GET /api/v1/tickets (認証必須)"
