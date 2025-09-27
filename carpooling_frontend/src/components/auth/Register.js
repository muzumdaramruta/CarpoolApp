import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import * as authService from '../../services/authService';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'RIDER', // Default to RIDER
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setValidationErrors({});
      setLoading(true);
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userDataToSubmit } = userData;
      
      await authService.register(userDataToSubmit);
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err) {
      console.error('Registration error:', err);
      setLoading(false);
      
      // Handle errors from your custom ValidationException
      if (err.response && err.response.data) {
        // Check for your custom validation format
        if (err.response.data.message === 'User validation failed' && err.response.data.errors) {
          // This matches your ValidationException format with field errors map
          setValidationErrors(err.response.data.errors);
        } else if (err.response.data.message) {
          // Single error message
          setError(err.response.data.message);
        } else {
          // Generic error fallback
          setError('Failed to create an account. Please check your information and try again.');
        }
      } else {
        setError('Failed to connect to the server. Please try again later.');
      }
    }
  };

  return (
    <Container className="auth-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="fullName" className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={userData.fullName}
                onChange={handleChange}
                isInvalid={!!validationErrors.fullName}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                isInvalid={!!validationErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="phoneNumber" className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleChange}
                isInvalid={!!validationErrors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.phoneNumber}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="username" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={userData.username}
                onChange={handleChange}
                isInvalid={!!validationErrors.username}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.username}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                isInvalid={!!validationErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="confirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!validationErrors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="role" className="mb-3">
              <Form.Label>Register as</Form.Label>
              <Form.Select
                name="role"
                value={userData.role}
                onChange={handleChange}
                isInvalid={!!validationErrors.role}
              >
                <option value="RIDER">Rider</option>
                <option value="DRIVER">Driver</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.role}
              </Form.Control.Feedback>
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </Container>
  );
};

export default Register;