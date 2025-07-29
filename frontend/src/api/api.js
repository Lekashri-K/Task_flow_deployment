// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
//   timeout: 10000, // 10 second timeout
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   }
// });

// // Authentication API
// const authApi = {
//   login: async (credentials) => {
//     try {
//       const response = await api.post('login/', credentials);
//       if (response.data.access && response.data.refresh) {
//         localStorage.setItem('access_token', response.data.access);
//         localStorage.setItem('refresh_token', response.data.refresh);
//       }
//       return response.data;
//     } catch (error) {
//       console.error('Login error:', error.response?.data);
//       throw error;
//     }
//   },

//   getCurrentUser: async () => {
//     try {
//       const response = await api.get('user/');
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch current user:', error);
//       throw error;
//     }
//   },

//   logout: () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//   },

//   refreshToken: async () => {
//     try {
//       const refreshToken = localStorage.getItem('refresh_token');
//       if (!refreshToken) throw new Error('No refresh token available');

//       const response = await api.post('token/refresh/', {
//         refresh: refreshToken
//       });

//       localStorage.setItem('access_token', response.data.access);
//       return response.data.access;
//     } catch (error) {
//       console.error('Refresh token failed:', error);
//       throw error;
//     }
//   },

//   checkApiHealth: async () => {
//     try {
//       await api.get('');
//       return true;
//     } catch (error) {
//       console.error('API health check failed:', error);
//       return false;
//     }
//   }
// };

// // Super Manager API
// const superManagerApi = {
//   // Dashboard
//   getDashboardStats: async () => {
//     try {
//       const response = await api.get('supermanager-dashboard-stats/');
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch dashboard stats:', error);
//       throw error;
//     }
//   },

//   // User Management
//   getUsers: async () => {
//     try {
//       const response = await api.get('supermanager/users/');
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch users:', error);
//       throw error;
//     }
//   },

//   getUser: async (userId) => {
//     try {
//       const response = await api.get(`supermanager/users/${userId}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       throw error;
//     }
//   },

//   createUser: async (userData) => {
//     try {
//       const response = await api.post('supermanager/users/', userData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create user:', error.response?.data);
//       throw error;
//     }
//   },

//   updateUser: async (userId, userData) => {
//     try {
//       const response = await api.put(`supermanager/users/${userId}/`, userData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update user:', error.response?.data);
//       throw error;
//     }
//   },

//   deleteUser: async (userId) => {
//     try {
//       const response = await api.delete(`supermanager/users/${userId}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to delete user:', error.response?.data);
//       throw error;
//     }
//   },

//   // Activity
//   getRecentActivities: async () => {
//     try {
//       const response = await api.get('recent-activity/');
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch recent activities:', error);
//       throw error;
//     }
//   },

//   // Projects
//   getProjects: async () => {
//     try {
//       const response = await api.get('supermanager/projects/');
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch projects:', error);
//       throw error;
//     }
//   },

//   getProject: async (id) => {
//     try {
//       const response = await api.get(`supermanager/projects/${id}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch project:', error);
//       throw error;
//     }
//   },

//   createProject: async (projectData) => {
//     try {
//       const response = await api.post('supermanager/projects/', projectData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create project:', error.response?.data);
//       throw error;
//     }
//   },

//   updateProject: async (id, projectData) => {
//     try {
//       const response = await api.put(`supermanager/projects/${id}/`, projectData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update project:', error.response?.data);
//       throw error;
//     }
//   },

//   deleteProject: async (id) => {
//     try {
//       const response = await api.delete(`supermanager/projects/${id}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to delete project:', error.response?.data);
//       throw error;
//     }
//   },

//   // Tasks
//   getTasks: async () => {
//     try {
//       const response = await api.get('supermanager/tasks/');
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch tasks:', error);
//       throw error;
//     }
//   },

//   getTasksByProject: async (projectId) => {
//     try {
//       const response = await api.get(`supermanager/tasks/?project=${projectId}`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch project tasks:', error);
//       throw error;
//     }
//   },

//   getTask: async (taskId) => {
//     try {
//       const response = await api.get(`supermanager/tasks/${taskId}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch task:', error);
//       throw error;
//     }
//   },

//   createTask: async (taskData) => {
//     try {
//       const response = await api.post('supermanager/tasks/', taskData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to create task:', error.response?.data);
//       throw error;
//     }
//   },

//   updateTask: async (taskId, taskData) => {
//     try {
//       const response = await api.put(`supermanager/tasks/${taskId}/`, taskData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update task:', error.response?.data);
//       throw error;
//     }
//   },

//   updateTaskStatus: async (taskId, status) => {
//     try {
//       const response = await api.patch(`supermanager/tasks/${taskId}/`, { status });
//       return response.data;
//     } catch (error) {
//       console.error('Failed to update task status:', error.response?.data);
//       throw error;
//     }
//   },

//   deleteTask: async (taskId) => {
//     try {
//       const response = await api.delete(`supermanager/tasks/${taskId}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to delete task:', error.response?.data);
//       throw error;
//     }
//   },

//   // Reports
//   generateReport: async (reportData) => {
//     try {
//       const response = await api.post('supermanager/reports/', reportData);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to generate report:', error.response?.data);
//       throw error;
//     }
//   }
// };

// // Request interceptor for JWT token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// // Enhanced Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // Handle network errors
//     if (error.code === 'ECONNABORTED') {
//       error.message = 'Request timeout - please try again later';
//       return Promise.reject(error);
//     }

//     if (!error.response) {
//       error.message = 'Network error - please check your connection';
//       return Promise.reject(error);
//     }

//     const originalRequest = error.config;

//     // If unauthorized and not already retried
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const newToken = await authApi.refreshToken();
//         api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//         originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error('Refresh token failed:', refreshError);
//         authApi.logout();
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     // For other errors, just reject
//     return Promise.reject(error);
//   }
// );

// export { authApi, superManagerApi };
// export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
  timeout: 10000, // 10 second timeout
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

      const response = await api.post('token/refresh/', {
        refresh: refreshToken
      });

      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
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

  // Tasks - Updated to handle overdue status
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

// Enhanced Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please try again later';
      return Promise.reject(error);
    }

    if (!error.response) {
      error.message = 'Network error - please check your connection';
      return Promise.reject(error);
    }

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
// api.js
// Ensure your managerApi in api.js has all these endpoints
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

// Add to api.js
const employeeApi = {
  // Add these to your employeeApi methods
  createSelfTask: async (taskData) => {
    const response = await api.post('/tasks/self', taskData);
    return response.data;
  },

  getSelfTasks: async () => {
    const response = await api.get('/tasks/self');
    return response.data;
  },

  updateSelfTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/tasks/self/${taskId}`, { status });
    return response.data;
  },
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

// Add to exports
export { authApi, managerApi, superManagerApi, employeeApi };

export default api;