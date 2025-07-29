import React, { useState, useEffect } from 'react';
import { 
  BsArrowLeft
} from 'react-icons/bs';
import {
  Card, Form, Button, Spinner, Alert,
  FloatingLabel, InputGroup
} from 'react-bootstrap';
import ManagerSidebar from '../components/ManagerSidebar';
import { managerApi } from '../api/api';
import { useNavigate } from 'react-router-dom';

const CreateTask = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assigned_to: '',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsResponse, employeesResponse] = await Promise.all([
          managerApi.getProjects(),
          managerApi.getEmployees()
        ]);
        setProjects(projectsResponse);
        setEmployees(employeesResponse);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        project: parseInt(formData.project),
        assigned_to: parseInt(formData.assigned_to),
        due_date: formData.due_date || null
      };
      
      await managerApi.createTask(dataToSend);
      navigate('/manager/tasks');
    } catch (err) {
      setError('Failed to create task. ' + (err.response?.data?.message || 'Please try again.'));
      setLoading(false);
      console.error('Error creating task:', err);
    }
  };

  if (loading && !error) {
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

  return (
    <div className="d-flex">
      <ManagerSidebar />
      <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
        <Button style={{color:'white'}}
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="mb-3"
        >
          <BsArrowLeft /> Back
        </Button>
        
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h4 className="mb-0">Create New Task</h4>
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <FloatingLabel controlId="title" label="Title" className="mb-3">
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  required
                />
              </FloatingLabel>

              <FloatingLabel controlId="description" label="Description" className="mb-3">
                <Form.Control
                  as="textarea"
                  style={{ height: '100px' }}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                />
              </FloatingLabel>

              <FloatingLabel controlId="project" label="Project" className="mb-3">
                <Form.Select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>

              <FloatingLabel controlId="assigned_to" label="Assign To" className="mb-3">
                <Form.Select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>

              <Form.Group className="mb-3">
                <Form.Label>Due Date (Optional)</Form.Label>
                <Form.Control
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </Form.Group>

              <FloatingLabel controlId="status" label="Status" className="mb-3">
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                </Form.Select>
              </FloatingLabel>

              <div className="d-flex justify-content-end">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/manager/tasks')}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" size="sm" animation="border" role="status" />
                      <span className="visually-hidden">Creating...</span>
                    </>
                  ) : 'Create Task'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default CreateTask;