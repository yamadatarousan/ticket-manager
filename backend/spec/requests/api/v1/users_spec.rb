require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  describe "GET /api/v1/users" do
    it "ユーザー一覧を正常に取得できること" do
      User.create!(name: "テストユーザー", email: "test@example.com", role: "user")
      get "/api/v1/users"
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['users']).to be_present
      expect(json['meta']).to be_present
    end
  end

  describe "POST /api/v1/users" do
    it "有効なパラメータでユーザーを作成できること" do
      user_params = {
        user: {
          name: "新規ユーザー",
          email: "new@example.com", 
          role: "user"
        }
      }
      post "/api/v1/users", params: user_params
      expect(response).to have_http_status(:created)
    end

    it "無効なパラメータでユーザー作成が失敗すること" do
      user_params = {
        user: {
          name: "",
          email: "invalid-email",
          role: "user"
        }
      }
      post "/api/v1/users", params: user_params
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "GET /api/v1/users/:id" do
    it "指定されたユーザーの詳細を取得できること" do
      user = User.create!(name: "テストユーザー", email: "test@example.com", role: "user")
      get "/api/v1/users/#{user.id}"
      expect(response).to have_http_status(:success)
    end

    it "存在しないユーザーIDで404エラーになること" do
      get "/api/v1/users/999999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /api/v1/users/:id" do
    it "ユーザー情報を更新できること" do
      user = User.create!(name: "テストユーザー", email: "test@example.com", role: "user")
      update_params = {
        user: {
          name: "更新されたユーザー"
        }
      }
      patch "/api/v1/users/#{user.id}", params: update_params
      expect(response).to have_http_status(:success)
    end
  end

  describe "DELETE /api/v1/users/:id" do
    it "ユーザーを削除できること" do
      user = User.create!(name: "テストユーザー", email: "test@example.com", role: "user")
      delete "/api/v1/users/#{user.id}"
      expect(response).to have_http_status(:no_content)
    end
  end
end
