// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//     BsArrowLeft, BsPerson, BsCalendar, BsCheckCircle,
//     BsClock, BsExclamationTriangle, BsPlus,
//     BsPencil, BsTrash
// } from 'react-icons/bs';
// import {
//     Alert, Button, Card, Spinner, Row, Col,
//     Badge, ProgressBar, ListGroup, Modal, Form
// } from 'react-bootstrap';
// import { useAuth } from '../context/AuthContext';
// import { superManagerApi } from '../api/api';
// import Sidebar from '../components/Sidebar';
// import EditProjectForm from '../components/EditProjectForm';

// const ProjectDetailsPage = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [project, setProject] = useState(null);
//     const [tasks, setTasks] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [showTaskForm, setShowTaskForm] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [manager, setManager] = useState(null);
//     const [creator, setCreator] = useState(null);
//     const [employees, setEmployees] = useState([]);
//     const [managers, setManagers] = useState([]);
//     const [taskData, setTaskData] = useState({
//         title: '',
//         description: '',
//         assigned_to: '',
//         due_date: '',
//         status: 'pending'
//     });

//     useEffect(() => {
//         const fetchProjectDetails = async () => {
//             try {
//                 setLoading(true);
                
//                 const [projectData, tasksData, employeesData, managersData] = await Promise.all([
//                     superManagerApi.getProject(id),
//                     superManagerApi.getTasksByProject(id),
//                     superManagerApi.getUsers(),
//                     superManagerApi.getUsers()
//                 ]);

//                 // Filter users by role
//                 const filteredEmployees = employeesData.filter(user => user.role === 'employee');
//                 const filteredManagers = managersData.filter(user => user.role === 'manager');

//                 // Fetch manager and creator details
//                 const managerData = projectData.assigned_to 
//                     ? await superManagerApi.getUser(projectData.assigned_to)
//                     : null;
//                 const creatorData = projectData.created_by 
//                     ? await superManagerApi.getUser(projectData.created_by)
//                     : null;

//                 const completedTasks = tasksData.filter(task => task.status === 'completed').length;
//                 const progress = tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0;

//                 setProject({
//                     ...projectData,
//                     progress,
//                     totalTasks: tasksData.length,
//                     completedTasks
//                 });
//                 setTasks(tasksData);
//                 setManager(managerData);
//                 setCreator(creatorData);
//                 setEmployees(filteredEmployees);
//                 setManagers(filteredManagers);
//             } catch (err) {
//                 setError(err.message || 'Failed to fetch project details');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProjectDetails();
//     }, [id]);

//     const handleDeleteProject = async () => {
//         try {
//             await superManagerApi.deleteProject(id);
//             navigate('/projects');
//         } catch (err) {
//             console.error('Error deleting project:', err);
//             setError('Failed to delete project: ' + (err.response?.data?.message || err.message));
//         }
//     };

//     const handleAddTask = async (e) => {
//         e.preventDefault();
//         setError(null);
        
//         try {
//             if (!taskData.title.trim()) {
//                 throw new Error('Task title is required');
//             }
//             if (!taskData.assigned_to) {
//                 throw new Error('Please assign the task to an employee');
//             }

//             const taskPayload = {
//                 title: taskData.title.trim(),
//                 description: taskData.description.trim() || null,
//                 project: parseInt(id),
//                 assigned_to: parseInt(taskData.assigned_to),
//                 due_date: taskData.due_date || null,
//                 status: taskData.status
//             };

//             const response = await superManagerApi.createTask(taskPayload);
            
//             const assignedEmployee = employees.find(emp => emp.id === parseInt(taskData.assigned_to));
            
//             if (!assignedEmployee) {
//                 throw new Error('Assigned employee not found in local data');
//             }

//             const newTask = {
//                 ...response,
//                 assigned_to: {
//                     id: assignedEmployee.id,
//                     username: assignedEmployee.username,
//                     full_name: assignedEmployee.full_name
//                 }
//             };

