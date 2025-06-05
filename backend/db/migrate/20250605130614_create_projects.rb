class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects do |t|
      t.string :name, null: false, limit: 255
      t.text :description
      t.integer :status, default: 0, null: false
      t.bigint :created_by, null: false
      t.date :start_date
      t.date :end_date

      t.timestamps
    end

    # インデックスの追加
    add_index :projects, :name, unique: true
    add_index :projects, :status
    add_index :projects, :created_by
    add_index :projects, :start_date
    add_index :projects, :end_date
  end
end
