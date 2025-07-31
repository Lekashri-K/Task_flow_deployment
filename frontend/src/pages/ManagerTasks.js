import React, { useState, useEffect } from 'react';
import {
    BsCheckCircle, BsClock, BsExclamationTriangle,
    BsPencil, BsTrash, BsFilter, BsSearch, BsX,
    BsChevronLeft, BsChevronRight, BsExclamationCircle,
    BsPersonCircle, BsBoxArrowRight, BsListUl
} from 'react-icons/bs';
import {
    Card, Table, Badge, Button,
    Form, InputGroup, Spinner, Alert, Modal,
    Pagination, Navbar, Nav, Dropdown, Container, Row, Col, ListGroup
} from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ManagerSidebar from '../components/ManagerSidebar';
import { managerApi, authApi } from '../api/api';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ManagerTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        due_date: '',
        project: ''
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
    const tasksPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await authApi.getCurrentUser();
                setCurrentUser(user);

                const [tasksResponse, projectsResponse] = await Promise.all([
                    managerApi.getTasksByProject(''),
                    managerApi.getProjects()
                ]);
                // Add isOverdue flag to each task
                const tasksWithOverdue = tasksResponse.map(task => ({
                    ...task,
                    isOverdue: task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                }));
                setTasks(tasksWithOverdue);
                setProjects(projectsResponse);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                setLoading(false);
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);

    // Calculate task statistics for charts
    const calculateTaskStats = () => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
        const overdueTasks = tasks.filter(task => task.isOverdue).length;

        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            overdueTasks,
            completionPercentage
        };
    };

    const taskStats = calculateTaskStats();

    // Get pending tasks for the pending tasks section
    const pendingTasks = tasks.filter(task => task.status === 'pending');

    // Data for doughnut chart
    const doughnutChartData = {
        labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
        datasets: [
            {
                data: [
                    taskStats.completedTasks,
                    taskStats.inProgressTasks,
                    taskStats.pendingTasks,
                    taskStats.overdueTasks
                ],
                backgroundColor: [
                    '#28a745', // Completed - green
                    '#007bff', // In Progress - blue
                    '#ffc107', // Pending - yellow
                    '#dc3545'  // Overdue - red
                ],
                borderColor: [
                    '#28a745',
                    '#007bff',
                    '#ffc107',
                    '#dc3545'
                ],
                borderWidth: 1,
            },
        ],
    };

    const doughnutChartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
            setError('Failed to logout. Please try again.');
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Filter by status
        if (filter === 'overdue') {
            if (!task.isOverdue) return false;
        } else if (filter !== 'all' && task.status !== filter) {
            return false;
        }

        // Filter by search term
        if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        return true;
    });

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEditClick = (task) => {
        setCurrentTask(task);
        setEditFormData({
            title: task.title,
            description: task.description,
            status: task.status,
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
            project: task.project?.id || ''
        });
        setShowEditModal(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...editFormData,
                project: editFormData.project ? parseInt(editFormData.project) : null,
                due_date: editFormData.due_date || null
            };

            await managerApi.updateTask(currentTask.id, dataToSend);
            setShowEditModal(false);

            const updatedTasks = await managerApi.getTasksByProject('');
            // Update isOverdue flag after edit
            const tasksWithOverdue = updatedTasks.map(task => ({
                ...task,
                isOverdue: task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
            }));
            setTasks(tasksWithOverdue);
            setCurrentPage(1);
        } catch (err) {
            setError('Failed to update task. ' + (err.response?.data?.message || 'Please try again.'));
            console.error('Error updating task:', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await managerApi.deleteTask(taskId);
                setTasks(tasks.filter(task => task.id !== taskId));
                if (currentTasks.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (err) {
                setError('Failed to delete task. ' + (err.response?.data?.message || 'Please try again.'));
                console.error('Error deleting task:', err);
            }
        }
    };

    const resetFilters = () => {
        setFilter('all');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const getStatusBadge = (status, isOverdue) => {
        if (isOverdue) {
            return (
                <Badge bg="danger" className="d-flex align-items-center">
                    <BsExclamationCircle className="me-1" /> Overdue
                </Badge>
            );
        }

        switch (status) {
            case 'completed':
                return <Badge bg="success" className="d-flex align-items-center">
                    <BsCheckCircle className="me-1" /> Completed
                </Badge>;
            case 'in_progress':
                return <Badge bg="primary" className="d-flex align-items-center">
                    <BsClock className="me-1" /> In Progress
                </Badge>;
            case 'pending':
                return <Badge bg="warning" className="d-flex align-items-center">
                    <BsExclamationTriangle className="me-1" /> Pending
                </Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : '-';
    };

    const formatDueDate = (dueDate, isOverdue) => {
        if (!dueDate) return '-';

        const date = new Date(dueDate);
        const formattedDate = date.toLocaleDateString();

        return isOverdue ? (
            <span className="text-danger fw-bold">
                {formattedDate} <BsExclamationCircle />
            </span>
        ) : formattedDate;
    };

    if (loading) {
        return (
            <div className="d-flex">
                <ManagerSidebar />
                <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                        <Spinner animation="border" variant="primary" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex">
                <ManagerSidebar />
                <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex">
            <ManagerSidebar />
            <div className="flex-grow-1" style={{ marginLeft: '250px', backgroundColor: '#f8f9fa' }}>
                {/* Top Navigation Bar */}
                <Navbar
                    bg="white"
                    expand="lg"
                    className="shadow-sm"
                    style={{
                        margin: '1rem 1rem 0rem 1rem', // top, right, bottom, left
                        borderRadius: '0.75rem',
                        padding: '0.5rem 1rem',
                        border: '1px solid #dee2e6',
                    }}
                >
                    <Container fluid>
                        <Navbar.Brand
                            className="mb-0"
                            style={{ fontSize: '1.5rem', fontWeight: '600' }}
                        >
                            Manager Dashboard
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                            <Nav>
                                <Dropdown align="end">
                                    <Dropdown.Toggle
                                        variant="link"
                                        id="dropdown-basic"
                                        className="d-flex align-items-center text-decoration-none"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#0d6efd',
                                            padding: '0.5rem 1rem',
                                        }}
                                    >
                                        <BsPersonCircle className="me-1" size={20} />
                                        {currentUser?.full_name || currentUser?.username || 'User'}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item disabled>
                                            <small className="text-muted">
                                                Signed in as {currentUser?.role}
                                            </small>
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item
                                            onClick={handleLogout}
                                            className="text-primary"
                                            style={{ background: 'transparent' }}
                                        >
                                            <BsBoxArrowRight className="me-2" /> Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <div className="p-4">
                    {/* Task Summary Cards */}
                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="card-title mb-0">Total Tasks</h6>
                                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                                            <BsCheckCircle className="text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="mb-0">{taskStats.totalTasks}</h3>
                                    <small className="text-muted">All tasks assigned</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="card-title mb-0">Completed</h6>
                                        <div className="bg-success bg-opacity-10 p-2 rounded">
                                            <BsCheckCircle className="text-success" />
                                        </div>
                                    </div>
                                    <h3 className="mb-0">{taskStats.completedTasks}</h3>
                                    <small className="text-muted">{taskStats.completionPercentage}% of total</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="card-title mb-0">In Progress</h6>
                                        <div className="bg-primary bg-opacity-10 p-2 rounded">
                                            <BsClock className="text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="mb-0">{taskStats.inProgressTasks}</h3>
                                    <small className="text-muted">Currently working on</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="card-title mb-0">Overdue</h6>
                                        <div className="bg-danger bg-opacity-10 p-2 rounded">
                                            <BsExclamationTriangle className="text-danger" />
                                        </div>
                                    </div>
                                    <h3 className="mb-0">{taskStats.overdueTasks}</h3>
                                    <small className="text-muted">Past due date</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Charts Row */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="mb-3">Task Completion</Card.Title>
                                    <div
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            margin: '0 auto',
                                        }}
                                    >
                                        <CircularProgressbar
                                            value={taskStats.completionPercentage}
                                            text={`${taskStats.completionPercentage}%`}
                                            styles={buildStyles({
                                                pathColor: `rgba(40, 167, 69, ${taskStats.completionPercentage / 100})`,
                                                textColor: '#212529',
                                                trailColor: '#e9ecef',
                                                textSize: '14px',
                                            })}
                                        />
                                    </div>
                                    <div className="text-center mt-2">
                                        <small className="text-muted">
                                            {taskStats.completedTasks} of {taskStats.totalTasks} tasks completed
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="mb-3">Task Status Distribution</Card.Title>
                                    <div style={{ height: '180px' }}>
                                        <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Pending Tasks Section */}
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Card.Title className="mb-0">Pending Tasks</Card.Title>
                                <Badge bg="warning" pill>
                                    {taskStats.pendingTasks} Pending
                                </Badge>
                            </div>

                            {pendingTasks.length > 0 ? (
                                <ListGroup variant="flush">
                                    {pendingTasks.slice(0, 5).map(task => (
                                        <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{task.title}</h6>
                                                <small className="text-muted">
                                                    Project: {getProjectName(task.project)} |
                                                    Due: {formatDueDate(task.due_date, task.isOverdue)}
                                                </small>
                                            </div>
                                            <div>
                                                <Button style={{ height: '35px', width: '35px' }}
                                                    variant="primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditClick(task)}
                                                >
                                                    <BsPencil />
                                                </Button>
                                                <Button style={{ height: '35px', width: '35px' }}
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <BsTrash />
                                                </Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                    {pendingTasks.length > 5 && (
                                        <ListGroup.Item className="text-center">
                                            <Button variant="link" onClick={() => setFilter('pending')}>
                                                View all {taskStats.pendingTasks} pending tasks
                                            </Button>
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            ) : (
                                <Alert variant="info" className="mb-0">
                                    No pending tasks at the moment.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Task Table */}
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div style={{ width: '250px' }}>
                                    <InputGroup size="sm">
                                        <InputGroup.Text>
                                            <BsSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search tasks..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                        {searchTerm && (
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setSearchTerm('')}
                                                size="sm"
                                            >
                                                <BsX />
                                            </Button>
                                        )}
                                    </InputGroup>
                                </div>

                                <div className="d-flex align-items-center">
                                    <Form.Select
                                        value={filter}
                                        onChange={(e) => {
                                            setFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        style={{ width: '150px' }}
                                        size="sm"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="overdue">Overdue</option>
                                    </Form.Select>

                                    <Button style={{ color: 'white' }}
                                        variant="outline-secondary"
                                        onClick={resetFilters}
                                        disabled={filter === 'all' && !searchTerm}
                                        className="ms-2"
                                        size="sm"
                                    >
                                        <BsFilter /> Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Project</th>
                                            <th>Assigned To</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTasks.length > 0 ? (
                                            currentTasks.map(task => (
                                                <tr
                                                    key={task.id}
                                                    className={task.isOverdue ? 'table-danger' : ''}
                                                >
                                                    <td>
                                                        {task.isOverdue && <BsExclamationCircle className="text-danger me-1" />}
                                                        {task.title}
                                                    </td>
                                                    <td>{task.description}</td>
                                                    <td>{getProjectName(task.project)}</td>
                                                    <td>{task.assigned_to_details?.full_name || task.assigned_to}</td>
                                                    <td>{formatDueDate(task.due_date, task.isOverdue)}</td>
                                                    <td>{getStatusBadge(task.status, task.isOverdue)}</td>
                                                    <td>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleEditClick(task)}
                                                        >
                                                            <BsPencil />
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteTask(task.id)}
                                                        >
                                                            <BsTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    No tasks found matching your criteria
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            {filteredTasks.length > tasksPerPage && (
                                <div className="d-flex justify-content-end mt-3">
                                    <Pagination size="sm">
                                        <Pagination.Prev
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <BsChevronLeft />
                                        </Pagination.Prev>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                            <Pagination.Item
                                                key={number}
                                                active={number === currentPage}
                                                onClick={() => paginate(number)}
                                            >
                                                {number}
                                            </Pagination.Item>
                                        ))}

                                        <Pagination.Next
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <BsChevronRight />
                                        </Pagination.Next>
                                    </Pagination>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Task</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleEditSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={editFormData.title}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditFormChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Project *</Form.Label>
                                    <Form.Select
                                        name="project"
                                        value={editFormData.project}
                                        onChange={handleEditFormChange}
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
                                    <Form.Label>Status *</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={editFormData.status}
                                        onChange={handleEditFormChange}
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date (Optional)</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="due_date"
                                        value={editFormData.due_date || ''}
                                        onChange={handleEditFormChange}
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-end">
                                    <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit">
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default ManagerTasks;