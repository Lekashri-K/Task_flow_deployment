import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { BsX, BsCheck } from 'react-icons/bs';

const TaskForm = ({ onSubmit, onCancel, projectId }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(taskData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                    type="text"
                    name="title"
                    value={taskData.title}
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
                    value={taskData.description}
                    onChange={handleChange}
                />
            </Form.Group>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Assigned To (User ID)</Form.Label>
                        <Form.Control
                            type="text"
                            name="assigned_to"
                            value={taskData.assigned_to}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Due Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="due_date"
                            value={taskData.due_date}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                    name="status"
                    value={taskData.status}
                    onChange={handleChange}
                >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    <BsX className="me-1" /> Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (
                        <>
                            <BsCheck className="me-1" /> Save Task
                        </>
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default TaskForm;