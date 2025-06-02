require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'バリデーション' do
    it '名前が必須であること' do
      user = build(:user, name: nil)
      expect(user).not_to be_valid
      expect(user.errors[:name]).to include("can't be blank")
    end

    it 'メールアドレスが必須であること' do
      user = build(:user, email: nil)
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it 'メールアドレスが一意であること' do
      create(:user, email: 'test@example.com')
      user = build(:user, email: 'test@example.com')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("has already been taken")
    end

    it '正しいメールアドレス形式であること' do
      user = build(:user, email: 'invalid-email')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("is invalid")
    end

    it 'パスワードの最小長が6文字であること' do
      user = build(:user, password: 'short', password_confirmation: 'short')
      expect(user).not_to be_valid
      expect(user.errors[:password]).to include("is too short (minimum is 6 characters)")
    end

    it 'ロールが有効であること' do
      user = build(:user)
      expect(User.roles.keys).to include(user.role)
    end

    it '全ての必須項目が設定されている場合は有効であること' do
      user = build(:user)
      expect(user).to be_valid
    end
  end

  describe 'ロール enum' do
    it '正しいロール値を持つこと' do
      expect(User.roles).to eq({
        'user' => 0,
        'manager' => 1,
        'admin' => 2
      })
    end

    it 'ロールに応じた判定メソッドが動作すること' do
      user = create(:user, role: :user)
      manager = create(:user, :manager)
      admin = create(:user, :admin)

      expect(user.user?).to be true
      expect(user.manager?).to be false
      expect(user.admin?).to be false

      expect(manager.user?).to be false
      expect(manager.manager?).to be true
      expect(manager.admin?).to be false

      expect(admin.user?).to be false
      expect(admin.manager?).to be false
      expect(admin.admin?).to be true
    end
  end

  describe '認証メソッド' do
    it '正しいパスワードで認証できること' do
      user = create(:user, email: 'test@example.com', password: 'password123', password_confirmation: 'password123')
      authenticated_user = User.authenticate('test@example.com', 'password123')
      expect(authenticated_user).to eq(user)
    end

    it '間違ったパスワードでは認証できないこと' do
      user = create(:user, email: 'test@example.com', password: 'password123', password_confirmation: 'password123')
      authenticated_user = User.authenticate('test@example.com', 'wrong_password')
      expect(authenticated_user).to be_nil
    end

    it '存在しないメールアドレスでは認証できないこと' do
      authenticated_user = User.authenticate('nonexistent@example.com', 'password123')
      expect(authenticated_user).to be_nil
    end
  end

  describe 'JWTトークンメソッド' do
    let(:user) { create(:user) }

    it 'JWTトークンを生成できること' do
      token = user.generate_jwt_token
      expect(token).to be_a(String)
      expect(token.split('.').length).to eq(3) # JWT の構造
    end

    it 'JWTトークンをデコードできること' do
      token = user.generate_jwt_token
      decoded_user = User.decode_jwt_token(token)
      expect(decoded_user.id).to eq(user.id)
      expect(decoded_user.email).to eq(user.email)
    end

    it '無効なトークンではnilが返されること' do
      invalid_token = 'invalid_token'
      decoded_user = User.decode_jwt_token(invalid_token)
      expect(decoded_user).to be_nil
    end
  end
end
