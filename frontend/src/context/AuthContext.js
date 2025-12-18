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
            
            // The updated authApi.login() now handles token storage internally
            const userData = await authApi.login({ username, password });
            
            // Update state with the returned user data
            setUser(userData);
            setIsAuthenticated(true);
            
            console.log('Login completed, user:', userData);
            
            // Navigate based on role
            const role = userData.role?.toLowerCase();
            if (role === 'supermanager') navigate('/supermanager');
            else if (role === 'manager') navigate('/manager');
            else if (role === 'employee') navigate('/employee');
            else navigate('/dashboard');
            
            return userData;
        } catch (error) {
            console.error('Login error in AuthContext:', error);
            
            let errorMessage = 'Login failed. ';
            
            // Use the error message from the API
            if (error.message) {
                errorMessage = error.message;
            }
            
            // Clear any existing tokens on login failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            
            throw error; // Re-throw the error so Login component can display it
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
