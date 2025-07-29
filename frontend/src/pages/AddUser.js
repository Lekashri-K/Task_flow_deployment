// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { superManagerApi } from '../api/api';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import './SuperManagerDashboard.css';

// const AddUser = () => {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     full_name: '',
//     role: 'employee',
//     password: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showPasswordFields, setShowPasswordFields] = useState(false);

//   useEffect(() => {
//     if (id) {
//       setIsEditMode(true);
//       fetchUserData();
//     }
//   }, [id]);

//   useEffect(() => {
//     if (user?.role?.toLowerCase() !== 'supermanager') {
//       navigate('/login');
//     }
//   }, [user, navigate]);

//   const fetchUserData = async () => {
//     try {
//       const userData = await superManagerApi.getUser(id);
//       setFormData({
//         username: userData.username,
//         email: userData.email,
//         full_name: userData.full_name || '',
//         role: userData.role,
//         password: '',
//         confirmPassword: ''
//       });
//     } catch (error) {
//       console.error('Failed to fetch user data:', error);
//       navigate('/supermanager/users', { state: { error: 'Failed to load user data' } });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.username) newErrors.username = 'Username is required';
//     if (!formData.email) newErrors.email = 'Email is required';

//     // Only validate password if:
//     // 1. Creating new user, or
//     // 2. Editing user AND password fields are shown
//     if (!isEditMode) {
//       if (!formData.password) newErrors.password = 'Password is required';
//       if (formData.password !== formData.confirmPassword) {
//         newErrors.confirmPassword = 'Passwords do not match';
//       }
//     } else if (showPasswordFields) {
//       if (!formData.password) newErrors.password = 'Password is required';
//       if (formData.password !== formData.confirmPassword) {
//         newErrors.confirmPassword = 'Passwords do not match';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const userData = {
//         username: formData.username,
//         email: formData.email,
//         full_name: formData.full_name || '',
//         role: formData.role,
//         is_active: true
//       };

//       // Only include password if:
//       // 1. Creating new user, or
//       // 2. Editing user AND password fields are shown AND password is not empty
//       if (!isEditMode || (showPasswordFields && formData.password)) {
//         userData.password = formData.password;
//       }

//       if (isEditMode) {
//         await superManagerApi.updateUser(id, userData);
//         navigate('/supermanager/users', { state: { success: 'User updated successfully!' } });
//       } else {
//         await superManagerApi.createUser(userData);
//         navigate('/supermanager/users', { state: { success: 'User created successfully!' } });
//       }
//     } catch (error) {
//       console.error('Operation failed:', error);
//       setErrors({
//         ...errors,
//         apiError: error.response?.data?.message || error.message || 'Operation failed. Please try again.'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const togglePasswordFields = () => {
//     setShowPasswordFields(!showPasswordFields);
//     // Clear password fields when hiding them
//     if (!showPasswordFields) {
//       setFormData(prev => ({
//         ...prev,
//         password: '',
//         confirmPassword: ''
//       }));
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-md-2 sidebar p-0">
//           <div className="p-4 text-center">
//             <h4 className="text-primary fw-bold">TaskFlow</h4>
//             <p className="text-muted small">Admin Dashboard</p>
//           </div>
//           <ul className="nav flex-column px-3">
//             <li className="nav-item">
//               <Link className="nav-link" to="/supermanager">
//                 <i className="bi bi-speedometer2 me-2"></i>Dashboard
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link active" to="/supermanager/users">
//                 <i className="bi bi-people me-2"></i>Users
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/supermanager/projects">
//                 <i className="bi bi-kanban me-2"></i>Projects
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/supermanager/tasks">
//                 <i className="bi bi-list-task me-2"></i>Tasks
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/supermanager/reports">
//                 <i className="bi bi-graph-up me-2"></i>Reports
//               </Link>
//             </li>
//           </ul>
//         </div>

