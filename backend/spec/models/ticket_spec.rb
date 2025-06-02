require 'rails_helper'

RSpec.describe Ticket, type: :model do
  describe 'バリデーション' do
    it 'タイトルが必須であること' do
      ticket = build(:ticket, title: nil)
      expect(ticket).not_to be_valid
      expect(ticket.errors[:title]).to include("can't be blank")
    end

    it '説明が必須であること' do
      ticket = build(:ticket, description: nil)
      expect(ticket).not_to be_valid
      expect(ticket.errors[:description]).to include("can't be blank")
    end

    it '作成者が必須であること' do
      ticket = build(:ticket, created_by: nil)
      expect(ticket).not_to be_valid
      expect(ticket.errors[:created_by]).to include("can't be blank")
    end

    it '全ての必須項目が設定されている場合は有効であること' do
      ticket = build(:ticket)
      expect(ticket).to be_valid
    end
  end

  describe 'ステータス enum' do
    it '正しいステータス値を持つこと' do
      expect(Ticket.statuses.keys).to eq([ 'open', 'in_progress', 'resolved', 'closed' ])
    end

    it 'ステータスを正しく設定できること' do
      ticket = create(:ticket, :in_progress)
      expect(ticket.status).to eq('in_progress')
      expect(ticket.in_progress?).to be true
    end
  end

  describe '優先度 enum' do
    it '正しい優先度値を持つこと' do
      expect(Ticket.priorities.keys).to eq([ 'low', 'medium', 'high', 'urgent' ])
    end

    it '優先度を正しく設定できること' do
      ticket = create(:ticket, :high_priority)
      expect(ticket.priority).to eq('high')
      expect(ticket.high?).to be true
    end
  end
end
