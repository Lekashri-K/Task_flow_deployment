import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('login/', credentials);
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('user/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Refresh token failed:', error);
      throw error;
    }
  }
};

// Super Manager API
const superManagerApi = {
  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('supermanager-dashboard-stats/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

  // User Management
  getUsers: async () => {
    try {
      const response = await api.get('supermanager/users/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const response = await api.get(`supermanager/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('supermanager/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error.response?.data);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`supermanager/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error.response?.data);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`supermanager/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error.response?.data);
      throw error;
    }
  },

  // Activity
  getRecentActivities: async () => {
    try {
      const response = await api.get('recent-activity/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      throw error;
    }
  },

  // Projects
  getProjects: async () => {
    try {
      const response = await api.get('supermanager/projects/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('supermanager/projects/', projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error.response?.data);
      throw error;
    }
  },

  // Tasks
  getTasks: async () => {
    try {
      const response = await api.get('supermanager/tasks/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('supermanager/tasks/', taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error.response?.data);
      throw error;
    }
  },

  // Reports
  generateReport: async (reportData) => {
    try {
      const response = await api.post('supermanager/reports/', reportData);
      return response.data;
    } catch (error) {
      console.error('Failed to generate report:', error.response?.data);
      throw error;
    }
  }
};

// Request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authApi.refreshToken();
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        authApi.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

export { authApi, superManagerApi };
export default api;