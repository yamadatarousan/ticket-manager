FactoryBot.define do
  factory :comment do
    content { "テストコメント" }
    user_email { "user@example.com" }
    association :ticket
  end
end