//         <div className="col-md-10 main-content">
//           <div className="header d-flex justify-content-between align-items-center mb-4">
//             <h4 className="mb-0">{isEditMode ? 'Edit User' : 'Add New User'}</h4>
//           </div>

//           <div className="card shadow-sm">
//             <div className="card-body">
//               {errors.apiError && (
//                 <div className="alert alert-danger mb-4">
//                   <i className="bi bi-exclamation-circle me-2"></i>
//                   {errors.apiError}
//                 </div>
//               )}

//               <form onSubmit={handleSubmit}>
//                 <div className="row g-3">
//                   <div className="col-md-6">
//                     <label className="form-label">Username*</label>
//                     <input
//                       type="text"
//                       className={`form-control ${errors.username ? 'is-invalid' : ''}`}
//                       name="username"
//                       value={formData.username}
//                       onChange={handleChange}
//                       disabled={isEditMode}
//                     />
//                     {errors.username && <div className="invalid-feedback">{errors.username}</div>}
//                   </div>

//                   <div className="col-md-6">
//                     <label className="form-label">Email*</label>
//                     <input
//                       type="email"
//                       className={`form-control ${errors.email ? 'is-invalid' : ''}`}
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                     />
//                     {errors.email && <div className="invalid-feedback">{errors.email}</div>}
//                   </div>

//                   <div className="col-md-6">
//                     <label className="form-label">Full Name</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="full_name"
//                       value={formData.full_name}
//                       onChange={handleChange}
//                     />
//                   </div>

//                   <div className="col-md-6">
//                     <label className="form-label">Role*</label>
//                     <select
//                       className="form-select"
//                       name="role"
//                       value={formData.role}
//                       onChange={handleChange}
//                     >
//                       <option value="supermanager">Super Manager</option>
//                       <option value="manager">Manager</option>
//                       <option value="employee">Employee</option>
//                     </select>
//                   </div>

//                   {!isEditMode ? (
//                     <>
//                       <div className="col-md-6">
//                         <label className="form-label">Password*</label>
//                         <input
//                           type="password"
//                           className={`form-control ${errors.password ? 'is-invalid' : ''}`}
//                           name="password"
//                           value={formData.password}
//                           onChange={handleChange}
//                         />
//                         {errors.password ? (
//                           <div className="invalid-feedback">{errors.password}</div>
//                         ) : (
//                           <div className="form-text">Minimum 8 characters</div>
//                         )}
//                       </div>

//                       <div className="col-md-6">
//                         <label className="form-label">Confirm Password*</label>
//                         <input
//                           type="password"
//                           className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
//                           name="confirmPassword"
//                           value={formData.confirmPassword}
//                           onChange={handleChange}
//                         />
//                         {errors.confirmPassword && (
//                           <div className="invalid-feedback">{errors.confirmPassword}</div>
//                         )}
//                       </div>
//                     </>
//                   ) : showPasswordFields && (
//                     <>
//                       <div className="col-md-6">
//                         <label className="form-label">New Password</label>
//                         <input
//                           type="password"
//                           className={`form-control ${errors.password ? 'is-invalid' : ''}`}
//                           name="password"
//                           value={formData.password}
//                           onChange={handleChange}
//                         />
//                         {errors.password && (
//                           <div className="invalid-feedback">{errors.password}</div>
//                         )}
//                       </div>

//                       <div className="col-md-6">
//                         <label className="form-label">Confirm New Password</label>
//                         <input
//                           type="password"
//                           className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
//                           name="confirmPassword"
//                           value={formData.confirmPassword}
//                           onChange={handleChange}
//                         />
//                         {errors.confirmPassword && (
//                           <div className="invalid-feedback">{errors.confirmPassword}</div>
//                         )}
//                       </div>
//                     </>
//                   )}

