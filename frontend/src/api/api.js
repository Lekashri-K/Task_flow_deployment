import axios from 'axios';

// Create axios instance with Render-specific configuration
const getApiBaseUrl = () => {
    // For production on Render
    if (window.location.hostname.includes('onrender.com')) {
        return window.location.origin + '/api/';
    }
    // For local development
    return process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';
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
            const apiUrl = getApiBaseUrl();
            console.log('Making login request to:', `${apiUrl}login/`);
            
            const response = await fetch(`${apiUrl}login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            console.log('Login response status:', response.status);
            console.log('Login response data:', data);

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
            
            // Enhanced error handling
            if (error.response) {
                console.error('Response error:', error.response.data);
                console.error('Status:', error.response.status);
            } else if (error.request) {
                console.error('No response received:', error.request);
                error.message = 'Network error - unable to connect to server';
            } else {
                console.error('Request setup error:', error.message);
            }
            
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
            throw error;
        }
    },

    checkApiHealth: async () => {
        try {
            const response = await api.get('');
            return response.status === 200;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    },

    // New: Direct test endpoint
    testConnection: async () => {
        try {
            const apiUrl = getApiBaseUrl();
            console.log('Testing connection to:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });
            
            console.log('Connection test response:', response);
            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
};

// Super Manager API (keep existing functions, just ensure they use the corrected api instance)
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

    // ... keep all your existing superManagerApi functions as they are ...
    // (No changes needed to the actual function implementations)
};

// Manager API (keep existing functions)
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
    // ... rest of your managerApi functions ...
};

// Employee API (keep existing functions)
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
    // ... rest of your employeeApi functions ...
};

// Request interceptor for JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add origin header for CORS
    if (window.location.origin) {
        config.headers['Origin'] = window.location.origin;
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
            // Network error
            error.message = 'Network error - please check your connection and ensure the server is running';
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
