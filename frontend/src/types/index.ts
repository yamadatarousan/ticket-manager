/**
 * チケット管理システムの型定義
 *
 * このファイルは、アプリケーション全体で使用される
 * TypeScriptの型定義を提供します。
 *
 * 含まれる型：
 * - User: ユーザー情報
 * - Ticket: チケット情報
 * - Project: プロジェクト情報
 * - API リクエスト/レスポンス型
 * - 認証関連の型
 * - ページネーション型
 */

/**
 * ユーザー情報を表すインターフェース
 *
 * システムに登録されているユーザーの情報を定義します。
 * ユーザーは3つの役割（ロール）を持つことができます。
 */
export interface User {
  /** ユーザーの一意識別子 */
  id: number;
  /** ユーザーの表示名 */
  name: string;
  /** ユーザーのメールアドレス（ログイン時に使用） */
  email: string;
  /** ユーザーの権限レベル
   * - user: 一般ユーザー（チケット作成・編集）
   * - manager: マネージャー（チーム管理・レポート閲覧）
   * - admin: 管理者（全ての操作・システム設定）
   */
  role: 'admin' | 'manager' | 'user';
  /** ユーザーアカウント作成日時（ISO 8601形式） */
  created_at: string;
  /** ユーザー情報最終更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * プロジェクト情報の型定義
 */
export interface Project {
  /** プロジェクトの一意識別子 */
  id: number;
  /** プロジェクトの表示名 */
  name: string;
  /** プロジェクトの詳細説明 */
  description?: string;
  /** プロジェクトのステータス
   * - planning: 計画中
   * - active: 進行中
   * - on_hold: 保留中
   * - completed: 完了
   * - cancelled: キャンセル
   */
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  /** プロジェクトのステータスラベル */
  status_label: string;
  /** プロジェクトの開始日（ISO 8601形式） */
  start_date?: string;
  /** プロジェクトの終了日（ISO 8601形式） */
  end_date?: string;
  /** プロジェクト作成者のユーザーID */
  created_by: number;
  /** プロジェクト作成者のユーザーID（旧フィールド、created_byと同一） */
  creator_id: number;
  /** プロジェクト作成者の表示名 */
  creator_name: string;
  /** プロジェクトの進捗率 */
  progress_rate: number;
  /** プロジェクトの残り日数 */
  days_remaining?: number;
  /** プロジェクトの遅延フラグ */
  overdue: boolean;
  /** プロジェクトの期間文字列 */
  duration_string: string;
  /** プロジェクト作成日時（ISO 8601形式） */
  created_at: string;
  /** プロジェクト最終更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * チケット情報を表すインターフェース
 *
 * タスクや問題を管理するためのチケットの情報を定義します。
 * チケットは作成から完了まで複数のステータスを持ちます。
 */
export interface Ticket {
  /** チケットの一意識別子 */
  id: number;
  /** チケットのタイトル（概要） */
  title: string;
  /** チケットの詳細説明 */
  description: string;
  /** チケットの現在のステータス
   * - open: 新規作成・未着手
   * - in_progress: 作業中
   * - resolved: 解決済み（レビュー待ち）
   * - closed: 完了・クローズ
   */
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  /** ステータスの表示ラベル */
  status_label?: string;
  /** チケットの優先度
   * - low: 低優先度（緊急性なし）
   * - medium: 中優先度（通常の作業）
   * - high: 高優先度（早急な対応が必要）
   * - urgent: 緊急（即座の対応が必要）
   */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** 優先度の表示ラベル */
  priority_label?: string;
  /** 担当者のユーザーID（未割り当ての場合はnull） */
  assigned_to?: number;
  /** 担当者の表示名 */
  assigned_to_name?: string;
  /** チケット作成者のユーザーID */
  created_by: number;
  /** チケット作成者の表示名 */
  created_by_name?: string;
  /** チケットが属するプロジェクトのID */
  project_id: number;
  /** プロジェクトの表示名 */
  project_name?: string;
  /** チケット作成日時（ISO 8601形式） */
  created_at: string;
  /** チケット最終更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * コメント情報を表すインターフェース
 *
 * チケットに対するコメント（BacklogやRedmineのようなコメント機能）の情報を定義します。
 * コメントは進捗報告、質疑応答、ディスカッションなどに使用されます。
 */
export interface Comment {
  /** コメントの一意識別子 */
  id: number;
  /** コメントの内容 */
  content: string;
  /** コメントが属するチケットのID */
  ticket_id: number;
  /** コメント作成者のユーザーID */
  user_id: number;
  /** コメント作成者の表示名 */
  user_name: string;
  /** コメント作成者のメールアドレス */
  user_email: string;
  /** コメント作成日時（ISO 8601形式） */
  created_at: string;
  /** コメント最終更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * コメント作成リクエストの型定義
 *
 * 新しいコメントを作成する際に必要な情報を定義します。
 * idや作成日時などの自動生成される値は含まれません。
 */
export interface CreateCommentRequest {
  /** コメントの内容（必須） */
  content: string;
}

/**
 * チケット作成リクエストの型定義
 *
 * 新しいチケットを作成する際に必要な情報を定義します。
 * idや作成日時などの自動生成される値は含まれません。
 */
export interface CreateTicketRequest {
  /** チケットのタイトル（必須） */
  title: string;
  /** チケットの詳細説明（必須） */
  description: string;
  /** チケットの初期ステータス（通常は'open'） */
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  /** チケットの優先度（デフォルト: 'medium'） */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** 担当者のユーザーID（オプション、未指定の場合はnull） */
  assigned_to?: string | null;
  /** チケットが属するプロジェクトのID */
  project_id: number;
}

/**
 * プロジェクト作成・更新リクエストの型定義
 */
export interface ProjectRequest {
  /** プロジェクトの表示名（必須） */
  name: string;
  /** プロジェクトの詳細説明（オプション） */
  description?: string;
  /** プロジェクトのステータス（必須） */
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  /** プロジェクトの開始日（オプション） */
  start_date?: string;
  /** プロジェクトの終了日（オプション） */
  end_date?: string;
}

/**
 * 認証レスポンスの型定義
 *
 * ログインまたは登録成功時にサーバーから返される情報を定義します。
 */
export interface AuthResponse {
  /** 認証されたユーザーの情報 */
  user: User;
  /** JWT認証トークン（以降のAPIリクエストで使用） */
  token: string;
  /** サーバーからのメッセージ（成功メッセージなど） */
  message: string;
}

/**
 * ログインリクエストの型定義
 *
 * ユーザーがログインする際に必要な認証情報を定義します。
 */
export interface LoginRequest {
  /** ユーザーのメールアドレス */
  email: string;
  /** ユーザーのパスワード */
  password: string;
}

/**
 * ユーザー登録リクエストの型定義
 *
 * 新しいユーザーアカウントを作成する際に必要な情報を定義します。
 */
export interface RegisterRequest {
  /** ユーザーの表示名 */
  name: string;
  /** ユーザーのメールアドレス（一意である必要がある） */
  email: string;
  /** ユーザーのパスワード（6文字以上推奨） */
  password: string;
  /** パスワードの確認入力（passwordと一致する必要がある） */
  password_confirmation: string;
  /** ユーザーの権限レベル（オプション、デフォルト: 'user'） */
  role?: 'user' | 'manager' | 'admin';
}

/**
 * 汎用APIレスポンスの型定義
 *
 * APIから返される一般的なレスポンス形式を定義します。
 * 成功時はdata、失敗時はerrorが設定されます。
 *
 * @template T - レスポンスデータの型
 */
export interface ApiResponse<T> {
  /** レスポンスデータ（成功時に設定） */
  data?: T;
  /** エラーメッセージ（失敗時に設定） */
  error?: string;
  /** サーバーからの一般的なメッセージ */
  message?: string;
}

/**
 * ページネーション付きレスポンスの型定義
 *
 * 大量のデータを複数ページに分割して取得する際の
 * レスポンス形式を定義します。
 *
 * @template T - データの型（TicketまたはUser）
 *
 * @example
 * ```typescript
 * // チケット一覧のページネーション
 * const ticketResponse: PaginatedResponse<Ticket> = await apiService.getTickets();
 * console.log('チケット:', ticketResponse.items);
 * console.log('総件数:', ticketResponse.total);
 *
 * // ユーザー一覧のページネーション
 * const userResponse: PaginatedResponse<User> = await apiService.getUsers();
 * console.log('ユーザー:', userResponse.items);
 * console.log('現在のページ:', userResponse.page);
 * ```
 */
export interface PaginatedResponse<T> {
  /** データの配列 */
  items: T[];
  /** 全体の総件数 */
  total: number;
  /** 総ページ数 */
  total_pages: number;
  /** 現在のページ番号（1から開始） */
  page: number;
  /** 1ページあたりの件数 */
  per_page: number;
}

/**
 * ダッシュボード統計情報の型定義
 *
 * ダッシュボード画面で表示する各種統計情報を定義します。
 * チケットの数、ステータス分布、優先度分布、最近の活動などが含まれます。
 */
export interface DashboardStats {
  /** チケット統計情報 */
  ticket_stats: {
    /** 総チケット数 */
    total: number;
    /** ステータス別チケット数 */
    open: number;
    /** ステータス別チケット数 */
    in_progress: number;
    /** ステータス別チケット数 */
    resolved: number;
    /** ステータス別チケット数 */
    closed: number;
  };
  /** 最近のチケット（直近10件） */
  recent_tickets: Ticket[];
  /** 割り当てられたチケット（直近10件） */
  assigned_tickets: Ticket[];
  /** ユーザー統計情報 */
  user_stats?: {
    /** 総ユーザー数 */
    total_users: number;
    /** アクティブユーザー数 */
    active_users: number;
  };
  /** 統計情報生成日時 */
  generated_at: string;
}

/**
 * システム設定情報の型定義
 *
 * アプリケーション全体の設定を管理する設定項目の型を定義します。
 * 管理者のみがアクセス・編集可能な設定項目です。
 */
export interface SystemSetting {
  /** 設定の一意識別子 */
  id: number;
  /** 設定キー（英数字、アンダースコア、ハイフンのみ） */
  key: string;
  /** 設定値（文字列形式） */
  value: string;
  /** 設定の説明 */
  description: string;
  /** 設定の型（string, integer, boolean, json） */
  setting_type: 'string' | 'integer' | 'boolean' | 'json';
  /** 公開設定（一般ユーザーも閲覧可能かどうか） */
  is_public: boolean;
  /** 設定作成日時（ISO 8601形式） */
  created_at: string;
  /** 設定最終更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * システム設定作成・更新リクエストの型定義
 *
 * システム設定の新規作成や更新時に送信するデータの型を定義します。
 */
export interface SystemSettingRequest {
  /** 設定キー（必須） */
  key: string;
  /** 設定値（必須） */
  value: string;
  /** 設定の説明（必須） */
  description: string;
  /** 設定の型（必須） */
  setting_type: 'string' | 'integer' | 'boolean' | 'json';
  /** 公開設定（必須） */
  is_public: boolean;
}
