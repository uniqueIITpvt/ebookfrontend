'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, LoginCredentials, RegisterData } from '@/services/api/authApi';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isUser: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authApi.getUser();
        const token = authApi.getToken();

        if (storedUser && token) {
          // Verify token is still valid by fetching profile
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear auth
            authApi.removeToken();
            authApi.removeUser();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authApi.removeToken();
        authApi.removeUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, message: 'Login successful', user: response.data.user };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, message: 'Registration successful' };
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      router.push('/');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    isUser: user?.role === 'user',
    isLoginModalOpen,
    setIsLoginModalOpen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
