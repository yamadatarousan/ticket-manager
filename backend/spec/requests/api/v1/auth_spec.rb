require 'rails_helper'
require 'swagger_helper'

RSpec.describe "Api::V1::Auths", type: :request do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123', password_confirmation: 'password123') }
  let(:valid_login_params) { { user: { email: user.email, password: 'password123' } } }
  let(:invalid_login_params) { { user: { email: user.email, password: 'wrong_password' } } }
  
  path '/api/v1/auth/login' do
    post('ユーザーログイン') do
      tags 'Authentication'
      description 'ユーザーのログイン認証を行い、JWTトークンを返します'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :login_params, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              email: { type: :string, format: :email, description: 'ユーザーのメールアドレス' },
              password: { type: :string, description: 'パスワード' }
            },
            required: ['email', 'password']
          }
        }
      }

      response(200, 'ログイン成功') do
        schema type: :object,
               properties: {
                 user: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string },
                     email: { type: :string },
                     role: { type: :string, enum: ['user', 'admin', 'manager'] },
                     created_at: { type: :string, format: :datetime },
                     updated_at: { type: :string, format: :datetime }
                   }
                 },
                 token: { type: :string, description: 'JWTトークン' },
                 message: { type: :string }
               }

        let(:login_params) { valid_login_params }
        run_test!
      end

      response(401, 'ログイン失敗') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }

        let(:login_params) { invalid_login_params }
        run_test!
      end
    end
  end

  path '/api/v1/auth/logout' do
    post('ユーザーログアウト') do
      tags 'Authentication'
      description 'ユーザーのログアウト（JWTはステートレスのため、クライアント側でトークンを削除）'
      produces 'application/json'
      security [Bearer: []]

      response(200, 'ログアウト成功') do
        schema type: :object,
               properties: {
                 message: { type: :string }
               }

        let(:Authorization) { "Bearer #{user.generate_jwt_token}" }
        run_test!
      end

      response(401, '認証エラー') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }

        let(:Authorization) { nil }
        run_test!
      end
    end
  end

  path '/api/v1/auth/me' do
    get('現在のユーザー情報取得') do
      tags 'Authentication'
      description '現在ログイン中のユーザー情報を取得します'
      produces 'application/json'
      security [Bearer: []]

      response(200, '取得成功') do
        schema type: :object,
               properties: {
                 user: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     name: { type: :string },
                     email: { type: :string },
                     role: { type: :string, enum: ['user', 'admin', 'manager'] },
                     created_at: { type: :string, format: :datetime },
                     updated_at: { type: :string, format: :datetime }
                   }
                 }
               }

        let(:Authorization) { "Bearer #{user.generate_jwt_token}" }
        run_test!
      end

      response(401, '認証エラー') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }

        let(:Authorization) { nil }
        run_test!
      end
    end
  end

  describe "POST /api/v1/auth/login" do
    context "有効な認証情報の場合" do
      it "ログインが成功する" do
        post "/api/v1/auth/login", params: valid_login_params
        
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to include(
          'user',
          'token',
          'message'
        )
        expect(JSON.parse(response.body)['message']).to eq('ログインに成功しました')
      end
      
      it "JWTトークンが返される" do
        post "/api/v1/auth/login", params: valid_login_params
        
        token = JSON.parse(response.body)['token']
        expect(token).not_to be_nil
        
        # トークンをデコードしてユーザー情報が含まれることを確認
        decoded_user = User.decode_jwt_token(token)
        expect(decoded_user.id).to eq(user.id)
      end
    end
    
    context "無効な認証情報の場合" do
      it "認証が失敗する" do
        post "/api/v1/auth/login", params: invalid_login_params
        
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('メールアドレスまたはパスワードが間違っています')
      end
    end
    
    context "存在しないユーザーの場合" do
      it "認証が失敗する" do
        params = { user: { email: 'nonexistent@example.com', password: 'password123' } }
        post "/api/v1/auth/login", params: params
        
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('メールアドレスまたはパスワードが間違っています')
      end
    end
  end

  describe "POST /api/v1/auth/logout" do
    context "認証済みユーザーの場合" do
      it "ログアウトが成功する" do
        token = user.generate_jwt_token
        headers = { 'Authorization' => "Bearer #{token}" }
        
        post "/api/v1/auth/logout", headers: headers
        
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['message']).to eq('ログアウトしました')
      end
    end
    
    context "認証されていないユーザーの場合" do
      it "認証エラーが返される" do
        post "/api/v1/auth/logout"
        
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('認証トークンが見つかりません')
      end
    end
  end

  describe "GET /api/v1/auth/me" do
    context "認証済みユーザーの場合" do
      it "現在のユーザー情報が返される" do
        token = user.generate_jwt_token
        headers = { 'Authorization' => "Bearer #{token}" }
        
        get "/api/v1/auth/me", headers: headers
        
        expect(response).to have_http_status(:ok)
        user_data = JSON.parse(response.body)['user']
        expect(user_data['id']).to eq(user.id)
        expect(user_data['email']).to eq(user.email)
        expect(user_data['name']).to eq(user.name)
      end
    end
    
    context "認証されていないユーザーの場合" do
      it "認証エラーが返される" do
        get "/api/v1/auth/me"
        
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('認証トークンが見つかりません')
      end
    end
    
    context "無効なトークンの場合" do
      it "認証エラーが返される" do
        headers = { 'Authorization' => "Bearer invalid_token" }
        
        get "/api/v1/auth/me", headers: headers
        
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('認証が必要です')
      end
    end
  end
end
