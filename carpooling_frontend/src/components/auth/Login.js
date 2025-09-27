import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.login(credentials);
      login(response.user, response.token);
      
      // Redirect based on user role
      if (response.user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else {
        navigate('/rider/dashboard');
      }
    } 
    catch (err) {
      console.error('Login error:', err);
      
      if (err.response && err.response.data) {
        // Log the complete response for debugging
        console.log('Error response data:', err.response.data);
        
        if (err.response.data.errors) {
          // If we have field-specific errors, display them
          const errorFields = Object.entries(err.response.data.errors);
          if (errorFields.length > 0) {
            // Format field errors nicely
            const errorMessages = errorFields.map(([field, message]) => `${message}`);
            setError(errorMessages.join(', '));
          } else {
            // Fallback to the main message if no specific field errors
            setError(err.response.data.message || 'Login failed');
          }
        } else if (err.response.data.message) {
          // Just show the message if no field errors
          setError(err.response.data.message);
        } else {
          setError('Failed to log in. Please check your credentials.');
        }
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    }
  };

  return (
    <Container className="auth-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="username" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
              />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Log In
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/register">Register</Link>
      </div>
    </Container>
  );
};

export default Login;