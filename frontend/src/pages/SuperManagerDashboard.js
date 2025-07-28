import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Sidebar from '../components/Sidebar';
import SuperManagerStats from '../pages/SuperManagerStats';
import QuickActions from '../pages/QuickActions';
import { superManagerApi } from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './SuperManagerDashboard.css';

const SuperManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    projects: false,
    users: false,
    activities: false
  });
  const [data, setData] = useState({
    projects: [],
    recentUsers: [],
    recentActivities: []
  });

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, projects: true, users: true, activities: true }));

      const [projects, users, activities] = await Promise.all([
        superManagerApi.getProjects(),
        superManagerApi.getUsers(),
        superManagerApi.getRecentActivities()
      ]);

      const processedUsers = users
        .map(user => ({
          ...user,
          is_active: user.is_active !== false,
          date_joined: new Date(user.date_joined)
        }))
        .filter(user => ['supermanager', 'manager', 'employee'].includes(user.role?.toLowerCase()))
        .sort((a, b) => b.date_joined - a.date_joined)
        .slice(0, 5);

      const processedActivities = activities
        .map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      setData({
        projects,
        recentUsers: processedUsers,
        recentActivities: processedActivities
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading({ projects: false, users: false, activities: false });
    }
  };

  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'supermanager') {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  const handleLogout = () => logout();

  const getBadgeClass = (type, value) => {
    if (type === 'role') {
      switch ((value || '').toLowerCase()) {
        case 'supermanager': return 'bg-danger';
        case 'manager': return 'bg-warning text-dark';
        case 'employee': return 'bg-primary';
        default: return 'bg-secondary';
      }
    }
    if (type === 'status') {
      switch ((value || '').toLowerCase()) {
        case 'completed': return 'bg-success';
        case 'in_progress': return 'bg-warning';
        default: return type === 'project' ? 'bg-info' : 'bg-secondary';
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />

        <div className="col-md-10 main-content">
          <div className="header d-flex justify-content-between align-items-center py-3">
            <h4 className="mb-0">Dashboard Overview</h4>
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

          <SuperManagerStats />

          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Recent Activity</h6>
                  <Link to="/activity" className="small">View All</Link>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {loading.activities ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : data.recentActivities.length === 0 ? (
                    <div className="text-center py-4 text-muted">No activities found</div>
                  ) : (
                    data.recentActivities.map(activity => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        getBadgeClass={getBadgeClass}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <QuickActions refreshData={fetchData} />

              <div className="card mt-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Recent Users</h6>
                  <Link to="/supermanager/users" className="small">View All</Link>
                </div>
                <div className="card-body p-0">
                  {loading.users ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"></div>
                    </div>
                  ) : (
                    <UserTable users={data.recentUsers} getBadgeClass={getBadgeClass} />
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

// Helper components
const ActivityItem = ({ activity, getBadgeClass }) => (
  <div className="activity-item mb-3 border-bottom pb-2">
    <div className="d-flex">
      <div className="me-3">
        <i className={`bi ${activity.type === 'project' ? 'bi-kanban' : 'bi-list-task'} fs-4 text-primary`}></i>
      </div>
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between">
          <strong>{activity.title}</strong>
          <small className="text-muted">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </small>
        </div>
        <div className="d-flex align-items-center mt-1 flex-wrap">
          <span className={`badge ${getBadgeClass('role', activity.user_role)} me-2 mb-1`}>
            {activity.user_role}
          </span>
          <span className={`badge ${getBadgeClass('status', activity.status)} me-2 mb-1`}>
            {activity.type === 'project' ? 'Project' : activity.status.replace('_', ' ')}
          </span>
          <small className="text-muted mb-1">
            {activity.action === 'created' ? 'Created' : 'Updated'} by {activity.user}
          </small>
        </div>
        {activity.description && (
          <p className="mb-0 mt-2 text-muted small">
            {activity.description.length > 100
              ? `${activity.description.substring(0, 100)}...`
              : activity.description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const UserTable = ({ users, getBadgeClass }) => (
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
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.full_name || user.username}</td>
            <td>
              <span className={`badge ${getBadgeClass('role', user.role)}`}>
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
);

export default SuperManagerDashboard;