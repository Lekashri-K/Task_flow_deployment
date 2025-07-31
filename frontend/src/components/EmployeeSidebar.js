import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="sidebar p-0" style={{ width: '250px', minHeight: '100vh', backgroundColor: '#f8f9fa', borderRight: '1px solid #dee2e6' }}>
      <div className="p-4 text-center">
        <h4 className="text-dark fw-bold">TaskFlow</h4>
        <p className="text-muted small">{user.role} Dashboard</p>
      </div>
      <ul className="nav flex-column px-3">
        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname === '/employee' ? 'active' : ''}`}
            to="/employee"
          >
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname.startsWith('/employee/tasks') ? 'active' : ''}`}
            to="/employee/tasks"
          >
            <i className="bi bi-list-task me-2"></i>View Tasks
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default EmployeeSidebar;