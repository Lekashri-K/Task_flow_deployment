import axios from 'axios';

// ========== CRITICAL FIX: Hardcode the URL ==========
const API_BASE_URL = "https://task-flow-deployment.onrender.com/api/";

console.log('=== API CONFIGURATION ===');
console.log('Hardcoded API URL:', API_BASE_URL);
console.log('Full login URL:', API_BASE_URL + 'login/');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ========== AUTHENTICATION API ==========
const authApi = {
  login: async (credentials) => {
    console.log('Login attempt with:', credentials.username);
    
    try {
      const response = await api.post('login/', credentials);
      
      console.log('Login successful! Status:', response.status);
      
      if (response.data && response.data.access) {
        const { access, refresh, user: userData } = response.data;
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        return { access, refresh, user: userData };
      } else {
        throw new Error('Invalid response format from server');
      }
      
    } catch (error) {
      console.error('Login API error:', error.message);
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
  }
};

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login/')) {
      originalRequest._retry = true;
      try {
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

export { authApi, managerApi, superManagerApi, employeeApi };
export default api;
