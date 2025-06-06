module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'prettier'
  ],
  plugins: ['prettier'],
  rules: {
    // 実用的な設定：警告レベルに変更
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // テスト関連は警告のみ
    'testing-library/no-wait-for-multiple-assertions': 'warn',
    'testing-library/no-wait-for-side-effects': 'warn',
    'testing-library/no-unnecessary-act': 'warn',
    'testing-library/no-node-access': 'warn',
  },

  // ファイル別設定
  overrides: [
    {
      files: ['**/*.test.tsx', '**/*.test.ts'],
      rules: {
        // テストファイルでは更に緩く
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
        'testing-library/no-wait-for-multiple-assertions': 'off',
      }
    },
    {
      files: ['src/App.tsx'],
      rules: {
        // App.tsxでは未使用変数を許可（レガシー対応）
        '@typescript-eslint/no-unused-vars': 'off',
      }
    }
  ]
}; 