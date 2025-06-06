FactoryBot.define do
  factory :ticket do
    sequence(:title) { |n| "チケット#{n}" }
    description { "テスト用のチケット説明です。" }
    status { :open }
    priority { :medium }
    association :assigned_user, factory: :user
    association :creator, factory: :user
    association :project

    trait :in_progress do
      status { :in_progress }
    end

    trait :resolved do
      status { :resolved }
    end

    trait :closed do
      status { :closed }
    end

    trait :high_priority do
      priority { :high }
    end

    trait :urgent do
      priority { :urgent }
    end

    trait :low_priority do
      priority { :low }
    end
  end
end
