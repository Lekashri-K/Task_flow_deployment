import axios from 'axios';

// Create axios instance with Render-specific configuration
const getApiBaseUrl = () => {
    console.log('Detecting environment...');
    console.log('Hostname:', window.location.hostname);
    
    if (window.location.hostname.includes('onrender.com')) {
        const url = window.location.origin + '/api/';
        console.log('Using Render URL:', url);
        return url;
    }
    
    const localUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';
    console.log('Using local URL:', localUrl);
    return localUrl;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Authentication API
const authApi = {
    login: async (credentials) => {
        try {
            console.log('Login attempt with credentials:', { 
                username: credentials.username, 
                password: '***' 
            });
            
            console.log('API base URL:', api.defaults.baseURL);
            
            const response = await api.post('login/', credentials);
            console.log('Login successful! Response:', response.data);
            
            const { access, refresh, user: userData } = response.data;

            // Store tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update axios defaults for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            
            let errorMessage = 'Login failed. ';
            
            if (error.response) {
                console.error('Server response:', error.response.data);
                console.error('Status:', error.response.status);
                
                if (error.response.status === 401) {
                    errorMessage = 'Invalid username or password';
                } else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data?.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.request) {
                console.error('No response received');
                errorMessage = 'Cannot connect to server. Please check if the backend is running.';
            } else {
                console.error('Request setup error:', error.message);
                errorMessage = error.message;
            }
            
            // Clear any existing tokens on login failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            
            throw new Error(errorMessage);
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get('user/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
            
            throw error;
        }
    },

    logout: () => {
        console.log('Logging out user...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            throw error;
        }
    },

    checkApiHealth: async () => {
        try {
            const response = await api.get('');
            return { 
                healthy: response.status === 200,
                message: 'API is responding',
                url: api.defaults.baseURL
            };
        } catch (error) {
            console.error('API health check failed:', error);
            return { 
                healthy: false, 
                message: error.message,
                url: api.defaults.baseURL
            };
        }
    }
};

// Super Manager API - COMPLETE VERSION (from your old file)
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

// Manager API - COMPLETE VERSION (from your old file)
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

// Employee API - COMPLETE VERSION (from your old file)
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

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding authorization header for:', config.url);
    }
    console.log('Making request to:', config.baseURL + config.url);
    return config;
}, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response received from:', response.config.url);
        return response;
    },
    async (error) => {
        console.log('Response error for:', error.config?.url);
        console.log('Error status:', error.response?.status);
        
        if (!error.response) {
            error.message = 'Network error - cannot connect to server';
            console.error('Network error, likely backend is not running');
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (originalRequest.url && originalRequest.url.includes('login/')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Attempting token refresh...');

            try {
                const newToken = await authApi.refreshToken();
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                console.log('Token refreshed, retrying request');
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Refresh token failed, logging out');
                authApi.logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { authApi, managerApi, superManagerApi, employeeApi };
export default api;
