import axios from 'axios';

// ========== CRITICAL FIX: Hardcode the URL ==========
const API_BASE_URL = 'https://task-flow-deployment.onrender.com/api/';
console.log('=== API CONFIGURATION ===');
console.log('Hardcoded API URL:', API_BASE_URL);
console.log('Full login URL:', API_BASE_URL + 'login/');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,  // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  // NO withCredentials
});

// ========== AUTHENTICATION API ==========
const authApi = {
  login: async (credentials) => {
    console.log('🔑 Login attempt with:', credentials.username);
    
    try {
      // CLEAN DEBUG - Show exact URL being called
      console.log(`📤 POST to: ${api.defaults.baseURL}login/`);
      
      const response = await api.post('login/', credentials);
      
      console.log('✅ Login successful! Status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data && response.data.access) {
        const { access, refresh, user: userData } = response.data;
        
        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Update axios defaults
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        console.log('✓ Tokens stored and header set');
        
        return { access, refresh, user: userData };
      } else {
        console.error('❌ Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
    } catch (error) {
      console.error('❌ Login API error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
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
        console.error('❌ No response received. This is a network error.');
        console.error('Request was made but no response:', error.request);
        throw {
          message: 'Cannot connect to server. Please check your internet connection.',
          request: error.request
        };
      } else {
        console.error('❌ Request setup error:', error.message);
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
      const response = await api.get('health/');
      console.log('API Health:', response.data);
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
};

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use((config) => {
  console.log(`📤 Making ${config.method?.toUpperCase()} request to:`, config.url);
  console.log('Full URL:', config.baseURL + config.url);
  console.log('Request headers:', config.headers);
  
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✓ Added Authorization header');
  }
  
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status}: ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ Response error details:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      code: error.code,
      responseData: error.response?.data
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ NETWORK ERROR - No response received from server');
      console.error('This means:');
      console.error('1. Server is down or not responding');
      console.error('2. CORS is blocking the request');
      console.error('3. Network connection issue');
      error.message = 'Cannot connect to server. Please check if the server is running.';
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

// ========== SUPER MANAGER API ==========
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

// ========== MANAGER API ==========
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

// ========== EMPLOYEE API ==========
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

// ========== TEST FUNCTION ==========
export const testConnection = async () => {
  console.log('🔍 Testing connection to server...');
  try {
    const response = await api.get('health/');
    console.log('✅ Server is reachable:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Cannot reach server:', error.message);
    return false;
  }
};

export { authApi, managerApi, superManagerApi, employeeApi };
export default api;
