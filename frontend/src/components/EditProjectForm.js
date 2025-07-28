import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { superManagerApi } from '../api/api';

const EditProjectForm = ({ 
  project, 
  managers, 
  show, 
  onHide, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    assigned_to: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form when project or show changes
  useEffect(() => {
    if (project && show) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        assigned_to: project.assigned_to || ''
      });
      setError(null);
    }
  }, [project, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline || null,
        assigned_to: formData.assigned_to || null
      };

      // Call API to update project
      const updatedProject = await superManagerApi.updateProject(project.id, payload);
      
      // Notify parent component of success
      onSuccess(updatedProject);
      onHide();
    } catch (err) {
      console.error('Failed to update project:', err);
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Project Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Project Manager</Form.Label>
            <Form.Select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name || manager.username}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="secondary" 
              onClick={onHide}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProjectForm;