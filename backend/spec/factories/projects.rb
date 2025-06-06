FactoryBot.define do
  factory :project do
    sequence(:name) { |n| "プロジェクト#{n}" }
    description { "テスト用のプロジェクト説明です。" }
    status { :active }
    association :creator, factory: :user

    trait :inactive do
      status { :inactive }
    end

    trait :completed do
      status { :completed }
    end
  end
end
