import {
  User,
  Ticket,
  Comment,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateCommentRequest,
  PaginatedResponse,
  DashboardStats,
  SystemSetting,
  SystemSettingRequest,
  Project,
  ProjectRequest,
  CreateTicketRequest,
} from '../types/index';

/** APIベースURL（環境変数または開発環境のデフォルト値） */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

export interface TicketFilterParams {
  status?: string;
  priority?: string;
  assigned_to?: number;
  project_id?: number;
  page?: number;
  per_page?: number;
}

/**
 * APIサービスクラス
 *
 * バックエンドAPIとの通信を管理するサービスクラスです。
 * 以下の機能を提供します：
 * - 認証（ログイン、登録、ログアウト、ユーザー情報取得）
 * - チケット管理（CRUD操作、検索、フィルタリング）
 * - ユーザー管理（一覧取得、更新、削除）
 * - エラーハンドリング
 * - 認証トークンの自動処理
 *
 * このクラスは以下の責任を持ちます：
 * - HTTPリクエストの実行
 * - 認証ヘッダーの管理
 * - レスポンスの処理とエラーハンドリング
 * - データ形式の変換
 *
 * @example
 * ```typescript
 * // ログイン
 * const response = await apiService.login({ email: 'user@example.com', password: 'password' });
 *
 * // チケット一覧取得
 * const tickets = await apiService.getTickets({ status: 'open' });
 *
 * // チケット作成
 * const newTicket = await apiService.createTicket({
 *   title: '新しいタスク',
 *   description: 'タスクの詳細説明'
 * });
 * ```
 */
class ApiService {
  private token: string | null = null;
  private readonly API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // エンドポイントが/apiで始まる場合は、それを除去
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
    const url = `${this.API_BASE_URL}${cleanEndpoint}`;

    // 最新のトークンを取得
    const currentToken = localStorage.getItem('auth_token');
    this.token = currentToken;

    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    // デバッグ用ログ
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenLength: this.token?.length,
      headers,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error:', error);

      // 422エラー（バリデーションエラー）の場合、JSONそのものを文字列として投げる
      if (response.status === 422) {
        throw new Error(JSON.stringify(error));
      }

