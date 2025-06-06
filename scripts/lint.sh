#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 引数処理
LINT_BACKEND=true
LINT_FRONTEND=true
FIX_MODE=false

# 引数がある場合は処理
while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-only)
      LINT_FRONTEND=false
      shift
      ;;
    --frontend-only)
      LINT_BACKEND=false
      shift
      ;;
    --fix)
      FIX_MODE=true
      shift
      ;;
    *)
      echo -e "${RED}不明な引数: $1${NC}"
      echo "使用方法: $0 [--backend-only] [--frontend-only] [--fix]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}=== チケット管理システム リント実行スクリプト ===${NC}"
echo ""

# プロジェクトのルートディレクトリに移動
cd "$(dirname "$0")/.." || exit

# 結果格納変数
BACKEND_SUCCESS=false
FRONTEND_SUCCESS=false

# バックエンドリント
if [ "$LINT_BACKEND" = true ]; then
  echo -e "${GREEN}=== バックエンドのリントを実行します ===${NC}"
  cd backend || exit
  
  if [ "$FIX_MODE" = true ]; then
    echo -e "${YELLOW}RuboCop（自動修正モード）を実行しています...${NC}"
    if bundle exec rubocop -a; then
      echo -e "${GREEN}✓ バックエンドリント（自動修正）が成功しました${NC}"
      BACKEND_SUCCESS=true
    else
      echo -e "${RED}✗ バックエンドリント（自動修正）が失敗しました${NC}"
      echo -e "${YELLOW}修正できない問題があります。手動で修正してください。${NC}"
    fi
  else
    echo -e "${YELLOW}RuboCopを実行しています...${NC}"
    if bundle exec rubocop; then
      echo -e "${GREEN}✓ バックエンドリントが成功しました${NC}"
      BACKEND_SUCCESS=true
    else
      echo -e "${RED}✗ バックエンドリントが失敗しました${NC}"
      echo -e "${YELLOW}修正するには --fix オプションを使用してください${NC}"
    fi
  fi
  
  cd ..
  echo ""
fi

# フロントエンドリント
if [ "$LINT_FRONTEND" = true ]; then
  echo -e "${GREEN}=== フロントエンドのリントを実行します ===${NC}"
  cd frontend || exit
  
  if [ "$FIX_MODE" = true ]; then
    echo -e "${YELLOW}ESLint（自動修正モード）を実行しています...${NC}"
    if npx eslint --fix 'src/**/*.{js,jsx,ts,tsx}'; then
      echo -e "${GREEN}✓ フロントエンドリント（自動修正）が成功しました${NC}"
      FRONTEND_SUCCESS=true
    else
      echo -e "${RED}✗ フロントエンドリント（自動修正）が失敗しました${NC}"
      echo -e "${YELLOW}修正できない問題があります。手動で修正してください。${NC}"
    fi
  else
    echo -e "${YELLOW}ESLintを実行しています...${NC}"
    if npx eslint 'src/**/*.{js,jsx,ts,tsx}'; then
      echo -e "${GREEN}✓ フロントエンドリントが成功しました${NC}"
      FRONTEND_SUCCESS=true
    else
      echo -e "${RED}✗ フロントエンドリントが失敗しました${NC}"
      echo -e "${YELLOW}修正するには --fix オプションを使用してください${NC}"
    fi
  fi
  
  cd ..
  echo ""
fi

# 結果表示
echo -e "${BLUE}=== リント結果サマリー ===${NC}"
if [ "$LINT_BACKEND" = true ]; then
  if [ "$BACKEND_SUCCESS" = true ]; then
    echo -e "${GREEN}✓ バックエンドリント: 成功${NC}"
  else
    echo -e "${RED}✗ バックエンドリント: 失敗${NC}"
  fi
fi

if [ "$LINT_FRONTEND" = true ]; then
  if [ "$FRONTEND_SUCCESS" = true ]; then
    echo -e "${GREEN}✓ フロントエンドリント: 成功${NC}"
  else
    echo -e "${RED}✗ フロントエンドリント: 失敗${NC}"
  fi
fi

# 最終判定
if ([ "$LINT_BACKEND" = false ] || [ "$BACKEND_SUCCESS" = true ]) && \
   ([ "$LINT_FRONTEND" = false ] || [ "$FRONTEND_SUCCESS" = true ]); then
  echo -e "${GREEN}✓ すべてのリントが成功しました${NC}"
  exit 0
else
  echo -e "${RED}✗ リントに失敗しました${NC}"
  echo -e "${YELLOW}自動修正を試すには --fix オプションを使用してください${NC}"
  exit 1
fi 