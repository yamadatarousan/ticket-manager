FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "テストユーザー#{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    role { :user }
    password { "password123" }
    password_confirmation { "password123" }
    
    trait :admin do
      role { :admin }
      name { "管理者ユーザー" }
    end
    
    trait :manager do
      role { :manager }
      name { "マネージャーユーザー" }
    end
  end
end
