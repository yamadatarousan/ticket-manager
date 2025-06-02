export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'user' | 'manager' | 'admin';
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  tickets?: T[] & Ticket[];
  users?: T[] & User[];
  total_count: number;
  total_pages: number;
  current_page: number;
  per_page: number;
} 