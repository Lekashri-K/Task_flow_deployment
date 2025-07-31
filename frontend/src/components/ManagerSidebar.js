import React from 'react';
import { 
  BsHouse,
  BsClipboardCheck, 
  BsPlusSquare 
} from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

const ManagerSidebar = () => {
  const location = useLocation();

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItemStyle = (isActive) => ({
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#e9f5ff' : 'transparent',
    color: isActive ? '#0d6efd' : '#495057',
    marginBottom: '4px',
    fontWeight: isActive ? '600' : '400'
  });

  return (
    <div className="sidebar p-0 bg-white" style={{
      width: '250px',
      minHeight: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
    }}>
      <div className="p-4 text-center" style={{ borderBottom: '1px solid #eee' }}>
        <h4 className="text-dark fw-bold">TaskFlow</h4>
        <p className="text-muted small">Manager Portal</p>
      </div>
      
      <div className="p-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              to="/manager/dashboard"
              style={navItemStyle(isActive('/manager/dashboard', true))}
            >
              <BsHouse className="me-3" size={18} /> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/manager/tasks"
              style={navItemStyle(isActive('/manager/tasks'))}
            >
              <BsClipboardCheck className="me-3" size={18} /> View Projects
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/manager/createtask"
              style={navItemStyle(isActive('/manager/createtask'))}
            >
              <BsPlusSquare className="me-3" size={18} /> Create Task
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ManagerSidebar;