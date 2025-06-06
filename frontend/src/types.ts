// ユーザー関連の型定義
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// チケット関連の型定義
export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  status_label?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_label?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  project_id: number;
  project_name?: string;
  creator_id: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name?: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  project_id: number;
}

// コメント関連の型定義
export interface Comment {
  id: number;
  content: string;
  ticket_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  content: string;
}

// プロジェクト関連の型定義
export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  status_label: string;
  progress_rate: number;
  start_date: string;
  end_date: string;
  duration_string: string;
  days_remaining: number;
  overdue: boolean;
  creator_id: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRequest {
  name: string;
  description: string;
  status: Project['status'];
  start_date: string;
  end_date: string;
}

// システム設定関連の型定義
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  setting_type: 'string' | 'number' | 'json' | 'integer' | 'boolean';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingRequest {
  key: string;
  value: string;
  description: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
}

// ダッシュボード関連の型定義
export interface DashboardStats {
  ticket_stats: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
  project_stats: {
    total: number;
    active: number;
    completed: number;
    archived: number;
  };
  recent_tickets: Ticket[];
  assigned_tickets: Ticket[];
}

// ページネーション関連の型定義
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
} 