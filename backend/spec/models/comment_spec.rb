require 'rails_helper'

RSpec.describe Comment, type: :model do
  describe 'バリデーション' do
    let(:ticket) { create(:ticket) }
    let(:comment) { build(:comment, ticket: ticket, user_email: 'user@example.com') }

    it '有効なコメントが作成できること' do
      expect(comment).to be_valid
    end

    it 'contentが空の場合は無効であること' do
      comment.content = ''
      expect(comment).not_to be_valid
    end

    it 'contentが1000文字を超える場合は無効であること' do
      comment.content = 'a' * 1001
      expect(comment).not_to be_valid
    end

    it 'user_emailが存在しない場合は無効であること' do
      comment.user_email = nil
      expect(comment).not_to be_valid
    end

    it 'ticketが存在しない場合は無効であること' do
      comment.ticket = nil
      expect(comment).not_to be_valid
    end
  end

  describe '関連' do
    it 'ticketに属していること' do
      expect(Comment.reflect_on_association(:ticket).macro).to eq :belongs_to
    end
  end
end
