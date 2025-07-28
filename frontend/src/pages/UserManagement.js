import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { superManagerApi } from '../api/api';
import './UserManagement.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from '../components/Sidebar';

const UserManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'supermanager') {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await superManagerApi.getUsers();
      // Filter out users with no role
      const filteredData = data.filter(user => user.role);
      setUsers(filteredData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await superManagerApi.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        setSuccessMessage('User deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'all' || 
      user.role?.toLowerCase() === roleFilter.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRoleBadgeClass = (role) => {
    switch((role || '').toLowerCase()) {
      case 'supermanager': return 'bg-danger';
      case 'manager': return 'bg-warning text-dark';
      case 'employee': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
         <Sidebar />

        <div className="col-md-10 main-content">
          <div className="header d-flex justify-content-between align-items-center">
            <h4 className="mb-0">User Management</h4>
            <div className="d-flex align-items-center">
              <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle user-avatar me-2 fs-2"></i>
                  <span className="d-none d-md-inline">{user.full_name || 'Super Manager'}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
                  <li><Link className="dropdown-item" to="/settings"><i className="bi bi-gear me-2"></i>Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show mt-3">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
            </div>
          )}

          <div className="row mb-4">
            <div className="col-md-6">
              <h2>All Users</h2>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
              <Link to="/supermanager/users/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>Add New User
              </Link>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="row align-items-center g-2">
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by username, name or email..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="supermanager">Super Manager</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <div className="d-flex justify-content-end">
                    <span className="text-muted align-self-center me-3">
                      {filteredUsers.length} users found
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <i className="bi bi-person-circle fs-4"></i>
                              </div>
                              <div>
                                <strong>{user.full_name || 'No Name'}</strong>
                                <div className="text-muted small">
                                  Joined: {formatDate(user.date_joined)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex">
                              <Link 
                                to={`/supermanager/users/edit/${user.id}`} 
                                className="btn btn-sm btn-outline-primary me-2"
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button 
                                className="btn btn-sm btn-danger"  // Changed to btn-danger for red color
                                onClick={() => handleDeleteUser(user.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No users found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card-footer bg-white">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="text-muted small mb-2 mb-md-0">
                  Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link text-dark"  // Changed text color
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button 
                          onClick={() => paginate(number)} 
                          className="page-link text-dark"  // Changed text color
                        >
                          {number}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link text-dark"  // Changed text color
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;