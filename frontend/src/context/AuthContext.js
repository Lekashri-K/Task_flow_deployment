import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';
import api from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Check for existing token on initial load
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                    console.log('Found access token, verifying...');
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    
                    // Try to get user data
                    try {
                        const userData = await authApi.getCurrentUser();
                        setUser(userData);
                        setIsAuthenticated(true);
                        console.log('User authenticated:', userData);
                    } catch (userError) {
                        console.error('Failed to get user data:', userError);
                        // Token might be invalid, clear it
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        setIsAuthenticated(false);
                    }
                } else {
                    console.log('No access token found');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            console.log('Attempting login for user:', username);
            
            // Test API connection first
            console.log('Testing API connection...');
            const isConnected = await authApi.testConnection();
            if (!isConnected) {
                throw new Error('Cannot connect to server. Please try again later.');
            }
            
            // Use the direct fetch method from authApi
            const response = await authApi.login({ username, password });

            const { access, refresh, user: userData } = response;

            console.log('Login successful, storing tokens...');
            
            // Store tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            
            // Update state
            setUser(userData);
            setIsAuthenticated(true);
            
            console.log('Login completed, user:', userData);
            
            return userData;
        } catch (error) {
            console.error('Login error in AuthContext:', error);
            
            let errorMessage = 'Login failed. ';
            
            if (error.message) {
                errorMessage += error.message;
            } else if (error.response?.data?.detail) {
                errorMessage += error.response.data.detail;
            } else if (error.response?.data?.error) {
                errorMessage += error.response.data.error;
            } else {
                errorMessage += 'Please check your credentials and try again.';
            }
            
            // Clear any existing tokens on login failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('Logging out user...');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
