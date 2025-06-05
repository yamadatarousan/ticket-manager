require 'rails_helper'

RSpec.describe 'Api::V1::Comments', type: :request do
  let(:user) { create(:user, email: 'user@example.com') }
  let(:ticket) { create(:ticket) }
  let(:valid_attributes) { { content: 'テストコメント', user_email: user.email } }
  let(:invalid_attributes) { { content: '', user_email: user.email } }
  let(:headers) { { 'Authorization' => "Bearer #{user.generate_jwt_token}" } }

  describe 'GET /api/v1/tickets/:ticket_id/comments' do
    let!(:comments) { create_list(:comment, 3, ticket: ticket, user_email: user.email) }

    it 'チケットのコメント一覧を取得できること' do
      get api_v1_ticket_comments_path(ticket), headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["comments"].length).to eq(3)
    end

    it '認証されていない場合は401エラーを返すこと' do
      get api_v1_ticket_comments_path(ticket)
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/tickets/:ticket_id/comments' do
    context '有効なパラメータの場合' do
      it '新しいコメントを作成できること' do
        expect {
          post api_v1_ticket_comments_path(ticket), params: { comment: valid_attributes }, headers: headers
        }.to change(Comment, :count).by(1)
        expect(response).to have_http_status(:created)
      end
    end

    context '無効なパラメータの場合' do
      it 'コメントを作成できないこと' do
        expect {
          post api_v1_ticket_comments_path(ticket), params: { comment: invalid_attributes }, headers: headers
        }.not_to change(Comment, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    it '認証されていない場合は401エラーを返すこと' do
      post api_v1_ticket_comments_path(ticket), params: { comment: valid_attributes }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/comments/:id' do
    let!(:comment) { create(:comment, ticket: ticket, user_email: user.email) }

    context '有効なパラメータの場合' do
      let(:new_attributes) { { content: '更新されたコメント', user_email: user.email } }

      it 'コメントを更新できること' do
        put api_v1_comment_path(comment), params: { comment: new_attributes }, headers: headers
        comment.reload
        expect(comment.content).to eq('更新されたコメント')
        expect(response).to have_http_status(:ok)
      end
    end

    context '無効なパラメータの場合' do
      it 'コメントを更新できないこと' do
        put api_v1_comment_path(comment), params: { comment: invalid_attributes }, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    it '認証されていない場合は401エラーを返すこと' do
      put api_v1_comment_path(comment), params: { comment: valid_attributes }
      expect(response).to have_http_status(:unauthorized)
    end

    it '他のユーザーのコメントは更新できないこと' do
      other_user = create(:user, email: 'other@example.com')
      other_comment = create(:comment, ticket: ticket, user_email: other_user.email)
      put api_v1_comment_path(other_comment), params: { comment: valid_attributes }, headers: headers
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'DELETE /api/v1/comments/:id' do
    let!(:comment) { create(:comment, ticket: ticket, user_email: user.email) }

    it 'コメントを削除できること' do
      expect {
        delete api_v1_comment_path(comment), headers: headers
      }.to change(Comment, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it '認証されていない場合は401エラーを返すこと' do
      delete api_v1_comment_path(comment)
      expect(response).to have_http_status(:unauthorized)
    end

    it '他のユーザーのコメントは削除できないこと' do
      other_user = create(:user, email: 'other@example.com')
      other_comment = create(:comment, ticket: ticket, user_email: other_user.email)
      delete api_v1_comment_path(other_comment), headers: headers
      expect(response).to have_http_status(:forbidden)
    end
  end
end
