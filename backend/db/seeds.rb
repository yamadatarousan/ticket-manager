# frozen_string_literal: true

# ==============================================================================
# データベースシードファイル
#
# 開発環境とテスト環境での初期データを作成します。
# ==============================================================================

# 既存データの確認とクリーンアップ
puts "シードデータの作成を開始します..."

# ユーザーの作成
puts "ユーザーデータを作成中..."

admin_user = User.find_or_create_by(email: 'admin@example.com') do |user|
  user.name = '管理者'
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'admin'
end

manager_user = User.find_or_create_by(email: 'manager@example.com') do |user|
  user.name = 'マネージャー'
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'manager'
end

regular_user = User.find_or_create_by(email: 'user@example.com') do |user|
  user.name = '一般ユーザー'
  user.password = 'password123'
  user.password_confirmation = 'password123'
  user.role = 'user'
end

puts "ユーザーデータ作成完了: #{User.count}件"

# プロジェクトの作成
puts "プロジェクトデータを作成中..."

# 既存のプロジェクトを削除（開発環境のみ）
if Rails.env.development?
  Project.destroy_all
end

projects = [
  {
    name: "チケット管理システム",
    description: "社内チケット管理システムの開発プロジェクト。バックログやRedmineのような機能を実装します。",
    status: "active",
    start_date: Date.current - 30.days,
    end_date: Date.current + 60.days,
    created_by: admin_user.id
  },
  {
    name: "Webサイトリニューアル",
    description: "企業サイトのリニューアルプロジェクト。レスポンシブデザインの実装とSEO対策を含みます。",
    status: "planning",
    start_date: Date.current + 7.days,
    end_date: Date.current + 90.days,
    created_by: manager_user.id
  },
  {
    name: "モバイルアプリ開発",
    description: "社内業務用のモバイルアプリケーション開発。iOSとAndroidのネイティブアプリです。",
    status: "active",
    start_date: Date.current - 14.days,
    end_date: Date.current + 120.days,
    created_by: manager_user.id
  },
  {
    name: "データ分析基盤構築",
    description: "ビジネスインテリジェンス向けのデータ分析基盤の構築。BigQueryとTableauを活用します。",
    status: "on_hold",
    start_date: Date.current - 45.days,
    end_date: nil,
    created_by: admin_user.id
  },
  {
    name: "セキュリティ監査",
    description: "システム全体のセキュリティ監査と脆弱性対応プロジェクト。",
    status: "completed",
    start_date: Date.current - 60.days,
    end_date: Date.current - 10.days,
    created_by: admin_user.id
  }
]

projects.each do |project_data|
  Project.find_or_create_by(name: project_data[:name]) do |project|
    project.description = project_data[:description]
    project.status = project_data[:status]
    project.start_date = project_data[:start_date]
    project.end_date = project_data[:end_date]
    project.created_by = project_data[:created_by]
  end
end

puts "プロジェクトデータ作成完了: #{Project.count}件"

# システム設定の作成
puts "システム設定データを作成中..."

system_settings = [
  {
    key: 'app_name',
    value: 'チケット管理システム',
    description: 'アプリケーション名',
    setting_type: 'string',
    is_public: true
  },
  {
    key: 'app_version',
    value: '1.0.0',
    description: 'アプリケーションバージョン',
    setting_type: 'string',
    is_public: true
  },
  {
    key: 'maintenance_mode',
    value: 'false',
    description: 'メンテナンスモード',
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
    description: 'ゲストアクセスを許可するか',
    setting_type: 'boolean',
    is_public: false
  },
  {
    key: 'email_notifications',
    value: 'true',
    description: 'メール通知を有効にするか',
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
    value: '60',
    description: 'セッションタイムアウト（分）',
    setting_type: 'integer',
    is_public: false
  },
  {
    key: 'backup_enabled',
    value: 'true',
    description: 'バックアップ機能を有効にするか',
    setting_type: 'boolean',
    is_public: false
  },
  {
    key: 'api_rate_limit',
    value: '1000',
    description: 'API レート制限（1時間あたり）',
    setting_type: 'integer',
    is_public: false
  }
]

system_settings.each do |setting_data|
  SystemSetting.find_or_create_by(key: setting_data[:key]) do |setting|
    setting.value = setting_data[:value]
    setting.description = setting_data[:description]
    setting.setting_type = setting_data[:setting_type]
    setting.is_public = setting_data[:is_public]
  end
end

puts "システム設定データ作成完了: #{SystemSetting.count}件"

puts "シードデータの作成が完了しました！"
puts "作成されたデータ:"
puts "- ユーザー: #{User.count}件"
puts "- プロジェクト: #{Project.count}件"
puts "- システム設定: #{SystemSetting.count}件"
