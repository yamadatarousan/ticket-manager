class CreateSystemSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :system_settings do |t|
      t.string :key, null: false
      t.text :value
      t.string :description
      t.string :setting_type, null: false, default: 'string'
      t.boolean :is_public, null: false, default: false

      t.timestamps
    end

    # パフォーマンス向上のためのインデックス
    add_index :system_settings, :key, unique: true
    add_index :system_settings, :setting_type
    add_index :system_settings, :is_public
  end
end
