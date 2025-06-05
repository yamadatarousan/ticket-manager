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
  },
  {
    title: "ユーザーマニュアルの更新",
    description: "新機能追加に伴うマニュアルの更新作業。",
    status: "open",
    priority: "low",
    assigned_to: regular_user.email,
    created_by: manager_user.email
  },
  {
    title: "バックアップシステムの構築",
    description: "データ保護のためのバックアップシステムを構築する。",
    status: "in_progress",
    priority: "high",
    assigned_to: admin_user.email,
    created_by: admin_user.email
  },
  {
    title: "API仕様書の作成",
    description: "外部連携用のAPI仕様書を作成する。",
    status: "resolved",
    priority: "medium",
    assigned_to: manager_user.email,
    created_by: admin_user.email
  },
  {
    title: "モバイル対応の検討",
    description: "スマートフォンからの利用を考慮したUI改善。",
    status: "open",
    priority: "medium",
    assigned_to: regular_user.email,
    created_by: regular_user.email
  },
  {
    title: "通知機能の実装",
    description: "チケット更新時の通知機能を実装する。",
    status: "in_progress",
    priority: "high",
    assigned_to: manager_user.email,
    created_by: regular_user.email
  },
  {
    title: "パフォーマンステストの実施",
    description: "システム全体のパフォーマンステストを実施する。",
    status: "open",
    priority: "medium",
    assigned_to: admin_user.email,
    created_by: manager_user.email
  },
  {
    title: "エラーログの分析",
    description: "システムエラーの原因分析と対策検討。",
    status: "resolved",
    priority: "low",
    assigned_to: regular_user.email,
    created_by: admin_user.email
  },
  {
    title: "データ移行ツールの開発",
    description: "旧システムからのデータ移行ツールを開発する。",
    status: "closed",
    priority: "high",
    assigned_to: admin_user.email,
    created_by: manager_user.email
  }
]

tickets_data.each do |ticket_attrs|
  Ticket.create!(ticket_attrs)
end

puts "Created #{Ticket.count} tickets"

# システム設定を作成
puts "Creating system settings..."

# 既存の設定を削除してから新しく作成
SystemSetting.destroy_all

default_settings = [
  {
    key: 'app_name',
    value: 'チケット管理システム',
    description: 'アプリケーションの表示名',
    setting_type: 'string',
    is_public: true
  },
  {
    key: 'app_version',
    value: '1.0.0',
    description: 'アプリケーションのバージョン',
    setting_type: 'string',
    is_public: true
  },
  {
    key: 'maintenance_mode',
    value: 'false',
    description: 'メンテナンスモードの有効/無効',
    setting_type: 'boolean',
    is_public: false
  },
  {
    key: 'max_tickets_per_user',
    value: '100',
    description: 'ユーザーあたりの最大チケット数',
    setting_type: 'integer',
    is_public: false
  },
  {
    key: 'allow_guest_access',
    value: 'false',
    description: 'ゲストアクセスの許可',
    setting_type: 'boolean',
    is_public: false
  },
  {
    key: 'email_notifications',
    value: 'true',
    description: 'メール通知の有効/無効',
    setting_type: 'boolean',
    is_public: false
  },
  {
    key: 'default_ticket_priority',
    value: 'medium',
    description: 'デフォルトのチケット優先度',
    setting_type: 'string',
    is_public: false
  },
  {
    key: 'session_timeout_minutes',
    value: '480',
    description: 'セッションタイムアウト時間（分）',
    setting_type: 'integer',
    is_public: false
  },
  {
    key: 'backup_enabled',
    value: 'true',
    description: '自動バックアップの有効/無効',
    setting_type: 'boolean',
    is_public: false
  },
  {
    key: 'api_rate_limit',
    value: '1000',
    description: 'API Rate Limit（1時間あたりのリクエスト数）',
    setting_type: 'integer',
    is_public: false
  }
]

default_settings.each do |setting_attrs|
  SystemSetting.create!(setting_attrs)
end

puts "Created #{SystemSetting.count} system settings"
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
