import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { superManagerApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ refreshTasks = () => {}, refreshProjects = () => {}, refreshUsers = () => {} }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Modal visibility states
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    // Form data states
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
    });

    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        assigned_to: '',
        deadline: ''
    });

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        full_name: '',
        role: 'employee',
        password: '',
        confirmPassword: ''
    });

    // Data and UI states
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchProjectsAndUsers = async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                superManagerApi.getProjects(),
                superManagerApi.getUsers()
            ]);
            setProjects(projectsRes);
            setUsers(usersRes);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError('Failed to load required data. Please try again.');
        }
    };

    const handleShowModal = (modalType) => {
        setActiveModal(modalType);
        setError(null);
        setSuccess(null);
        fetchProjectsAndUsers();
        
        // Reset all modals first
        setShowTaskModal(false);
        setShowProjectModal(false);
        setShowUserModal(false);
        
        // Then show the requested modal
        switch (modalType) {
            case 'task': setShowTaskModal(true); break;
            case 'project': setShowProjectModal(true); break;
            case 'user': setShowUserModal(true); break;
            default: break;
        }
    };

    const handleInputChange = (e, formType) => {
        const { name, value } = e.target;
        switch (formType) {
            case 'task':
                setTaskData(prev => ({ ...prev, [name]: value }));
                break;
            case 'project':
                setProjectData(prev => ({ ...prev, [name]: value }));
                break;
            case 'user':
                setUserData(prev => ({ ...prev, [name]: value }));
                break;
            default: break;
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const formattedData = {
                ...taskData,
                project: parseInt(taskData.project),
                assigned_to: parseInt(taskData.assigned_to),
                due_date: taskData.due_date || null
            };

            const response = await superManagerApi.createTask(formattedData);
            
            if (response && (response.id || response.success)) {
                setSuccess('Task created successfully!');
                setTimeout(() => {
                    setShowTaskModal(false);
                    if (typeof refreshTasks === 'function') {
                        refreshTasks();
                    }
                    setTaskData({
                        title: '',
                        description: '',
                        project: '',
                        assigned_to: '',
                        due_date: '',
                        status: 'pending'
                    });
                }, 1000);
            } else {
                throw new Error('Received invalid response from server');
            }
        } catch (error) {
            console.error('Task creation failed:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const formattedData = {
                name: projectData.name.trim(),
                description: projectData.description.trim(),
                assigned_to: parseInt(projectData.assigned_to),
                deadline: projectData.deadline || null,
            };

            const response = await superManagerApi.createProject(formattedData);

            if (response && (response.id || response.success)) {
                setSuccess('Project created successfully!');
                setTimeout(() => {
                    setShowProjectModal(false);
                    if (typeof refreshProjects === 'function') {
                        refreshProjects();
                    }
                    setProjectData({
                        name: '',
                        description: '',
                        assigned_to: '',
                        deadline: ''
                    });
                }, 1000);
            } else {
                throw new Error('Received invalid response from server');
            }
        } catch (error) {
            console.error('Project creation error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            // Client-side validation
            if (userData.password !== userData.confirmPassword) {
                throw new Error("Passwords don't match");
            }

            if (userData.password.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }

            const response = await superManagerApi.createUser({
                username: userData.username,
                email: userData.email,
                full_name: userData.full_name,
                role: userData.role,
                password: userData.password,
                confirmPassword: userData.password
            });

            if (response && (response.id || response.success)) {
                setSuccess('User created successfully!');
                setTimeout(() => {
                    setShowUserModal(false);
                    if (typeof refreshUsers === 'function') {
                        refreshUsers();
                    }
                    setUserData({
                        username: '',
                        email: '',
                        full_name: '',
                        role: 'employee',
                        password: '',
                        confirmPassword: ''
                    });
                }, 1000);
            } else {
                throw new Error('Received invalid response from server');
            }
        } catch (error) {
            console.error('User creation failed:', error.response?.data || error.message);
            setError(
                error.response?.data?.password || 
                error.response?.data?.username || 
                error.response?.data?.email || 
                error.message ||
                'Failed to create user. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        navigate('/reports');
    };

    const handleCloseModal = () => {
        setShowTaskModal(false);
        setShowProjectModal(false);
        setShowUserModal(false);
        setError(null);
        setSuccess(null);
    };

    return (
        <>
            <div className="card mb-4">
                <div className="card-header">
                    <h6 className="mb-0">Quick Actions</h6>
                </div>
                <div className="card-body">
                    <div className="row g-2">
                        <div className="col-6">
                            <button 
                                className="btn btn-quick-action w-100 text-start p-3"
                                onClick={() => handleShowModal('user')}
                            >
                                <i className="bi bi-plus-circle me-2 text-primary"></i> Add User
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-quick-action w-100 text-start p-3"
                                onClick={() => handleShowModal('project')}
                            >
                                <i className="bi bi-kanban me-2 text-success"></i> Create Project
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-quick-action w-100 text-start p-3"
                                onClick={() => handleShowModal('task')}
                            >
                                <i className="bi bi-list-task me-2 text-info"></i> New Task
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-quick-action w-100 text-start p-3"
                                onClick={handleGenerateReport}
                            >
                                <i className="bi bi-file-earmark-text me-2 text-warning"></i> Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Modal */}
            <Modal show={showTaskModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Task</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleTaskSubmit}>
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Task Title *</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={taskData.title}
                                onChange={(e) => handleInputChange(e, 'task')}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={taskData.description}
                                onChange={(e) => handleInputChange(e, 'task')}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Project *</Form.Label>
                            <Form.Select
                                name="project"
                                value={taskData.project}
                                onChange={(e) => handleInputChange(e, 'task')}
                                required
                            >
                                <option value="">Select Project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Assign To *</Form.Label>
                            <Form.Select
                                name="assigned_to"
                                value={taskData.assigned_to}
                                onChange={(e) => handleInputChange(e, 'task')}
                                required
                            >
                                <option value="">Select Employee</option>
                                {users.filter(u => u.role === 'employee').map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="due_date"
                                value={taskData.due_date}
                                onChange={(e) => handleInputChange(e, 'task')}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={taskData.status}
                                onChange={(e) => handleInputChange(e, 'task')}
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creating...
                                </>
                            ) : 'Create Task'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Project Modal */}
            <Modal show={showProjectModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Project</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProjectSubmit}>
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Project Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={projectData.name}
                                onChange={(e) => handleInputChange(e, 'project')}
                                required
                                minLength={3}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={projectData.description}
                                onChange={(e) => handleInputChange(e, 'project')}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Assign To Manager *</Form.Label>
                            <Form.Select
                                name="assigned_to"
                                value={projectData.assigned_to}
                                onChange={(e) => handleInputChange(e, 'project')}
                                required
                            >
                                <option value="">Select Manager</option>
                                {users.filter(u => u.role === 'manager').map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                name="deadline"
                                value={projectData.deadline}
                                onChange={(e) => handleInputChange(e, 'project')}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creating...
                                </>
                            ) : 'Create Project'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* User Modal */}
            <Modal show={showUserModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New User</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUserSubmit}>
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Username *</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={(e) => handleInputChange(e, 'user')}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={(e) => handleInputChange(e, 'user')}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="full_name"
                                value={userData.full_name}
                                onChange={(e) => handleInputChange(e, 'user')}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Role *</Form.Label>
                            <Form.Select
                                name="role"
                                value={userData.role}
                                onChange={(e) => handleInputChange(e, 'user')}
                                required
                            >
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="supermanager">Super Manager</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password *</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={userData.password}
                                onChange={(e) => handleInputChange(e, 'user')}
                                required
                                minLength={8}
                            />
                            <Form.Text>Minimum 8 characters</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password *</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={userData.confirmPassword}
                                onChange={(e) => handleInputChange(e, 'user')}
                                required
                                minLength={8}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creating...
                                </>
                            ) : 'Create User'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default QuickActions;