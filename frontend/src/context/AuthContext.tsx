import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean; // <-- Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUser(user);
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Registering user:', { name, email });
      const userData = await authService.register({ name, email, password });
      console.log('Registration successful:', userData);
      setUser(userData);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 400 && err.response?.data?.message === 'User already exists') {
        setError('A user with this email already exists. Please use a different email or login.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('Something went wrong during registration. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Logging in user:', email);
      const userData = await authService.login({ email, password });
      console.log('Login successful:', userData);
      setUser(userData);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('Something went wrong during login. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user, // <-- Add this line
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};