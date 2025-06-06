# フロントエンド コード品質ツール

RuboCopのようなコード品質管理をフロントエンドでも実現するため、以下のツールを導入しています。

## 🛠 導入ツール

- **Prettier**: コードフォーマッター（自動整形）
- **ESLint**: コード品質チェッカー（ルール違反検出）
- **Husky**: Git hooks（コミット前チェック）
- **lint-staged**: 変更ファイルのみチェック

## 📝 使用可能なコマンド

### 基本コマンド

```bash
# コード品質チェック（RuboCopと同様）
npm run lint

# 自動修正（RuboCop --auto-correctと同様）
npm run lint:fix

# コードフォーマットチェック
npm run format:check

# 自動フォーマット
npm run format

# 全チェック（lint + format）
npm run check

# 全自動修正（lint:fix + format）
npm run fix
```

### 実際の使用例

```bash
# 1. 開発中にコード品質をチェック
npm run check

# 2. 問題があれば自動修正
npm run fix

# 3. 手動修正が必要な場合は個別対応
npm run lint  # エラー詳細を確認
```

## 🔧 自動化機能

### Git Hooks（pre-commit）
コミット時に自動でlint-stagedが実行され、変更されたファイルのみチェック・修正されます。

```bash
git add .
git commit -m "機能追加"  # ← この時点で自動チェック実行
```

### CI/CD連携
GitHub Actionsでも同様のチェックが実行されるため、品質基準を満たさないコードはマージできません。

## 📊 設定ファイル

- `.prettierrc.json`: Prettierの設定
- `.prettierignore`: Prettierが無視するファイル
- `package.json` の `eslintConfig`: ESLintの設定
- `package.json` の `lint-staged`: Git hooks設定

## 🎯 RuboCopとの対応関係

| RuboCop | フロントエンド | 説明 |
|---------|---------------|------|
| `bundle exec rubocop` | `npm run lint` | コード品質チェック |
| `bundle exec rubocop --auto-correct` | `npm run fix` | 自動修正 |
| `.rubocop.yml` | `.prettierrc.json` + `eslintConfig` | 設定ファイル |
| pre-commit hook | Husky + lint-staged | Git hooks |

## 🚀 メリット

1. **一貫したコードスタイル**: チーム全体で統一されたコード品質
2. **自動修正**: 多くの問題は自動で解決
3. **早期発見**: コミット前に問題を検出
4. **CI/CD連携**: 品質基準を満たさないコードの自動ブロック

## 🔍 トラブルシューティング

### よくあるエラーと対処法

```bash
# エラー: 'variable' is defined but never used
# 対処: 変数名の前に _ を追加
const _unusedVariable = value;

# エラー: Unexpected console statement
# 対処: console.log を console.warn または console.error に変更
console.warn('デバッグ情報');

# エラー: Prettier formatting issues
# 対処: 自動フォーマット実行
npm run format
```

### 設定の無効化（緊急時のみ）

```typescript
// ESLintルールを一時的に無効化
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const temporaryVariable = value;

// Prettierを一時的に無効化
// prettier-ignore
const uglyCode = { a:1,b:2,c:3 };
```

## 📈 継続的改善

定期的に以下を実行して、コード品質を維持しましょう：

```bash
# 週次: 全ファイルの品質チェック
npm run check

# 月次: 設定の見直しと更新
npm audit
npm update
``` 