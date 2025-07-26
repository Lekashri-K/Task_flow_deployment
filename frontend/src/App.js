import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import SuperManagerDashboard from './pages/SuperManagerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Unauthorized from './pages/Unauthorized';
import UserManagement from './pages/UserManagement';
import AddUser from './pages/AddUser';  // Import the AddUser component

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<PrivateRoute allowedRoles={['supermanager']} />}>
        <Route path="/supermanager" element={<SuperManagerDashboard />} />
        <Route path="/supermanager/users" element={<UserManagement />} />
        <Route path="/supermanager/users/create" element={<AddUser />} />
        <Route path="/supermanager/users/edit/:id" element={<AddUser />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['manager']} />}>
        <Route path="/manager/*" element={<ManagerDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['employee']} />}>
        <Route path="/employee/*" element={<EmployeeDashboard />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;