//             setTasks(prevTasks => [...prevTasks, newTask]);
            
//             setProject(prevProject => {
//                 const totalTasks = prevProject.totalTasks + 1;
//                 const completedTasks = newTask.status === 'completed' 
//                     ? prevProject.completedTasks + 1 
//                     : prevProject.completedTasks;
//                 const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
//                 return {
//                     ...prevProject,
//                     progress,
//                     totalTasks,
//                     completedTasks
//                 };
//             });
            
//             setShowTaskForm(false);
//             setTaskData({
//                 title: '',
//                 description: '',
//                 assigned_to: '',
//                 due_date: '',
//                 status: 'pending'
//             });

//         } catch (err) {
//             console.error('Task creation error:', err);
            
//             let errorMessage = 'Failed to create task';
            
//             if (err.response) {
//                 errorMessage = err.response.data?.error || 
//                              err.response.data?.message || 
//                              `Server error (${err.response.status})`;
//             } else if (err.request) {
//                 errorMessage = 'Network error - please check your connection';
//             } else {
//                 errorMessage = err.message || 'Failed to create task';
//             }
            
//             setError(errorMessage);
//         }
//     };

//     const handleProjectUpdate = (updatedProject) => {
//         setProject(prev => ({
//             ...prev,
//             ...updatedProject
//         }));

//         if (updatedProject.assigned_to !== project.assigned_to) {
//             superManagerApi.getUser(updatedProject.assigned_to)
//                 .then(setManager)
//                 .catch(err => {
//                     console.error('Failed to fetch updated manager:', err);
//                     setManager(null);
//                 });
//         }
//     };

//     const getStatusBadge = (status) => {
//         switch (status) {
//             case 'completed': return { variant: 'success', icon: <BsCheckCircle />, text: 'Completed' };
//             case 'in_progress': return { variant: 'primary', icon: <BsClock />, text: 'In Progress' };
//             case 'pending': return { variant: 'warning', icon: <BsExclamationTriangle />, text: 'Pending' };
//             default: return { variant: 'secondary', icon: null, text: 'Unknown' };
//         }
//     };

//     if (loading) {
//         return (
//             <div className="d-flex">
//                 <Sidebar />
//                 <div className="col-md-10 main-content d-flex justify-content-center align-items-center">
//                     <Spinner animation="border" variant="primary" />
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="d-flex">
//                 <Sidebar />
//                 <div className="col-md-10 main-content p-4">
//                     <Alert variant="danger" className="mt-4">
//                         <h4>Error Loading Project</h4>
//                         <p>{error}</p>
//                         <Button
//                             variant="primary"
//                             onClick={() => navigate('/projects')}
//                             style={{
//                                 padding: '4px 10px',
//                                 fontSize: '13px',
//                                 fontWeight: '500',
//                                 borderRadius: '6px',
//                                 display: 'inline-flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                             }}
//                         >
//                             Back
//                         </Button>
//                     </Alert>
//                 </div>
//             </div>
//         );
//     }

//     if (!project) {
//         return (
//             <div className="d-flex">
//                 <Sidebar />
//                 <div className="col-md-10 main-content p-4">
//                     <Alert variant="warning" className="mt-4">
//                         <h4>Project Not Found</h4>
//                         <Button variant="primary" onClick={() => navigate('/projects')}>
//                             Back to Projects
//                         </Button>
//                     </Alert>
//                 </div>
//             </div>
//         );
//     }

//     const statusBadge = getStatusBadge(
//         project.progress === 100 ? 'completed' :
//             project.progress > 0 ? 'in_progress' : 'pending'
//     );

//     return (
//         <div className="d-flex">
//             <Sidebar />
//             <div className="col-md-10 main-content p-4">
//                 {error && (
//                     <Alert variant="danger" onClose={() => setError(null)} dismissible>
//                         {error}
//                     </Alert>
//                 )}

