#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== チケット管理システム セットアップスクリプト ===${NC}"
echo -e "${YELLOW}このスクリプトは開発環境のセットアップを行います${NC}"
echo ""

# プロジェクトのルートディレクトリに移動
cd "$(dirname "$0")/.." || exit

# バックエンドセットアップ
echo -e "${GREEN}=== バックエンドのセットアップを開始します ===${NC}"
cd backend || exit

echo -e "${YELLOW}Gemをインストールしています...${NC}"
if ! bundle install; then
  echo -e "${RED}Gemのインストールに失敗しました。${NC}"
  exit 1
fi

echo -e "${YELLOW}データベースを作成しています...${NC}"
if ! bundle exec rails db:create; then
  echo -e "${RED}データベース作成に失敗しました。${NC}"
  echo -e "${YELLOW}MySQLが起動していることを確認してください。${NC}"
  exit 1
fi

echo -e "${YELLOW}マイグレーションを実行しています...${NC}"
if ! bundle exec rails db:migrate; then
  echo -e "${RED}マイグレーションに失敗しました。${NC}"
  exit 1
fi

echo -e "${YELLOW}初期データを投入しています...${NC}"
if ! bundle exec rails db:seed; then
  echo -e "${RED}初期データ投入に失敗しました。${NC}"
  exit 1
fi

# フロントエンドセットアップ
echo -e "${GREEN}=== フロントエンドのセットアップを開始します ===${NC}"
cd ../frontend || exit

echo -e "${YELLOW}依存パッケージをインストールしています...${NC}"
if ! npm install; then
  echo -e "${RED}パッケージのインストールに失敗しました。${NC}"
  exit 1
fi

echo -e "${GREEN}=== セットアップが完了しました ===${NC}"
echo ""
echo -e "${BLUE}開発サーバーを起動するには:${NC}"
echo -e "  バックエンド: ${YELLOW}cd backend && rails s -p 3001${NC}"
echo -e "  フロントエンド: ${YELLOW}cd frontend && npm start${NC}"
echo ""
echo -e "${BLUE}または起動スクリプトを使用:${NC}"
echo -e "  ${YELLOW}./scripts/start.sh${NC}"
echo ""
echo -e "${BLUE}テスト用アカウント:${NC}"
echo -e "  管理者: ${YELLOW}admin@example.com / password123${NC}"
echo -e "  マネージャー: ${YELLOW}manager@example.com / password123${NC}"
echo -e "  一般ユーザー: ${YELLOW}user@example.com / password123${NC}" 