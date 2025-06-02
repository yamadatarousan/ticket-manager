require 'rails_helper'

RSpec.describe Ticket, type: :model do
  describe 'バリデーション' do
    it 'タイトルが必須であること' do
      ticket = Ticket.new(description: 'テスト', status: 'open', priority: 'medium', created_by: 'test@example.com')
      expect(ticket).not_to be_valid
      expect(ticket.errors[:title]).to include("can't be blank")
    end

    it '説明が必須であること' do
      ticket = Ticket.new(title: 'テストタイトル', status: 'open', priority: 'medium', created_by: 'test@example.com')
      expect(ticket).not_to be_valid
      expect(ticket.errors[:description]).to include("can't be blank")
    end

    it '作成者が必須であること' do
      ticket = Ticket.new(title: 'テストタイトル', description: 'テスト', status: 'open', priority: 'medium')
      expect(ticket).not_to be_valid
      expect(ticket.errors[:created_by]).to include("can't be blank")
    end

    it '全ての必須項目が設定されている場合は有効であること' do
      ticket = Ticket.new(
        title: 'テストタイトル',
        description: 'テスト説明',
        status: 'open',
        priority: 'medium',
        created_by: 'test@example.com'
      )
      expect(ticket).to be_valid
    end
  end

  describe 'ステータス enum' do
    it '正しいステータス値を持つこと' do
      expect(Ticket.statuses.keys).to eq(['open', 'in_progress', 'resolved', 'closed'])
    end
  end

  describe '優先度 enum' do
    it '正しい優先度値を持つこと' do
      expect(Ticket.priorities.keys).to eq(['low', 'medium', 'high', 'urgent'])
    end
  end
end