//                 <div className="d-flex align-items-center mb-4">
//                     <Button variant="light" onClick={() => navigate('/projects')} className="me-2 px-2 py-1">
//                         <BsArrowLeft className="me-1" /> Back
//                     </Button>
//                     <div className="ms-auto d-flex gap-2">
//                         <Button variant="outline-danger" className="px-2 py-1" onClick={() => setShowDeleteModal(true)}>
//                             <BsTrash />
//                         </Button>
//                         <Button variant="primary" className="px-2 py-1" onClick={() => setShowEditModal(true)}>
//                             <BsPencil />
//                         </Button>
//                     </div>
//                 </div>

//                 <Card className="mb-4 border-0 shadow-sm">
//                     <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
//                         <h4 className="mb-0">{project.name}</h4>
//                         <Badge bg={statusBadge.variant} className="d-flex align-items-center px-3 py-2">
//                             {statusBadge.icon}
//                             <span className="ms-1">{statusBadge.text}</span>
//                         </Badge>
//                     </Card.Header>
//                     <Card.Body className="pt-0">
//                         <Row>
//                             <Col md={8}>
//                                 <p className="text-muted mb-4">{project.description}</p>
//                                 <div className="mb-4">
//                                     <div className="d-flex justify-content-between mb-2">
//                                         <small className="text-muted">
//                                             Tasks: {project.completedTasks}/{project.totalTasks} completed
//                                         </small>
//                                         <small className="fw-bold">{project.progress}%</small>
//                                     </div>
//                                     <ProgressBar
//                                         now={project.progress}
//                                         variant={statusBadge.variant}
//                                         className="rounded-pill"
//                                         style={{ height: '8px' }}
//                                     />
//                                 </div>
//                             </Col>
//                             <Col md={4}>
//                                 <div className="bg-light p-3 rounded">
//                                     <div className="mb-3">
//                                         <small className="text-muted d-block">Manager</small>
//                                         <div className="d-flex align-items-center mt-1">
//                                             <BsPerson className="me-2 text-secondary" />
//                                             <span className="fw-medium">
//                                                 {manager?.full_name || manager?.username || 'Unassigned'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <div className="mb-3">
//                                         <small className="text-muted d-block">Created By</small>
//                                         <div className="d-flex align-items-center mt-1">
//                                             <BsPerson className="me-2 text-secondary" />
//                                             <span className="fw-medium">
//                                                 {creator?.full_name || creator?.username || 'System'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <small className="text-muted d-block">Deadline</small>
//                                         <div className="d-flex align-items-center mt-1">
//                                             <BsCalendar className="me-2 text-secondary" />
//                                             <span className="fw-medium">
//                                                 {project.deadline
//                                                     ? new Date(project.deadline).toLocaleDateString()
//                                                     : 'No deadline'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Col>
//                         </Row>
//                     </Card.Body>
//                 </Card>

//                 <Card className="border-0 shadow-sm">
//                     <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
//                         <h5 className="mb-0">Tasks</h5>
//                         <Button
//                             style={{
//                                 padding: '4px 8px',
//                                 fontSize: '14px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 width: '150px',
//                             }}
//                             variant="primary"
//                             size="sm"
//                             onClick={() => setShowTaskForm(true)}
//                         >
//                             <BsPlus style={{ marginRight: '4px' }} /> Add Task
//                         </Button>
//                     </Card.Header>
//                     <Card.Body className="pt-0">
//                         {tasks.length > 0 ? (
//                             <ListGroup variant="flush">
//                                 {tasks.map(task => {
//                                     const taskStatus = getStatusBadge(task.status);
//                                     return (
//                                         <ListGroup.Item key={task.id} className="border-0 py-3 px-0">
//                                             <div className="d-flex justify-content-between align-items-center">
//                                                 <div>
//                                                     <h6 className="mb-1 fw-medium">{task.title}</h6>
//                                                     <p className="mb-2 text-muted small">{task.description}</p>
//                                                     <div className="d-flex">
//                                                         <small className="text-muted me-3 d-flex align-items-center">
//                                                             <BsPerson className="me-1" />
//                                                             {task.assigned_to?.full_name || task.assigned_to?.username || 'Unassigned'}
//                                                         </small>
//                                                         <small className="text-muted d-flex align-items-center">
//                                                             <BsCalendar className="me-1" />
//                                                             {task.due_date
//                                                                 ? new Date(task.due_date).toLocaleDateString()
//                                                                 : 'No due date'}
//                                                         </small>
//                                                     </div>
//                                                 </div>
//                                                 <Badge bg={taskStatus.variant} className="d-flex align-items-center px-2 py-1">
//                                                     {taskStatus.icon}
//                                                     <span className="ms-1">{taskStatus.text}</span>
//                                                 </Badge>
//                                             </div>
//                                         </ListGroup.Item>
//                                     );
//                                 })}
//                             </ListGroup>
//                         ) : (
//                             <div className="text-center py-4">
//                                 <div className="mb-3">
//                                     <BsExclamationTriangle size={24} className="text-muted" />
//                                 </div>
//                                 <h5 className="text-muted mb-2">No Tasks Added Yet</h5>
//                                 <p className="text-muted mb-3">This project doesn't have any tasks assigned</p>

