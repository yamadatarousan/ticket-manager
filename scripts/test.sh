#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 引数処理
TEST_BACKEND=true
TEST_FRONTEND=true

# 引数がある場合は処理
while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-only)
      TEST_FRONTEND=false
      shift
      ;;
    --frontend-only)
      TEST_BACKEND=false
      shift
      ;;
    *)
      echo -e "${RED}不明な引数: $1${NC}"
      echo "使用方法: $0 [--backend-only] [--frontend-only]"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}=== チケット管理システム テスト実行スクリプト ===${NC}"
echo ""

# プロジェクトのルートディレクトリに移動
cd "$(dirname "$0")/.." || exit

# 結果格納変数
BACKEND_SUCCESS=false
FRONTEND_SUCCESS=false

# バックエンドテスト
if [ "$TEST_BACKEND" = true ]; then
  echo -e "${GREEN}=== バックエンドテストを実行します ===${NC}"
  cd backend || exit
  
  echo -e "${YELLOW}RSpecを実行しています...${NC}"
  if bundle exec rspec; then
    echo -e "${GREEN}✓ バックエンドテストが成功しました${NC}"
    BACKEND_SUCCESS=true
  else
    echo -e "${RED}✗ バックエンドテストが失敗しました${NC}"
  fi
  
  cd ..
  echo ""
fi

# フロントエンドテスト
if [ "$TEST_FRONTEND" = true ]; then
  echo -e "${GREEN}=== フロントエンドテストを実行します ===${NC}"
  cd frontend || exit
  
  echo -e "${YELLOW}Jestを実行しています...${NC}"
  if CI=true npm test; then
    echo -e "${GREEN}✓ フロントエンドテストが成功しました${NC}"
    FRONTEND_SUCCESS=true
  else
    echo -e "${RED}✗ フロントエンドテストが失敗しました${NC}"
  fi
  
  cd ..
  echo ""
fi

# 結果表示
echo -e "${BLUE}=== テスト結果サマリー ===${NC}"
if [ "$TEST_BACKEND" = true ]; then
  if [ "$BACKEND_SUCCESS" = true ]; then
    echo -e "${GREEN}✓ バックエンドテスト: 成功${NC}"
  else
    echo -e "${RED}✗ バックエンドテスト: 失敗${NC}"
  fi
fi

if [ "$TEST_FRONTEND" = true ]; then
  if [ "$FRONTEND_SUCCESS" = true ]; then
    echo -e "${GREEN}✓ フロントエンドテスト: 成功${NC}"
  else
    echo -e "${RED}✗ フロントエンドテスト: 失敗${NC}"
  fi
fi

# 最終判定
if ([ "$TEST_BACKEND" = false ] || [ "$BACKEND_SUCCESS" = true ]) && \
   ([ "$TEST_FRONTEND" = false ] || [ "$FRONTEND_SUCCESS" = true ]); then
  echo -e "${GREEN}✓ すべてのテストが成功しました${NC}"
  exit 0
else
  echo -e "${RED}✗ テストに失敗しました${NC}"
  exit 1
fi 