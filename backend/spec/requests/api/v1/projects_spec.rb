require 'rails_helper'

RSpec.describe "Api::V1::Projects", type: :request do
  let(:admin_user) { create(:user, :admin) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{admin_user.generate_jwt_token}" } }

  describe "GET /index" do
    it "returns http success" do
      get "/api/v1/projects", headers: auth_headers
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    let(:project) { create(:project, creator: admin_user) }
    it "returns http success" do
      get "/api/v1/projects/#{project.id}", headers: auth_headers
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST /create" do
    it "returns http success" do
      post "/api/v1/projects", params: { project: { name: "テストプロジェクト", description: "テスト用のプロジェクトです" } }, headers: auth_headers
      expect(response).to have_http_status(:created)
    end
  end

  describe "PATCH /update" do
    let(:project) { create(:project, creator: admin_user) }
    it "returns http success" do
      patch "/api/v1/projects/#{project.id}", params: { project: { name: "更新されたプロジェクト" } }, headers: auth_headers
      expect(response).to have_http_status(:success)
    end
  end

  describe "DELETE /destroy" do
    let(:project) { create(:project, creator: admin_user) }
    it "returns http success" do
      delete "/api/v1/projects/#{project.id}", headers: auth_headers
      expect(response).to have_http_status(:no_content)
    end
  end
end
