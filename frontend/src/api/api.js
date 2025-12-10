
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Authentication API
const authApi = {
  login: async (credentials) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';
      console.log('Making login request to:', `${apiUrl}login/`);
      
      const response = await fetch(`${apiUrl}login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw {
          response: {
            data: data,
            status: response.status,
            statusText: response.statusText
          }
        };
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
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
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await api.post('token/refresh/', {
        refresh: refreshToken
      });

      const newToken = response.data.access;
      localStorage.setItem('access_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newToken;
    } catch (error) {
      console.error('Refresh token failed:', error);
      throw error;
    }
  },

  checkApiHealth: async () => {
    try {
      await api.get('');
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
};

// Super Manager API
const superManagerApi = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('supermanager-dashboard-stats/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  },

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
      const response = await api.patch(`supermanager/users/${userId}/`, userData);
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

  // UPDATED: Get all recent activities with limit for top 5
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get(`recent-activity/?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      throw error;
    }
  },

  // NEW: Get activities by user role
  getActivitiesByRole: async (role) => {
    try {
      const response = await api.get(`recent-activity/?user_role=${role}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activities by role:', error);
      throw error;
    }
  },

  getProjects: async () => {
    try {
      const response = await api.get('supermanager/projects/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  },

  getProject: async (id) => {
    try {
      const response = await api.get(`supermanager/projects/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
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

  updateProject: async (id, projectData) => {
    try {
      const response = await api.patch(`supermanager/projects/${id}/`, projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to update project:', error.response?.data);
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      const response = await api.delete(`supermanager/projects/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete project:', error.response?.data);
      throw error;
    }
  },

  getTasks: async () => {
    try {
      const response = await api.get('supermanager/tasks/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  getTasksByProject: async (projectId) => {
    try {
      const response = await api.get(`supermanager/tasks/?project=${projectId}&annotate_overdue=true`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
      throw error;
    }
  },

  getTask: async (taskId) => {
    try {
      const response = await api.get(`supermanager/tasks/${taskId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch task:', error);
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

  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.patch(`supermanager/tasks/${taskId}/`, taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error.response?.data);
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await api.patch(`supermanager/tasks/${taskId}/status/`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update task status:', error.response?.data);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`supermanager/tasks/${taskId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete task:', error.response?.data);
      throw error;
    }
  },

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

// Manager API
const managerApi = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('manager-dashboard-stats/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch manager dashboard stats:', error);
      throw error;
    }
  },

  getProjects: async () => {
    try {
      const response = await api.get('manager/projects/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch manager projects:', error);
      throw error;
    }
  },

  getProject: async (projectId) => {
    try {
      const response = await api.get(`manager/projects/${projectId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  },

  getTasksByProject: async (projectId) => {
    try {
      const response = await api.get(`manager/tasks/?project=${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
      throw error;
    }
  },

  getEmployees: async () => {
    try {
      const response = await api.get('manager/employees/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('manager/tasks/', taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error.response?.data);
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.patch(`manager/tasks/${taskId}/`, taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to update task:', error.response?.data);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`manager/tasks/${taskId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete task:', error.response?.data);
      throw error;
    }
  }
};

// Employee API
const employeeApi = {
  getTasks: async () => {
    try {
      const response = await api.get('employee/tasks/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch employee tasks:', error);
      throw error;
    }
  },

  updateTaskStatus: async (taskId, status, notes) => {
    try {
      const response = await api.patch(`employee/tasks/${taskId}/`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update task status:', error.response?.data);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('employee/tasks/', taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error.response?.data);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`employee/tasks/${taskId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete task:', error.response?.data);
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Interceptor caught error:', error.response?.status);
    
    if (!error.response) {
      error.message = 'Network error - please check your connection';
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Skip token refresh for login requests
    if (originalRequest.url && originalRequest.url.includes('login/')) {
      return Promise.reject(error);
    }

    // If unauthorized (401) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('Attempting token refresh...');
        const newToken = await authApi.refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        authApi.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { authApi, managerApi, superManagerApi, employeeApi };
export default api;