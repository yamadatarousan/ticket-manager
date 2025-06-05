#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== チケット管理システム 開発サーバー起動スクリプト ===${NC}"
echo ""

# プロジェクトのルートディレクトリに移動
cd "$(dirname "$0")/.." || exit

# ポートチェック関数
check_port() {
  local port=$1
  if lsof -i:"$port" > /dev/null; then
    echo -e "${RED}警告: ポート $port はすでに使用されています。${NC}"
    echo -e "${YELLOW}他のプロセスが実行中の可能性があります。${NC}"
    return 1
  fi
  return 0
}

# フロントエンド用のポート確認
if ! check_port 3000; then
  echo -e "${YELLOW}フロントエンドは別のポートで起動するか、実行中のプロセスを終了してください。${NC}"
fi

# バックエンド用のポート確認
if ! check_port 3001; then
  echo -e "${YELLOW}バックエンドは別のポートで起動するか、実行中のプロセスを終了してください。${NC}"
fi

# 起動メッセージ
echo -e "${GREEN}バックエンドサーバーとフロントエンドサーバーを起動します${NC}"
echo -e "${YELLOW}終了するには Ctrl+C を押してください${NC}"
echo ""

# バックエンドサーバーを起動（バックグラウンドで）
echo -e "${GREEN}バックエンドサーバーを起動しています...${NC}"
cd backend || exit
bundle exec rails server -p 3001 &
BACKEND_PID=$!

# バックエンドサーバーの起動を待つ
echo -e "${YELLOW}バックエンドサーバーの起動を待っています...${NC}"
sleep 5
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo -e "${RED}バックエンドサーバーの起動に失敗しました。${NC}"
  exit 1
fi

# フロントエンドサーバーを起動
echo -e "${GREEN}フロントエンドサーバーを起動しています...${NC}"
cd ../frontend || exit
npm start &
FRONTEND_PID=$!

# トラップを設定して終了時に子プロセスをクリーンアップ
cleanup() {
  echo -e "${YELLOW}サーバーをシャットダウンしています...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}シャットダウン完了${NC}"
  exit 0
}
trap cleanup INT TERM

echo -e "${GREEN}両方のサーバーが起動しました${NC}"
echo -e "${BLUE}フロントエンド: ${YELLOW}http://localhost:3000${NC}"
echo -e "${BLUE}バックエンドAPI: ${YELLOW}http://localhost:3001${NC}"
echo -e "${BLUE}Swagger UI: ${YELLOW}http://localhost:3001/api-docs/index.html${NC}"
echo ""
echo -e "${BLUE}テスト用アカウント:${NC}"
echo -e "  管理者: ${YELLOW}admin@example.com / password123${NC}"
echo -e "  マネージャー: ${YELLOW}manager@example.com / password123${NC}"
echo -e "  一般ユーザー: ${YELLOW}user@example.com / password123${NC}"
echo ""
echo -e "${YELLOW}終了するには Ctrl+C を押してください${NC}"

# 子プロセスが終了するまで待機
wait 