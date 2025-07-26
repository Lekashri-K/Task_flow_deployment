import './SuperManagerDashboard.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { formatDistanceToNow } from 'date-fns';
import SuperManagerStats from './SuperManagerStats';
import QuickActions from './QuickActions';
import { superManagerApi } from '../api/api';

const SuperManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await superManagerApi.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchRecentUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await superManagerApi.getUsers();
      
      const processedUsers = data
        .map(user => ({
          ...user,
          is_active: user.is_active !== false,
          date_joined: new Date(user.date_joined)
        }))
        .filter(user => 
          user.role && 
          ['supermanager', 'manager', 'employee'].includes(user.role.toLowerCase())
        )
        .sort((a, b) => b.date_joined - a.date_joined)
        .slice(0, 5);
      
      setRecentUsers(processedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRecentActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await superManagerApi.getRecentActivities();
      const sortedActivities = data
        .map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'supermanager') {
      navigate('/login');
    } else {
      fetchProjects();
      fetchRecentUsers();
      fetchRecentActivities();
    }
  }, [user, navigate]);

  if (!user) {
    return <div className="d-flex justify-content-center mt-5">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeClass = (role) => {
    switch((role || '').toLowerCase()) {
      case 'supermanager': return 'bg-danger';
      case 'manager': return 'bg-warning text-dark';
      case 'employee': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getActivityIcon = (type) => {
    switch((type || '').toLowerCase()) {
      case 'project': return 'bi-kanban';
      case 'task': return 'bi-list-task';
      default: return 'bi-activity';
    }
  };

  const getStatusBadgeClass = (type, status) => {
    if (type === 'project') return 'bg-info';
    
    switch((status || '').toLowerCase()) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const formatStatus = (type, status) => {
    if (type === 'project') return 'Project';
    return status.replace('_', ' ');
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
              <Link className="nav-link active" to="/supermanager">
                <i className="bi bi-speedometer2 me-2"></i>Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/supermanager/users">
                <i className="bi bi-people me-2"></i>Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/projects">
                <i className="bi bi-kanban me-2"></i>Projects
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tasks">
                <i className="bi bi-list-task me-2"></i>Tasks
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reports">
                <i className="bi bi-graph-up me-2"></i>Reports
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-md-10 main-content">
          <div className="header d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Dashboard Overview</h4>
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

          <SuperManagerStats />

          <div className="row">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Recent Activity</h6>
                  <Link to="/activity" className="small">View All</Link>
                </div>
                <div className="card-body" style={{ overflowY: 'auto', maxHeight: '400px' }}>
                  {loadingActivities ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No recent activities found
                    </div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div className="activity-item mb-3 border-bottom pb-2" key={`${activity.type}-${activity.id}`}>
                        <div className="d-flex">
                          <div className="me-3">
                            <i className={`bi ${getActivityIcon(activity.type)} fs-4 text-primary`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <strong className="text-capitalize">{activity.title}</strong>
                              <small className="text-muted">
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                              </small>
                            </div>
                            <div className="d-flex align-items-center mt-1 flex-wrap">
                              <span className={`badge ${getRoleBadgeClass(activity.user_role)} me-2 mb-1`}>
                                {activity.user_role}
                              </span>
                              <span className={`badge ${getStatusBadgeClass(activity.type, activity.status)} me-2 mb-1`}>
                                {formatStatus(activity.type, activity.status)}
                              </span>
                              <small className="text-muted mb-1">
                                {activity.action === 'created' ? 'Created' : 'Updated'} by {activity.user}
                              </small>
                            </div>
                            <p className="mb-0 mt-2 text-muted small">
                              {activity.description && (activity.description.length > 100 
                                ? `${activity.description.substring(0, 100)}...` 
                                : activity.description)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <QuickActions 
                refreshProjects={fetchProjects}
                refreshUsers={fetchRecentUsers}
              />

              <div className="card mt-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Recent Users</h6>
                  <Link to="/supermanager/users" className="small">View All</Link>
                </div>
                <div className="card-body p-0">
                  {loadingUsers ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentUsers.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span>{user.full_name || user.username}</span>
                                </div>
                              </td>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperManagerDashboard;