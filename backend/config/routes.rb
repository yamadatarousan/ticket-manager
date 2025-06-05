Rails.application.routes.draw do
  # Swagger UI
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"

  # API routes
  namespace :api do
    namespace :v1 do
      # 認証関連のルート
      post "auth/login", to: "auth#login"
      post "auth/logout", to: "auth#logout"
      get "auth/me", to: "auth#me"

      # ダッシュボード関連のルート
      get "dashboard/stats", to: "dashboard#stats"

      # リソースルート
      resources :tickets do
        # ネストしたコメントリソース（チケットに紐づくコメント）
        resources :comments, only: [ :index, :create ]
      end

      # 個別のコメント操作（編集・削除など）
      resources :comments, only: [ :show, :update, :destroy ]

      resources :users
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
