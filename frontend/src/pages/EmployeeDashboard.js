// import React, { useState, useEffect } from 'react';
// import {
//   Card, Badge, Button,
//   ProgressBar, Container, Row, Col,
//   Dropdown, Modal, Form, Stack,
//   Spinner, Alert, Navbar, Nav,
//   Table, Tabs, Tab
// } from 'react-bootstrap';
// import {
//   BsCheckCircle, BsClock, BsExclamationTriangle,
//   BsCalendar, BsThreeDotsVertical,
//   BsFilter, BsPlus, BsSearch, BsX,
//   BsPersonCircle, BsBoxArrowRight,
//   BsGrid, BsListUl, BsBarChart
// } from 'react-icons/bs';
// import { employeeApi, authApi } from '../api/api';
// import { useNavigate } from 'react-router-dom';
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
// import { Bar, Pie } from 'react-chartjs-2';

// // Register ChartJS components
// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// const EmployeeDashboard = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [status, setStatus] = useState('pending');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentUser, setCurrentUser] = useState(null);
//   const [viewMode, setViewMode] = useState('cards'); // 'cards', 'table', or 'chart'
//   const navigate = useNavigate();

//   // Fetch tasks and user data from backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [userData, tasksData] = await Promise.all([
//           authApi.getCurrentUser(),
//           employeeApi.getTasks()
//         ]);

//         setCurrentUser(userData);

//         const formattedTasks = tasksData.map(task => ({
//           id: task.id,
//           title: task.title,
//           project: task.project_name || 'General',
//           dueDate: task.due_date,
//           status: task.status,
//           description: task.description || '',
//           isOverdue: task.is_overdue
//         }));
//         setTasks(formattedTasks);
//       } catch (err) {
//         setError(err.message || 'Failed to load data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle status update
//   const handleStatusUpdate = async (taskId, status) => {
//     try {
//       await employeeApi.updateTaskStatus(taskId, status);
//       setTasks(tasks.map(task =>
//         task.id === taskId ? { ...task, status } : task
//       ));
//       setShowUpdateModal(false);
//     } catch (err) {
//       console.error('Update failed:', err);
//       setError('Failed to update task status');
//     }
//   };

//   // Filter tasks based on status and search query
//   const filteredTasks = tasks.filter(task => {
//     // Filter by status
//     if (filter === 'all') {
//       // No status filter
//     } else if (filter === 'overdue') {
//       if (!task.isOverdue) return false;
//     } else {
//       if (task.status !== filter) return false;
//     }

