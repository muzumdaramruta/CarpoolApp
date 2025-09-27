import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import * as rideService from '../../services/rideService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const SearchRides = () => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
    
    // Clear validation error when field is changed
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
      
      
      const departureDateTime = searchParams.departureTime 
        ? `${searchParams.departureDate}T${searchParams.departureTime}:00` 
        : `${searchParams.departureDate}T00:00:00`;
      
      // Send parameters directly to backend
      const results = await rideService.searchRides(
        searchParams.origin,
        searchParams.destination,
        departureDateTime
      );
      
      setSearchResults(results);
      setSearched(true);
    } catch (error) {
      console.error('Error searching for rides:', error);
      
      // Handle server validation errors
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setValidationErrors(error.response.data.errors);
        }
        if (error.response.data.message) {
          setError(error.response.data.message);
        }
      } else {
        setError('Failed to search for rides. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <h1 className="mb-4">Find a Ride</h1>
      
      <Card className="mb-4">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group id="origin" className="mb-3">
                  <Form.Label>Origin</Form.Label>
                  <Form.Control
                    type="text"
                    name="origin"
                    value={searchParams.origin}
                    onChange={handleChange}
                    placeholder="Enter pickup location"
                    isInvalid={!!validationErrors.origin}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.origin}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group id="destination" className="mb-3">
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    type="text"
                    name="destination"
                    value={searchParams.destination}
                    onChange={handleChange}
                    placeholder="Enter drop-off location"
                    isInvalid={!!validationErrors.destination}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.destination}
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
                    value={searchParams.departureDate}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.departureDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.departureDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group id="departureTime" className="mb-3">
                  <Form.Label>Departure Time (Optional)</Form.Label>
                  <Form.Control
                    type="time"
                    name="departureTime"
                    value={searchParams.departureTime}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.departureTime}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.departureTime}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Rides'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {loading ? (
        <LoadingSpinner />
      ) : searched && (
        <div className="search-results">
          <h2 className="mb-3">Search Results</h2>
          
          {searchResults.length === 0 ? (
            <Alert variant="info">
              No rides found for your search criteria. Try adjusting your search parameters.
            </Alert>
          ) : (
            <Row>
              {searchResults.map(ride => (
                <Col md={4} key={ride.id}>
                  <Card className="mb-4 card-hover">
                    <Card.Body>
                      <Card.Title>
                        {ride.originLocation} → {ride.destinationLocation}
                      </Card.Title>
                      <Card.Text>
                        <strong>Date:</strong> {formatDate(ride.departureTime)}<br />
                        <strong>Driver:</strong> {ride.driver.fullName}<br />
                        <strong>Vehicle:</strong> {ride.vehicle.make} {ride.vehicle.model}<br />
                        <strong>Available Seats:</strong> {ride.availableSeats}<br />
                        <strong>Fare per Seat:</strong> {formatCurrency(ride.fareAmount)}
                      </Card.Text>
                      <div className="d-grid">
                        <Button 
                          as={Link} 
                          to={`/rider/book/${ride.id}`}
                          variant="success"
                        >
                          Book This Ride
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}
    </Container>
  );
};

export default SearchRides;