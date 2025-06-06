# 修正しきれないコードの対処法

RuboCopと同様に、フロントエンドでも段階的なアプローチで品質を向上させます。

## 🎯 優先度による対処法

### 最優先：CI/CDブロッキング（エラー）
```bash
# エラーのみ修正（警告は後回し）
npm run lint --quiet
```

### 中優先：品質向上（警告）
```bash
# 警告も含めてチェック
npm run lint
```

### 低優先：完璧主義（将来の改善）

## 🛠 具体的な対処法

### 1. **設定による解決**

#### A. 警告の許容数を調整
```json
// package.json
"lint": "eslint src --ext .ts,.tsx --max-warnings 50"
```

#### B. ルールを警告レベルに変更
```json
// package.json eslintConfig.rules
{
  "testing-library/no-wait-for-multiple-assertions": "warn",
  "testing-library/no-wait-for-side-effects": "warn",
  "no-console": ["warn", { "allow": ["warn", "error"] }]
}
```

### 2. **一時的な無効化**

#### A. ファイル全体を無効化
```typescript
/* eslint-disable */
// レガシーコードや緊急修正時
```

#### B. 特定行のみ無効化
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const temporaryVariable = value;
```

#### C. 特定ルールのみ無効化
```typescript
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
await waitFor(() => {
  expect(element1).toBeInTheDocument();
  expect(element2).toBeInTheDocument();
});
/* eslint-enable testing-library/no-wait-for-multiple-assertions */
```

### 3. **段階的な修正戦略**

#### 第1段階：エラーのみ修正（CI/CD通過）
- 未使用変数の削除
- import文の整理
- 明らかな構文エラー

#### 第2段階：簡単な警告から修正
- console.log → console.warn
- 命名規則の統一
- Prettierで自動修正可能な箇所

#### 第3段階：複雑な品質向上
- テストのリファクタリング
- アーキテクチャの改善
- パフォーマンス最適化

## 📊 実用的な基準

### CI/CD通過基準
```bash
# エラー：0個（必須）
# 警告：50個以下（許容）
npm run lint --max-warnings 50
```

### コードレビュー基準
```bash
# エラー：0個
# 警告：新規追加分のみチェック
npm run lint --max-warnings 30
```

### リリース基準
```bash
# エラー：0個
# 警告：10個以下（目標）
npm run lint --max-warnings 10
```

## 🔧 .eslintrc.js による高度な設定

```javascript
module.exports = {
  // 環境別の設定
  overrides: [
    {
      files: ['**/*.test.tsx', '**/*.test.ts'],
      rules: {
        // テストファイルでは緩い設定
        'testing-library/no-wait-for-multiple-assertions': 'warn',
        'no-console': 'off'
      }
    },
    {
      files: ['src/services/api.ts'],
      rules: {
        // APIファイルでは console を許可
        'no-console': ['warn', { allow: ['warn', 'error', 'log'] }]
      }
    }
  ]
};
```

## 🚀 RuboCopとの対応

| 状況 | RuboCop | フロントエンド |
|------|---------|---------------|
| 一時的無効化 | `# rubocop:disable` | `// eslint-disable` |
| 自動修正 | `--auto-correct` | `--fix` |
| 警告許容 | `.rubocop.yml` | `--max-warnings` |
| 段階的改善 | TODO cops | `warn` レベル |

## 💡 実践的なワークフロー

### 日常開発
```bash
# 1. 開発中
npm run lint:fix  # 自動修正

# 2. コミット前
npm run check     # 全チェック

# 3. エラーがある場合
npm run lint --max-warnings 50  # 警告は許容
```

### チーム運用
```bash
# 1. 新規参加者
npm run lint --max-warnings 100  # 緩い基準

# 2. 経験者
npm run lint --max-warnings 10   # 厳しい基準

# 3. リリース前
npm run lint --max-warnings 0    # 最高品質
```

## 📈 継続的改善

### 月次レビュー
1. 警告件数の推移を確認
2. よく発生するパターンを特定
3. ルール設定の調整
4. チーム基準の見直し

### 品質向上計画
- Phase 1: エラー0個 (必須)
- Phase 2: 警告50個以下 (現実的)
- Phase 3: 警告10個以下 (理想)
- Phase 4: 警告0個 (将来目標)

**重要**: 完璧よりも継続的な改善を重視する！ 