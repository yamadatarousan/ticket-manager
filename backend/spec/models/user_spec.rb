require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーション' do
    it '名前が必須であること' do
      user = User.new(email: 'test@example.com', role: 'user')
      expect(user).not_to be_valid
      expect(user.errors[:name]).to include("can't be blank")
    end

    it 'メールアドレスが必須であること' do
      user = User.new(name: 'テストユーザー', role: 'user')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it 'メールアドレスが一意であること' do
      User.create!(name: 'ユーザー1', email: 'test@example.com', role: 'user')
      user = User.new(name: 'ユーザー2', email: 'test@example.com', role: 'admin')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("has already been taken")
    end

    it '正しいメールアドレス形式であること' do
      user = User.new(name: 'テストユーザー', email: 'invalid-email', role: 'user')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("is invalid")
    end

    it '全ての必須項目が設定されている場合は有効であること' do
      user = User.new(
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'user'
      )
      expect(user).to be_valid
    end
  end

  describe 'ロール enum' do
    it '正しいロール値を持つこと' do
      expect(User.roles.keys).to eq(['user', 'admin', 'manager'])
    end
  end
end
