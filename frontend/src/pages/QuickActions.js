import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { superManagerApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ refreshTasks, refreshProjects, refreshUsers }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Task Modal State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
    });

    // Project Modal State
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        assigned_to: '',
        deadline: ''
    });

    // User Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        full_name: '',
        role: 'employee',
        password: ''
    });

    // Shared State
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

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
        }
    };

    const handleShowModal = (modalType) => {
        setActiveModal(modalType);
        fetchProjectsAndUsers();
        switch (modalType) {
            case 'task':
                setShowTaskModal(true);
                break;
            case 'project':
                setShowProjectModal(true);
                break;
            case 'user':
                setShowUserModal(true);
                break;
            default:
                break;
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
            default:
                break;
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formattedData = {
                ...taskData,
                project: parseInt(taskData.project),
                assigned_to: parseInt(taskData.assigned_to),
                due_date: taskData.due_date || null
            };

            await superManagerApi.createTask(formattedData);
            setShowTaskModal(false);
            refreshTasks();
            setTaskData({
                title: '',
                description: '',
                project: '',
                assigned_to: '',
                due_date: '',
                status: 'pending'
            });
        } catch (error) {
            console.error('Task creation failed:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Format data for backend
            const formattedData = {
                name: projectData.name.trim(),
                description: projectData.description.trim(),
                assigned_to: parseInt(projectData.assigned_to),
                deadline: projectData.deadline || null,
            };

            console.log('Sending project data:', formattedData); // Debug log

            const response = await superManagerApi.createProject(formattedData);
            console.log('Backend response:', response); // Debug log

            if (response && response.id) {
                setShowProjectModal(false);
                refreshProjects();
                setProjectData({
                    name: '',
                    description: '',
                    assigned_to: '',
                    deadline: ''
                });
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Project creation error:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert(`Failed to create project: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await superManagerApi.createUser(userData);
            setShowUserModal(false);
            refreshUsers();
            setUserData({
                username: '',
                email: '',
                full_name: '',
                role: 'employee',
                password: ''
            });
        } catch (error) {
            console.error('User creation failed:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        navigate('/reports');
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
            <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Task</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleTaskSubmit}>
                    <Modal.Body>
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
                        <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Project Modal */}
            <Modal show={showProjectModal} onHide={() => setShowProjectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Project</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProjectSubmit}>
                    <Modal.Body>
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
                        <Button variant="secondary" onClick={() => setShowProjectModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* User Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New User</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUserSubmit}>
                    <Modal.Body>
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
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default QuickActions;