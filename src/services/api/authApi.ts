import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'superadmin';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  avatar?: string;
  bio?: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
  };
}

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
    theme?: 'light' | 'dark' | 'auto';
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
class AuthApiService {
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Store access token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  /**
   * Remove access token
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Store user data
   */
  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Remove user data
   */
  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      if (data.success && data.data) {
        this.setToken(data.data.accessToken);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        this.setToken(data.data.accessToken);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
      this.removeUser();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        this.setUser(data.data);
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Failed to fetch profile',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: ProfileUpdateData): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        this.setUser(data.data);
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: PasswordChangeData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData),
        credentials: 'include',
      });

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to process request',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password',
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ success: boolean; data?: { accessToken: string; user: User } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        this.setToken(data.data.accessToken);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      return { success: false };
    }
  }
}

export const authApi = new AuthApiService();
export default authApi;
