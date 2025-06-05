# ==============================================================================
# システム設定モデル
#
# アプリケーション全体の設定値を管理するモデルです。
# 管理者が設定可能な各種パラメータを key-value ペアで保存します。
# ==============================================================================
class SystemSetting < ApplicationRecord
  # =============================================================================
  # バリデーション
  # =============================================================================

  validates :key, presence: true, uniqueness: true, format: {
    with: /\A[a-zA-Z0-9_-]+\z/,
    message: "は英数字、アンダースコア、ハイフンのみ使用可能です"
  }

  validates :setting_type, presence: true, inclusion: {
    in: %w[string integer boolean json],
    message: "は string, integer, boolean, json のいずれかである必要があります"
  }

  validates :is_public, inclusion: { in: [ true, false ] }

  # =============================================================================
  # スコープ
  # =============================================================================

  scope :public_settings, -> { where(is_public: true) }
  scope :admin_settings, -> { where(is_public: false) }
  scope :by_type, ->(type) { where(setting_type: type) }

  # =============================================================================
  # クラスメソッド
  # =============================================================================

  # 設定値を取得（型変換付き）
  #
  # @param key [String] 設定キー
  # @param default_value [Object] デフォルト値
  # @return [Object] 設定値（型変換済み）
  #
  # @example
  #   SystemSetting.get_value('app_name', 'チケット管理システム')
  #   SystemSetting.get_value('max_tickets_per_user', 100)
  #   SystemSetting.get_value('maintenance_mode', false)
  def self.get_value(key, default_value = nil)
    setting = find_by(key: key)
    return default_value unless setting&.value

    convert_value(setting.value, setting.setting_type)
  end

  # 設定値を保存（型変換付き）
  #
  # @param key [String] 設定キー
  # @param value [Object] 設定値
  # @param options [Hash] 追加オプション
  # @option options [String] :description 設定の説明
  # @option options [String] :setting_type 設定の型
  # @option options [Boolean] :is_public 公開設定
  # @return [SystemSetting] 設定オブジェクト
  #
  # @example
  #   SystemSetting.set_value('app_name', 'My App', description: 'アプリケーション名')
  #   SystemSetting.set_value('max_users', 1000, setting_type: 'integer')
  def self.set_value(key, value, options = {})
    setting = find_or_initialize_by(key: key)
    setting.value = value.to_s
    setting.description = options[:description] if options[:description]
    setting.setting_type = options[:setting_type] || infer_type(value)
    setting.is_public = options[:is_public] || false
    setting.save!
    setting
  end

  # 公開設定のみを取得
  #
  # @return [Hash] 公開設定のハッシュ
  def self.public_settings_hash
    public_settings.pluck(:key, :value, :setting_type).each_with_object({}) do |(key, value, type), hash|
      hash[key] = convert_value(value, type)
    end
  end

  # =============================================================================
  # インスタンスメソッド
  # =============================================================================

  # 型変換済みの値を取得
  #
  # @return [Object] 型変換済みの値
  def typed_value
    self.class.convert_value(value, setting_type)
  end

  # 設定値を更新
  #
  # @param new_value [Object] 新しい値
  # @return [Boolean] 更新成功/失敗
  def update_value(new_value)
    self.value = new_value.to_s
    save
  end

  private

  # =============================================================================
  # プライベートクラスメソッド
  # =============================================================================

  # 値の型を推測
  #
  # @param value [Object] 値
  # @return [String] 型名
  # @private
  def self.infer_type(value)
    case value
    when Integer
      "integer"
    when TrueClass, FalseClass
      "boolean"
    when Hash, Array
      "json"
    else
      "string"
    end
  end

  # 値を指定された型に変換
  #
  # @param value [String] 文字列値
  # @param type [String] 型名
  # @return [Object] 変換済みの値
  # @private
  def self.convert_value(value, type)
    return nil if value.nil?

    case type
    when "integer"
      value.to_i
    when "boolean"
      value.to_s.downcase.in?([ "true", "1", "yes", "on" ])
    when "json"
      JSON.parse(value)
    else
      value.to_s
    end
  rescue JSON::ParserError
    value.to_s
  end
end
