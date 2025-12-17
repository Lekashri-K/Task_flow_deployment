import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';
import { BsHouse } from 'react-icons/bs';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Login attempt started...'); // DEBUG

    try {
      const user = await login(username, password);
      console.log('Login successful:', user); // DEBUG

      const role = user.role?.toLowerCase();
      if (role === 'supermanager') navigate('/supermanager');
      else if (role === 'manager') navigate('/manager');
      else if (role === 'employee') navigate('/employee');
      else navigate('/dashboard');

    } catch (err) {
      console.log('=== LOGIN ERROR DETAILS ==='); // DEBUG
      console.log('Full error object:', err); // DEBUG
      console.log('Error response:', err.response); // DEBUG
      console.log('Error message:', err.message); // DEBUG
      
      let errorMessage = 'Login failed. Please try again.';

      // Extract error message from different possible formats
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        console.log('Error data structure:', errorData); // DEBUG
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.username) {
          errorMessage = errorData.username[0];
        } else if (errorData.password) {
          errorMessage = errorData.password[0];
        } else {
          // Default message for authentication failure
          errorMessage = 'Invalid username or password';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.log('Final error message to display:', errorMessage); // DEBUG
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

// TEST FUNCTION - Direct API call to check what the server returns
const testDirectLogin = async () => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';
    console.log('Testing direct login with URL:', `${API_URL}login/`);

    const response = await fetch(`${API_URL}login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'wronguser',
        password: 'wrongpass'
      }),
    });

    const data = await response.json();

    console.log('Direct test response data:', data);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.log('Error from server:', data.detail || data);
    }

  } catch (error) {
    console.log('Direct test fetch error:', error);
  }
};

      
      const data = await response.json();
      console.log('Direct test response:', data);
      console.log('Response status:', response.status);
    } catch (error) {
      console.log('Direct test error:', error);
    }
  };

  return (
    <div className="auth-container">
      {/* Uncomment to test direct API call */}
      {/* <button 
        onClick={testDirectLogin}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px',
          background: '#f0f0f0',
          border: '1px solid #ccc'
        }}
      >
        Test API
      </button> */}

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: '#3b82f6',
          fontWeight: '500',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '1.1rem'
        }}
        onClick={() => navigate('/')}
        title="Go to Home"
      >
        <BsHouse size={20} />
        Home
      </div>

      <div className="auth-glass-card">
        <div className="auth-panel">
          <div className="auth-panel-overlay"></div>
          <div className="auth-panel-content">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="rgba(255,255,255,0.9)" />
            </svg>
            <h2>TaskFlow</h2>
            <p>Streamline your workflow with our premium dashboard</p>
          </div>
        </div>

        <div className="auth-form">
          <div className="auth-header">
            <h3>Welcome Back</h3>
            <p>Let's login to your dashboard</p>
          </div>

          {error && (
            <div className="auth-error" style={{ 
              background: '#fee', 
              border: '1px solid #fcc',
              padding: '12px',
              borderRadius: '8px',
              color: '#c33',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{cursor: 'pointer'}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c8db5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </>
                  )}
                </svg>
              </span>
            </div>

            <button type="submit" disabled={isLoading} style={{position: 'relative'}}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
