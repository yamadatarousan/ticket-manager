class CreateComments < ActiveRecord::Migration[8.0]
  def change
    unless table_exists?(:comments)
      create_table :comments do |t|
        t.text :content, null: false
        t.references :ticket, null: false, foreign_key: true
        t.string :user_email, null: false

        t.timestamps
      end
    end

    # パフォーマンス向上のためのインデックス
    # ticket_idは:referencesで既に作成されているため不要
    unless index_exists?(:comments, :user_email)
      add_index :comments, :user_email
    end
    unless index_exists?(:comments, :created_at)
      add_index :comments, :created_at
    end
  end
end
