import axios from 'axios';

// Create axios instance with Render-specific configuration
const getApiBaseUrl = () => {
    // Auto-detect environment
    console.log('Detecting environment...');
    console.log('Hostname:', window.location.hostname);
    console.log('Full URL:', window.location.href);
    
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

// Authentication API - FIXED: Use axios instead of fetch
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
            
            // Enhanced error handling
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
            
            // If unauthorized, clear tokens
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
            // Clear tokens on refresh failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            throw error;
        }
    },

    // Test API connection
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

// Keep all your existing API functions (they're fine)
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
    // ... keep ALL your existing superManagerApi functions
};

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
    // ... keep ALL your existing managerApi functions
};

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
    // ... keep ALL your existing employeeApi functions
};

// Request interceptor - ADD DEBUG LOGS
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

// Response interceptor - SIMPLIFIED
api.interceptors.response.use(
    (response) => {
        console.log('Response received from:', response.config.url);
        return response;
    },
    async (error) => {
        console.log('Response error for:', error.config?.url);
        console.log('Error status:', error.response?.status);
        
        if (!error.response) {
            // Network error
            error.message = 'Network error - cannot connect to server';
            console.error('Network error, likely backend is not running');
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