//     // Filter by search query
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       return (
//         task.title.toLowerCase().includes(query) ||
//         task.project.toLowerCase().includes(query) ||
//         task.description.toLowerCase().includes(query)
//       );
//     }

//     return true;
//   });

//   // Calculate task statistics
//   const taskStats = {
//     total: tasks.length,
//     completed: tasks.filter(t => t.status === 'completed').length,
//     inProgress: tasks.filter(t => t.status === 'in_progress').length,
//     pending: tasks.filter(t => t.status === 'pending').length,
//     overdue: tasks.filter(t => t.isOverdue).length,
//     completionRate: tasks.length > 0 ?
//       Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
//   };

//   // Status badge component
//   const StatusBadge = ({ status }) => {
//     switch (status) {
//       case 'completed':
//         return <Badge bg="success" className="d-flex align-items-center">
//           <BsCheckCircle className="me-1" /> Completed
//         </Badge>;
//       case 'in_progress':
//         return <Badge bg="primary" className="d-flex align-items-center">
//           <BsClock className="me-1" /> In Progress
//         </Badge>;
//       case 'pending':
//         return <Badge bg="warning" className="d-flex align-items-center text-dark">
//           <BsExclamationTriangle className="me-1" /> Pending
//         </Badge>;
//       default:
//         return <Badge bg="secondary">Unknown</Badge>;
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'No due date';
//     const options = { month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };

//   const handleLogout = async () => {
//     try {
//       await authApi.logout();
//       navigate('/login');
//     } catch (err) {
//       console.error('Logout failed:', err);
//       setError('Failed to logout. Please try again.');
//     }
//   };

//   // Chart data configuration
//   const chartData = {
//     labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
//     datasets: [
//       {
//         label: 'Tasks by Status',
//         data: [
//           taskStats.completed,
//           taskStats.inProgress,
//           taskStats.pending,
//           taskStats.overdue
//         ],
//         backgroundColor: [
//           'rgba(25, 135, 84, 0.7)',  // Completed - green
//           'rgba(13, 110, 253, 0.7)',  // In Progress - blue
//           'rgba(255, 193, 7, 0.7)',   // Pending - yellow
//           'rgba(220, 53, 69, 0.7)'    // Overdue - red
//         ],
//         borderColor: [
//           'rgba(25, 135, 84, 1)',
//           'rgba(13, 110, 253, 1)',
//           'rgba(255, 193, 7, 1)',
//           'rgba(220, 53, 69, 1)'
//         ],
//         borderWidth: 1
//       }
//     ]
//   };

//   const pieChartOptions = {
//     plugins: {
//       legend: {
//         position: 'right',
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             const label = context.label || '';
//             const value = context.raw || 0;
//             const total = context.dataset.data.reduce((a, b) => a + b, 0);
//             const percentage = Math.round((value / total) * 100);
//             return `${label}: ${value} (${percentage}%)`;
//           }
//         }
//       }
//     }
//   };

//   const barChartOptions = {
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           stepSize: 1
//         }
//       }
//     },
//     plugins: {
//       legend: {
//         display: false
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             const label = context.label || '';
//             const value = context.raw || 0;
//             return `${label}: ${value}`;
//           }
//         }
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <Container fluid className="employee-dashboard px-4 py-3">
//         <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//           <Spinner animation="border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </Spinner>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container fluid className="employee-dashboard px-4 py-3">
//         <Alert variant="danger">{error}</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container fluid className="employee-dashboard px-4 py-3">
//       {/* Navbar with user info and logout */}
//       <Navbar bg="white" expand="lg" className="shadow-sm">
//         <Container fluid>
//           <Navbar.Brand className="mb-0" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
//             Task Management
//           </Navbar.Brand>
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
//             <Nav>
//               <Dropdown align="end">
//                 <Dropdown.Toggle
//                   variant="link"
//                   id="dropdown-basic"
//                   className="d-flex align-items-center text-decoration-none"
//                   style={{
//                     background: 'transparent',
//                     border: 'none',
//                     color: '#0d6efd',
//                     padding: '0.5rem 1rem'
//                   }}
//                 >
//                   <BsPersonCircle className="me-1" size={20} />
//                   {currentUser?.full_name || currentUser?.username || 'User'}
//                 </Dropdown.Toggle>

//                 <Dropdown.Menu>
//                   <Dropdown.Item disabled>
//                     <small className="text-muted">Signed in as {currentUser?.role}</small>
//                   </Dropdown.Item>
//                   <Dropdown.Divider />
//                   <Dropdown.Item
//                     onClick={handleLogout}
//                     className="text-primary"
//                     style={{ background: 'transparent' }}
//                   >
//                     <BsBoxArrowRight className="me-2" /> Logout
//                   </Dropdown.Item>
//                 </Dropdown.Menu>
//               </Dropdown>
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>

//       {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

//       {/* Stats Cards */}
//       <Row className="mb-4 g-4">
//         <Col md={3}>
//           <Card className="stat-card h-100">
//             <Card.Body>
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <h6 className="stat-title">TOTAL TASKS</h6>
//                   <h3 className="stat-value">{taskStats.total}</h3>
//                 </div>
//                 <div className="stat-icon bg-primary-light">
//                   <BsThreeDotsVertical className="text-primary" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="stat-card h-100">
//             <Card.Body>
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <h6 className="stat-title">COMPLETED</h6>
//                   <h3 className="stat-value">{taskStats.completed}</h3>
//                 </div>
//                 <div className="stat-icon bg-success-light">
//                   <BsCheckCircle className="text-success" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="stat-card h-100">
//             <Card.Body>
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <h6 className="stat-title">IN PROGRESS</h6>
//                   <h3 className="stat-value">{taskStats.inProgress}</h3>
//                 </div>
//                 <div className="stat-icon bg-warning-light">
//                   <BsClock className="text-warning" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={2}>
//           <Card className="stat-card h-100">
//             <Card.Body>
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <h6 className="stat-title">PENDING</h6>
//                   <h3 className="stat-value">{taskStats.pending}</h3>
//                 </div>
//                 <div className="stat-icon bg-info-light">
//                   <BsExclamationTriangle className="text-info" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//         <Col md={3}>
//           <Card className="stat-card h-100">
//             <Card.Body>
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <h6 className="stat-title">OVERDUE</h6>
//                   <h3 className="stat-value">{taskStats.overdue}</h3>
//                 </div>
//                 <div className="stat-icon bg-danger-light">
//                   <BsExclamationTriangle className="text-danger" />
//                 </div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Progress and Filters */}
//       <Row className="mb-3">
//         <Col md={8}>
//           <div className="completion-progress">
//             <div className="d-flex justify-content-between mb-2">
//               <span>Task Completion</span>
//               <span>{taskStats.completionRate}%</span>
//             </div>
//             <ProgressBar
//               now={taskStats.completionRate}
//               variant="success"
//               className="rounded-pill"
//               style={{ height: '8px' }}
//             />
//           </div>
//         </Col>
//         <Col md={4}>
//           <div className="d-flex gap-2">
//             <div className="search-box flex-grow-1">
//               <div className="input-group">
//                 <span className="input-group-text bg-white border-end-0">
//                   <BsSearch />
//                 </span>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search tasks..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="border-start-0"
//                 />
//                 {searchQuery && (
//                   <Button
//                     variant="light"
//                     onClick={() => setSearchQuery('')}
//                     className="border-start-0"
//                   >
//                     <BsX />
//                   </Button>
//                 )}
//               </div>
//             </div>
//             <Dropdown style={{ marginTop: '10px' }}>  
//               <Dropdown.Toggle variant="light" className="filter-toggle">
//                 <BsFilter className="me-2" />
//                 {filter === 'all' ? 'All Tasks' :
//                   filter === 'completed' ? 'Completed' :
//                     filter === 'in_progress' ? 'In Progress' :
//                       filter === 'pending' ? 'Pending' : 'Overdue'}
//               </Dropdown.Toggle>
//               <Dropdown.Menu>
//                 <Dropdown.Item onClick={() => setFilter('all')}>All Tasks</Dropdown.Item>
//                 <Dropdown.Item onClick={() => setFilter('completed')}>Completed</Dropdown.Item>
//                 <Dropdown.Item onClick={() => setFilter('in_progress')}>In Progress</Dropdown.Item>
//                 <Dropdown.Item onClick={() => setFilter('pending')}>Pending</Dropdown.Item>
//                 <Dropdown.Item onClick={() => setFilter('overdue')}>Overdue</Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//             <Button style={{ height: '40px', color: 'white' ,marginTop: '10px'}}
//               variant={viewMode === 'cards' ? 'primary' : 'outline-primary'}
//               onClick={() => setViewMode('cards')}
//               title="Card View"
//             >
//               <BsGrid />
//             </Button>
//             <Button style={{ height: '40px', color: 'white' ,marginTop: '10px'}}
//               variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
//               onClick={() => setViewMode('table')}
//               title="Table View"
//             >
//               <BsListUl />
//             </Button>
//             <Button style={{ height: '40px', color: 'white' ,marginTop: '10px'}}
//               variant={viewMode === 'chart' ? 'primary' : 'outline-primary'}
//               onClick={() => setViewMode('chart')}
//               title="Chart View"
//             >
//               <BsBarChart />
//             </Button>
//           </div>
//         </Col>
//       </Row>

//       {/* Task List - Conditional Rendering based on viewMode */}
//       {filteredTasks.length === 0 ? (
//         <Row>
//           <Col>
//             <div className="text-center py-5">
//               <h5 className="text-muted">No tasks found</h5>
//               <p>You have no {filter === 'all' ? '' : filter} tasks matching your search</p>
//             </div>
//           </Col>
//         </Row>
//       ) : viewMode === 'cards' ? (
//         // Card View
//         <Row xs={1} md={2} lg={3} className="g-4">
//           {filteredTasks.map(task => (
//             <Col key={task.id}>
//               <Card className="task-card h-100">
//                 <Card.Body className="d-flex flex-column">
//                   <div className="d-flex justify-content-between align-items-start mb-2">
//                     <Card.Title className="task-title mb-1">{task.title}</Card.Title>
//                     <StatusBadge status={task.status} />
//                   </div>

//                   <Badge bg="light" text="dark" className="mb-3">
//                     {task.project}
//                   </Badge>

//                   <div className="task-meta mb-3">
//                     <div className="d-flex align-items-center text-muted small">
//                       <BsCalendar className="me-2" />
//                       <span>Due: {formatDate(task.dueDate)}</span>
//                       {task.isOverdue && (
//                         <Badge bg="danger" className="ms-2">Overdue</Badge>
//                       )}
//                     </div>
//                   </div>

//                   {task.description && (
//                     <div className="task-notes mb-3 flex-grow-1">
//                       <p className="text-muted small mb-0">{task.description}</p>
//                     </div>
//                   )}

//                   <div className="task-actions mt-auto">
//                     <Stack direction="horizontal" gap={2} className="justify-content-end">
//                       <Button style={{ color: 'white' }}
//                         variant="outline-primary"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedTask(task);
//                           setStatus(task.status);
//                           setShowUpdateModal(true);
//                         }}
//                       >
//                         Update Status
//                       </Button>
//                     </Stack>
//                   </div>
//                 </Card.Body>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       ) : viewMode === 'table' ? (
//         // Table View
//         <Card className="mb-4">
//           <Card.Body className="p-0">
//             <Table hover responsive className="mb-0">
//               <thead>
//                 <tr>
//                   <th>Task</th>
//                   <th>Project</th>
//                   <th>Description</th>
//                   <th>Due Date</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredTasks.map(task => (
//                   <tr key={task.id}>
//                     <td>
//                       <div className="fw-semibold">{task.title}</div>
//                     </td>
//                     <td>
//                       <Badge bg="light" text="dark">
//                         {task.project}
//                       </Badge>
//                     </td>
//                     <td>
//                       <small className="text-muted">
//                         {task.description || '-'}
//                       </small>
//                     </td>
//                     <td>
//                       <div className="d-flex align-items-center">
//                         <BsCalendar className="me-2 text-muted" />
//                         <span>{formatDate(task.dueDate)}</span>
//                         {task.isOverdue && (
//                           <Badge bg="danger" className="ms-2">Overdue</Badge>
//                         )}
//                       </div>
//                     </td>
//                     <td>
//                       <StatusBadge status={task.status} />
//                     </td>
//                     <td>
//                       <Button style={{ color: 'white' }}
//                         variant="outline-primary"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedTask(task);
//                           setStatus(task.status);
//                           setShowUpdateModal(true);
//                         }}
//                       >
//                         Update
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </Card.Body>
//         </Card>
//       ) : (
//         // Chart View
//         <Row className="g-4">
//           {/* Bar Chart Column */}
//           <Col md={8}>
//             <Card className="h-100">
//               <Card.Body className="d-flex flex-column">
//                 <Card.Title className="mb-3">Task Status Distribution</Card.Title>
//                 <div style={{
//                   height: '280px',
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   padding: '0 15px'
//                 }}>
//                   <div style={{
//                     width: '75%',
//                     height: '95%',
//                     margin: '0 auto'
//                   }}>
//                     <Bar
//                       data={chartData}
//                       options={{
//                         ...barChartOptions,
//                         maintainAspectRatio: false,
//                         responsive: true,
//                         scales: {
//                           x: {
//                             grid: {
//                               display: false
//                             },
//                             barPercentage: 0.4,
//                             categoryPercentage: 0.6,
//                             ticks: {
//                               font: {
//                                 size: 11
//                               }
//                             }
//                           },
//                           y: {
//                             beginAtZero: true,
//                             ticks: {
//                               stepSize: 1,
//                               precision: 0,
//                               font: {
//                                 size: 11
//                               }
//                             },
//                             grid: {
//                               drawBorder: false,
//                               color: 'rgba(0,0,0,0.05)'
//                             }
//                           }
//                         },
//                         plugins: {
//                           legend: {
//                             display: false
//                           },
//                           tooltip: {
//                             bodyFont: {
//                               size: 12
//                             },
//                             padding: 8
//                           }
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>

//           {/* Pie Chart Column */}
//           <Col md={4}>
//             <Card className="h-100">
//               <Card.Body className="d-flex flex-column">
//                 <Card.Title className="mb-3">Status Breakdown</Card.Title>
//                 <div style={{
//                   height: '280px',
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center'
//                 }}>
//                   <div style={{
//                     width: '100%',
//                     height: '80%'
//                   }}>
//                     <Pie
//                       data={chartData}
//                       options={{
//                         ...pieChartOptions,
//                         maintainAspectRatio: false,
//                         responsive: true,
//                         plugins: {
//                           legend: {
//                             position: 'right',
//                             labels: {
//                               boxWidth: 12,
//                               padding: 12,
//                               font: {
//                                 size: 11
//                               },
//                               usePointStyle: true
//                             }
//                           },
//                           tooltip: {
//                             bodyFont: {
//                               size: 12
//                             },
//                             padding: 8
//                           }
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>

//           {/* Task Table */}
//           <Col md={12}>
//             <Card className="mt-2">
//               <Card.Body>
//                 <Card.Title className="mb-3">Task Details</Card.Title>
//                 <Table hover responsive size="sm">
//                   <thead>
//                     <tr>
//                       <th width="25%">Task</th>
//                       <th width="20%">Project</th>
//                       <th width="20%">Due Date</th>
//                       <th width="10%">Status</th>
//                       <th width="10%">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredTasks.map(task => (
//                       <tr key={task.id}>
//                         <td className="text-truncate" style={{ maxWidth: '200px' }} title={task.title}>
//                           {task.title}
//                         </td>
//                         <td>
//                           <Badge bg="light" text="dark" className="text-truncate" style={{ maxWidth: '150px' }}>
//                             {task.project}
//                           </Badge>
//                         </td>
//                         <td>
//                           <div className="d-flex align-items-center">
//                             <BsCalendar className="me-2 text-muted" />
//                             <span className="text-nowrap">
//                               {formatDate(task.dueDate)}
//                               {task.isOverdue && (
//                                 <Badge bg="danger" className="ms-2">Overdue</Badge>
//                               )}
//                             </span>
//                           </div>
//                         </td>
//                         <td>
//                           <StatusBadge status={task.status} />
//                         </td>
//                         <td>
//                           <Button style={{ color: 'white' }}
//                             variant="outline-primary"
//                             size="sm"
//                             onClick={() => {
//                               setSelectedTask(task);
//                               setStatus(task.status);
//                               setShowUpdateModal(true);
//                             }}
//                             className="px-3"
//                           >
//                             Update
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       )}

