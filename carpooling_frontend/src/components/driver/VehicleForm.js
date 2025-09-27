import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as vehicleService from '../../services/vehicleService';

const VehicleForm = () => {
  const { id } = useParams(); // If editing, id will be available
  const isEditing = !!id;
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    licensePlate: '',
    capacity: 4, // Default capacity
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingVehicle, setFetchingVehicle] = useState(isEditing);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    const fetchVehicle = async () => {
      if (isEditing) {
        try {
          setFetchingVehicle(true);
          const vehicles = await vehicleService.getUserVehicles(currentUser.id);
          const vehicleData = vehicles.find(v => v.id === parseInt(id));
          
          if (vehicleData) {
            setVehicle(vehicleData);
          } else {
            setError('Vehicle not found');
            navigate('/driver/dashboard');
          }
        } catch (error) {
          console.error('Error fetching vehicle:', error);
          setError('Failed to load vehicle data');
        } finally {
          setFetchingVehicle(false);
        }
      }
    };
    
    fetchVehicle();
  }, [id, isEditing, currentUser.id, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({
      ...vehicle,
      [name]: name === 'capacity' ? parseInt(value, 10) : value,
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setValidationErrors({});
      
      if (isEditing) {
        await vehicleService.updateVehicle(id, vehicle);
      } else {
        await vehicleService.createVehicle(currentUser.id, vehicle);
      }
      
      navigate('/driver/dashboard');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      // Handle validation errors from backend
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setValidationErrors(error.response.data.errors);
        }
        if (error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Failed to save vehicle. Please try again.');
        }
      } else {
        setError('Failed to save vehicle. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await vehicleService.deleteVehicle(id);
      setShowDeleteModal(false);
      navigate('/driver/dashboard', { 
        state: { message: "Vehicle successfully deleted" } 
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      
      // Display the error message from the server if available
      const errorMessage = error.response?.data?.message || 'Failed to delete vehicle';
      setError(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  if (fetchingVehicle) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container className="form-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="make" className="mb-3">
              <Form.Label>Make</Form.Label>
              <Form.Control
                type="text"
                name="make"
                value={vehicle.make}
                onChange={handleChange}
                isInvalid={!!validationErrors.make}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.make}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="model" className="mb-3">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                isInvalid={!!validationErrors.model}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.model}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="licensePlate" className="mb-3">
              <Form.Label>License Plate</Form.Label>
              <Form.Control
                type="text"
                name="licensePlate"
                value={vehicle.licensePlate}
                onChange={handleChange}
                isInvalid={!!validationErrors.licensePlate}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.licensePlate}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group id="capacity" className="mb-3">
              <Form.Label>Seating Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                min="1"
                max="10"
                value={vehicle.capacity}
                onChange={handleChange}
                isInvalid={!!validationErrors.capacity}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.capacity}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/driver/dashboard')}
                disabled={loading || deleteLoading}
              >
                Cancel
              </Button>
              
              {isEditing && (
                <Button 
                  variant="danger" 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading || deleteLoading}
                >
                  Delete Vehicle
                </Button>
              )}
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || deleteLoading}
                className="ms-auto"
              >
                {loading ? 'Saving...' : 'Save Vehicle'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this vehicle? This action cannot be undone.
          <p className="mt-2">
            <strong>Vehicle:</strong> {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Vehicle'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VehicleForm;