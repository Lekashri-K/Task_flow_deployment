// // src/App.js
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/Login';
// import PrivateRoute from './components/PrivateRoute';
// import SuperManagerDashboard from './pages/SuperManagerDashboard';
// import ManagerDashboard from './pages/ManagerDashboard';
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import Unauthorized from './pages/Unauthorized';
// import UserManagement from './pages/UserManagement';
// import AddUser from './pages/AddUser';
// import ProjectsPage from './pages/ProjectsPage'; // Add this import
// import ProjectDetailsPage from './pages/ProjectDetailsPage';
// import TasksPage from './pages/TasksPage';
// import Reports from './pages/Reports';
// import ManagerTasks from './pages/ManagerTasks';
// import CreateTask from './pages/CreateTask';

// function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/unauthorized" element={<Unauthorized />} />

//       <Route element={<PrivateRoute allowedRoles={['supermanager']} />}>
//         <Route path="/supermanager" element={<SuperManagerDashboard />} />
//         <Route path="/supermanager/users" element={<UserManagement />} />
//         <Route path="/supermanager/users/create" element={<AddUser />} />
//         <Route path="/supermanager/users/edit/:id" element={<AddUser />} />
//       </Route>

//       <Route element={<PrivateRoute allowedRoles={['manager']} />}>
//        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
//         <Route path="/manager/tasks" element={<ManagerTasks />} />
//         <Route path="/manager/createtask" element={<CreateTask />} />
//         <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
//         <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
//       </Route>

//       <Route element={<PrivateRoute allowedRoles={['employee']} />}>
//         <Route path="/employee/*" element={<EmployeeDashboard />} />
//       </Route>

//       <Route element={<PrivateRoute allowedRoles={['supermanager', 'manager']} />}>
//         <Route path="/projects" element={<ProjectsPage />} />
//         <Route path="/projects/create" element={<div>Create Project Form</div>} />
//         <Route path="/projects/:id" element={<ProjectDetailsPage />} />
//         <Route path="/tasks" element={<TasksPage />} />
//         <Route path="/reports" element={<Reports />} />
//         <Route path="/manager/dashboard" element={<ManagerDashboard />} />
//         {/* <Route path="/manager/projects" element={<ManagerProjects />} />
//         <Route path="/manager/tasks" element={<ManagerTasks />} />
//         <Route path="/manager/add-task" element={<AddTask />} /> */}

//       </Route>

//       <Route path="/" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default App;
// src/App.js
// src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import SuperManagerDashboard from './pages/SuperManagerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Unauthorized from './pages/Unauthorized';
import UserManagement from './pages/UserManagement';
import AddUser from './pages/AddUser';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import TasksPage from './pages/TasksPage';
import Reports from './pages/Reports';
import ManagerTasks from './pages/ManagerTasks';
import CreateTask from './pages/CreateTask';
import Home from './pages/home'; // Home page
import { useAuth } from './context/AuthContext'; // Auth context
import EmployeeTasks from './pages/EmployeeTasks';
function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Show home page when visiting root */}
      <Route path="/" element={<Home />} />

      {/* Direct login path */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated routes */}
      <Route element={<PrivateRoute allowedRoles={['supermanager']} />}>
        <Route path="/supermanager" element={<SuperManagerDashboard />} />
        <Route path="/supermanager/users" element={<UserManagement />} />
        <Route path="/supermanager/users/create" element={<AddUser />} />
        <Route path="/supermanager/users/edit/:id" element={<AddUser />} />
      </Route>

      {/* <Route element={<PrivateRoute allowedRoles={['manager']} />}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/tasks" element={<ManagerTasks />} />
        <Route path="/manager/createtask" element={<CreateTask />} />
        <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
      </Route> */}
       <Route element={<PrivateRoute allowedRoles={['manager']} />}>
        {/* Now renders ManagerTasks as dashboard */}
        <Route path="/manager/dashboard" element={<ManagerTasks />} />

        {/* Now renders ManagerDashboard as tasks */}
        <Route path="/manager/tasks" element={<ManagerDashboard />} />

        <Route path="/manager/createtask" element={<CreateTask />} />
        <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['employee']} />}>
       <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/tasks" element={<EmployeeTasks />} />
        <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['supermanager', 'manager']} />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/create" element={<div>Create Project Form</div>} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Fallback route for unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
