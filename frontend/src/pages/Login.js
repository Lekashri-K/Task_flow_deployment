// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login } from '../utils/auth';
// import '../styles/auth.css';

// export default function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
    
//     try {
//       const user = await login(username, password);
      
//       // Role-based redirection
//       const role = user.role?.toLowerCase();
//       if (role === 'supermanager') navigate('/supermanager');
//       else if (role === 'manager') navigate('/manager');
//       else if (role === 'employee') navigate('/employee');
//       else navigate('/dashboard');
      
//     } catch (err) {
//       setError('Invalid username or password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-glass-card">
//         {/* Left Decorative Panel */}
//         <div className="auth-panel">
//           <div className="auth-panel-overlay"></div>
//           <div className="auth-panel-content">
//             <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="rgba(255,255,255,0.9)"/>
//             </svg>
//             <h2>TaskFlow</h2>
//             <p>Streamline your workflow with our premium dashboard</p>
//           </div>
//         </div>

//         {/* Right Login Form */}
//         <div className="auth-form">
//           <div className="auth-header">
//             <h3>Welcome Back</h3>
//             <p> Let's login to your dashboard</p>
//           </div>

//           {error && (
//             <div className="auth-error">
//               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="12" cy="12" r="10"></circle>
//                 <line x1="12" y1="8" x2="12" y2="12"></line>
//                 <line x1="12" y1="16" x2="12.01" y2="16"></line>
//               </svg>
//               <span>{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="input-group">
//               <span className="input-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                   <circle cx="12" cy="7" r="4"></circle>
//                 </svg>
//               </span>
//               <input
//                 type="text"
//                 placeholder="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="input-group">
//               <span className="input-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                   <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                 </svg>
//               </span>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <span 
//                 className="password-toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c8db5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   {showPassword ? (
//                     <>
//                       <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
//                       <line x1="1" y1="1" x2="23" y2="23"></line>
//                     </>
//                   ) : (
//                     <>
                      
                      
//                     </>
//                   )}
//                 </svg>
//               </span>
//             </div>

//             {/* <div className="auth-options">
//               <label>
//                 <input type="checkbox" />
//                 <span className="checkmark"></span>
//                 Remember me
//               </label>
//               <a href="/forgot-password">Forgot password?</a>
//             </div> */}

//             <button type="submit" disabled={isLoading}>
//               {isLoading ? (
//                 <span className="spinner"></span>
//               ) : (
//                 <>
//                   Login
//                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <line x1="5" y1="12" x2="19" y2="12"></line>
//                     <polyline points="12 5 19 12 12 19"></polyline>
//                   </svg>
//                 </>
//               )}
//             </button>
//           </form>

          
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import '../styles/auth.css';
import { BsHouse } from 'react-icons/bs';
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login(username, password);
      
      // Role-based redirection
      const role = user.role?.toLowerCase();
      if (role === 'supermanager') navigate('/supermanager');
      else if (role === 'manager') navigate('/manager');
      else if (role === 'employee') navigate('/employee');
      else navigate('/dashboard');
      
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Home Link in Top Right Corner */}
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
        {/* Left Decorative Panel */}
        <div className="auth-panel">
          <div className="auth-panel-overlay"></div>
          <div className="auth-panel-content">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="rgba(255,255,255,0.9)"/>
            </svg>
            <h2>TaskFlow</h2>
            <p>Streamline your workflow with our premium dashboard</p>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="auth-form">
          <div className="auth-header">
            <h3>Welcome Back</h3>
            <p> Let's login to your dashboard</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
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
              />
              {/* <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
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
              </span> */}
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="spinner"></span>
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