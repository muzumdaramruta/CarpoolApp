import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as vehicleService from '../../services/vehicleService';
import * as rideService from '../../services/rideService';

const PostRideForm = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const [ride, setRide] = useState({
    vehicleId: '',
    originLocation: '',
    destinationLocation: '',
    departureDate: '',
    departureTime: '',
    availableSeats: 1,
    fareAmount: '',
  });
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setFetchingVehicles(true);
        const vehiclesData = await vehicleService.getUserVehicles(currentUser.id);
        setVehicles(vehiclesData);
        
        // Set default vehicleId if vehicles exist
        if (vehiclesData.length > 0) {
          setRide(prev => ({
            ...prev,
            vehicleId: vehiclesData[0].id.toString(),
            availableSeats: vehiclesData[0].capacity,
          }));
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load your vehicles');
      } finally {
        setFetchingVehicles(false);
      }
    };
    
    fetchVehicles();
  }, [currentUser.id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for vehicle selection to update available seats
    if (name === 'vehicleId') {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(value, 10));
      setRide({
        ...ride,
        vehicleId: value,
        availableSeats: selectedVehicle ? selectedVehicle.capacity : 1,
      });
    } else {
      setRide({
        ...ride,
        [name]: name === 'availableSeats' || name === 'fareAmount' 
          ? parseFloat(value) 
          : value,
      });
    }
    
    // Clear validation error when user modifies a field
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
      
      // Combine date and time into a single ISO string
      const departureDateTime = new Date(`${ride.departureDate}T${ride.departureTime}`).toISOString();
      
      const rideData = {
        originLocation: ride.originLocation,
        destinationLocation: ride.destinationLocation,
        departureTime: departureDateTime,
        availableSeats: ride.availableSeats,
        fareAmount: ride.fareAmount,
      };
      
      await rideService.createRide(currentUser.id, ride.vehicleId, rideData);
      navigate('/driver/rides');
    } catch (error) {
      console.error('Error creating ride:', error);
      
      // Handle validation errors
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setValidationErrors(error.response.data.errors);
        }
        if (error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Failed to create ride. Please try again.');
        }
      } else {
        setError('Failed to create ride. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingVehicles) {
    return <LoadingSpinner />;
  }
  
  // If no vehicles, prompt to add a vehicle first
  if (vehicles.length === 0) {
    return (
      <Container className="form-container">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Post a Ride</h2>
            <Alert variant="info">
              You need to add a vehicle before you can post a ride.
            </Alert>
            <div className="d-flex justify-content-center">
              <Button 
                variant="primary" 
                onClick={() => navigate('/driver/vehicles/new')}
              >
                Add a Vehicle
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="form-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Post a Ride</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="vehicleId" className="mb-3">
              <Form.Label>Select Vehicle</Form.Label>
              <Form.Select
                name="vehicleId"
                value={ride.vehicleId}
                onChange={handleChange}
                isInvalid={!!validationErrors.vehicleId}
              >
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.vehicleId}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group id="originLocation" className="mb-3">
                  <Form.Label>Origin</Form.Label>
                  <Form.Control
                    type="text"
                    name="originLocation"
                    value={ride.originLocation}
                    onChange={handleChange}
                    placeholder="Enter pickup location"
                    isInvalid={!!validationErrors.originLocation}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.originLocation}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group id="destinationLocation" className="mb-3">
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    type="text"
                    name="destinationLocation"
                    value={ride.destinationLocation}
                    onChange={handleChange}
                    placeholder="Enter drop-off location"
                    isInvalid={!!validationErrors.destinationLocation}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.destinationLocation}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group id="departureDate" className="mb-3">
                  <Form.Label>Departure Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="departureDate"
                    value={ride.departureDate}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.departureDate || !!validationErrors.departureTime}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.departureDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group id="departureTime" className="mb-3">
                  <Form.Label>Departure Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="departureTime"
                    value={ride.departureTime}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.departureTime}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.departureTime}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group id="availableSeats" className="mb-3">
                  <Form.Label>Available Seats</Form.Label>
                  <Form.Control
                    type="number"
                    name="availableSeats"
                    min="1"
                    max={vehicles.find(v => v.id === parseInt(ride.vehicleId, 10))?.capacity || 10}
                    value={ride.availableSeats}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.availableSeats}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.availableSeats}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group id="fareAmount" className="mb-3">
                  <Form.Label>Fare per Seat (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    name="fareAmount"
                    min="0"
                    step="0.01"
                    value={ride.fareAmount}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.fareAmount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.fareAmount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/driver/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
                className="ms-auto"
              >
                {loading ? 'Posting...' : 'Post Ride'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PostRideForm;