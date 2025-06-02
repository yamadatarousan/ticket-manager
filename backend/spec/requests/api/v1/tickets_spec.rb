require 'swagger_helper'

RSpec.describe 'api/v1/tickets', type: :request do
  path '/api/v1/tickets' do
    get('チケット一覧取得') do
      tags 'Tickets'
      description 'チケット一覧を取得'
      produces 'application/json'
      
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
                       status: { type: :string, enum: ['open', 'in_progress', 'resolved', 'closed'] },
                       priority: { type: :string, enum: ['low', 'medium', 'high', 'urgent'] },
                       assigned_to: { type: :string },
                       created_by: { type: :string },
                       created_at: { type: :string, format: :datetime },
                       updated_at: { type: :string, format: :datetime }
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

        run_test!
      end
    end

    post('チケット作成') do
      tags 'Tickets'
      description 'チケットを作成'
      consumes 'application/json'
      produces 'application/json'
      
      parameter name: :ticket, in: :body, schema: {
        type: :object,
        properties: {
          ticket: {
            type: :object,
            properties: {
              title: { type: :string },
              description: { type: :string },
              status: { type: :string, enum: ['open', 'in_progress', 'resolved', 'closed'] },
              priority: { type: :string, enum: ['low', 'medium', 'high', 'urgent'] },
              assigned_to: { type: :string },
              created_by: { type: :string }
            },
            required: ['title', 'description', 'status', 'priority', 'created_by']
          }
        }
      }

      response(201, '作成成功') do
        let(:ticket) { { ticket: { title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', created_by: 'test@example.com' } } }
        run_test!
      end

      response(422, 'バリデーションエラー') do
        let(:ticket) { { ticket: { title: '' } } }
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

      response(200, '成功') do
        let(:id) { Ticket.create(title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', created_by: 'test@example.com').id }
        run_test!
      end

      response(404, '見つからない') do
        let(:id) { 'invalid' }
        run_test!
      end
    end

    patch('チケット更新') do
      tags 'Tickets'
      description 'チケットを更新'
      consumes 'application/json'
      produces 'application/json'
      
      parameter name: :ticket, in: :body, schema: {
        type: :object,
        properties: {
          ticket: {
            type: :object,
            properties: {
              title: { type: :string },
              description: { type: :string },
              status: { type: :string, enum: ['open', 'in_progress', 'resolved', 'closed'] },
              priority: { type: :string, enum: ['low', 'medium', 'high', 'urgent'] },
              assigned_to: { type: :string },
              created_by: { type: :string }
            }
          }
        }
      }

      response(200, '更新成功') do
        let(:id) { Ticket.create(title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', created_by: 'test@example.com').id }
        let(:ticket) { { ticket: { title: '更新されたタイトル' } } }
        run_test!
      end
    end

    delete('チケット削除') do
      tags 'Tickets'
      description 'チケットを削除'

      response(204, '削除成功') do
        let(:id) { Ticket.create(title: 'テストチケット', description: 'テスト説明', status: 'open', priority: 'medium', created_by: 'test@example.com').id }
        run_test!
      end
    end
  end
end