//                   {isEditMode && (
//                     <div className="col-12">
//                       <div className="form-check">
//                         <input
//                           type="checkbox"
//                           className="form-check-input"
//                           id="changePassword"
//                           checked={showPasswordFields}
//                           onChange={togglePasswordFields}
//                         />
//                         <label className="form-check-label" htmlFor="changePassword">
//                           Change Password
//                         </label>
//                       </div>
//                     </div>
//                   )}

//                   <div className="col-12 mt-4">
//                     <div className="d-flex justify-content-end gap-2">
//                       <button
//                         type="button"
//                         className="btn btn-outline-secondary"
//                         onClick={() => navigate('/supermanager/users')}
//                         disabled={loading}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className="btn btn-primary"
//                         disabled={loading}
//                       >
//                         {loading ? (
//                           <>
//                             <span className="spinner-border spinner-border-sm me-2"></span>
//                             {isEditMode ? 'Updating...' : 'Creating...'}
//                           </>
//                         ) : (
//                           <>
//                             <i className="bi bi-save me-2"></i>
//                             {isEditMode ? 'Update User' : 'Create User'}
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddUser;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { superManagerApi } from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SuperManagerDashboard.css';

const AddUser = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'employee',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'supermanager') {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const userData = await superManagerApi.getUser(id);
      setFormData({
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name || '',
        role: userData.role,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      navigate('/supermanager/users', { state: { error: 'Failed to load user data' } });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';

    // Only validate password if:
    // 1. Creating new user, or
    // 2. Editing user AND password fields are shown
    if (!isEditMode) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (showPasswordFields) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name || '',
        role: formData.role,
        is_active: true,
        password: formData.password,
        confirmPassword: formData.confirmPassword // Add this line
      };

      if (isEditMode) {
        await superManagerApi.updateUser(id, userData);
        navigate('/supermanager/users', { state: { success: 'User updated successfully!' } });
      } else {
        await superManagerApi.createUser(userData);
        navigate('/supermanager/users', { state: { success: 'User created successfully!' } });
      }
    } catch (error) {
      console.error('Operation failed:', error);
      const errorMessage = error.response?.data?.password ||
        error.response?.data?.message ||
        error.message ||
        'Operation failed. Please try again.';
      setErrors({
        ...errors,
        apiError: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    // Clear password fields when hiding them
    if (!showPasswordFields) {
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 sidebar p-0">
          <div className="p-4 text-center">
            <h4 className="text-primary fw-bold">TaskFlow</h4>
            <p className="text-muted small">Admin Dashboard</p>
          </div>
          <ul className="nav flex-column px-3">
            <li className="nav-item">
              <Link className="nav-link" to="/supermanager">
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/supermanager/users">
                <i className="bi bi-people me-2"></i>Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/supermanager/projects">
                <i className="bi bi-kanban me-2"></i>Projects
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/supermanager/tasks">
                <i className="bi bi-list-task me-2"></i>Tasks
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/supermanager/reports">
                <i className="bi bi-graph-up me-2"></i>Reports
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-md-10 main-content">
          <div className="header d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">{isEditMode ? 'Edit User' : 'Add New User'}</h4>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              {errors.apiError && (
                <div className="alert alert-danger mb-4">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {errors.apiError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Username*</label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isEditMode}
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email*</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Role*</label>
                    <select
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="supermanager">Super Manager</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>

                  {!isEditMode ? (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Password*</label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        {errors.password ? (
                          <div className="invalid-feedback">{errors.password}</div>
                        ) : (
                          <div className="form-text">Minimum 8 characters</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Confirm Password*</label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
                        )}
                      </div>
                    </>
                  ) : showPasswordFields && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
                        )}
                      </div>
                    </>
                  )}

                  {isEditMode && (
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="changePassword"
                          checked={showPasswordFields}
                          onChange={togglePasswordFields}
                        />
                        <label className="form-check-label" htmlFor="changePassword">
                          Change Password
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="col-12 mt-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/supermanager/users')}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            {isEditMode ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2"></i>
                            {isEditMode ? 'Update User' : 'Create User'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;