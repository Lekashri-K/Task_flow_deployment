// import React, { useState, useEffect } from 'react';
// import { useLocation, Link } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import { useAuth } from '../context/AuthContext';
// import { superManagerApi } from '../api/api';

// const TasksPage = () => {
//     const location = useLocation();
//     const { user, logout } = useAuth();
//     const [activeTab, setActiveTab] = useState('pending');
//     const [showTaskModal, setShowTaskModal] = useState(false);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//     const [taskToDelete, setTaskToDelete] = useState(null);
//     const [currentTask, setCurrentTask] = useState({
//         id: null,
//         title: '',
//         description: '',
//         project: '',
//         assigned_to: '',
//         due_date: '',
//         status: 'pending'
//     });
//     const [tasks, setTasks] = useState({
//         pending: [],
//         inProgress: [],
//         completed: []
//     });
//     const [loading, setLoading] = useState(true);
//     const [projects, setProjects] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchTasks();
//         fetchProjects();
//         fetchEmployees();
//     }, []);

//     useEffect(() => {
//         if (location.hash) {
//             const tabFromHash = location.hash.substring(1);
//             if (['pending', 'inProgress', 'completed'].includes(tabFromHash)) {
//                 setActiveTab(tabFromHash);
//                 setTimeout(() => {
//                     const element = document.getElementById(tabFromHash);
//                     if (element) {
//                         element.scrollIntoView({ behavior: 'smooth' });
//                     }
//                 }, 100);
//             }
//         }
//     }, [location]);

//     const fetchTasks = async () => {
//         try {
//             setLoading(true);
//             const response = await superManagerApi.getTasks();

//             const groupedTasks = {
//                 pending: response.filter(task => task.status === 'pending'),
//                 inProgress: response.filter(task => task.status === 'in_progress'),
//                 completed: response.filter(task => task.status === 'completed')
//             };

//             setTasks(groupedTasks);
//             setError(null);
//         } catch (error) {
//             console.error('Failed to fetch tasks:', error);
//             setError('Failed to load tasks. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchProjects = async () => {
//         try {
//             const response = await superManagerApi.getProjects();
//             setProjects(response);
//         } catch (error) {
//             console.error('Failed to fetch projects:', error);
//             setError('Failed to load projects. Please try again.');
//         }
//     };

//     const fetchEmployees = async () => {
//         try {
//             const response = await superManagerApi.getUsers();
//             setEmployees(response.filter(user => user.role === 'employee'));
//         } catch (error) {
//             console.error('Failed to fetch employees:', error);
//             setError('Failed to load employees. Please try again.');
//         }
//     };

//     const handleLogout = () => {
//         logout();
//     };

//     const handleTaskSubmit = async () => {
//         try {
//             setLoading(true);
//             const formattedTask = {
//                 title: currentTask.title,
//                 description: currentTask.description,
//                 project: parseInt(currentTask.project),
//                 assigned_to: currentTask.assigned_to ? parseInt(currentTask.assigned_to) : null,
//                 due_date: currentTask.due_date || null,
//                 status: currentTask.status
//             };

//             if (currentTask.id) {
//                 await superManagerApi.updateTask(currentTask.id, formattedTask);
//             } else {
//                 await superManagerApi.createTask(formattedTask);
//             }

//             await fetchTasks();
//             closeTaskModal();
//             setError(null);
//         } catch (error) {
//             console.error('Failed to save task:', error);
//             setError(error.response?.data?.message || `Failed to ${currentTask.id ? 'update' : 'create'} task. Please try again.`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleStatusChange = async (taskId, newStatus) => {
//         try {
//             await superManagerApi.updateTaskStatus(taskId, newStatus);
//             await fetchTasks();
//         } catch (error) {
//             console.error('Failed to update task status:', error);
//             setError('Failed to update task status. Please try again.');
//         }
//     };

//     const handleDeleteTask = async () => {
//         try {
//             setLoading(true);
//             await superManagerApi.deleteTask(taskToDelete);
//             await fetchTasks();
//             setShowDeleteConfirm(false);
//             setTaskToDelete(null);
//             setError(null);
//         } catch (error) {
//             console.error('Failed to delete task:', error);
//             setError('Failed to delete task. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const openEditModal = (task) => {
//         setCurrentTask({
//             id: task.id,
//             title: task.title,
//             description: task.description || '',
//             project: task.project?.id?.toString() || '',
//             assigned_to: task.assigned_to?.id?.toString() || '',
//             due_date: task.due_date?.split('T')[0] || '',
//             status: task.status
//         });
//         setShowTaskModal(true);
//     };

