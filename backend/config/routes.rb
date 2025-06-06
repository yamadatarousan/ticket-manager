# frozen_string_literal: true

Rails.application.routes.draw do
  # Swagger UI
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"

  # Health check route
  get "up" => "rails/health#show", as: :rails_health_check

  # Serve files from the public directory at root
  root "rails/public#show"

  # API routes
  namespace :api do
    namespace :v1 do
      # 認証関連のルート
      post "auth/login", to: "auth#login"
      post "auth/register", to: "auth#register"
      post "auth/logout", to: "auth#logout"
      get "auth/me", to: "auth#me"

      # ダッシュボード関連のルート
      get "dashboard/stats", to: "dashboard#stats"

      # システム設定関連のルート
      resources :system_settings, except: [ :new, :edit ] do
        collection do
          patch :bulk_update
          get :public
        end
      end

      # リソースルート
      resources :tickets, except: [ :new, :edit ] do
        # ネストしたコメントリソース（チケットに紐づくコメント）
        resources :comments, only: [ :index, :create, :show, :update, :destroy ]
      end

      resources :users, except: [ :new, :edit ]

      # プロジェクト管理
      resources :projects, except: [ :new, :edit ]
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "posts#index"
end
