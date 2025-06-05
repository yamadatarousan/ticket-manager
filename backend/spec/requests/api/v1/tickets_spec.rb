require 'swagger_helper'

RSpec.describe 'api/v1/tickets', type: :request do
  let(:admin_user) { create(:user, :admin) }
  let(:regular_user) { create(:user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{admin_user.generate_jwt_token}" } }

  path '/api/v1/tickets' do
    get('チケット一覧取得') do
      tags 'Tickets'
      description 'チケット一覧を取得'
      produces 'application/json'
      security [ Bearer: [] ]

      parameter name: :status, in: :query, type: :string, description: 'ステータスでフィルタ', required: false
      parameter name: :priority, in: :query, type: :string, description: '優先度でフィルタ', required: false
      parameter name: :assigned_to, in: :query, type: :string, description: '担当者でフィルタ', required: false
      parameter name: :created_by, in: :query, type: :string, description: '作成者でフィルタ', required: false
      parameter name: :limit, in: :query, type: :integer, description: '取得件数制限', required: false
      parameter name: :offset, in: :query, type: :integer, description: 'オフセット', required: false

      response(200, '成功') do
        schema type: :object,
               properties: {
                 tickets: {
                   type: :array,
                   items: {
                     type: :object,
                     properties: {
                       id: { type: :integer },
                       title: { type: :string },
                       description: { type: :string },
                       status: { type: :string, enum: [ 'open', 'in_progress', 'resolved', 'closed' ] },
                       priority: { type: :string, enum: [ 'low', 'medium', 'high', 'urgent' ] },
                       assigned_to: { type: [ :string, :null ] },
                       created_by: { type: :string }
                     }
                   }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     total: { type: :integer },
                     count: { type: :integer }
                   }
                 }
               }

        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
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

    post('チケット作成') do
      tags 'Tickets'
      description 'チケットを作成'
      consumes 'application/json'
      produces 'application/json'
      security [ Bearer: [] ]

      parameter name: :ticket, in: :body, schema: {
        type: :object,
        properties: {
          ticket: {
            type: :object,
            properties: {
              title: { type: :string },
              description: { type: :string },
              status: { type: :string, enum: [ 'open', 'in_progress', 'resolved', 'closed' ] },
              priority: { type: :string, enum: [ 'low', 'medium', 'high', 'urgent' ] },
              assigned_to: { type: [ :string, :null ] },
              creator_id: { type: :integer }
            },
            required: [ 'title', 'description', 'status', 'priority', 'creator_id' ]
          }
        }
      }

      response(201, '作成成功') do
        schema type: :object,
               properties: {
                 ticket: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     title: { type: :string },
                     description: { type: :string },
                     status: { type: :string },
                     priority: { type: :string },
                     assigned_to: { type: [ :string, :null ] },
                     creator_id: { type: :integer }
                   }
                 }
               }

        let(:ticket) { { ticket: { title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', creator_id: admin_user.id } } }
        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
        run_test!
      end

      response(422, 'バリデーションエラー') do
        schema type: :object,
               properties: {
                 errors: {
                   type: :array,
                   items: { type: :string }
                 }
               }

        let(:ticket) { { ticket: { title: '' } } }
        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
        run_test!
      end
    end
  end

  path '/api/v1/tickets/{id}' do
    parameter name: 'id', in: :path, type: :string, description: 'チケットID'

    get('チケット詳細取得') do
      tags 'Tickets'
      description 'チケット詳細を取得'
      produces 'application/json'
      security [ Bearer: [] ]

      response(200, '成功') do
        schema type: :object,
               properties: {
                 ticket: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     title: { type: :string },
                     description: { type: :string },
                     status: { type: :string },
                     priority: { type: :string },
                     assigned_to: { type: [ :string, :null ] },
                     creator_id: { type: :integer }
                   }
                 }
               }

        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
        let(:id) { create(:ticket, title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', creator: admin_user).id }
        run_test!
      end

      response(404, '見つからない') do
        schema type: :object,
               properties: {
                 error: { type: :string }
               }

        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('チケット更新') do
      tags 'Tickets'
      description 'チケットを更新'
      consumes 'application/json'
      produces 'application/json'
      security [ Bearer: [] ]

      parameter name: :ticket, in: :body, schema: {
        type: :object,
        properties: {
          ticket: {
            type: :object,
            properties: {
              title: { type: :string },
              description: { type: :string },
              status: { type: :string, enum: [ 'open', 'in_progress', 'resolved', 'closed' ] },
              priority: { type: :string, enum: [ 'low', 'medium', 'high', 'urgent' ] },
              assigned_to: { type: [ :string, :null ] },
              created_by: { type: :string }
            }
          }
        }
      }

      response(200, '更新成功') do
        schema type: :object,
               properties: {
                 ticket: {
                   type: :object,
                   properties: {
                     id: { type: :integer },
                     title: { type: :string },
                     description: { type: :string },
                     status: { type: :string },
                     priority: { type: :string },
                     assigned_to: { type: [ :string, :null ] },
                     creator_id: { type: :integer }
                   }
                 }
               }

        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
        let(:id) { create(:ticket, title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', creator: admin_user).id }
        let(:ticket) { { ticket: { title: '更新されたチケット' } } }
        run_test!
      end
    end

    delete('チケット削除') do
      tags 'Tickets'
      description 'チケットを削除'
      security [ Bearer: [] ]

      response(204, '削除成功') do
        let(:Authorization) { "Bearer #{admin_user.generate_jwt_token}" }
        let(:id) { create(:ticket, title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', creator: admin_user).id }
        run_test!
      end
    end
  end

  # 認証システム対応のリファクタリングテスト
  describe "GET /api/v1/tickets" do
    context "認証済みユーザーの場合" do
      it "チケット一覧を取得できること" do
        create(:ticket)
        get "/api/v1/tickets", headers: auth_headers
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['tickets']).to be_an(Array)
        expect(json['meta']).to include('total', 'count')
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        get "/api/v1/tickets"
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('認証トークンが見つかりません')
      end
    end
  end

  describe "POST /api/v1/tickets" do
    let(:valid_ticket_params) do
      {
        ticket: {
          title: "新しいチケット",
          description: "詳細説明",
          status: "open",
          priority: "medium",
          assigned_to: "user@example.com",
          created_by: "admin@example.com"
        }
      }
    end

    context "認証済みユーザーの場合" do
      it "有効なパラメータでチケットを作成できること" do
        post "/api/v1/tickets", params: valid_ticket_params, headers: auth_headers
        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['ticket']['title']).to eq('新しいチケット')
      end

      it "無効なパラメータの場合エラーが返されること" do
        invalid_params = { ticket: { title: "", description: "" } }
        post "/api/v1/tickets", params: invalid_params, headers: auth_headers
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        post "/api/v1/tickets", params: valid_ticket_params
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/tickets/:id" do
    let(:ticket) { create(:ticket) }

    context "認証済みユーザーの場合" do
      it "チケット詳細を取得できること" do
        get "/api/v1/tickets/#{ticket.id}", headers: auth_headers
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['ticket']['id']).to eq(ticket.id)
      end

      it "存在しないチケットの場合404が返されること" do
        get "/api/v1/tickets/999999", headers: auth_headers
        expect(response).to have_http_status(:not_found)
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        get "/api/v1/tickets/#{ticket.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/tickets/:id" do
    let(:ticket) { create(:ticket) }
    let(:update_params) { { ticket: { title: "更新されたタイトル" } } }

    context "認証済みユーザーの場合" do
      it "チケットを更新できること" do
        patch "/api/v1/tickets/#{ticket.id}", params: update_params, headers: auth_headers
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json['ticket']['title']).to eq('更新されたタイトル')
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        patch "/api/v1/tickets/#{ticket.id}", params: update_params
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/tickets/:id" do
    let!(:ticket) { create(:ticket) }

    context "認証済みユーザーの場合" do
      it "チケットを削除できること" do
        delete "/api/v1/tickets/#{ticket.id}", headers: auth_headers
        expect(response).to have_http_status(:no_content)
      end
    end

    context "認証されていないユーザーの場合" do
      it "認証エラーが返されること" do
        delete "/api/v1/tickets/#{ticket.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
