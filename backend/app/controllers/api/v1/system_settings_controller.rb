# ==============================================================================
# システム設定コントローラー
#
# システム全体の設定を管理するコントローラーです。
# 管理者のみがアクセス可能で、アプリケーションの各種設定を管理できます。
# ==============================================================================
class Api::V1::SystemSettingsController < ApplicationController
  before_action :authenticate_request
  before_action :ensure_admin
  before_action :set_system_setting, only: [ :show, :update, :destroy ]

  # システム設定一覧の取得
  #
  # @route GET /api/v1/system_settings
  # @return [JSON] システム設定一覧
  # @status 200 取得成功
  # @status 401 認証エラー
  # @status 403 権限エラー
  # @example レスポンス
  #   {
  #     "system_settings": [
  #       {
  #         "id": 1,
  #         "key": "app_name",
  #         "value": "チケット管理システム",
  #         "description": "アプリケーション名",
  #         "setting_type": "string",
  #         "is_public": true
  #       }
  #     ]
  #   }
  def index
    @system_settings = SystemSetting.all.order(:key)

    render json: {
      system_settings: @system_settings.map { |setting| setting_response(setting) }
    }
  end

  # 個別システム設定の取得
  #
  # @route GET /api/v1/system_settings/:id
  # @param id [Integer] システム設定ID
  # @return [JSON] システム設定情報
  # @status 200 取得成功
  # @status 401 認証エラー
  # @status 403 権限エラー
  # @status 404 設定が見つからない
  def show
    render json: {
      system_setting: setting_response(@system_setting)
    }
  end

  # システム設定の作成
  #
  # @route POST /api/v1/system_settings
  # @param system_setting [Hash] システム設定パラメータ
  # @return [JSON] 作成されたシステム設定情報
  # @status 201 作成成功
  # @status 400 バリデーションエラー
  # @status 401 認証エラー
  # @status 403 権限エラー
  def create
    @system_setting = SystemSetting.new(system_setting_params)

    if @system_setting.save
      render json: {
        system_setting: setting_response(@system_setting),
        message: "システム設定を作成しました"
      }, status: :created
    else
      render json: {
        error: "システム設定の作成に失敗しました",
        details: @system_setting.errors.full_messages
      }, status: :bad_request
    end
  end

  # システム設定の更新
  #
  # @route PATCH/PUT /api/v1/system_settings/:id
  # @param id [Integer] システム設定ID
  # @param system_setting [Hash] 更新するシステム設定パラメータ
  # @return [JSON] 更新されたシステム設定情報
  # @status 200 更新成功
  # @status 400 バリデーションエラー
  # @status 401 認証エラー
  # @status 403 権限エラー
  # @status 404 設定が見つからない
  def update
    if @system_setting.update(system_setting_params)
      render json: {
        system_setting: setting_response(@system_setting),
        message: "システム設定を更新しました"
      }
    else
      render json: {
        error: "システム設定の更新に失敗しました",
        details: @system_setting.errors.full_messages
      }, status: :bad_request
    end
  end

  # システム設定の削除
  #
  # @route DELETE /api/v1/system_settings/:id
  # @param id [Integer] システム設定ID
  # @return [JSON] 削除結果
  # @status 200 削除成功
  # @status 401 認証エラー
  # @status 403 権限エラー
  # @status 404 設定が見つからない
  def destroy
    @system_setting.destroy
    render json: {
      message: "システム設定を削除しました"
    }
  end

  # 設定値の一括更新
  #
  # @route POST /api/v1/system_settings/bulk_update
  # @param settings [Hash] 設定キーと値のハッシュ
  # @return [JSON] 更新結果
  # @status 200 更新成功
  # @status 400 バリデーションエラー
  # @status 401 認証エラー
  # @status 403 権限エラー
  def bulk_update
    settings_params = params.require(:settings)
    updated_settings = []
    errors = []

    settings_params.each do |key, value|
      begin
        setting = SystemSetting.find_by(key: key)
        if setting
          setting.update_value(value)
          updated_settings << setting_response(setting)
        else
          errors << "設定キー '#{key}' が見つかりません"
        end
      rescue => e
        errors << "設定キー '#{key}' の更新でエラーが発生しました: #{e.message}"
      end
    end

    if errors.empty?
      render json: {
        system_settings: updated_settings,
        message: "#{updated_settings.length}件の設定を更新しました"
      }
    else
      render json: {
        error: "一部の設定の更新に失敗しました",
        details: errors,
        updated_settings: updated_settings
      }, status: :bad_request
    end
  end

  # 公開設定の取得（認証不要）
  #
  # @route GET /api/v1/system_settings/public
  # @return [JSON] 公開設定一覧
  # @status 200 取得成功
  def public_settings
    render json: {
      settings: SystemSetting.public_settings_hash
    }
  end

  private

  # システム設定オブジェクトを設定
  #
  # @private
  def set_system_setting
    @system_setting = SystemSetting.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      error: "指定されたシステム設定が見つかりません"
    }, status: :not_found
  end

  # システム設定パラメータのフィルタリング
  #
  # @return [ActionController::Parameters] フィルタ済みパラメータ
  # @private
  def system_setting_params
    params.require(:system_setting).permit(:key, :value, :description, :setting_type, :is_public)
  end

  # 管理者権限の確認
  #
  # @private
  def ensure_admin
    unless @current_user&.role == "admin"
      render json: {
        error: "この機能にアクセスするには管理者権限が必要です"
      }, status: :forbidden
    end
  end

  # システム設定のレスポンス形式
  #
  # @param setting [SystemSetting] システム設定オブジェクト
  # @return [Hash] レスポンス用ハッシュ
  # @private
  def setting_response(setting)
    {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      typed_value: setting.typed_value,
      description: setting.description,
      setting_type: setting.setting_type,
      is_public: setting.is_public,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    }
  end
end