//       {/* Update Status Modal */}
//       <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Update Task Status</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Task</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={selectedTask?.title || ''}
//                 readOnly
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Project</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={selectedTask?.project || ''}
//                 readOnly
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={selectedTask?.description || ''}
//                 readOnly
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Status</Form.Label>
//               <Form.Select
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//               >
//                 <option value="pending">Pending</option>
//                 <option value="in_progress">In Progress</option>
//                 <option value="completed">Completed</option>
//               </Form.Select>
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={() => handleStatusUpdate(selectedTask.id, status)}>
//             Update Status
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* CSS Styles */}
//       <style jsx>{`
//         .employee-dashboard {
//           background-color: #f8f9fa;
//           min-height: 100vh;
//         }
//         .dashboard-title {
//           font-weight: 600;
//           color: #2c3e50;
//         }
//         .stat-card {
//           border-radius: 10px;
//           border: none;
//           box-shadow: 0 4px 6px rgba(0,0,0,0.05);
//         }
//         .stat-title {
//           color: #6c757d;
//           font-size: 0.8rem;
//           text-transform: uppercase;
//           letter-spacing: 1px;
//         }
//         .stat-value {
//           font-weight: 700;
//           color: #2c3e50;
//         }
//         .stat-icon {
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .bg-primary-light {
//           background-color: rgba(13,110,253,0.1);
//         }
//         .bg-success-light {
//           background-color: rgba(25,135,84,0.1);
//         }
//         .bg-info-light {
//           background-color: rgba(13,202,240,0.1);
//         }
//         .bg-warning-light {
//           background-color: rgba(255,193,7,0.1);
//         }
//         .bg-danger-light {
//           background-color: rgba(220,53,69,0.1);
//         }
//         .task-card {
//           border-radius: 10px;
//           border: none;
//           box-shadow: 0 4px 6px rgba(0,0,0,0.05);
//           transition: transform 0.2s, box-shadow 0.2s;
//         }
//         .task-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 12px rgba(0,0,0,0.1);
//         }
//         .task-title {
//           font-weight: 600;
//           color: #2c3e50;
//           font-size: 1.1rem;
//           margin-right: 0.5rem;
//         }
//         .task-notes {
//           font-size: 0.9rem;
//           color: #6c757d;
//         }
//         .filter-toggle {
//           border-radius: 20px;
//           padding: 0.375rem 1rem;
//           border: 1px solid #dee2e6;
//           white-space: nowrap;
//         }
//         .completion-progress {
//           background: white;
//           padding: 1rem;
//           border-radius: 10px;
//           box-shadow: 0 4px 6px rgba(0,0,0,0.05);
//         }
//         .search-box {
//           min-width: 200px;
//         }
//         .table-view {
//           background: white;
//           border-radius: 10px;
//           box-shadow: 0 4px 6px rgba(0,0,0,0.05);
//         }
//         .chart-container {
//           background: white;
//           border-radius: 10px;
//           padding: 20px;
//           box-shadow: 0 4px 6px rgba(0,0,0,0.05);
//         }
//       `}</style>
//     </Container>
//   );
// };

// export default EmployeeDashboard;
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
  Dropdown
} from 'react-bootstrap';
import { 
  BsCheckCircle, 
  BsClock, 
  BsExclamationTriangle, 
  BsThreeDotsVertical, 
  BsExclamationCircle,
  BsPersonCircle,
  BsBoxArrowRight
} from 'react-icons/bs';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { employeeApi, authApi } from '../api/api';
import { useNavigate } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';

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

        const total = tasksData.length;
        const completed = tasksData.filter(t => t.status === 'completed').length;
        const inProgress = tasksData.filter(t => t.status === 'in_progress').length;
        const pending = tasksData.filter(t => t.status === 'pending').length;
        const overdue = tasksData.filter(t => t.is_overdue).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setTaskStats({
          total,
          completed,
          inProgress,
          pending,
          overdue,
          completionRate
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const chartData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          taskStats.completed,
          taskStats.inProgress,
          taskStats.pending,
          taskStats.overdue
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(23, 162, 184, 0.7)',
          'rgba(220, 53, 69, 0.7)'
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          'rgba(40, 167, 69, 0.9)',
          'rgba(255, 193, 7, 0.9)',
          'rgba(23, 162, 184, 0.9)',
          'rgba(220, 53, 69, 0.9)'
        ]
      }
    ]
  };

  const barChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#6c757d',
          font: {
            size: 12
          },
          padding: 20
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
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
    margin: '1rem 1rem 0.25rem 1rem', // top, right, bottom (reduced), left
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
      Employee Dashboard
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
                      <BsThreeDotsVertical className="text-primary" />
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

          <Row className="mb-4">
            <Col md={8}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Task Completion Progress</Card.Title>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Overall Completion Rate</span>
                    <span>{taskStats.completionRate}%</span>
                  </div>
                  <ProgressBar
                    now={taskStats.completionRate}
                    variant="success"
                    className="rounded-pill"
                    style={{ height: '10px' }}
                  />
                  <div className="mt-3 d-flex justify-content-between">
                    <small className="text-muted">
                      {taskStats.completed} of {taskStats.total} tasks completed
                    </small>
                    {taskStats.overdue > 0 && (
                      <small className="text-danger">
                        {taskStats.overdue} overdue tasks
                      </small>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Pending Tasks</Card.Title>
                  <div className="d-flex align-items-center justify-content-center" style={{ height: '100px' }}>
                    <h2 className="m-0">{taskStats.pending}</h2>
                  </div>
                  <button 
                    className="btn btn-primary w-100 mt-3"
                    onClick={() => navigate('/employee/tasks')}
                  >
                    View All Tasks
                  </button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={8}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-3">Task Status Distribution</Card.Title>
                  <div style={{
                    height: '280px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0 15px'
                  }}>
                    <div style={{
                      width: '75%',
                      height: '95%',
                      margin: '0 auto'
                    }}>
                      <Bar
                        data={chartData}
                        options={{
                          ...barChartOptions,
                          maintainAspectRatio: false,
                          responsive: true,
                          scales: {
                            x: {
                              grid: {
                                display: false
                              },
                              barPercentage: 0.4,
                              categoryPercentage: 0.6,
                              ticks: {
                                font: {
                                  size: 11
                                }
                              }
                            },
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1,
                                precision: 0,
                                font: {
                                  size: 11
                                }
                              },
                              grid: {
                                drawBorder: false,
                                color: 'rgba(0,0,0,0.05)'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              bodyFont: {
                                size: 12
                              },
                              padding: 8
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-3">Status Breakdown</Card.Title>
                  <div style={{
                    height: '280px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '80%'
                    }}>
                      <Pie
                        data={chartData}
                        options={{
                          ...pieChartOptions,
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                boxWidth: 12,
                                padding: 20,
                                font: {
                                  size: 12
                                },
                                usePointStyle: true,
                                color: '#6c757d'
                              }
                            },
                            tooltip: {
                              bodyFont: {
                                size: 12
                              },
                              padding: 8
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default EmployeeDashboard;