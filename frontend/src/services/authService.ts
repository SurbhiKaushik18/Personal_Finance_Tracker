import api from './api';
import { User } from '../types';

// Register user
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  try {
    console.log('Sending registration request:', { name: userData.name, email: userData.email });
    const response = await api.post('/users', userData);
    console.log('Registration response:', response.data);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error: any) {
    console.error('Registration API error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Login user
export const login = async (userData: {
  email: string;
  password: string;
}): Promise<User> => {
  try {
    console.log('Sending login request:', { email: userData.email });
    const response = await api.post('/users/login', userData);
    console.log('Login response:', response.data);
    
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error: any) {
    console.error('Login API error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem('user');
};

// Get user from local storage
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 