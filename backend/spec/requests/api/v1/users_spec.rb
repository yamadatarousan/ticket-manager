require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  let(:admin_user) { create(:user, :admin) }
  let(:regular_user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{admin_user.generate_jwt_token}" } }

  describe "GET /api/v1/users" do
    context "認証済みユーザーの場合" do
      it "ユーザー一覧を正常に取得できること" do
        create(:user, name: "テストユーザー", email: "test@example.com")
        get "/api/v1/users", headers: auth_headers
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['users']).to be_an(Array)
        expect(json['meta']).to include('total', 'count')
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        get "/api/v1/users"
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('認証トークンが見つかりません')
      end
    end
  end

  describe "POST /api/v1/users" do
    context "有効なパラメータの場合" do
      it "ユーザーを作成できること" do
        user_params = {
          user: {
            name: "新規ユーザー",
            email: "new@example.com",
            role: "user",
            password: "password123",
            password_confirmation: "password123"
          }
        }
        post "/api/v1/users", params: user_params
        expect(response).to have_http_status(:created)

        json = JSON.parse(response.body)
        expect(json['user']['name']).to eq("新規ユーザー")
        expect(json['user']['email']).to eq("new@example.com")
        expect(json['token']).to be_present
        expect(json['message']).to eq('ユーザーが正常に作成されました')
      end
    end

    context "無効なパラメータの場合" do
      it "ユーザー作成が失敗すること" do
        user_params = {
          user: {
            name: "",
            email: "invalid-email",
            role: "user",
            password: "123", # 短すぎるパスワード
            password_confirmation: "123"
          }
        }
        post "/api/v1/users", params: user_params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "パスワード確認が一致しない場合失敗すること" do
        user_params = {
          user: {
            name: "テストユーザー",
            email: "test@example.com",
            role: "user",
            password: "password123",
            password_confirmation: "different_password"
          }
        }
        post "/api/v1/users", params: user_params
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/users/:id" do
    context "認証済みユーザーの場合" do
      it "指定されたユーザーの詳細を取得できること" do
        user = create(:user, name: "テストユーザー", email: "test@example.com")
        get "/api/v1/users/#{user.id}", headers: auth_headers
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['id']).to eq(user.id)
        expect(json['name']).to eq(user.name)
        expect(json['email']).to eq(user.email)
      end

      it "存在しないユーザーIDで404エラーになること" do
        get "/api/v1/users/999999", headers: auth_headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        user = create(:user)
        get "/api/v1/users/#{user.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/users/:id" do
    context "認証済みユーザーの場合" do
      it "ユーザー情報を更新できること" do
        user = create(:user, name: "テストユーザー", email: "test@example.com")
        update_params = {
          user: {
            name: "更新されたユーザー"
          }
        }
        patch "/api/v1/users/#{user.id}", params: update_params, headers: auth_headers
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['name']).to eq("更新されたユーザー")
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        user = create(:user)
        update_params = { user: { name: "更新されたユーザー" } }
        patch "/api/v1/users/#{user.id}", params: update_params
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/users/:id" do
    context "認証済みユーザーの場合" do
      it "ユーザーを削除できること" do
        user = create(:user, name: "テストユーザー", email: "test@example.com")
        delete "/api/v1/users/#{user.id}", headers: auth_headers
        expect(response).to have_http_status(:no_content)
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        user = create(:user)
        delete "/api/v1/users/#{user.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
