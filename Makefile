.PHONY: setup start stop test lint lint-fix db-reset help

# デフォルトターゲット
help:
	@echo "利用可能なコマンド:"
	@echo "  make setup     - 開発環境をセットアップする"
	@echo "  make start     - 開発サーバーを起動する"
	@echo "  make stop      - 実行中の開発サーバーを停止する"
	@echo "  make test      - すべてのテストを実行する"
	@echo "  make test-be   - バックエンドのテストのみ実行する"
	@echo "  make test-fe   - フロントエンドのテストのみ実行する"
	@echo "  make lint      - コードリントを実行する"
	@echo "  make lint-fix  - コードリントを実行し、自動修正を試みる"
	@echo "  make db-reset  - データベースをリセットして再作成する"

# セットアップ
setup:
	@./scripts/setup.sh

# 開発サーバー起動
start:
	@./scripts/start.sh

# 開発サーバー停止
stop:
	@echo "実行中のサーバーを停止しています..."
	@-pkill -f "rails server" 2>/dev/null || true
	@-pkill -f "react-scripts start" 2>/dev/null || true
	@echo "サーバーを停止しました"

# テスト実行
test:
	@./scripts/test.sh

test-be:
	@./scripts/test.sh --backend-only

test-fe:
	@./scripts/test.sh --frontend-only

# リント実行
lint:
	@./scripts/lint.sh

lint-fix:
	@./scripts/lint.sh --fix

# データベースリセット
db-reset:
	@echo "データベースをリセットしています..."
	@cd backend && bundle exec rails db:drop db:create db:migrate db:seed
	@echo "データベースをリセットしました" 