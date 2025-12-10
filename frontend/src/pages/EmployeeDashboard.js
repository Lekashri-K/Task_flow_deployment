import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Container, 
  Row, 
  Col, 
  Alert, 
  Spinner, 
  ProgressBar,
  Navbar,
  Nav,
  Dropdown,
  ListGroup,
  Badge
} from 'react-bootstrap';
import { 
  BsCheckCircle, 
  BsClock, 
  BsThreeDotsVertical, 
  BsExclamationCircle,
  BsPersonCircle,
  BsBoxArrowRight,
  BsCalendar,
  BsFlag,
  BsListTask
} from 'react-icons/bs';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { employeeApi, authApi } from '../api/api';
import { useNavigate } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { format, addDays, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

// Register ChartJS components
ChartJS.register(...registerables);

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, tasksData] = await Promise.all([
          authApi.getCurrentUser(),
          employeeApi.getTasks()
        ]);

        setCurrentUser(userData);
        processTaskData(tasksData);
        
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processTaskData = (tasksData) => {
    const total = tasksData.length;
    const completed = tasksData.filter(t => t.status === 'completed').length;
    const inProgress = tasksData.filter(t => t.status === 'in_progress').length;
    const pending = tasksData.filter(t => t.status === 'pending').length;
    
    // Calculate overdue tasks (due date passed and not completed)
    const overdue = tasksData.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.due_date) return false;
      return new Date(task.due_date) < new Date();
    }).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setTaskStats({
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate
    });

    // Get upcoming tasks (next 7 days, not completed)
    const upcoming = tasksData
      .filter(task => 
        task.due_date && 
        task.status !== 'completed' &&
        new Date(task.due_date) <= addDays(new Date(), 7) &&
        new Date(task.due_date) >= new Date()
      )
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);

    setUpcomingTasks(upcoming);

    // Get recently completed tasks (last 5)
    const recentCompletedTasks = tasksData
      .filter(task => task.status === 'completed')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);
    
    setRecentCompleted(recentCompletedTasks);

    // Generate weekly progress from actual data
    const weeklyData = generateWeeklyProgress(tasksData);
    setWeeklyProgress(weeklyData);
  };

  const generateWeeklyProgress = (tasks) => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // For each day of the week, count how many tasks were completed on that day
    return weekDays.map(day => {
      const completedOnDay = tasks.filter(task => {
        if (task.status !== 'completed') return false;
        if (!task.updated_at) return false;
        return isSameDay(new Date(task.updated_at), day);
      }).length;
      
      return {
        day: format(day, 'EEE'), // Mon, Tue, etc.
        date: day,
        completed: completedOnDay
      };
    });
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  // Weekly Progress Line Chart
  const weeklyChartData = {
    labels: weeklyProgress.map(item => item.day),
    datasets: [
      {
        label: 'Tasks Completed',
        data: weeklyProgress.map(item => item.completed),
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2
      }
    ]
  };

  const weeklyChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false
  };

  // Standard Pie Chart for Task Status Distribution
  const pieChartData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [
          taskStats.completed,
          taskStats.inProgress,
          taskStats.pending,
          taskStats.overdue
        ],
        backgroundColor: [
          '#28a745', // Green for completed
          '#ffc107', // Yellow for in progress
          '#17a2b8', // Blue for pending
          '#dc3545'  // Red for overdue
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8
      }
    ]
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: '#6c757d'
        },
        tooltip: {
          bodyFont: {
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    cutout: '0%',
    maintainAspectRatio: false,
    responsive: true
  };

  // Bar Chart for Task Priority/Status Overview
  const barChartData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [
          taskStats.completed,
          taskStats.inProgress,
          taskStats.pending,
          taskStats.overdue
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  const getDueDateBadge = (dueDate) => {
    if (!dueDate) return <Badge bg="secondary">No due date</Badge>;
    
    const date = new Date(dueDate);
    if (isToday(date)) {
      return <Badge bg="danger">Today</Badge>;
    } else if (isTomorrow(date)) {
      return <Badge bg="warning" text="dark">Tomorrow</Badge>;
    } else {
      return <Badge bg="secondary">{format(date, 'MMM dd')}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'secondary', text: 'Pending' },
      in_progress: { bg: 'warning', text: 'In Progress' },
      completed: { bg: 'success', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  // Function to get project name correctly
  const getProjectName = (task) => {
    // Check different possible locations for project data
    if (task.project_name) return task.project_name;
    if (task.project?.name) return task.project.name;
    if (task.project) return typeof task.project === 'string' ? task.project : 'No Project';
    return 'No Project';
  };

  if (loading) {
    return (
      <div className="d-flex">
        <EmployeeSidebar />
        <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Spinner animation="border" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex">
        <EmployeeSidebar />
        <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
          <Alert variant="danger">{error}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <EmployeeSidebar />
      <div className="flex-grow-1" style={{ marginLeft: '250px' }}>
        <Navbar
          bg="white"
          expand="lg"
          className="shadow-sm"
          style={{
            margin: '1rem 1rem 0.25rem 1rem',
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
              My Dashboard
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

        <Container fluid className="py-3 px-4">
          {/* Quick Stats Row */}
          <Row className="mb-4 g-4">
            <Col md={3}>
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="stat-title">TOTAL TASKS</h6>
                      <h3 className="stat-value">{taskStats.total}</h3>
                    </div>
                    <div className="stat-icon bg-primary-light">
                      <BsListTask className="text-primary" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="stat-title">COMPLETED</h6>
                      <h3 className="stat-value">{taskStats.completed}</h3>
                    </div>
                    <div className="stat-icon bg-success-light">
                      <BsCheckCircle className="text-success" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="stat-title">IN PROGRESS</h6>
                      <h3 className="stat-value">{taskStats.inProgress}</h3>
                    </div>
                    <div className="stat-icon bg-warning-light">
                      <BsClock className="text-warning" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="stat-title">OVERDUE</h6>
                      <h3 className="stat-value">{taskStats.overdue}</h3>
                    </div>
                    <div className="stat-icon bg-danger-light">
                      <BsExclamationCircle className="text-danger" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Progress and Charts Row */}
          <Row className="mb-4">
            <Col md={8}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>My Progress This Week</Card.Title>
                  <div style={{ height: '200px' }}>
                    <Line 
                      data={weeklyChartData} 
                      options={weeklyChartOptions}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Tasks completed each day this week
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Task Distribution</Card.Title>
                  <div style={{ height: '200px' }}>
                    <Bar 
                      data={barChartData} 
                      options={barChartOptions}
                    />
                  </div>
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => navigate('/employee/tasks')}
                    >
                      <BsFlag className="me-2" />
                      View All Tasks
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Upcoming Deadlines and Task Status */}
          <Row className="g-4">
            <Col md={8}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    <span>Upcoming Deadlines</span>
                    <BsCalendar className="text-muted" />
                  </Card.Title>
                  {upcomingTasks.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      No upcoming deadlines this week
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {upcomingTasks.map(task => (
                        <ListGroup.Item 
                          key={task.id}
                          className="d-flex justify-content-between align-items-center py-3"
                        >
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="mb-0">{task.title}</h6>
                              {getStatusBadge(task.status)}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-muted">
                                <strong>Project:</strong> {getProjectName(task)}
                              </small>
                            </div>
                          </div>
                          <div>
                            {getDueDateBadge(task.due_date)}
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Task Status Overview</Card.Title>
                  <div style={{ height: '250px', flex: '1' }}>
                    <Pie 
                      data={pieChartData}
                      options={pieChartOptions}
                    />
                  </div>
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Overall task completion: {taskStats.completionRate}%
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recently Completed Tasks */}
          {recentCompleted.length > 0 && (
            <Row className="mt-4">
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Card.Title>Recently Completed</Card.Title>
                    <ListGroup variant="flush">
                      {recentCompleted.map(task => (
                        <ListGroup.Item 
                          key={task.id}
                          className="d-flex justify-content-between align-items-center py-3"
                        >
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-success">{task.title}</h6>
                            <small className="text-muted">
                              <strong>Project:</strong> {getProjectName(task)} • 
                              Completed on {format(new Date(task.updated_at), 'MMM dd, yyyy')}
                            </small>
                          </div>
                          <Badge bg="success">Completed</Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export default EmployeeDashboard;