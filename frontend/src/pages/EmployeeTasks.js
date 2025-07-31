import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Row, Col, Card, Spinner, Alert, Button,
  Dropdown, Modal, Form, Badge, Stack, Table, Navbar, Nav
} from 'react-bootstrap';
import {
  BsCheckCircle, BsClock, BsExclamationTriangle, BsFilter,
  BsCalendar, BsFolder, BsSearch,
  BsX, BsGrid, BsListUl, BsPersonCircle, BsBoxArrowRight
} from 'react-icons/bs';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeApi } from '../api/api';

const EmployeeSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="sidebar p-0" style={{
      width: '250px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 1000
    }}>
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

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [status, setStatus] = useState('pending');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [projects, setProjects] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await employeeApi.getTasks();
        const tasksData = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse.data || []);
        setTasks(tasksData);

        const extractedProjects = tasksData.reduce((acc, task) => {
          if (task.project && typeof task.project === 'object' && task.project.name) {
            if (!acc.some(p => p.id === task.project.id)) {
              acc.push({ id: task.project.id, name: task.project.name });
            }
          } else if (task.project_name) {
            if (!acc.some(p => p.name === task.project_name)) {
              acc.push({ id: task.project, name: task.project_name });
            }
          } else if (task.project && typeof task.project === 'string' && !acc.some(p => p.name === task.project)) {
            acc.push({ id: task.project, name: task.project });
          }
          return acc;
        }, []);

        setProjects(extractedProjects);
      } catch (err) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedTask) return;

    try {
      setLoading(true);
      const response = await employeeApi.updateTaskStatus(selectedTask.id, status);

      if (response.error) {
        throw new Error(response.error);
      }

      setTasks(tasks.map(task =>
        task.id === selectedTask.id ? { ...task, status } : task
      ));
      setShowUpdateModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = (task) => {
    if (task.project_name) return task.project_name;
    if (task.project && typeof task.project === 'object' && task.project.name) {
      return task.project.name;
    }
    if (typeof task.project === 'string') {
      return task.project;
    }
    if (projects.length > 0 && task.project) {
      const project = projects.find(p => p.id === task.project);
      return project?.name || 'No Project';
    }
    return 'No Project';
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      if (projectFilter !== 'all') {
        const taskProjectName = getProjectName(task);
        if (!taskProjectName || taskProjectName !== projectFilter) {
          return false;
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const taskProjectName = getProjectName(task).toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          taskProjectName.includes(query)
        );
      }

      return true;
    });
  }, [tasks, statusFilter, projectFilter, searchQuery]);

  const StatusBadge = ({ status }) => {
    const statusMap = {
      completed: { icon: <BsCheckCircle />, variant: 'success', text: 'Completed' },
      in_progress: { icon: <BsClock />, variant: 'primary', text: 'In Progress' },
      pending: { icon: <BsExclamationTriangle />, variant: 'warning', text: 'Pending' }
    };

    const current = statusMap[status] || { icon: null, variant: 'secondary', text: 'Unknown' };

    return (
      <Badge bg={current.variant} className="d-flex align-items-center">
        {current.icon} <span className="ms-1">{current.text}</span>
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Navbar
        bg="white"
        expand="lg"
        className="shadow-sm"
        style={{
          flexShrink: 0,
          margin: '1rem 1rem 0.25rem 270px', // top, right, bottom, left (accounts for sidebar)
          borderRadius: '0.75rem',
          padding: '0.5rem 1rem',
          border: '1px solid #dee2e6',
        }}
      >
        <Container fluid>
          <Navbar.Brand
            className="mb-0"
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
            }}
          >
            Task Management
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
                  {user?.full_name || user?.username || 'User'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item disabled>
                    <small className="text-muted">
                      Signed in as {user?.role || 'Employee'}
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


      <div className="d-flex flex-grow-1">
        <EmployeeSidebar />
        <div className="flex-grow-1" style={{ marginLeft: '250px', padding: '20px' }}>
          <Container fluid>
            <Row className="mb-3 align-items-center">
              <Col md={8} className="mb-2 mb-md-0">
                <div className="d-flex flex-column flex-md-row gap-2">
                  <div className="flex-grow-1">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <BsSearch />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-start-0"
                      />
                      {searchQuery && (
                        <Button
                          variant="light"
                          onClick={() => setSearchQuery('')}
                          className="border-start-0"
                        >
                          <BsX />
                        </Button>
                      )}
                    </div>
                  </div>

                  <Dropdown style={{ marginTop: '10px' }}>
                    <Dropdown.Toggle variant="light" className="filter-toggle d-flex align-items-center">
                      <BsFilter className="me-2" />
                      {statusFilter === 'all' ? 'All Statuses' :
                        statusFilter === 'completed' ? 'Completed' :
                          statusFilter === 'in_progress' ? 'In Progress' : 'Pending'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setStatusFilter('all')}>All Statuses</Dropdown.Item>
                      <Dropdown.Item onClick={() => setStatusFilter('completed')}>Completed</Dropdown.Item>
                      <Dropdown.Item onClick={() => setStatusFilter('in_progress')}>In Progress</Dropdown.Item>
                      <Dropdown.Item onClick={() => setStatusFilter('pending')}>Pending</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  {projects.length > 0 && (
                    <Dropdown style={{ marginTop: '10px' }}>
                      <Dropdown.Toggle variant="light" className="filter-toggle d-flex align-items-center">
                        <BsFolder className="me-2" />
                        {projectFilter === 'all' ? 'All Projects' : projectFilter}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setProjectFilter('all')}>All Projects</Dropdown.Item>
                        {projects.map((project) => (
                          <Dropdown.Item
                            key={project.id}
                            onClick={() => setProjectFilter(project.name)}
                          >
                            {project.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </Col>

              <Col md={4} className="text-md-end">
                <div className="d-inline-flex">
                  <Button
                    variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewMode('cards')}
                    title="Card View"
                    size="sm"
                    className="me-2"
                  >
                    <BsGrid />
                  </Button>
                  <Button style={{color:'white'}}
                    variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                    size="sm"
                  >
                    <BsListUl />
                  </Button>
                </div>
              </Col>
            </Row>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            ) : filteredTasks.length === 0 ? (
              <Alert variant="info">
                No tasks found matching your criteria
              </Alert>
            ) : viewMode === 'cards' ? (
              <Row xs={1} md={2} lg={3} className="g-4">
                {filteredTasks.map((task) => (
                  <Col key={task.id}>
                    <Card className="h-100 shadow-sm">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-1 text-truncate" style={{ maxWidth: '200px' }}>
                            {task.title}
                          </Card.Title>
                          <StatusBadge status={task.status} />
                        </div>

                        <div className="d-flex align-items-center mb-3">
                          <BsFolder className="text-muted me-2" />
                          <span className="text-truncate" style={{ maxWidth: '180px' }}>
                            {getProjectName(task)}
                          </span>
                        </div>

                        <Card.Text className="text-muted small mb-3 flex-grow-1">
                          {task.description || 'No description provided'}
                        </Card.Text>

                        <Stack direction="horizontal" className="justify-content-between align-items-center">
                          <div className="d-flex align-items-center text-muted small">
                            <BsCalendar className="me-2" />
                            <span>Due: {formatDate(task.due_date)}</span>
                          </div>
                          {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                            <Badge bg="danger">Overdue</Badge>
                          )}
                        </Stack>
                      </Card.Body>
                      <Card.Footer className="bg-white border-top-0">
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-100"
                          onClick={() => {
                            setSelectedTask(task);
                            setStatus(task.status);
                            setShowUpdateModal(true);
                          }}
                        >
                          Update Status
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="mb-4">
                <Card.Body className="p-0">
                  <Table hover responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Project</th>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map(task => (
                        <tr key={task.id}>
                          <td>
                            <div className="fw-semibold">{task.title}</div>
                          </td>
                          <td>
                            <Badge bg="light" text="dark">
                              {getProjectName(task)}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {task.description || '-'}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsCalendar className="me-2 text-muted" />
                              <span>{formatDate(task.due_date)}</span>
                              {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                                <Badge bg="danger" className="ms-2">Overdue</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={task.status} />
                          </td>
                          <td>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task);
                                setStatus(task.status);
                                setShowUpdateModal(true);
                              }}
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Update Task Status</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Task</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedTask?.title || ''}
                      readOnly
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Project</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedTask ? getProjectName(selectedTask) : ''}
                      readOnly
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedTask?.due_date ? formatDate(selectedTask.due_date) : 'No due date'}
                      readOnly
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Status</Form.Label>
                    <Form.Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={loading}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStatusUpdate}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTasks;