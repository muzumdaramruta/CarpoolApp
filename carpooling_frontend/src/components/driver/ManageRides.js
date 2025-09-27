import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Badge, Row, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as rideService from '../../services/rideService';
import * as bookingService from '../../services/bookingService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ManageRides = () => {
  const { currentUser } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [bookingsByRide, setBookingsByRide] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all rides for this driver
        const ridesData = await rideService.getRidesByDriver(currentUser.id);
        setRides(ridesData);
        
        // Fetch bookings for each ride with better error handling
        const bookingsMap = {};
        for (const ride of ridesData) {
          try {
            const bookings = await bookingService.getBookingsByRide(ride.id);
            // Ensure bookings is always an array
            bookingsMap[ride.id] = Array.isArray(bookings) ? bookings : [];
          } catch (bookingError) {
            console.error(`Error fetching bookings for ride ${ride.id}:`, bookingError);
            bookingsMap[ride.id] = []; // Default to empty array on error
          }
        }
        
        setBookingsByRide(bookingsMap);
      } catch (error) {
        console.error('Error fetching rides:', error);
        setError('Failed to load rides. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser.id]);
  
  const handleUpdateRideStatus = async (rideId, newStatus) => {
    try {
      await rideService.updateRideStatus(rideId, newStatus);
      
      // Update local state
      setRides(rides.map(ride => 
        ride.id === rideId 
          ? { ...ride, status: newStatus } 
          : ride
      ));
    } catch (error) {
      console.error('Error updating ride status:', error);
      alert('Failed to update ride status. Please try again.');
    }
  };
  
  const getStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'SCHEDULED':
        variant = 'primary';
        break;
      case 'IN_PROGRESS':
        variant = 'warning';
        break;
      case 'COMPLETED':
        variant = 'success';
        break;
      case 'CANCELLED':
        variant = 'secondary';
        break;
      default:
        variant = 'info';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Filter rides by status
  const scheduledRides = rides.filter(ride => ride.status === 'SCHEDULED');
  const inProgressRides = rides.filter(ride => ride.status === 'IN_PROGRESS');
  const completedRides = rides.filter(ride => ride.status === 'COMPLETED');
  const cancelledRides = rides.filter(ride => ride.status === 'CANCELLED');
  
  const renderRideCard = (ride) => {
    // Ensure bookings is always an array with additional safety checks
    const bookings = bookingsByRide[ride.id];
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    
    // Filter bookings based on ride status for better display
    const allPaidBookings = bookingsArray.filter(booking => 
      booking && (booking.status === 'ACCEPTED' || booking.status === 'COMPLETED')
    );
    
    const confirmedBookings = bookingsArray.filter(booking => booking && booking.status === 'ACCEPTED');
    const completedBookings = bookingsArray.filter(booking => booking && booking.status === 'COMPLETED');
    
    return (
      <Card key={ride.id} className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Card.Title>{ride.originLocation} → {ride.destinationLocation}</Card.Title>
              <Card.Subtitle className="text-muted">
                {formatDate(ride.departureTime)}
              </Card.Subtitle>
            </div>
            {getStatusBadge(ride.status)}
          </div>
          
          <Row>
            <Col md={6}>
              <p><strong>Vehicle:</strong> {ride.vehicle?.make} {ride.vehicle?.model}</p>
              <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
              <p><strong>Fare per Seat:</strong> {formatCurrency(ride.fareAmount)}</p>
            </Col>
            <Col md={6}>
              <p><strong>Total Bookings:</strong> {allPaidBookings.length}</p>
              <p><strong>Revenue:</strong> {formatCurrency(
                allPaidBookings.reduce((total, booking) => 
                  total + (booking.numberOfSeats * ride.fareAmount), 0
                )
              )}</p>
              {ride.status === 'COMPLETED' && (
                <p><strong>Status:</strong> <Badge bg="success">Ride Completed</Badge></p>
              )}
            </Col>
          </Row>
          
          {ride.status === 'SCHEDULED' && (
            <div className="d-flex gap-2 mt-3">
              <Button 
                variant="warning" 
                size="sm"
                onClick={() => handleUpdateRideStatus(ride.id, 'IN_PROGRESS')}
                disabled={allPaidBookings.length === 0}
              >
                Start Ride
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => handleUpdateRideStatus(ride.id, 'CANCELLED')}
              >
                Cancel Ride
              </Button>
            </div>
          )}
          
          {ride.status === 'IN_PROGRESS' && (
            <div className="d-flex gap-2 mt-3">
              <Button 
                variant="success" 
                size="sm"
                onClick={() => handleUpdateRideStatus(ride.id, 'COMPLETED')}
              >
                Complete Ride
              </Button>
            </div>
          )}
          
          {/* Show riders based on ride status */}
          {ride.status === 'SCHEDULED' && confirmedBookings.length > 0 && (
            <div className="mt-4">
              <h5>🎫 Confirmed Riders (Paid)</h5>
              {confirmedBookings.map(booking => (
                <Card key={booking.id} className="mb-2" style={{ borderLeft: '4px solid #28a745' }}>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <p className="mb-1"><strong>👤 Rider:</strong> {booking.rider?.fullName}</p>
                        <p className="mb-1"><strong>🪑 Seats:</strong> {booking.numberOfSeats}</p>
                        <p className="mb-1"><strong>📱 Phone:</strong> {booking.rider?.phoneNumber}</p>
                      </Col>
                      <Col md={4} className="text-end">
                        <Badge bg="success">Paid & Confirmed</Badge>
                        <p className="mb-0 mt-1">
                          <strong>{formatCurrency(booking.numberOfSeats * ride.fareAmount)}</strong>
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
          
          {ride.status === 'IN_PROGRESS' && confirmedBookings.length > 0 && (
            <div className="mt-4">
              <h5>🚗 Active Passengers</h5>
              {confirmedBookings.map(booking => (
                <Card key={booking.id} className="mb-2" style={{ borderLeft: '4px solid #ffc107' }}>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <p className="mb-1"><strong>👤 Rider:</strong> {booking.rider?.fullName}</p>
                        <p className="mb-1"><strong>🪑 Seats:</strong> {booking.numberOfSeats}</p>
                        <p className="mb-1"><strong>📱 Phone:</strong> {booking.rider?.phoneNumber}</p>
                      </Col>
                      <Col md={4} className="text-end">
                        <Badge bg="warning">In Transit</Badge>
                        <p className="mb-0 mt-1">
                          <strong>{formatCurrency(booking.numberOfSeats * ride.fareAmount)}</strong>
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
          
          {ride.status === 'COMPLETED' && allPaidBookings.length > 0 && (
            <div className="mt-4">
              <h5>✅ Completed Passengers</h5>
              {allPaidBookings.map(booking => (
                <Card key={booking.id} className="mb-2" style={{ borderLeft: '4px solid #17a2b8' }}>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <p className="mb-1"><strong>👤 Rider:</strong> {booking.rider?.fullName}</p>
                        <p className="mb-1"><strong>🪑 Seats:</strong> {booking.numberOfSeats}</p>
                        <p className="mb-1"><strong>📱 Phone:</strong> {booking.rider?.phoneNumber}</p>
                      </Col>
                      <Col md={4} className="text-end">
                        <Badge bg="info">Trip Completed</Badge>
                        <p className="mb-0 mt-1">
                          <strong>{formatCurrency(booking.numberOfSeats * ride.fareAmount)}</strong>
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
          
          {/* Show message if no bookings */}
          {allPaidBookings.length === 0 && (
            <div className="mt-3">
              <Alert variant="light">
                <div className="text-center">
                  <p className="mb-2">📭 No confirmed bookings yet for this ride.</p>
                  {ride.status === 'SCHEDULED' && (
                    <small className="text-muted">
                      Riders need to find and book your ride, then complete payment to appear here.
                    </small>
                  )}
                </div>
              </Alert>
            </div>
          )}
          
          {/* Show total earnings for completed rides */}
          {ride.status === 'COMPLETED' && allPaidBookings.length > 0 && (
            <div className="mt-3">
              <Alert variant="success">
                <div className="d-flex justify-content-between align-items-center">
                  <span><strong>💰 Total Earnings:</strong></span>
                  <span className="h5 mb-0">
                    {formatCurrency(
                      allPaidBookings.reduce((total, booking) => 
                        total + (booking.numberOfSeats * ride.fareAmount), 0
                      )
                    )}
                  </span>
                </div>
              </Alert>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>🚗 Manage My Rides</h1>
        <Button as={Link} to="/driver/rides/new" variant="primary">
          ➕ Post a New Ride
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {rides.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h3>🚗 No rides posted yet</h3>
            <p className="text-muted mb-4">Start earning by posting your first ride!</p>
            <Button as={Link} to="/driver/rides/new" variant="primary" size="lg">
              Post Your First Ride
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Tabs defaultActiveKey="scheduled" className="mb-4">
          <Tab eventKey="scheduled" title={`📅 Scheduled (${scheduledRides.length})`}>
            {scheduledRides.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-4">
                  <p>📅 You don't have any scheduled rides.</p>
                  <Button as={Link} to="/driver/rides/new" variant="outline-primary">
                    Post a New Ride
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              scheduledRides.map(renderRideCard)
            )}
          </Tab>
          
          <Tab eventKey="inProgress" title={`🚗 In Progress (${inProgressRides.length})`}>
            {inProgressRides.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-4">
                  <p>🚗 You don't have any rides currently in progress.</p>
                </Card.Body>
              </Card>
            ) : (
              inProgressRides.map(renderRideCard)
            )}
          </Tab>
          
          <Tab eventKey="completed" title={`✅ Completed (${completedRides.length})`}>
            {completedRides.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-4">
                  <p>✅ You don't have any completed rides yet.</p>
                </Card.Body>
              </Card>
            ) : (
              completedRides.map(renderRideCard)
            )}
          </Tab>
          
          <Tab eventKey="cancelled" title={`❌ Cancelled (${cancelledRides.length})`}>
            {cancelledRides.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-4">
                  <p>❌ You don't have any cancelled rides.</p>
                </Card.Body>
              </Card>
            ) : (
              cancelledRides.map(renderRideCard)
            )}
          </Tab>
        </Tabs>
      )}
    </Container>
  );
};

export default ManageRides;