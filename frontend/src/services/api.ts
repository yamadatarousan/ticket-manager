import { User, Ticket, Comment, AuthResponse, LoginRequest, RegisterRequest, CreateCommentRequest, PaginatedResponse } from '../types';

/** APIベースURL（環境変数または開発環境のデフォルト値） */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

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
      ...(token && { 'Authorization': `Bearer ${token}` })
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
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
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
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ user: credentials })
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: userData })
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
        headers: this.getAuthHeaders()
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
        headers: this.getAuthHeaders()
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
  // チケット関連API
  // ============================================================================

  /**
   * チケット一覧を取得
   * 
   * 指定したフィルター条件に基づいてチケット一覧を取得します。
   * ページネーション情報も含まれた結果を返します。
   * 
   * @param filters - フィルター条件（オプション）
   * @param filters.status - チケットのステータス（open, in_progress, closed等）
   * @param filters.priority - チケットの優先度（low, medium, high等）
   * @param filters.assigned_to - 担当者ID
   * @param filters.page - ページ番号
   * @param filters.per_page - 1ページあたりの件数
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
  async getTickets(filters: Record<string, string> = {}): Promise<PaginatedResponse<Ticket>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      const data = await this.handleResponse<any>(response);
      
      // バックエンドの応答形式に合わせて変換
      return {
        tickets: data.tickets || data || [],
        total_count: data.total_count || data.length || 0,
        total_pages: data.total_pages || 1,
        current_page: data.current_page || 1,
        per_page: data.per_page || 20
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
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
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ ticket: Ticket }>(response);
  }

  /**
   * 新しいチケットを作成
   * 
   * @param ticketData - 作成するチケットの情報
   * @param ticketData.title - チケットのタイトル（必須）
   * @param ticketData.description - チケットの説明
   * @param ticketData.priority - 優先度
   * @param ticketData.assigned_to - 担当者ID
   * @param ticketData.status - ステータス（デフォルト: 'open'）
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
  async createTicket(ticketData: Partial<Ticket>): Promise<{ ticket: Ticket }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('createTicket API call started');
        console.log('Ticket data:', ticketData);
        
        const token = localStorage.getItem('auth_token');
        console.log('Auth token exists:', !!token);
        console.log('Auth token length:', token?.length || 0);
      }
      
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ticket: ticketData })
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('createTicket response status:', response.status);
        console.log('createTicket response ok:', response.ok);
      }
      
      const result = await this.handleResponse<{ ticket: Ticket }>(response);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('createTicket API call successful:', result);
      }
      
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('createTicket API call failed:', error);
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
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
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ticket: ticketData })
    });
    
    return this.handleResponse<{ ticket: Ticket }>(response);
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
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('チケットの削除に失敗しました');
    }
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
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse<any>(response);
    
    return {
      users: data.users || data || [],
      total_count: data.total_count || data.length || 0,
      total_pages: data.total_pages || 1,
      current_page: data.current_page || 1,
      per_page: data.per_page || 20
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
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ user: User }>(response);
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
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ user: userData })
    });
    
    return this.handleResponse<{ user: User }>(response);
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
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('ユーザーの削除に失敗しました');
    }
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
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse<{ comments: Comment[] }>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
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
  async createComment(ticketId: number, commentData: CreateCommentRequest): Promise<{ comment: Comment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ comment: commentData })
      });
      
      return await this.handleResponse<{ comment: Comment }>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
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
  async updateComment(commentId: number, commentData: CreateCommentRequest): Promise<{ comment: Comment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ comment: commentData })
      });
      
      return await this.handleResponse<{ comment: Comment }>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
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
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      await this.handleResponse<void>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
      }
      throw error;
    }
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