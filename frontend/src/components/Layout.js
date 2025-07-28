// src/components/Layout.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar activePath={location.pathname} />
        
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
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;