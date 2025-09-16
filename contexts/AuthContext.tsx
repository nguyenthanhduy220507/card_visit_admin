// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: { username: string; password: string; fullName: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await apiService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.login(username, password);
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        
        // Get user profile after login
        const userData = await apiService.getProfile();
        setUser(userData);
        
        toast.success('Đăng nhập thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error?.response?.data?.message || 'Đăng nhập thất bại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { username: string; password: string; fullName: string }): Promise<boolean> => {
    try {
      setLoading(true);
      await apiService.register(userData);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      return true;
    } catch (error: any) {
      console.error('Register failed:', error);
      toast.error(error?.response?.data?.message || 'Đăng ký thất bại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    toast.success('Đăng xuất thành công!');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
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