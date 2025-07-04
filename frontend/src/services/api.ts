import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', { 
      url: config.url, 
      method: config.method, 
      headers: config.headers 
    });
    
    const user = localStorage.getItem('user') ? 
      JSON.parse(localStorage.getItem('user') || '{}') : 
      null;
      
    if (user && user.token) {
      config.headers!.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { 
      status: response.status, 
      url: response.config.url,
      data: response.data 
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('API response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle server connection errors
    if (!error.response) {
      // Network error or server not responding
      return Promise.reject({
        response: {
          status: 503,
          data: {
            message: 'Unable to connect to the server. Please check if the server is running and try again.',
            error: 'SERVER_CONNECTION_ERROR'
          }
        }
      });
    }
    
    // Handle database connection errors
    if (error.response.status === 503 && 
        error.response.data && 
        typeof error.response.data === 'object' && 
        'error' in error.response.data && 
        error.response.data.error === 'DATABASE_CONNECTION_ERROR') {
      console.error('Database connection error detected');
    }
    
    return Promise.reject(error);
  }
);

// Add a health check function
export const checkServerHealth = async (): Promise<{ isServerUp: boolean, isDatabaseUp: boolean }> => {
  try {
    const response = await api.get('/status');
    return {
      isServerUp: true,
      isDatabaseUp: response.data.database === 'connected'
    };
  } catch (error) {
    return {
      isServerUp: false,
      isDatabaseUp: false
    };
  }
};

export default api; 