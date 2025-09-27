import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as bookingService from '../../services/bookingService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import '../../scss/RiderDashboard.scss'; // Import the SCSS file

const RiderDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    upcomingRides: 0,
    completedRides: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch bookings
        const bookingsData = await bookingService.getBookingsByRider(currentUser.id);
        setBookings(bookingsData);

        // Calculate stats
        const pendingBookings = bookingsData.filter(
          booking => booking.status === 'PENDING'
        ).length;

        const upcomingRides = bookingsData.filter(
          booking =>
            booking.status === 'ACCEPTED' &&
            new Date(booking.ride.departureTime) > new Date()
        ).length;

        const completedRides = bookingsData.filter(
          booking => booking.status === 'COMPLETED'
        ).length;

        setStats({
          totalBookings: bookingsData.length,
          pendingBookings,
          upcomingRides,
          completedRides
        });
      } catch (error) {
        console.error('Error fetching rider data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="rider-dashboard">
      <Container>
        <h1 className="mb-4">
          🚗 Rider Dashboard
        </h1>

        {/* Stats Cards */}
        <Row className="dashboard-stats mb-5">
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Total Bookings</Card.Title>
                <Card.Text className="display-4">{stats.totalBookings}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Pending</Card.Title>
                <Card.Text className="display-4">{stats.pendingBookings}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Upcoming</Card.Title>
                <Card.Text className="display-4">{stats.upcomingRides}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Completed</Card.Title>
                <Card.Text className="display-4">{stats.completedRides}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5 quick-actions-section">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>⚡ Quick Actions</Card.Title>
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    as={Link} 
                    to="/rider/bookings" 
                    variant="outline-primary"
                    size="lg"
                  >
                    📋 View All Bookings
                  </Button>
                  <Button 
                    as={Link} 
                    to="/rides/search" 
                    variant="primary"
                    size="lg"
                  >
                    🔍 Find New Rides
                  </Button>
                  <Button 
                    as={Link} 
                    to="/profile" 
                    variant="outline-secondary"
                    size="lg"
                  >
                    👤 Edit Profile
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Bookings Section */}
        <div className="pending-bookings-section">
          <h2 className="mb-4">
            ⏳ Pending Requests
          </h2>
          
          {bookings.filter(booking => booking.status === 'PENDING').length === 0 ? (
            <div className="empty-state-card">
              <Card>
                <Card.Body>
                  <Card.Text>
                    You don't have any pending booking requests.
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <Row>
              {bookings
                .filter(booking => booking.status === 'PENDING')
                .map((booking, index) => (
                  <Col md={4} key={booking.id} className="mb-4">
                    <Card className="card-hover border-warning h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="mb-3">
                          🚩 {booking.ride.originLocation} → {booking.ride.destinationLocation}
                        </Card.Title>
                        <Card.Text className="flex-grow-1">
                          <div className="mb-2">
                            <strong>📅 Date:</strong> {formatDate(booking.ride.departureTime)}
                          </div>
                          <div className="mb-2">
                            <strong>🪑 Seats:</strong> {booking.numberOfSeats}
                          </div>
                          <div className="mb-2">
                            <strong>📊 Status:</strong>{' '}
                            <span className="text-warning">⏳ Pending</span>
                          </div>
                          <div className="mb-3">
                            <strong>💰 Total Fare:</strong>{' '}
                            <span className="fw-bold">
                              {formatCurrency(booking.numberOfSeats * booking.ride.fareAmount)}
                            </span>
                          </div>
                        </Card.Text>
                        <div className="mt-auto">
                          <Button
                            as={Link}
                            to={`/rider/bookings`}
                            variant="outline-warning"
                            size="sm"
                            className="w-100"
                          >
                            🔍 Check Status
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="recent-activity-section mt-5">
          <h2 className="mb-4">
            📈 Recent Activity
          </h2>
          
          <Row>
            {bookings
              .filter(booking => booking.status === 'ACCEPTED' || booking.status === 'COMPLETED')
              .slice(0, 3)
              .map((booking, index) => (
                <Col md={4} key={booking.id} className="mb-4">
                  <Card className="card-hover h-100">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="mb-3">
                        {booking.status === 'COMPLETED' ? '✅' : '🎯'} {booking.ride.originLocation} → {booking.ride.destinationLocation}
                      </Card.Title>
                      <Card.Text className="flex-grow-1">
                        <div className="mb-2">
                          <strong>📅 Date:</strong> {formatDate(booking.ride.departureTime)}
                        </div>
                        <div className="mb-2">
                          <strong>📊 Status:</strong>{' '}
                          <span className={`fw-bold ${booking.status === 'COMPLETED' ? 'text-success' : 'text-primary'}`}>
                            {booking.status === 'COMPLETED' ? '✅ Completed' : '🎯 Accepted'}
                          </span>
                        </div>
                        <div className="mb-3">
                          <strong>💰 Paid:</strong>{' '}
                          <span className="fw-bold text-success">
                            {formatCurrency(booking.numberOfSeats * booking.ride.fareAmount)}
                          </span>
                        </div>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default RiderDashboard;