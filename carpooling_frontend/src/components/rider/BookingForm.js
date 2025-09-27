import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as rideService from '../../services/rideService';
import * as bookingService from '../../services/bookingService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const BookingForm = () => {
  const { rideId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [ride, setRide] = useState(null);
  const [booking, setBooking] = useState({
    numberOfSeats: 1,
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingRide, setFetchingRide] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchRide = async () => {
      try {
        setFetchingRide(true);
        
        const response = await rideService.getRideById(rideId);
        setRide(response);
      } catch (error) {
        console.error('Error fetching ride:', error);
        setError('Failed to load ride information');
      } finally {
        setFetchingRide(false);
      }
    };
    
    fetchRide();
  }, [rideId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBooking({
      ...booking,
      [name]: name === 'numberOfSeats' ? parseInt(value, 10) : value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (booking.numberOfSeats > ride.availableSeats) {
      setError('You cannot book more seats than available');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const bookingData = {
        numberOfSeats: booking.numberOfSeats,
      };
      
      // Create the booking first
      const response = await bookingService.createBooking(currentUser.id, rideId, bookingData);
      
      // Navigate directly to payment page with the new booking
      navigate(`/payment/${response.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingRide) {
    return <LoadingSpinner />;
  }
  
  if (!ride) {
    return (
      <Container>
        <Alert variant="danger">
          Ride not found or has been cancelled. <Button variant="link" onClick={() => navigate('/rider/search')}>Search for new rides</Button>
        </Alert>
      </Container>
    );
  }
  
  const totalFare = booking.numberOfSeats * ride.fareAmount;
  
  return (
    <Container className="form-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Book a Ride</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="mb-4">
            <h5>Ride Details</h5>
            <Row>
              <Col md={6}>
                <p><strong>From:</strong> {ride.originLocation}</p>
                <p><strong>To:</strong> {ride.destinationLocation}</p>
                <p><strong>Date/Time:</strong> {formatDate(ride.departureTime)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Driver:</strong> {ride.driver?.fullName}</p>
                <p><strong>Vehicle:</strong> {ride.vehicle?.make} {ride.vehicle?.model}</p>
                <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
                <p><strong>Fare per Seat:</strong> {formatCurrency(ride.fareAmount)}</p>
              </Col>
            </Row>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group id="numberOfSeats" className="mb-3">
              <Form.Label>Number of Seats to Book</Form.Label>
              <Form.Control
                type="number"
                name="numberOfSeats"
                min="1"
                max={ride.availableSeats}
                value={booking.numberOfSeats}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Alert variant="info">
              <strong>Total Fare:</strong> {formatCurrency(totalFare)}
            </Alert>
            
            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/rider/search')}
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
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingForm;