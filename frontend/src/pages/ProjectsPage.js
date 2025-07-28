import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BsPlus, BsPersonCircle, BsSearch, BsFilter, BsX,
  BsCalendar, BsPerson, BsEye, BsPencil, BsCheck,
  BsCheckCircle, BsClock, BsExclamationTriangle
} from 'react-icons/bs';
import {
  Alert, Button, Card, Spinner, Row, Col, Form,
  Dropdown, Badge, ProgressBar, Pagination, Modal
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authApi, superManagerApi } from '../api/api';
import Sidebar from '../components/Sidebar';

const ProjectsPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    manager: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managers, setManagers] = useState([]);
  const projectsPerPage = 6;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthCheck = await authApi.checkApiHealth();
        setApiAvailable(healthCheck);
        if (!healthCheck) {
          throw new Error('API server unavailable');
        }

        const [projectsResponse, tasksResponse, managersResponse] = await Promise.all([
          superManagerApi.getProjects(),
          superManagerApi.getTasks(),
          superManagerApi.getUsers()
        ]);

        const managersMap = managersResponse.reduce((acc, user) => {
          if (user.role === 'manager') {
            const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
            acc[user.id] = { id: user.id, name };
          }
          return acc;
        }, {});

        setManagers(Object.values(managersMap));

        const projectsWithProgress = projectsResponse.map(project => {
          const projectTasks = tasksResponse.filter(task => task.project === project.id);

          const totalTasks = projectTasks.length;
          const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          let status = 'pending';
          if (totalTasks > 0) {
            if (completedTasks === totalTasks) status = 'completed';
            else if (completedTasks > 0) status = 'in-progress';
          }

          let manager = { id: null, name: 'Unassigned' };
          if (project.assigned_to) {
            if (typeof project.assigned_to === 'object') {
              manager = {
                id: project.assigned_to.id,
                name: `${project.assigned_to.first_name || ''} ${project.assigned_to.last_name || ''}`.trim() ||
                  project.assigned_to.username || 'Unassigned'
              };
            } else if (managersMap[project.assigned_to]) {
              manager = managersMap[project.assigned_to];
            }
          }

          return {
            ...project,
            progress,
            status,
            totalTasks,
            completedTasks,
            manager
          };
        });

        setProjects(projectsWithProgress);
      } catch (error) {
        console.error('Initialization error:', error);
        setNetworkError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', manager: '' });
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = (newProject) => {
    const manager = managers.find(m => m.id === newProject.assigned_to) || { name: 'Unassigned' };
    setProjects(prev => [
      {
        ...newProject,
        progress: 0,
        status: 'pending',
        totalTasks: 0,
        completedTasks: 0,
        manager
      },
      ...prev
    ]);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === '' || project.status === filters.status;
    const matchesManager = filters.manager === '' ||
      project.manager.name.toLowerCase().includes(filters.manager.toLowerCase());
    return matchesSearch && matchesStatus && matchesManager;
  });

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return { variant: 'success', icon: <BsCheckCircle className="me-1" />, text: 'Completed' };
      case 'in-progress': return { variant: 'primary', icon: <BsClock className="me-1" />, text: 'In Progress' };
      case 'pending': return { variant: 'warning', icon: <BsExclamationTriangle className="me-1" />, text: 'Pending' };
      default: return { variant: 'secondary', icon: null, text: 'Unknown' };
    }
  };

  const uniqueManagers = [...new Set(projects.map(project => project.manager.name))].filter(Boolean);

  if (!apiAvailable) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="col-md-10 main-content p-4">
          <Card className="mt-4 shadow-sm">
            <Card.Body className="text-center py-5">
              <Alert variant="danger">
                <h4>Connection Problem</h4>
                <p>{networkError || 'Cannot connect to the server'}</p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                  className="mt-3"
                >
                  Retry Connection
                </Button>
              </Alert>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="col-md-10 main-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="col-md-10 main-content p-4">
          <Alert variant="danger" className="mt-4">
            <h4>Error Loading Projects</h4>
            <p>{networkError}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="col-md-10 main-content p-4">
        <div className="header d-flex justify-content-between align-items-center py-3 bg-white">
          <h4 className="mb-0 text-black">Projects Overview</h4>
          <div className="d-flex align-items-center">
            <Button
              variant="light"
              size="sm"
              className="me-3 bg-white text-dark border-0"
              onClick={handleCreateProject}
            >
              <BsPlus className="me-1" /> New Project
            </Button>

            <div className="dropdown">
              <a
                href="#"
                className="d-flex align-items-center text-decoration-none dropdown-toggle"
                id="userDropdown"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle user-avatar me-2 fs-2 text-primary"></i>
                <span className="d-none d-md-inline text-primary">{user?.full_name || 'Super Manager'}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end bg-white border-0 shadow-lg">
                <li>
                  <Link
                    className="dropdown-item text-dark py-2 px-3"
                    to="/profile"
                  >
                    <i className="bi bi-person me-2"></i>Profile
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item text-dark py-2 px-3"
                    to="/settings"
                  >
                    <i className="bi bi-gear me-2"></i>Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item text-dark py-2 px-3"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <div className="input-group">
                  <span className="input-group-text bg-white"><BsSearch /></span>
                  <Form.Control
                    type="text"
                    placeholder="Search projects..."
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
              </Col>
              <Col md={3}>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  name="manager"
                  value={filters.manager}
                  onChange={handleFilterChange}
                >
                  <option value="">All Managers</option>
                  {uniqueManagers.map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2} className="text-end">
                <Button variant="light" onClick={resetFilters}>
                  <BsX /> <BsFilter /> Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Projects List */}
        {filteredProjects.length > 0 ? (
          <>
            <Row className="g-4">
              {currentProjects.map(project => {
                const statusBadge = getStatusBadge(project.status);
                return (
                  <Col key={project.id} md={6} lg={4}>
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">{project.name}</h5>
                        <Badge bg={statusBadge.variant}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </Badge>
                      </Card.Header>
                      <Card.Body>
                        <p className="text-muted">{project.description}</p>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">
                              Tasks: {project.completedTasks}/{project.totalTasks} completed
                            </small>
                            <small className="fw-bold">{project.progress}%</small>
                          </div>
                          <ProgressBar
                            now={project.progress}
                            variant={statusBadge.variant}
                          />
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <BsPerson className="me-1" /> {project.manager.name}
                          </small>
                          <small className="text-muted">
                            <BsCalendar className="me-1" />
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                          </small>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="d-flex align-items-center"
                          title="View project details and tasks"
                        >
                          <BsEye className="me-1" /> View Details
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        ) : projects.length > 0 ? (
          <Card className="shadow-sm">
            <Card.Body className="text-center py-5">
              <h5 className="text-muted">No projects match your filters</h5>
              <Button variant="outline-primary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <Card.Body className="text-center py-5">
              <h5 className="text-muted">No projects found</h5>
              <Button
                variant="primary"
                onClick={handleCreateProject}
              >
                <BsPlus className="me-1" /> Create New Project
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Create Project Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Create New Project</Modal.Title>
          </Modal.Header>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const formData = new FormData(e.target);
              const projectData = {
                name: formData.get('name'),
                description: formData.get('description'),
                assigned_to: formData.get('assigned_to'),
                deadline: formData.get('deadline') || null
              };

              const newProject = await superManagerApi.createProject(projectData);
              handleProjectCreated(newProject);
              setShowCreateModal(false);
            } catch (error) {
              console.error('Error creating project:', error);
            }
          }}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  required
                  placeholder="Enter project name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Enter project description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Manager</Form.Label>
                <Form.Select
                  name="assigned_to"
                  required
                >
                  <option value="">Select a manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Deadline (optional)</Form.Label>
                <Form.Control
                  type="date"
                  name="deadline"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                <BsX className="me-1" /> Cancel
              </Button>
              <Button variant="primary" type="submit">
                <BsCheck className="me-1" /> Create Project
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default ProjectsPage;