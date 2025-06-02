FactoryBot.define do
  factory :ticket do
    title { "MyString" }
    description { "MyText" }
    status { 1 }
    priority { 1 }
    assigned_to { "MyString" }
    created_by { "MyString" }
  end
end
