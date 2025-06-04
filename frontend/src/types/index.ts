/**
 * チケット管理システムの型定義
 * 
 * このファイルは、アプリケーション全体で使用される
 * TypeScriptの型定義を提供します。
 * 
 * 含まれる型：
 * - User: ユーザー情報
 * - Ticket: チケット情報
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
  role: 'user' | 'manager' | 'admin';
  /** ユーザーアカウント作成日時（ISO 8601形式） */
  created_at: string;
  /** ユーザー情報最終更新日時（ISO 8601形式） */
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
  /** チケットの優先度
   * - low: 低優先度（緊急性なし）
   * - medium: 中優先度（通常の作業）
   * - high: 高優先度（早急な対応が必要）
   * - urgent: 緊急（即座の対応が必要）
   */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** 担当者のユーザーID（未割り当ての場合はnull） */
  assigned_to: string | null;
  /** チケット作成者のユーザーID */
  created_by: string;
  /** チケット作成日時（ISO 8601形式） */
  created_at: string;
  /** チケット最終更新日時（ISO 8601形式） */
  updated_at: string;
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
 * console.log('チケット:', ticketResponse.tickets);
 * console.log('総件数:', ticketResponse.total_count);
 * 
 * // ユーザー一覧のページネーション
 * const userResponse: PaginatedResponse<User> = await apiService.getUsers();
 * console.log('ユーザー:', userResponse.users);
 * console.log('現在のページ:', userResponse.current_page);
 * ```
 */
export interface PaginatedResponse<T> {
  /** チケットの配列（TがTicketの場合に設定） */
  tickets?: T[] & Ticket[];
  /** ユーザーの配列（TがUserの場合に設定） */
  users?: T[] & User[];
  /** 全体の総件数 */
  total_count: number;
  /** 総ページ数 */
  total_pages: number;
  /** 現在のページ番号（1から開始） */
  current_page: number;
  /** 1ページあたりの件数 */
  per_page: number;
} 