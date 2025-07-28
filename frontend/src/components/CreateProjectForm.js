import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { BsX, BsCheck } from 'react-icons/bs';
import { superManagerApi } from '../api/api';

const CreateProjectForm = ({ show, onHide, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigned_to: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [managers, setManagers] = useState([]);

  // Fetch managers when component mounts
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const users = await superManagerApi.getUsers();
        const managerList = users.filter(user => user.role === 'manager')
                               .map(user => ({
                                 id: user.id,
                                 name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
                               }));
        setManagers(managerList);
      } catch (err) {
        console.error('Failed to fetch managers:', err);
      }
    };
    
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await superManagerApi.createProject({
        name: formData.name,
        description: formData.description,
        assigned_to: formData.assigned_to, // This should be the manager ID
        deadline: formData.deadline || null
      });
      
      setSuccess(true);
      setTimeout(() => {
        onProjectCreated(response);
        onHide();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      assigned_to: '',
      deadline: ''
    });
    setSuccess(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Project</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              <BsCheck className="me-2" />
              Project created successfully!
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Manager</Form.Label>
            <Form.Select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
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
              value={formData.deadline}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            <BsX className="me-1" /> Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" />
                <span className="ms-2">Creating...</span>
              </>
            ) : (
              <>
                <BsCheck className="me-1" /> Create Project
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateProjectForm;