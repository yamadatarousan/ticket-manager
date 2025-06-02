import { User, Ticket, AuthResponse, LoginRequest, RegisterRequest, PaginatedResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  private getAuthHeaders() {
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

  // 認証関連API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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

  // チケット関連API
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

  async getTicket(id: number): Promise<{ ticket: Ticket }> {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ ticket: Ticket }>(response);
  }

  async createTicket(ticketData: Partial<Ticket>): Promise<{ ticket: Ticket }> {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ticket: ticketData })
    });
    
    return this.handleResponse<{ ticket: Ticket }>(response);
  }

  async updateTicket(id: number, ticketData: Partial<Ticket>): Promise<{ ticket: Ticket }> {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ticket: ticketData })
    });
    
    return this.handleResponse<{ ticket: Ticket }>(response);
  }

  async deleteTicket(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('チケットの削除に失敗しました');
    }
  }

  // ユーザー関連API
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

  async getUser(id: number): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<{ user: User }>(response);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ user: userData })
    });
    
    return this.handleResponse<{ user: User }>(response);
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('ユーザーの削除に失敗しました');
    }
  }
}

// シングルトンとしてエクスポート
export const apiService = new ApiService(); 