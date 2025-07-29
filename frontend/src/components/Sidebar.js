// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="col-md-2 sidebar p-0">
      <div className="p-4 text-center">
  <h4 className="text-dark fw-bold">TaskFlow</h4>
  <p className="text-muted small">{user.role} Dashboard</p>
</div>
      <ul className="nav flex-column px-3">
        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname === '/supermanager' ? 'active' : ''}`}
            to="/supermanager"
          >
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname.startsWith('/supermanager/users') ? 'active' : ''}`}
            to="/supermanager/users"
          >
            <i className="bi bi-people me-2"></i>Users
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
            to="/projects"
          >
            <i className="bi bi-kanban me-2"></i>Projects
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname.startsWith('/tasks') ? 'active' : ''}`}
            to="/tasks"
          >
            <i className="bi bi-list-task me-2"></i>Tasks

          </Link>
        </li>
        <li className="nav-item">
          <Link
            className={`nav-link ${location.pathname.startsWith('/reports') ? 'active' : ''}`}
            to="/reports"
          >
            <i className="bi bi-graph-up me-2"></i>Reports
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;