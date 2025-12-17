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
        console.log('Auth initialization - Token exists:', !!accessToken);
        
        if (accessToken) {
          // Set axios default header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          try {
            const userData = await authApi.getCurrentUser();
            console.log('User authenticated successfully:', userData);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (userError) {
            console.error('Failed to fetch user data:', userError);
            // Token might be expired
            try {
              await authApi.refreshToken();
              const userData = await authApi.getCurrentUser();
              setUser(userData);
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              logout();
            }
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
        console.log('Auth initialization completed');
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setUser(null);
    setIsAuthenticated(false);
    
    try {
      console.log('AuthContext: Starting login for user:', username);
      
      // Clear any existing tokens before new login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Call the authApi.login function (uses axios now)
      const response = await authApi.login({ username, password });
      
      console.log('AuthContext: Login successful, response:', response);
      
      // Extract user data from response
      const userData = response.user;
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('AuthContext: Login completed successfully, user:', userData);
      
      return userData;
    } catch (error) {
      console.error('AuthContext: Login error details:', {
        message: error.message,
        response: error.response
      });
      
      // Clear tokens on failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      
      // Re-throw the error for the login component to handle
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user...');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear axios header
    delete api.defaults.headers.common['Authorization'];
    
    console.log('AuthContext: Logout completed');
    
    // Redirect to login
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