//                                 <Button
//                                     style={{
//                                         width: '150px',
//                                         padding: '4px 8px',
//                                         fontSize: '14px',
//                                         display: 'inline-flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                     }}
//                                     variant="primary"
//                                     size="sm"
//                                     onClick={() => setShowTaskForm(true)}
//                                 >
//                                     <BsPlus style={{ marginRight: '4px' }} /> Add First Task
//                                 </Button>
//                             </div>
//                         )}
//                     </Card.Body>
//                 </Card>

//                 {/* Delete Project Modal */}
//                 <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
//                     <Modal.Header closeButton>
//                         <Modal.Title>Confirm Deletion</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <p>Are you sure you want to delete this project and all its tasks? This action cannot be undone.</p>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="light" onClick={() => setShowDeleteModal(false)}>
//                             Cancel
//                         </Button>
//                         <Button variant="danger" onClick={handleDeleteProject}>
//                             Delete Project
//                         </Button>
//                     </Modal.Footer>
//                 </Modal>

//                 {/* Task Form Modal */}
//                 <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} centered size="lg">
//                     <Modal.Header closeButton>
//                         <Modal.Title>Add New Task</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Form onSubmit={handleAddTask}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label>Title *</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     name="title"
//                                     value={taskData.title}
//                                     onChange={(e) => setTaskData({...taskData, title: e.target.value})}
//                                     required
//                                 />
//                             </Form.Group>

//                             <Form.Group className="mb-3">
//                                 <Form.Label>Description</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={3}
//                                     name="description"
//                                     value={taskData.description}
//                                     onChange={(e) => setTaskData({...taskData, description: e.target.value})}
//                                 />
//                             </Form.Group>

//                             <Row className="mb-3">
//                                 <Col md={6}>
//                                     <Form.Group>
//                                         <Form.Label>Assign To *</Form.Label>
//                                         <Form.Select
//                                             name="assigned_to"
//                                             value={taskData.assigned_to}
//                                             onChange={(e) => setTaskData({...taskData, assigned_to: e.target.value})}
//                                             required
//                                         >
//                                             <option value="">Select Employee</option>
//                                             {employees.map(employee => (
//                                                 <option key={employee.id} value={employee.id}>
//                                                     {employee.full_name || employee.username}
//                                                 </option>
//                                             ))}
//                                         </Form.Select>
//                                     </Form.Group>
//                                 </Col>
//                                 <Col md={6}>
//                                     <Form.Group>
//                                         <Form.Label>Due Date</Form.Label>
//                                         <Form.Control
//                                             type="date"
//                                             name="due_date"
//                                             value={taskData.due_date}
//                                             onChange={(e) => setTaskData({...taskData, due_date: e.target.value})}
//                                             min={new Date().toISOString().split('T')[0]}
//                                         />
//                                     </Form.Group>
//                                 </Col>
//                             </Row>