      throw new Error(error.message || 'APIリクエストに失敗しました');
    }

    return response;
  }

  /**
   * 認証ヘッダーを生成する
   *
   * ローカルストレージからトークンを取得し、
   * APIリクエストに必要なヘッダーを生成します。
   *
   * @returns HTTPリクエストヘッダー
   * @private
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // デバッグ用ログ（本番環境では削除）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Headers:', { hasToken: !!token, tokenLength: token?.length });
    }

    return headers;
  }

  /**
   * HTTPレスポンスを処理する
   *
   * APIからのレスポンスを処理し、エラーハンドリングを行います。
   * ステータスコードに応じた適切なエラーメッセージを生成します。
   *
   * @template T - レスポンスデータの型
   * @param response - fetch APIのレスポンスオブジェクト
   * @returns パースされたレスポンスデータ
   * @throws {Error} APIエラーまたはパースエラーが発生した場合
   * @private
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'APIエラーが発生しました';

      try {
        const errorData = await response.json();

        // Rails バリデーションエラー形式（422エラー）の場合、そのまま JSON 文字列として投げる
        if (response.status === 422 && typeof errorData === 'object') {
          throw new Error(JSON.stringify(errorData));
        }

        errorMessage = errorData.error || errorData.message || errorMessage;

        // 詳細なエラー情報がある場合は追加
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += '\n詳細: ' + errorData.details.join(', ');
        }
      } catch (parseError) {
        // parseError が Error インスタンスで、422エラーの場合は再投げ
        if (
          parseError instanceof Error &&
          parseError.message.startsWith('{') &&
          response.status === 422
        ) {
          throw parseError;
        }

        // JSONパースエラーの場合、ステータスコードベースのメッセージを使用
        switch (response.status) {
          case 401:
            errorMessage = '認証に失敗しました。再度ログインしてください。';
            break;
          case 403:
            errorMessage = 'アクセス権限がありません。';
            break;
          case 404:
            errorMessage = 'リソースが見つかりません。';
            break;
          case 422:
            errorMessage = '入力内容に問題があります。';
            break;
          case 500:
            errorMessage = 'サーバーエラーが発生しました。';
            break;
          default:
            errorMessage = `エラーが発生しました (${response.status})`;
        }
      }

      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (parseError) {
      throw new Error('レスポンスの解析に失敗しました');
    }
  }

  // ============================================================================
  // 認証関連API
  // ============================================================================

  /**
   * ユーザーログイン
   *
   * メールアドレスとパスワードを使用してユーザー認証を行います。
   * 成功時はトークンをローカルストレージに保存します。
   *
   * @param credentials - ログイン認証情報
   * @param credentials.email - メールアドレス
   * @param credentials.password - パスワード
   * @returns 認証結果（ユーザー情報とトークン）
   * @throws {Error} 認証失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.login({
   *     email: 'user@example.com',
   *     password: 'password123'
   *   });
   *   console.log('ログイン成功:', response.user);
   * } catch (error) {
   *   console.error('ログイン失敗:', error.message);
   * }
   * ```
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ user: credentials }),
      });

      const data = await this.handleResponse<AuthResponse>(response);

      // トークンを保存
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * ユーザー登録
   *
   * 新しいユーザーアカウントを作成し、自動的にログインします。
   * 成功時はトークンをローカルストレージに保存します。
   *
   * @param userData - ユーザー登録情報
   * @param userData.email - メールアドレス
   * @param userData.password - パスワード
   * @param userData.name - ユーザー名（オプション）
   * @returns 認証結果（ユーザー情報とトークン）
   * @throws {Error} 登録失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.register({
   *     email: 'newuser@example.com',
   *     password: 'password123',
   *     name: '新規ユーザー'
   *   });
   *   console.log('登録成功:', response.user);
   * } catch (error) {
   *   console.error('登録失敗:', error.message);
   * }
   * ```
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userData }),
      });

      const data = await this.handleResponse<AuthResponse>(response);

      // 登録後に自動ログイン
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * ユーザーログアウト
   *
   * サーバーにログアウト要求を送信し、ローカルストレージからトークンを削除します。
   * ネットワークエラーが発生してもローカルのトークンは確実に削除されます。
   *
   * @throws {Error} ネットワークエラーの場合（ローカルの状態はクリアされる）
   *
   * @example
   * ```typescript
   * try {
   *   await apiService.logout();
   *   console.log('ログアウト完了');
   * } catch (error) {
   *   console.warn('ログアウトエラー:', error.message);
   *   // ローカルの認証状態はクリアされている
   * }
   * ```
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      // レスポンスが成功かどうかに関わらず、ローカルのトークンは削除
      localStorage.removeItem('auth_token');

      if (!response.ok) {
        console.warn('ログアウトAPIエラー:', response.status);
      }
    } catch (error) {
      console.warn('ログアウトエラー:', error);
      // ネットワークエラーでもローカルのトークンは削除
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * 現在のユーザー情報を取得
   *
   * ローカルストレージのトークンを使用して、サーバーから
   * 現在認証されているユーザーの情報を取得します。
   *
   * @returns 現在のユーザー情報
   * @throws {Error} 認証失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.getCurrentUser();
   *   console.log('現在のユーザー:', response.user);
   * } catch (error) {
   *   console.error('ユーザー情報取得失敗:', error.message);
   *   // トークンが無効な可能性があるため、ログアウト処理が必要
   * }
   * ```
   */
  async getCurrentUser(): Promise<{ user: User }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('getCurrentUser API call started');
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Full URL:', `${API_BASE_URL}/auth/me`);

        const token = localStorage.getItem('auth_token');
        console.log('Token exists:', !!token);
        console.log('Token length:', token?.length || 0);
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
      }

      const result = await this.handleResponse<{ user: User }>(response);

      if (process.env.NODE_ENV === 'development') {
        console.log('getCurrentUser API call successful:', result);
      }

      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('getCurrentUser API call failed:', error);
        if (error instanceof TypeError) {
          console.error('Error type: TypeError - likely network issue');
          console.error('Error message:', error.message);
        }
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  // ============================================================================
  // ダッシュボード関連API
  // ============================================================================

  /**
   * ダッシュボード統計情報を取得
   *
   * ダッシュボード表示に必要な統計情報（チケット数、ステータス別分布など）を取得します。
   *
   * @returns ダッシュボード統計情報
   * @throws {Error} 取得失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const stats = await apiService.getDashboardStats();
   *   console.log('総チケット数:', stats.ticket_stats.total);
   * } catch (error) {
   *   console.error('統計情報取得失敗:', error.message);
   * }
   * ```
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<DashboardStats>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  // ============================================================================
  // システム設定関連API
  // ============================================================================

  /**
   * システム設定一覧を取得
   *
   * 管理者のみアクセス可能。システム全体の設定項目一覧を取得します。
   *
   * @returns システム設定一覧
   * @throws {Error} 取得失敗、認証エラー、権限エラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.getSystemSettings();
   *   console.log('設定数:', response.system_settings.length);
   * } catch (error) {
   *   console.error('設定取得失敗:', error.message);
   * }
   * ```
   */
  async getSystemSettings(): Promise<{ system_settings: SystemSetting[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system_settings`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<{ system_settings: SystemSetting[] }>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * 個別システム設定を取得
   *
   * @param id システム設定ID
   * @returns システム設定情報
   * @throws {Error} 取得失敗、認証エラー、権限エラーの場合
   */
  async getSystemSetting(id: number): Promise<{ system_setting: SystemSetting }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system_settings/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<{ system_setting: SystemSetting }>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * システム設定を作成
   *
   * @param systemSetting システム設定データ
   * @returns 作成されたシステム設定情報
   * @throws {Error} 作成失敗、認証エラー、権限エラーの場合
   */
  async createSystemSetting(
    systemSetting: SystemSettingRequest
  ): Promise<{ system_setting: SystemSetting; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ system_setting: systemSetting }),
      });

      return await this.handleResponse<{ system_setting: SystemSetting; message: string }>(
        response
      );
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * システム設定を更新
   *
   * @param id システム設定ID
   * @param systemSetting 更新するシステム設定データ
   * @returns 更新されたシステム設定情報
   * @throws {Error} 更新失敗、認証エラー、権限エラーの場合
   */
  async updateSystemSetting(
    id: number,
    systemSetting: Partial<SystemSettingRequest>
  ): Promise<{ system_setting: SystemSetting; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system_settings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ system_setting: systemSetting }),
      });

      return await this.handleResponse<{ system_setting: SystemSetting; message: string }>(
        response
      );
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * システム設定を削除
   *
   * @param id システム設定ID
   * @returns 削除結果
   * @throws {Error} 削除失敗、認証エラー、権限エラーの場合
   */
  async deleteSystemSetting(id: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system_settings/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<{ message: string }>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  /**
   * システム設定を一括更新
   *
   * @param settings 設定キーと値のハッシュ
   * @returns 更新結果
   * @throws {Error} 更新失敗、認証エラー、権限エラーの場合
   */
  async bulkUpdateSystemSettings(
    settings: Record<string, any>
  ): Promise<{ system_settings: SystemSetting[]; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/system_settings/bulk_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ settings }),
      });

      return await this.handleResponse<{ system_settings: SystemSetting[]; message: string }>(
        response
      );
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
  }

  // ============================================================================
  // チケット関連API
  // ============================================================================

  /**
   * チケット一覧を取得
   *
   * 指定したフィルター条件に基づいてチケット一覧を取得します。
   * ページネーション情報も含まれた結果を返します。
   *
   * @param params - フィルター条件（オプション）
   * @param params.status - チケットのステータス（open, in_progress, closed等）
   * @param params.priority - チケットの優先度（low, medium, high等）
   * @param params.assigned_to - 担当者ID
   * @param params.page - ページ番号
   * @param params.per_page - 1ページあたりの件数
   * @returns ページネーション付きチケット一覧
   * @throws {Error} 取得失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * // 全てのチケットを取得
   * const allTickets = await apiService.getTickets();
   *
   * // オープンなチケットのみを取得
   * const openTickets = await apiService.getTickets({ status: 'open' });
   *
   * // 高優先度のチケットを2ページ目から取得
   * const highPriorityTickets = await apiService.getTickets({
   *   priority: 'high',
   *   page: '2',
   *   per_page: '10'
   * });
   * ```
   */
  async getTickets(params: TicketFilterParams = {}): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithAuth(`/tickets?${queryParams.toString()}`);
    const data = await response.json();

    // バックエンドの応答形式に合わせて変換
    return {
      items: data.tickets || data || [],
      total: data.total_count || data.length || 0,
      page: data.current_page || 1,
      per_page: data.per_page || 10,
      total_pages: data.total_pages || 1,
    };
  }

  /**
   * 指定IDのチケット詳細を取得
   *
   * @param id - チケットID
   * @returns チケット詳細情報
   * @throws {Error} チケットが見つからない場合またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.getTicket(123);
   *   console.log('チケット詳細:', response.ticket);
   * } catch (error) {
   *   console.error('チケット取得失敗:', error.message);
   * }
   * ```
   */
  async getTicket(id: number): Promise<{ ticket: Ticket }> {
    console.log('getTicket - requesting ID:', id);
    const response = await this.fetchWithAuth(`/tickets/${id}`);
    const data = await response.json();
    console.log('getTicket - received data:', data);

    // バックエンドが既に{ticket: {...}}の形式で返す場合があるので、適切に処理
    if (data.ticket) {
      console.log('getTicket - returning data.ticket:', data.ticket);
      return { ticket: data.ticket };
    } else {
      console.log('getTicket - returning data as ticket:', data);
      return { ticket: data };
    }
  }

  /**
   * 新しいチケットを作成
   *
   * @param data - 作成するチケットの情報
   * @param data.title - チケットのタイトル（必須）
   * @param data.description - チケットの説明
   * @param data.priority - 優先度
   * @param data.assigned_to - 担当者ID
   * @param data.status - ステータス（デフォルト: 'open'）
   * @returns 作成されたチケット情報
   * @throws {Error} 作成失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const newTicket = await apiService.createTicket({
   *     title: 'バグ修正',
   *     description: 'ログイン画面でエラーが発生する',
   *     priority: 'high',
   *     assigned_to: 123
   *   });
   *   console.log('チケット作成完了:', newTicket.ticket);
   * } catch (error) {
   *   console.error('チケット作成失敗:', error.message);
   * }
   * ```
   */
  async createTicket(data: CreateTicketRequest): Promise<Ticket> {
    const response = await this.fetchWithAuth('/tickets', {
      method: 'POST',
      body: JSON.stringify({ ticket: data }),
    });
    const ticketData = await response.json();
    return ticketData.ticket || ticketData;
  }

  /**
   * 既存のチケットを更新
   *
   * @param id - 更新するチケットのID
   * @param ticketData - 更新するチケットの情報（部分更新可能）
   * @returns 更新されたチケット情報
   * @throws {Error} 更新失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const updatedTicket = await apiService.updateTicket(123, {
   *     status: 'in_progress',
   *     assigned_to: 456
   *   });
   *   console.log('チケット更新完了:', updatedTicket.ticket);
   * } catch (error) {
   *   console.error('チケット更新失敗:', error.message);
   * }
   * ```
   */
  async updateTicket(id: number, ticketData: Partial<Ticket>): Promise<{ ticket: Ticket }> {
    const response = await this.fetchWithAuth(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ticket: ticketData }),
    });
    const data = await response.json();
    return { ticket: data };
  }

  /**
   * チケットを削除
   *
   * @param id - 削除するチケットのID
   * @throws {Error} 削除失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   await apiService.deleteTicket(123);
   *   console.log('チケット削除完了');
   * } catch (error) {
   *   console.error('チケット削除失敗:', error.message);
   * }
   * ```
   */
  async deleteTicket(id: number): Promise<void> {
    await this.fetchWithAuth(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // ユーザー関連API
  // ============================================================================

  /**
   * ユーザー一覧を取得
   *
   * @returns ページネーション付きユーザー一覧
   * @throws {Error} 取得失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const users = await apiService.getUsers();
   *   console.log('ユーザー一覧:', users.users);
   *   console.log('総件数:', users.total_count);
   * } catch (error) {
   *   console.error('ユーザー取得失敗:', error.message);
   * }
   * ```
   */
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response = await this.fetchWithAuth('/users');
    const data = await response.json();

    return {
      items: data.users || data || [],
      total: data.total_count || data.length || 0,
      page: data.current_page || 1,
      per_page: data.per_page || 10,
      total_pages: data.total_pages || 1,
    };
  }

  /**
   * 指定IDのユーザー詳細を取得
   *
   * @param id - ユーザーID
   * @returns ユーザー詳細情報
   * @throws {Error} ユーザーが見つからない場合またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.getUser(123);
   *   console.log('ユーザー詳細:', response.user);
   * } catch (error) {
   *   console.error('ユーザー取得失敗:', error.message);
   * }
   * ```
   */
  async getUser(id: number): Promise<{ user: User }> {
    const response = await this.fetchWithAuth(`/users/${id}`);
    const data = await response.json();
    return { user: data };
  }

  /**
   * 新しいユーザーを作成
   *
   * @param userData - 作成するユーザーの情報
   * @returns 作成されたユーザー情報
   * @throws {Error} 作成失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const newUser = await apiService.createUser({
   *     name: '新しいユーザー',
   *     email: 'newuser@example.com',
   *     password: 'password123',
   *     password_confirmation: 'password123',
   *     role: 'user'
   *   });
   *   console.log('ユーザー作成成功:', newUser.user);
   * } catch (error) {
   *   console.error('ユーザー作成失敗:', error.message);
   * }
   * ```
   */
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: string;
  }): Promise<{ user: User; token: string; message: string }> {
    const response = await this.fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify({ user: userData }),
    });
    const data = await response.json();
    return data;
  }

  /**
   * ユーザー情報を更新
   *
   * @param id - 更新するユーザーのID
   * @param userData - 更新するユーザーの情報（部分更新可能）
   * @returns 更新されたユーザー情報
   * @throws {Error} 更新失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const updatedUser = await apiService.updateUser(123, {
   *     name: '新しい名前',
   *     role: 'manager'
   *   });
   *   console.log('ユーザー更新完了:', updatedUser.user);
   * } catch (error) {
   *   console.error('ユーザー更新失敗:', error.message);
   * }
   * ```
   */
  async updateUser(id: number, userData: Partial<User>): Promise<{ user: User }> {
    const response = await this.fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    });
    const data = await response.json();
    return { user: data };
  }

  /**
   * ユーザーを削除
   *
   * @param id - 削除するユーザーのID
   * @throws {Error} 削除失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   await apiService.deleteUser(123);
   *   console.log('ユーザー削除完了');
   * } catch (error) {
   *   console.error('ユーザー削除失敗:', error.message);
   * }
   * ```
   */
  async deleteUser(id: number): Promise<void> {
    await this.fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // コメント管理API
  // ============================================================================

  /**
   * チケットのコメント一覧取得
   *
   * 指定されたチケットに関連するコメントの一覧を取得します。
   * コメントは作成日時順（古い順）で返されます。
   *
   * @param ticketId - チケットID
   * @returns コメント一覧
   * @throws {Error} 取得失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.getComments(123);
   *   console.log('コメント一覧:', response.comments);
   * } catch (error) {
   *   console.error('コメント取得失敗:', error.message);
   * }
   * ```
   */
  async getComments(ticketId: number): Promise<{ comments: Comment[] }> {
    console.log('getComments - ticketId:', ticketId, 'type:', typeof ticketId);
    const response = await this.fetchWithAuth(`/tickets/${ticketId}/comments`);
    const data = await response.json();
    console.log('getComments - response data:', data);
    return { comments: data.comments || data };
  }

  /**
   * コメント作成
   *
   * 指定されたチケットに新しいコメントを追加します。
   * 作成者は現在ログインしているユーザーに自動設定されます。
   *
   * @param ticketId - チケットID
   * @param commentData - コメント作成情報
   * @param commentData.content - コメント内容
   * @returns 作成されたコメント情報
   * @throws {Error} 作成失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.createComment(123, {
   *     content: '作業を開始しました'
   *   });
   *   console.log('コメント作成成功:', response.comment);
   * } catch (error) {
   *   console.error('コメント作成失敗:', error.message);
   * }
   * ```
   */
  async createComment(
    ticketId: number,
    commentData: CreateCommentRequest
  ): Promise<{ comment: Comment }> {
    console.log('createComment - ticketId:', ticketId, 'type:', typeof ticketId);
    const response = await this.fetchWithAuth(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: commentData }),
    });
    const data = await response.json();
    console.log('createComment - response data:', data);
    return { comment: data.comment || data };
  }

  /**
   * コメント更新
   *
   * 既存のコメントの内容を更新します。
   * 自分が作成したコメントのみ更新可能です（管理者は全て更新可能）。
   *
   * @param commentId - コメントID
   * @param commentData - 更新するコメント情報
   * @param commentData.content - 新しいコメント内容
   * @returns 更新されたコメント情報
   * @throws {Error} 更新失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.updateComment(456, {
   *     content: '作業が完了しました'
   *   });
   *   console.log('コメント更新成功:', response.comment);
   * } catch (error) {
   *   console.error('コメント更新失敗:', error.message);
   * }
   * ```
   */
  async updateComment(
    commentId: number,
    commentData: CreateCommentRequest
  ): Promise<{ comment: Comment }> {
    const response = await this.fetchWithAuth(`/api/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: commentData }),
    });
    const data = await response.json();
    return { comment: data };
  }

  /**
   * コメント削除
   *
   * 指定されたコメントを削除します。
   * 自分が作成したコメントのみ削除可能です（管理者は全て削除可能）。
   *
   * @param commentId - 削除するコメントのID
   * @throws {Error} 削除失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   await apiService.deleteComment(456);
   *   console.log('コメント削除成功');
   * } catch (error) {
   *   console.error('コメント削除失敗:', error.message);
   * }
   * ```
   */
  async deleteComment(commentId: number): Promise<void> {
    await this.fetchWithAuth(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // プロジェクト関連API
  // ============================================================================

  /**
   * プロジェクト一覧を取得
   *
   * @param params - フィルター条件（オプション）
   * @param params.status - プロジェクトのステータス（active, completed等）
   * @param params.created_by - 作成者ID
   * @returns プロジェクト一覧
   * @throws {Error} 取得失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const projects = await apiService.getProjects();
   *   console.log('プロジェクト一覧:', projects.projects);
   * } catch (error) {
   *   console.error('プロジェクト取得失敗:', error.message);
   * }
   * ```
   */
  async getProjects(): Promise<Project[]> {
    const response = await this.fetchWithAuth('/api/projects');
    const data = await response.json();
    return data.projects || [];
  }

  /**
   * 指定IDのプロジェクト詳細を取得
   *
   * @param id - プロジェクトID
   * @returns プロジェクト詳細情報
   * @throws {Error} プロジェクトが見つからない場合またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const response = await apiService.getProject(123);
   *   console.log('プロジェクト詳細:', response.project);
   * } catch (error) {
   *   console.error('プロジェクト取得失敗:', error.message);
   * }
   * ```
   */
  async getProject(id: number): Promise<Project> {
    const response = await this.fetchWithAuth(`/api/projects/${id}`);
    const data = await response.json();
    return data;
  }

  /**
   * 新しいプロジェクトを作成
   *
   * @param projectData - 作成するプロジェクトの情報
   * @param projectData.title - プロジェクトのタイトル（必須）
   * @param projectData.description - プロジェクトの説明
   * @param projectData.status - プロジェクトのステータス（デフォルト: 'active'）
   * @param projectData.created_by - 作成者ID
   * @returns 作成されたプロジェクト情報
   * @throws {Error} 作成失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const newProject = await apiService.createProject({
   *     title: '新しいプロジェクト',
   *     description: 'プロジェクトの詳細説明',
   *     status: 'active',
   *     created_by: 123
   *   });
   *   console.log('プロジェクト作成完了:', newProject.project);
   * } catch (error) {
   *   console.error('プロジェクト作成失敗:', error.message);
   * }
   * ```
   */
  async createProject(projectData: ProjectRequest): Promise<Project> {
    const response = await this.fetchWithAuth('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ project: projectData }),
    });
    const data = await response.json();
    return data;
  }

  /**
   * 既存のプロジェクトを更新
   *
   * @param id - 更新するプロジェクトのID
   * @param projectData - 更新するプロジェクトの情報（部分更新可能）
   * @returns 更新されたプロジェクト情報
   * @throws {Error} 更新失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   const updatedProject = await apiService.updateProject(123, {
   *     title: '更新されたプロジェクトタイトル',
   *     description: '更新されたプロジェクトの詳細説明'
   *   });
   *   console.log('プロジェクト更新完了:', updatedProject.project);
   * } catch (error) {
   *   console.error('プロジェクト更新失敗:', error.message);
   * }
   * ```
   */
  async updateProject(id: number, projectData: ProjectRequest): Promise<Project> {
    const response = await this.fetchWithAuth(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ project: projectData }),
    });
    const data = await response.json();
    return data;
  }

  /**
   * プロジェクトを削除
   *
   * @param id - 削除するプロジェクトのID
   * @throws {Error} 削除失敗またはネットワークエラーの場合
   *
   * @example
   * ```typescript
   * try {
   *   await apiService.deleteProject(123);
   *   console.log('プロジェクト削除完了');
   * } catch (error) {
   *   console.error('プロジェクト削除失敗:', error.message);
   * }
   * ```
   */
  async deleteProject(id: number): Promise<void> {
    await this.fetchWithAuth(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * APIサービスのシングルトンインスタンス
 *
 * アプリケーション全体で共有されるAPIサービスのインスタンスです。
 * このインスタンスを使用してすべてのAPI通信を行います。
 *
 * @example
 * ```typescript
 * import { apiService } from './services/api';
 *
 * // 使用例
 * const tickets = await apiService.getTickets();
 * ```
 */
export const apiService = new ApiService();
