import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { superManagerApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const SuperManagerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_users: 0,
    active_projects: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await superManagerApi.getDashboardStats();
        setStats(response);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role?.toLowerCase() === 'supermanager') {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="row mb-4 g-3" style={{ minHeight: '120px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="col" key={i}>
            <div className="stat-card p-3 bg-white rounded-3 shadow-sm h-100">
              <div className="placeholder-glow">
                <h5 className="text-muted mb-2 placeholder col-6"></h5>
                <h3 className="mb-1 placeholder col-4"></h3>
                <small className="text-muted placeholder col-8"></small>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="row mb-4 g-3" style={{ minHeight: '120px' }}>
      {/* Total Users Card */}
      <div className="col">
        <Link to="/supermanager/users" className="text-decoration-none">
          <div className="stat-card p-3 bg-white rounded-3 shadow-sm h-100">
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="text-muted mb-2">Total Users</h5>
                <div className="icon bg-light-primary text-primary rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '36px', height: '36px', fontSize: '1rem'}}>
                  <i className="bi bi-people"></i>
                </div>
              </div>
              <h3 className="mb-1">{stats.total_users}</h3>
              <small className="text-muted">All registered users</small>
            </div>
          </div>
        </Link>
      </div>

      {/* Active Projects Card */}
      <div className="col">
        <Link to="/projects" className="text-decoration-none">
          <div className="stat-card p-3 bg-white rounded-3 shadow-sm h-100">
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="text-muted mb-2">Active Projects</h5>
                <div className="icon bg-light-success text-success rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                  <i className="bi bi-kanban"></i>
                </div>
              </div>
              <h3 className="mb-1">{stats.active_projects}</h3>
              <small className="text-muted">Currently running</small>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Pending Tasks Card - Now navigates to pending tasks section */}
      <div className="col">
        <Link to="/tasks#pending" className="text-decoration-none">
          <div className="stat-card p-3 bg-white rounded-3 shadow-sm h-100">
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="text-muted mb-2">Pending Tasks</h5>
                <div className="icon bg-light-warning text-warning rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                  <i className="bi bi-list-task"></i>
                </div>
              </div>
              <h3 className="mb-1">{stats.pending_tasks}</h3>
              <small className="text-muted">Awaiting completion</small>
            </div>
          </div>
        </Link>
      </div>

      {/* In Progress Tasks Card - Now navigates to in-progress tasks section */}
      <div className="col">
        <Link to="/tasks#inProgress" className="text-decoration-none">
          <div className="stat-card p-3 bg-white rounded-3 shadow-sm h-100">
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="text-muted mb-2">In Progress</h5>
                <div className="icon bg-light-info text-info rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                  <i className="bi bi-hourglass-split"></i>
                </div>
              </div>
              <h3 className="mb-1">{stats.in_progress_tasks}</h3>
              <small className="text-muted">Currently working</small>
            </div>
          </div>
        </Link>
      </div>

      {/* Completed Tasks Card - Now navigates to completed tasks section */}
      <div className="col">
        <Link to="/tasks#completed" className="text-decoration-none">
          <div className="stat-card p-3 bg-white rounded-3 shadow-sm h-100">
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="text-muted mb-2">Completed</h5>
                <div className="icon bg-light-success text-success rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
              <h3 className="mb-1">{stats.completed_tasks}</h3>
              <small className="text-muted">Finished tasks</small>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SuperManagerStats;