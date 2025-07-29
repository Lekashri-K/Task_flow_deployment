import React, { useState, useEffect } from 'react';
import {
  BsPerson, BsCalendar, BsCheckCircle, BsClock,
  BsExclamationTriangle, BsPlus, BsPencil, BsTrash,
  BsPersonCircle, BsBoxArrowRight
} from 'react-icons/bs';
import {
  Alert, Button, Card, Spinner, Row, Col,
  Badge, ProgressBar, ListGroup, Modal, Form,
  Navbar, Nav, Dropdown, Container
} from 'react-bootstrap';
import ManagerSidebar from '../components/ManagerSidebar';
import { authApi, managerApi } from '../api/api';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState({
    projects: true,
    tasks: true,
    employees: true,
    form: false,
    initialLoad: true
  });
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'pending',
    project: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);

        const [projectsResponse, employeesResponse] = await Promise.all([
          managerApi.getProjects(),
          managerApi.getEmployees()
        ]);

        setProjects(projectsResponse);
        setEmployees(employeesResponse);

        const tasksPromises = projectsResponse.map(project =>
          managerApi.getTasksByProject(project.id)
        );
        const tasksResponses = await Promise.all(tasksPromises);

        const initialProjectTasks = {};
        projectsResponse.forEach((project, index) => {
          initialProjectTasks[project.id] = tasksResponses[index];
        });

        setProjectTasks(initialProjectTasks);

        if (projectsResponse.length > 0) {
          setSelectedProject(projectsResponse[0]);
        }

        setLoading(prev => ({
          ...prev,
          projects: false,
          employees: false,
          tasks: false,
          initialLoad: false
        }));
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading({
          projects: false,
          tasks: false,
          employees: false,
          form: false,
          initialLoad: false
        });
      }
    };

    fetchData();
  }, []);

  const fetchTasksForProject = async (projectId) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const tasksResponse = await managerApi.getTasksByProject(projectId);

      setProjectTasks(prev => ({
        ...prev,
        [projectId]: tasksResponse
      }));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const handleProjectSelect = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setSelectedProject(project);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));

    try {
      const newTask = {
        ...taskData,
        project: selectedProject.id,
        assigned_by: (await authApi.getCurrentUser()).id,
        due_date: taskData.due_date || null
      };

      const createdTask = await managerApi.createTask(newTask);

      setProjectTasks(prev => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] || []), createdTask]
      }));

      const updatedProjects = projects.map(p => {
        if (p.id === selectedProject.id) {
          const tasks = projectTasks[p.id] || [];
          const totalTasks = tasks.length + 1;
          const completedTasks = tasks.filter(t => t.status === 'completed').length +
            (taskData.status === 'completed' ? 1 : 0);
          const progress = Math.floor((completedTasks / totalTasks) * 100);

          return {
            ...p,
            totalTasks,
            completedTasks,
            progress
          };
        }
        return p;
      });

      setProjects(updatedProjects);
      setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));

      setTaskData({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'pending',
        project: ''
      });
      setShowTaskForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, form: true }));

    try {
      const updatedTask = await managerApi.updateTask(
        currentTask.id,
        {
          ...taskData,
          due_date: taskData.due_date || null
        }
      );

      setProjectTasks(prev => ({
        ...prev,
        [selectedProject.id]: prev[selectedProject.id].map(task =>
          task.id === currentTask.id ? updatedTask : task
        )
      }));

      if (currentTask.status !== taskData.status) {
        const updatedProjects = projects.map(p => {
          if (p.id === selectedProject.id) {
            const tasks = projectTasks[p.id] || [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const progress = Math.floor((completedTasks / totalTasks) * 100);

            return {
              ...p,
              totalTasks,
              completedTasks,
              progress
            };
          }
          return p;
        });

        setProjects(updatedProjects);
        setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));
      }

      setShowEditTaskModal(false);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await managerApi.deleteTask(taskId);

      const deletedTask = projectTasks[selectedProject.id].find(t => t.id === taskId);
      setProjectTasks(prev => ({
        ...prev,
        [selectedProject.id]: prev[selectedProject.id].filter(task => task.id !== taskId)
      }));

      if (deletedTask) {
        const updatedProjects = projects.map(p => {
          if (p.id === selectedProject.id) {
            const tasks = projectTasks[p.id] || [];
            const totalTasks = tasks.length - 1;
            const completedTasks = tasks.filter(t => t.status === 'completed').length -
              (deletedTask.status === 'completed' ? 1 : 0);
            const progress = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0;

            return {
              ...p,
              totalTasks,
              completedTasks,
              progress
            };
          }
          return p;
        });

        setProjects(updatedProjects);
        setSelectedProject(updatedProjects.find(p => p.id === selectedProject.id));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const openEditTaskModal = (task) => {
    setCurrentTask(task);
    setTaskData({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to?.id?.toString() || '',
      due_date: task.due_date || '',
      status: task.status,
      project: task.project
    });
    setShowEditTaskModal(true);
  };

  const getStatusBadge = (task) => {
    const isOverdue = task.is_overdue;

    if (isOverdue) {
      return { variant: 'danger', icon: <BsExclamationTriangle />, text: 'Overdue' };
    }

    switch (task.status) {
      case 'completed': return { variant: 'success', icon: <BsCheckCircle />, text: 'Completed' };
      case 'in_progress': return { variant: 'primary', icon: <BsClock />, text: 'In Progress' };
      case 'pending': return { variant: 'warning', icon: <BsExclamationTriangle />, text: 'Pending' };
      default: return { variant: 'secondary', icon: null, text: 'Unknown' };
    }
  };

  const getCurrentProjectTasks = () => {
    if (!selectedProject) return [];
    return projectTasks[selectedProject.id] || [];
  };

  const calculateProjectProgress = (project) => {
    const tasks = projectTasks[project.id] || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      totalTasks,
      completedTasks,
      progress
    };
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

  const enhancedSelectedProject = selectedProject
    ? calculateProjectProgress(selectedProject)
    : null;

  if (loading.initialLoad) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <ManagerSidebar />

      <div className="flex-grow-1" style={{
        marginLeft: '250px',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        {/* Top Navigation Bar */}
        <Navbar bg="white" expand="lg" className="shadow-sm">
          <Container fluid>
            <Navbar.Brand className="mb-0" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
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
                      padding: '0.5rem 1rem'
                    }}
                  >
                    <BsPersonCircle className="me-1" size={20} />
                    {currentUser?.full_name || currentUser?.username || 'User'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item disabled>
                      <small className="text-muted">Signed in as {currentUser?.role}</small>
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
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-white">
                  <h5>My Projects</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {projects.length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted">No projects assigned</p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {projects.map(project => {
                        const tasks = projectTasks[project.id] || [];
                        return (
                          <ListGroup.Item
                            key={project.id}
                            action
                            active={selectedProject?.id === project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className="border-0"
                            style={{
                              backgroundColor: selectedProject?.id === project.id ? '#e9f5ff' : 'inherit',
                              fontWeight: selectedProject?.id === project.id ? '600' : 'normal'
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{project.name}</span>
                              <Badge bg="primary" pill>
                                {tasks.length}
                              </Badge>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={9}>
              {enhancedSelectedProject ? (
                <>
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">{enhancedSelectedProject.name}</h4>
                        <Button style={{ width: '130px', color: 'white' }}
                          variant="primary"
                          size="sm"
                          onClick={() => setShowTaskForm(true)}
                          className="d-flex align-items-center"
                        >
                          <BsPlus className="me-1" /> Add Task
                        </Button>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted mb-4">{enhancedSelectedProject.description}</p>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between mb-2">
                          <small className="text-muted">
                            Tasks: {enhancedSelectedProject.completedTasks}/{enhancedSelectedProject.totalTasks} completed
                          </small>
                          <small className="fw-bold">{enhancedSelectedProject.progress}%</small>
                        </div>
                        <ProgressBar
                          now={enhancedSelectedProject.progress}
                          variant={
                            enhancedSelectedProject.progress === 100 ? 'success' :
                              enhancedSelectedProject.progress > 0 ? 'primary' : 'warning'
                          }
                          className="rounded-pill"
                          style={{ height: '8px' }}
                        />
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 py-3">
                      <h5 className="mb-0">Project Tasks</h5>
                    </Card.Header>
                    <Card.Body className="pt-0">
                      {loading.tasks ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading tasks...</span>
                          </Spinner>
                        </div>
                      ) : getCurrentProjectTasks().length > 0 ? (
                        <ListGroup variant="flush">
                          {getCurrentProjectTasks().map(task => {
                            const taskStatus = getStatusBadge(task);
                            const assignedEmployee = task.assigned_to_details || task.assigned_to;
                            return (
                              <ListGroup.Item key={task.id} className="border-0 py-3 px-0">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1 fw-medium">{task.title}</h6>
                                    <p className="mb-2 text-muted small">{task.description}</p>
                                    <div className="d-flex">
                                      <small className="text-muted me-3 d-flex align-items-center">
                                        <BsPerson className="me-1" />
                                        {assignedEmployee?.full_name || assignedEmployee?.username || 'Unassigned'}
                                      </small>
                                      <small className="text-muted d-flex align-items-center">
                                        <BsCalendar className="me-1" />
                                        {task.due_date
                                          ? new Date(task.due_date).toLocaleDateString()
                                          : 'No due date'}
                                      </small>
                                    </div>
                                  </div>

                                  <div className="d-flex flex-column align-items-end" style={{ gap: '4px' }}>
                                    <Badge
                                      bg={taskStatus.variant}
                                      className="d-flex align-items-center px-2 py-1 mb-1"
                                    >
                                      {taskStatus.icon}
                                      <span className="ms-1">{taskStatus.text}</span>
                                    </Badge>
                                    <div className="d-flex" style={{ gap: '4px' }}>
                                      {task.status !== 'completed' && (
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="p-0 d-flex align-items-center justify-content-center"
                                          style={{
                                            width: '30px',
                                            height: '30px',
                                            color: 'white'
                                          }}
                                          onClick={() => openEditTaskModal(task)}
                                        >
                                          <BsPencil size={15} />
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-0 d-flex align-items-center justify-content-center"
                                        style={{
                                          width: '30px',
                                          height: '30px'
                                        }}
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        <BsTrash size={15} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            );
                          })}
                        </ListGroup>
                      ) : (
                        <div className="text-center py-4">
                          <div className="mb-3">
                            <BsExclamationTriangle size={24} className="text-muted" />
                          </div>
                          <h5 className="text-muted mb-2">No Tasks Added Yet</h5>
                          <p className="text-muted mb-3">This project doesn't have any tasks assigned</p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowTaskForm(true)}
                            className="d-flex align-items-center mx-auto"
                          >
                            <BsPlus className="me-1" /> Add First Task
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </>
              ) : (
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center py-5">
                    <div className="mb-3">
                      <BsExclamationTriangle size={32} className="text-muted" />
                    </div>
                    <h4 className="text-muted mb-3">No Project Selected</h4>
                    <p className="text-muted">
                      {projects.length === 0
                        ? "You don't have any projects assigned yet."
                        : "Please select a project from the list to view details."}
                    </p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>

          <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add New Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddTask}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Assign To</Form.Label>
                      <Form.Select
                        value={taskData.assigned_to}
                        onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name || employee.username}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Due Date (Optional)</Form.Label>
                      <Form.Control
                        type="date"
                        value={taskData.due_date}
                        onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={taskData.status}
                    onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowTaskForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading.form}>
                    {loading.form ? <Spinner size="sm" /> : 'Create Task'}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          <Modal show={showEditTaskModal} onHide={() => setShowEditTaskModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditTask}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={taskData.title}
                    onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={taskData.description}
                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Assign To</Form.Label>
                      <Form.Select
                        value={taskData.assigned_to}
                        onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name || employee.username}
                          </option>
                        ))}
                        {currentTask?.assigned_to && !employees.some(e => e.id === currentTask.assigned_to?.id) && (
                          <option value={currentTask.assigned_to.id} selected>
                            {currentTask.assigned_to.full_name || currentTask.assigned_to.username} (not available)
                          </option>
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Due Date (Optional)</Form.Label>
                      <Form.Control
                        type="date"
                        value={taskData.due_date}
                        onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={taskData.status}
                    onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowEditTaskModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading.form}>
                    {loading.form ? <Spinner size="sm" /> : 'Save Changes'}
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

export default ManagerDashboard;