//                             <Form.Group className="mb-3">
//                                 <Form.Label>Status</Form.Label>
//                                 <Form.Select
//                                     name="status"
//                                     value={taskData.status}
//                                     onChange={(e) => setTaskData({...taskData, status: e.target.value})}
//                                 >
//                                     <option value="pending">Pending</option>
//                                     <option value="in_progress">In Progress</option>
//                                     <option value="completed">Completed</option>
//                                 </Form.Select>
//                             </Form.Group>

//                             <div className="d-flex justify-content-end gap-2">
//                                 <Button variant="secondary" onClick={() => setShowTaskForm(false)}>
//                                     Cancel
//                                 </Button>
//                                 <Button variant="primary" type="submit">
//                                     Create Task
//                                 </Button>
//                             </div>
//                         </Form>
//                     </Modal.Body>
//                 </Modal>

//                 {/* Edit Project Modal */}
//                 <EditProjectForm
//                     project={project}
//                     managers={managers}
//                     show={showEditModal}
//                     onHide={() => setShowEditModal(false)}
//                     onSuccess={handleProjectUpdate}
//                 />
//             </div>
//         </div>
//     );
// };

// export default ProjectDetailsPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BsArrowLeft, BsPerson, BsCalendar, BsCheckCircle,
    BsClock, BsExclamationTriangle, BsPlus,
    BsPencil, BsTrash
} from 'react-icons/bs';
import {
    Alert, Button, Card, Spinner, Row, Col,
    Badge, ProgressBar, ListGroup, Modal, Form
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { superManagerApi } from '../api/api';
import Sidebar from '../components/Sidebar';
import EditProjectForm from '../components/EditProjectForm';

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [manager, setManager] = useState(null);
    const [creator, setCreator] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
    });

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setLoading(true);

                const [projectData, tasksData, employeesData, managersData] = await Promise.all([
                    superManagerApi.getProject(id),
                    superManagerApi.getTasksByProject(id),
                    superManagerApi.getUsers(),
                    superManagerApi.getUsers()
                ]);

                // Filter users by role
                const filteredEmployees = employeesData.filter(user => user.role === 'employee');
                const filteredManagers = managersData.filter(user => user.role === 'manager');

                // Fetch manager and creator details
                const managerData = projectData.assigned_to
                    ? await superManagerApi.getUser(projectData.assigned_to)
                    : null;
                const creatorData = projectData.created_by
                    ? await superManagerApi.getUser(projectData.created_by)
                    : null;

                const completedTasks = tasksData.filter(task => task.status === 'completed').length;
                const progress = tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0;

                setProject({
                    ...projectData,
                    progress,
                    totalTasks: tasksData.length,
                    completedTasks
                });
                setTasks(tasksData);
                setManager(managerData);
                setCreator(creatorData);
                setEmployees(filteredEmployees);
                setManagers(filteredManagers);
            } catch (err) {
                setError(err.message || 'Failed to fetch project details');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const handleDeleteProject = async () => {
        try {
            await superManagerApi.deleteProject(id);
            navigate('/projects');
        } catch (err) {
            console.error('Error deleting project:', err);
            setError('Failed to delete project: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (!taskData.title.trim()) {
                throw new Error('Task title is required');
            }
            if (!taskData.assigned_to) {
                throw new Error('Please assign the task to an employee');
            }

            const taskPayload = {
                title: taskData.title.trim(),
                description: taskData.description.trim() || null,
                project: parseInt(id),
                assigned_to: parseInt(taskData.assigned_to),
                due_date: taskData.due_date || null,
                status: taskData.status
            };

            const response = await superManagerApi.createTask(taskPayload);

            const assignedEmployee = employees.find(emp => emp.id === parseInt(taskData.assigned_to));

            if (!assignedEmployee) {
                throw new Error('Assigned employee not found in local data');
            }

            const newTask = {
                ...response,
                assigned_to: {
                    id: assignedEmployee.id,
                    username: assignedEmployee.username,
                    full_name: assignedEmployee.full_name
                }
            };

            setTasks(prevTasks => [...prevTasks, newTask]);

            setProject(prevProject => {
                const totalTasks = prevProject.totalTasks + 1;
                const completedTasks = newTask.status === 'completed'
                    ? prevProject.completedTasks + 1
                    : prevProject.completedTasks;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return {
                    ...prevProject,
                    progress,
                    totalTasks,
                    completedTasks
                };
            });

            setShowTaskForm(false);
            setTaskData({
                title: '',
                description: '',
                assigned_to: '',
                due_date: '',
                status: 'pending'
            });

        } catch (err) {
            console.error('Task creation error:', err);

            let errorMessage = 'Failed to create task';

            if (err.response) {
                errorMessage = err.response.data?.error ||
                    err.response.data?.message ||
                    `Server error (${err.response.status})`;
            } else if (err.request) {
                errorMessage = 'Network error - please check your connection';
            } else {
                errorMessage = err.message || 'Failed to create task';
            }

            setError(errorMessage);
        }
    };

    const handleProjectUpdate = (updatedProject) => {
        setProject(prev => ({
            ...prev,
            ...updatedProject
        }));

        if (updatedProject.assigned_to !== project.assigned_to) {
            superManagerApi.getUser(updatedProject.assigned_to)
                .then(setManager)
                .catch(err => {
                    console.error('Failed to fetch updated manager:', err);
                    setManager(null);
                });
        }
    };

    const getStatusBadge = (task) => {
        if (task.is_overdue) {
            return { variant: 'danger', icon: <BsExclamationTriangle />, text: 'Overdue' };
        }

        switch (task.status) {
            case 'completed': return { variant: 'success', icon: <BsCheckCircle />, text: 'Completed' };
            case 'in_progress': return { variant: 'primary', icon: <BsClock />, text: 'In Progress' };
            case 'pending': return { variant: 'warning', icon: <BsExclamationTriangle />, text: 'Pending' };
            default: return { variant: 'secondary', icon: null, text: 'Unknown' };
        }
    };

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

    if (error) {
        return (
            <div className="d-flex">
                <Sidebar />
                <div className="col-md-10 main-content p-4">
                    <Alert variant="danger" className="mt-4">
                        <h4>Error Loading Project</h4>
                        <p>{error}</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/projects')}
                            style={{
                                padding: '4px 10px',
                                fontSize: '13px',
                                fontWeight: '500',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            Back
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="d-flex">
                <Sidebar />
                <div className="col-md-10 main-content p-4">
                    <Alert variant="warning" className="mt-4">
                        <h4>Project Not Found</h4>
                        <Button variant="primary" onClick={() => navigate('/projects')}>
                            Back to Projects
                        </Button>
                    </Alert>
                </div>
            </div>
        );
    }

    const statusBadge = getStatusBadge({
        status: project.progress === 100 ? 'completed' :
            project.progress > 0 ? 'in_progress' : 'pending',
        is_overdue: false
    });

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="col-md-10 main-content p-4">
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                <div className="d-flex align-items-center mb-4">
                    <Button variant="light" onClick={() => navigate('/projects')} className="me-2 px-2 py-1">
                        <BsArrowLeft className="me-1" /> Back
                    </Button>
                    <div className="ms-auto d-flex gap-2">
                        <Button variant="outline-danger" className="px-2 py-1" onClick={() => setShowDeleteModal(true)}>
                            <BsTrash />
                        </Button>
                        <Button variant="primary" className="px-2 py-1" onClick={() => setShowEditModal(true)}>
                            <BsPencil />
                        </Button>
                    </div>
                </div>

                <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
                        <h4 className="mb-0">{project.name}</h4>
                        <Badge bg={statusBadge.variant} className="d-flex align-items-center px-3 py-2">
                            {statusBadge.icon}
                            <span className="ms-1">{statusBadge.text}</span>
                        </Badge>
                    </Card.Header>
                    <Card.Body className="pt-0">
                        <Row>
                            <Col md={8}>
                                <p className="text-muted mb-4">{project.description}</p>
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <small className="text-muted">
                                            Tasks: {project.completedTasks}/{project.totalTasks} completed
                                        </small>
                                        <small className="fw-bold">{project.progress}%</small>
                                    </div>
                                    <ProgressBar
                                        now={project.progress}
                                        variant={statusBadge.variant}
                                        className="rounded-pill"
                                        style={{ height: '8px' }}
                                    />
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="bg-light p-3 rounded">
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Manager</small>
                                        <div className="d-flex align-items-center mt-1">
                                            <BsPerson className="me-2 text-secondary" />
                                            <span className="fw-medium">
                                                {manager?.full_name || manager?.username || 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Created By</small>
                                        <div className="d-flex align-items-center mt-1">
                                            <BsPerson className="me-2 text-secondary" />
                                            <span className="fw-medium">
                                                {creator?.full_name || creator?.username || 'System'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Deadline</small>
                                        <div className="d-flex align-items-center mt-1">
                                            <BsCalendar className="me-2 text-secondary" />
                                            <span className="fw-medium">
                                                {project.deadline
                                                    ? new Date(project.deadline).toLocaleDateString()
                                                    : 'No deadline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
                        <h5 className="mb-0">Tasks</h5>
                        <Button
                            style={{
                                padding: '4px 8px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '150px',
                            }}
                            variant="primary"
                            size="sm"
                            onClick={() => setShowTaskForm(true)}
                        >
                            <BsPlus style={{ marginRight: '4px' }} /> Add Task
                        </Button>
                    </Card.Header>
                    <Card.Body className="pt-0">
                        {tasks.length > 0 ? (
                            <ListGroup variant="flush">
                                {tasks.map(task => {
                                    const taskStatus = getStatusBadge(task);
                                    return (
                                        <ListGroup.Item key={task.id} className="border-0 py-3 px-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1 fw-medium">{task.title}</h6>
                                                    <p className="mb-2 text-muted small">{task.description}</p>
                                                    <div className="d-flex">
                                                        <small className="text-muted me-3 d-flex align-items-center">
                                                            <BsPerson className="me-1" />
                                                            {task.assigned_to?.full_name || task.assigned_to?.username || 'Unassigned'}
                                                        </small>
                                                        <small className="text-muted d-flex align-items-center">
                                                            <BsCalendar className="me-1" />
                                                            {task.due_date
                                                                ? new Date(task.due_date).toLocaleDateString()
                                                                : 'No due date'}
                                                        </small>
                                                    </div>
                                                </div>
                                                <Badge bg={taskStatus.variant} className="d-flex align-items-center px-2 py-1">
                                                    {taskStatus.icon}
                                                    <span className="ms-1">{taskStatus.text}</span>
                                                </Badge>
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
                                    style={{
                                        width: '150px',
                                        padding: '4px 8px',
                                        fontSize: '14px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setShowTaskForm(true)}
                                >
                                    <BsPlus style={{ marginRight: '4px' }} /> Add First Task
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Delete Project Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete this project and all its tasks? This action cannot be undone.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteProject}>
                            Delete Project
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Task Form Modal */}
                <Modal show={showTaskForm} onHide={() => setShowTaskForm(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleAddTask}>
                            <Form.Group className="mb-3">
                                <Form.Label>Title *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
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
                                    name="description"
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                />
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Assign To *</Form.Label>
                                        <Form.Select
                                            name="assigned_to"
                                            value={taskData.assigned_to}
                                            onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Employee</option>
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
                                        <Form.Label>Due Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="due_date"
                                            value={taskData.due_date}
                                            onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
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
                                <Button variant="primary" type="submit">
                                    Create Task
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Edit Project Modal */}
                <EditProjectForm
                    project={project}
                    managers={managers}
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    onSuccess={handleProjectUpdate}
                />
            </div>
        </div>
    );
};

export default ProjectDetailsPage;