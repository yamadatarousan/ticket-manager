FactoryBot.define do
  factory :system_setting do
    key { "MyString" }
    value { "MyText" }
    description { "MyString" }
    setting_type { "MyString" }
    is_public { false }
  end
end