//     const openCreateModal = () => {
//         setCurrentTask({
//             id: null,
//             title: '',
//             description: '',
//             project: '',
//             assigned_to: '',
//             due_date: '',
//             status: 'pending'
//         });
//         setShowTaskModal(true);
//     };

//     const closeTaskModal = () => {
//         setShowTaskModal(false);
//         setCurrentTask({
//             id: null,
//             title: '',
//             description: '',
//             project: '',
//             assigned_to: '',
//             due_date: '',
//             status: 'pending'
//         });
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     const getProjectName = (projectId) => {
//         const project = projects.find(p => p.id === projectId);
//         return project ? `${project.name}` : 'No Project';
//     };

//     const getAssigneeName = (task) => {
//         if (task.assigned_to && typeof task.assigned_to === 'object') {
//             return task.assigned_to.full_name || 'Unassigned';
//         }
//         if (task.assigned_to) {
//             const employee = employees.find(e => e.id === task.assigned_to);
//             return employee ? employee.full_name : 'Unassigned';
//         }
//         return 'Unassigned';
//     };

//     const renderTaskCard = (task, status) => (
//         <div key={task.id} className="card mb-3 shadow-sm task-card-hover">
//             <div className="card-body">
//                 <div className="d-flex justify-content-between align-items-start">
//                     <div>
//                         <h5 className="card-title">{task.title}</h5>
//                         <div className="d-flex flex-wrap gap-2 mb-2">
//                             <span className="badge bg-light text-dark small">
//                                 <i className="bi bi-folder me-1"></i> {getProjectName(task.project)}
//                             </span>
//                             <span className="badge bg-light text-dark small">
//                                 <i className="bi bi-person me-1"></i> {getAssigneeName(task)}
//                             </span>
//                         </div>
//                     </div>
//                     <div className="text-end">
//                         <small className="text-muted d-block">Due: {formatDate(task.due_date)}</small>
//                         {status === 'completed' && (
//                             <small className="text-success d-block">Completed: {formatDate(task.completed_date)}</small>
//                         )}
//                     </div>
//                 </div>

//                 <div className="d-flex justify-content-between align-items-center mt-3">
//                     <small className="text-muted">
//                         Created: {formatDate(task.created_at)}
//                     </small>
//                     <div className="d-flex gap-2">
//                         {status !== 'completed' && (
//                             <>
//                                 <button style={{ color: 'white' }}
//                                     className="btn btn-sm btn-outline-primary py-0 px-2"
//                                     onClick={() => openEditModal(task)}
//                                 >
//                                     <i className="bi bi-pencil"></i> Edit
//                                 </button>
//                                 <button
//                                     className="btn btn-sm btn-outline-danger py-0 px-2"
//                                     onClick={() => {
//                                         setTaskToDelete(task.id);
//                                         setShowDeleteConfirm(true);
//                                     }}
//                                 >
//                                     <i className="bi bi-trash"></i> Delete
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
//     if (loading) {
//         return (
//             <div className="container-fluid">
//                 <div className="row">
//                     <Sidebar />
//                     <div className="col-md-10 main-content">
//                         <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
//                             <div className="spinner-border text-primary" role="status">
//                                 <span className="visually-hidden">Loading...</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container-fluid">
//             <div className="row">
//                 <Sidebar />

//                 <div className="col-md-10 main-content">
//                     <div className="header d-flex justify-content-between align-items-center py-3">
//                         <h4 className="mb-0">Task Overview</h4>
//                         <div className="d-flex align-items-center gap-3">
//                             <button
//                                 className="btn btn-primary btn-sm"
//                                 onClick={openCreateModal}
//                             >
//                                 <i className="bi bi-plus"></i> Create Task
//                             </button>
//                             <div className="dropdown">
//                                 <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown">
//                                     <i className="bi bi-person-circle user-avatar me-2 fs-2"></i>
//                                     <span className="d-none d-md-inline">{user.full_name || 'Super Manager'}</span>
//                                 </a>
//                                 <ul className="dropdown-menu dropdown-menu-end">
//                                     <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
//                                     <li><Link className="dropdown-item" to="/settings"><i className="bi bi-gear me-2"></i>Settings</Link></li>
//                                     <li><hr className="dropdown-divider" /></li>
//                                     <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>

//                     {error && (
//                         <div className="alert alert-danger alert-dismissible fade show" role="alert">
//                             {error}
//                             <button type="button" className="btn-close" onClick={() => setError(null)}></button>
//                         </div>
//                     )}

//                     <ul className="nav nav-tabs nav-tabs-custom">
//                         <li className="nav-item">
//                             <button
//                                 className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
//                                 onClick={() => {
//                                     setActiveTab('pending');
//                                     window.history.pushState(null, '', '/tasks#pending');
//                                 }}
//                             >
//                                 <i className="bi bi-hourglass-top me-2"></i>
//                                 Pending
//                                 <span className="badge bg-primary rounded-pill ms-2">{tasks.pending.length}</span>
//                             </button>
//                         </li>
//                         <li className="nav-item">
//                             <button
//                                 className={`nav-link ${activeTab === 'inProgress' ? 'active' : ''}`}
//                                 onClick={() => {
//                                     setActiveTab('inProgress');
//                                     window.history.pushState(null, '', '/tasks#inProgress');
//                                 }}
//                             >
//                                 <i className="bi bi-arrow-repeat me-2"></i>
//                                 In Progress
//                                 <span className="badge bg-warning rounded-pill ms-2">{tasks.inProgress.length}</span>
//                             </button>
//                         </li>
//                         <li className="nav-item">
//                             <button
//                                 className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
//                                 onClick={() => {
//                                     setActiveTab('completed');
//                                     window.history.pushState(null, '', '/tasks#completed');
//                                 }}
//                             >
//                                 <i className="bi bi-check-circle me-2"></i>
//                                 Completed
//                                 <span className="badge bg-success rounded-pill ms-2">{tasks.completed.length}</span>
//                             </button>
//                         </li>
//                     </ul>

//                     <div className="tab-content p-4 bg-white rounded-bottom shadow-sm">
//                         {activeTab === 'pending' && (
//                             <div id="pending">
//                                 {tasks.pending.length > 0 ? (
//                                     tasks.pending.map(task => renderTaskCard(task, 'pending'))
//                                 ) : (
//                                     <div className="text-center py-5">
//                                         <i className="bi bi-check2-all display-5 text-muted mb-3"></i>
//                                         <h5 className="text-muted">No pending tasks</h5>
//                                         <p className="text-muted small">All caught up! Create a new task to get started.</p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                         {activeTab === 'inProgress' && (
//                             <div id="inProgress">
//                                 {tasks.inProgress.length > 0 ? (
//                                     tasks.inProgress.map(task => renderTaskCard(task, 'inProgress'))
//                                 ) : (
//                                     <div className="text-center py-5">
//                                         <i className="bi bi-arrow-repeat display-5 text-muted mb-3"></i>
//                                         <h5 className="text-muted">No tasks in progress</h5>
//                                         <p className="text-muted small">Start working on pending tasks to see them here.</p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                         {activeTab === 'completed' && (
//                             <div id="completed">
//                                 {tasks.completed.length > 0 ? (
//                                     tasks.completed.map(task => renderTaskCard(task, 'completed'))
//                                 ) : (
//                                     <div className="text-center py-5">
//                                         <i className="bi bi-emoji-smile display-5 text-muted mb-3"></i>
//                                         <h5 className="text-muted">No completed tasks yet</h5>
//                                         <p className="text-muted small">Complete some tasks to see them listed here.</p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Task Modal */}
//             {showTaskModal && (
//                 <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">
//                                     {currentTask.id ? 'Edit Task' : 'Create New Task'}
//                                 </h5>
//                                 <button
//                                     type="button"
//                                     className="btn-close"
//                                     onClick={closeTaskModal}
//                                 ></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="mb-3">
//                                     <label className="form-label">Task Title*</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         value={currentTask.title}
//                                         onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
//                                         required
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Description</label>
//                                     <textarea
//                                         className="form-control"
//                                         value={currentTask.description}
//                                         onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
//                                         rows="3"
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Project*</label>
//                                     <select
//                                         className="form-select"
//                                         value={currentTask.project || ''}
//                                         onChange={(e) => setCurrentTask({ ...currentTask, project: e.target.value })}
//                                         required
//                                     >
//                                         <option value="">Select a project</option>
//                                         {projects.map(project => (
//                                             <option key={project.id} value={project.id}>
//                                                 {project.name} ({project.assigned_to?.full_name || 'Unassigned'})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Assign To</label>
//                                     <select
//                                         className="form-select"
//                                         value={currentTask.assigned_to || ''}
//                                         onChange={(e) => setCurrentTask({ ...currentTask, assigned_to: e.target.value })}
//                                     >
//                                         <option value="">Unassigned</option>
//                                         {employees.map(employee => (
//                                             <option key={employee.id} value={employee.id}>
//                                                 {employee.full_name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Status*</label>
//                                     <select
//                                         className="form-select"
//                                         value={currentTask.status}
//                                         onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
//                                         required
//                                     >
//                                         <option value="pending">Pending</option>
//                                         <option value="in_progress">In Progress</option>
//                                         <option value="completed">Completed</option>
//                                     </select>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Due Date</label>
//                                     <input
//                                         type="date"
//                                         className="form-control"
//                                         value={currentTask.due_date || ''}
//                                         onChange={(e) => setCurrentTask({ ...currentTask, due_date: e.target.value })}
//                                         min={new Date().toISOString().split('T')[0]}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={closeTaskModal}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-primary"
//                                     onClick={handleTaskSubmit}
//                                     disabled={loading || !currentTask.title || !currentTask.project}
//                                 >
//                                     {loading ? 'Saving...' : currentTask.id ? 'Update Task' : 'Create Task'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Delete Confirmation Modal */}
//             {showDeleteConfirm && (
//                 <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Confirm Delete</h5>
//                                 <button
//                                     type="button"
//                                     className="btn-close"
//                                     onClick={() => setShowDeleteConfirm(false)}
//                                 ></button>
//                             </div>
//                             <div className="modal-body">
//                                 <p>Are you sure you want to delete this task? This action cannot be undone.</p>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={() => setShowDeleteConfirm(false)}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-danger"
//                                     onClick={handleDeleteTask}
//                                     disabled={loading}
//                                 >
//                                     {loading ? 'Deleting...' : 'Delete Task'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TasksPage;
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { superManagerApi } from '../api/api';

const TasksPage = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [currentTask, setCurrentTask] = useState({
        id: null,
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
    });
    const [tasks, setTasks] = useState({
        pending: [],
        inProgress: [],
        completed: []
    });
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchEmployees();
        fetchManagers();
    }, []);

    useEffect(() => {
        if (location.hash) {
            const tabFromHash = location.hash.substring(1);
            if (['pending', 'inProgress', 'completed'].includes(tabFromHash)) {
                setActiveTab(tabFromHash);
                setTimeout(() => {
                    const element = document.getElementById(tabFromHash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        }
    }, [location]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await superManagerApi.getTasks();

            const tasksWithOverdue = response.map(task => ({
                ...task,
                is_overdue: task.due_date &&
                    new Date(task.due_date) < new Date() &&
                    task.status !== 'completed'
            }));

            const groupedTasks = {
                pending: tasksWithOverdue.filter(task => task.status === 'pending'),
                inProgress: tasksWithOverdue.filter(task => task.status === 'in_progress'),
                completed: tasksWithOverdue.filter(task => task.status === 'completed')
            };

            setTasks(groupedTasks);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            setError('Failed to load tasks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await superManagerApi.getProjects();
            setProjects(response);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            setError('Failed to load projects. Please try again.');
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await superManagerApi.getUsers();
            setEmployees(response.filter(user => user.role === 'employee'));
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            setError('Failed to load employees. Please try again.');
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await superManagerApi.getUsers();
            setManagers(response.filter(user => user.role === 'manager'));
        } catch (error) {
            console.error('Failed to fetch managers:', error);
            setError('Failed to load managers. Please try again.');
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleTaskSubmit = async () => {
        try {
            setLoading(true);
            // Format data for backend
            const formattedTask = {
                title: currentTask.title.trim(),
                description: currentTask.description?.trim() || '',
                project: parseInt(currentTask.project),
                assigned_to: currentTask.assigned_to ? parseInt(currentTask.assigned_to) : null,
                due_date: currentTask.due_date || null,
                status: currentTask.status,
                // assigned_by will be automatically set by backend from request user
            };

            console.log('Sending task data:', formattedTask); // Debug log

            // Validate required fields
            if (!formattedTask.title || !formattedTask.project) {
                throw new Error('Title and Project are required fields');
            }

            let response;
            if (currentTask.id) {
                response = await superManagerApi.updateTask(currentTask.id, formattedTask);
            } else {
                response = await superManagerApi.createTask(formattedTask);
            }

            console.log('Backend response:', response); // Debug log

            if (response && (response.id || currentTask.id)) {
                await fetchTasks();
                closeTaskModal();
                setError(null);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Task operation failed:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError(error.response?.data?.message || error.message ||
                `Failed to ${currentTask.id ? 'update' : 'create'} task. Please try again.`);
        } finally {
            setLoading(false);
        }
    };
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await superManagerApi.updateTaskStatus(taskId, newStatus);
            await fetchTasks();
        } catch (error) {
            console.error('Failed to update task status:', error);
            setError('Failed to update task status. Please try again.');
        }
    };

    const handleDeleteTask = async () => {
        try {
            setLoading(true);
            await superManagerApi.deleteTask(taskToDelete);
            await fetchTasks();
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
            setError(null);
        } catch (error) {
            console.error('Failed to delete task:', error);
            setError('Failed to delete task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (task) => {
        setCurrentTask({
            id: task.id,
            title: task.title,
            description: task.description || '',
            project: task.project?.id?.toString() || '',
            assigned_to: task.assigned_to?.id?.toString() || '',
            due_date: task.due_date?.split('T')[0] || '',
            status: task.status
        });
        setShowTaskModal(true);
    };

    const openCreateModal = () => {
        setCurrentTask({
            id: null,
            title: '',
            description: '',
            project: '',
            assigned_to: '',
            due_date: '',
            status: 'pending'
        });
        setShowTaskModal(true);
    };

    const closeTaskModal = () => {
        setShowTaskModal(false);
        setCurrentTask({
            id: null,
            title: '',
            description: '',
            project: '',
            assigned_to: '',
            due_date: '',
            status: 'pending'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? `${project.name}` : 'No Project';
    };

    const getAssigneeName = (task) => {
        if (task.assigned_to && typeof task.assigned_to === 'object') {
            return task.assigned_to.full_name || 'Unassigned';
        }
        if (task.assigned_to) {
            const employee = employees.find(e => e.id === task.assigned_to);
            return employee ? employee.full_name : 'Unassigned';
        }
        return 'Unassigned';
    };

    const getManagerName = (project) => {
        if (project.assigned_to && typeof project.assigned_to === 'object') {
            return project.assigned_to.full_name || 'Unassigned';
        }
        if (project.assigned_to) {
            const manager = managers.find(m => m.id === project.assigned_to);
            return manager ? manager.full_name : 'Unassigned';
        }
        return 'Unassigned';
    };

    const renderTaskCard = (task, status) => (
        <div key={task.id} className="card mb-3 shadow-sm task-card-hover">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 className="card-title">{task.title}</h5>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="badge bg-light text-dark small">
                                <i className="bi bi-folder me-1"></i> {getProjectName(task.project)}
                            </span>
                            <span className="badge bg-light text-dark small">
                                <i className="bi bi-person me-1"></i> {getAssigneeName(task)}
                            </span>
                        </div>
                    </div>
                    <div className="text-end">
                        <small className="text-muted d-block">Due: {formatDate(task.due_date)}</small>
                        {task.is_overdue && (
                            <small className="text-danger d-block">Overdue</small>
                        )}
                        {status === 'completed' && (
                            <small className="text-success d-block">Completed: {formatDate(task.completed_date)}</small>
                        )}
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                        Created: {formatDate(task.created_at)}
                    </small>
                    <div className="d-flex gap-2">
                        {status !== 'completed' ? (
                            <>
                                <button style={{ color: 'white' }}
                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                    onClick={() => openEditModal(task)}
                                >
                                    <i className="bi bi-pencil"></i> Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger py-0 px-2"
                                    onClick={() => {
                                        setTaskToDelete(task.id);
                                        setShowDeleteConfirm(true);
                                    }}
                                >
                                    <i className="bi bi-trash"></i> Delete
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                    setTaskToDelete(task.id);
                                    setShowDeleteConfirm(true);
                                }}
                            >
                                <i className="bi bi-trash"></i> Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="row">
                    <Sidebar />
                    <div className="col-md-10 main-content">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <Sidebar />

                <div className="col-md-10 main-content">
                    <div className="header d-flex justify-content-between align-items-center py-3">
                        <h4 className="mb-0">Task Overview</h4>
                        <div className="d-flex align-items-center gap-3">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={openCreateModal}
                            >
                                <i className="bi bi-plus"></i> Create Task
                            </button>
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

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}

                    <ul className="nav nav-tabs nav-tabs-custom">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('pending');
                                    window.history.pushState(null, '', '/tasks#pending');
                                }}
                            >
                                <i className="bi bi-hourglass-top me-2"></i>
                                Pending
                                <span className="badge bg-primary rounded-pill ms-2">{tasks.pending.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'inProgress' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('inProgress');
                                    window.history.pushState(null, '', '/tasks#inProgress');
                                }}
                            >
                                <i className="bi bi-arrow-repeat me-2"></i>
                                In Progress
                                <span className="badge bg-warning rounded-pill ms-2">{tasks.inProgress.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab('completed');
                                    window.history.pushState(null, '', '/tasks#completed');
                                }}
                            >
                                <i className="bi bi-check-circle me-2"></i>
                                Completed
                                <span className="badge bg-success rounded-pill ms-2">{tasks.completed.length}</span>
                            </button>
                        </li>
                    </ul>

                    <div className="tab-content p-4 bg-white rounded-bottom shadow-sm">
                        {activeTab === 'pending' && (
                            <div id="pending">
                                {tasks.pending.length > 0 ? (
                                    tasks.pending.map(task => renderTaskCard(task, 'pending'))
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-check2-all display-5 text-muted mb-3"></i>
                                        <h5 className="text-muted">No pending tasks</h5>
                                        <p className="text-muted small">All caught up! Create a new task to get started.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'inProgress' && (
                            <div id="inProgress">
                                {tasks.inProgress.length > 0 ? (
                                    tasks.inProgress.map(task => renderTaskCard(task, 'inProgress'))
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-arrow-repeat display-5 text-muted mb-3"></i>
                                        <h5 className="text-muted">No tasks in progress</h5>
                                        <p className="text-muted small">Start working on pending tasks to see them here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'completed' && (
                            <div id="completed">
                                {tasks.completed.length > 0 ? (
                                    tasks.completed.map(task => renderTaskCard(task, 'completed'))
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-emoji-smile display-5 text-muted mb-3"></i>
                                        <h5 className="text-muted">No completed tasks yet</h5>
                                        <p className="text-muted small">Complete some tasks to see them listed here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Task Modal */}
            {showTaskModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {currentTask.id ? 'Edit Task' : 'Create New Task'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeTaskModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Task Title*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentTask.title}
                                        onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        value={currentTask.description}
                                        onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Project*</label>
                                    <select
                                        className="form-select"
                                        value={currentTask.project || ''}
                                        onChange={(e) => setCurrentTask({ ...currentTask, project: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a project</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.name} (Manager: {getManagerName(project)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Assign To</label>
                                    <select
                                        className="form-select"
                                        value={currentTask.assigned_to || ''}
                                        onChange={(e) => setCurrentTask({ ...currentTask, assigned_to: e.target.value })}
                                    >
                                        <option value="">Unassigned</option>
                                        {employees.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status*</label>
                                    <select
                                        className="form-select"
                                        value={currentTask.status}
                                        onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Due Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={currentTask.due_date || ''}
                                        onChange={(e) => setCurrentTask({ ...currentTask, due_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeTaskModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleTaskSubmit}
                                    disabled={loading || !currentTask.title || !currentTask.project}
                                >
                                    {loading ? 'Saving...' : currentTask.id ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteConfirm(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteTask}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;