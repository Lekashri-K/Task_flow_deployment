import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
  timeout: 30000,
  // IMPORTANT: Remove withCredentials for JWT
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Authentication API
const authApi = {
  login: async (credentials) => {
    try {
      console.log('=== LOGIN API CALL ===');
      console.log('API URL:', api.defaults.baseURL);
      
      // USE AXIOS, NOT FETCH
      const response = await api.post('login/', credentials);
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);
      
      if (response.data && response.data.access) {
        const { access, refresh, user: userData } = response.data;
        
        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Set axios default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        return { access, refresh, user: userData };
      } else {
        throw new Error('Invalid response format from server');
      }
      
    } catch (error) {
      console.error('Login API error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Format error for consistent handling
      if (error.response) {
        throw {
          response: {
            data: error.response.data,
            status: error.response.status,
            statusText: error.response.statusText
          },
          message: error.response.data?.detail || 
                  error.response.data?.error || 
                  error.response.data?.message || 
                  'Login failed'
        };
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw {
          message: 'No response from server. Please check your connection.',
          request: error.request
        };
      } else {
        throw {
          message: error.message || 'Login request failed'
        };
      }
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
    console.log('Logging out...');
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

// Request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Making request to:', config.url);
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response ${response.status}: ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.log('Response interceptor caught error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - no response received');
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
      console.log('401 Unauthorized, attempting token refresh...');
      originalRequest._retry = true;

      try {
        const newToken = await authApi.refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        console.log('Token refreshed, retrying request');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed, logging out:', refreshError);
        authApi.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get(`recent-activity/?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      throw error;
    }
  },

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

export { authApi, managerApi, superManagerApi, employeeApi };
export default api;
