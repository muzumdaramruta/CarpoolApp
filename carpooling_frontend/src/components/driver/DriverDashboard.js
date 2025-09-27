import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as rideService from '../../services/rideService';
import * as vehicleService from '../../services/vehicleService';
import { formatDate } from '../../utils/helpers';
import axiosInstance from '../../utils/axiosConfig';
import '../../scss/DriverDashboard.scss'; // Import the SCSS file

const DriverDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    totalRatings: 0
  });
  const [stats, setStats] = useState({
    totalRides: 0,
    activeRides: 0,
    completedRides: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch rides, vehicles, and rating data
        const [ridesData, vehiclesData] = await Promise.all([
          rideService.getRidesByDriver(currentUser.id),
          vehicleService.getUserVehicles(currentUser.id)
        ]);
        
        setRides(ridesData);
        setVehicles(vehiclesData);
        
        // Calculate stats
        const activeRides = ridesData.filter(ride => 
          ride.status === 'SCHEDULED' || ride.status === 'IN_PROGRESS'
        ).length;
        
        const completedRides = ridesData.filter(ride => 
          ride.status === 'COMPLETED'
        ).length;
        
        setStats({
          totalRides: ridesData.length,
          activeRides,
          completedRides
        });

        // Fetch driver rating data (just for performance summary)
        await fetchDriverRating();
        
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser.id]);

  const fetchDriverRating = async () => {
    try {
      const response = await axiosInstance.get(`/ratings/driver/${currentUser.id}/summary`);
      setRatingData({
        averageRating: response.data.averageRating || 0,
        totalRatings: response.data.totalRatings || 0
      });
    } catch (error) {
      console.error('Error fetching rating data:', error);
      setRatingData({
        averageRating: 0,
        totalRatings: 0
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="driver-dashboard">
      <Container>
        <h1 className="mb-4">
          🚛 Driver Dashboard
        </h1>
        
        {/* Stats Cards */}
        <Row className="dashboard-stats mb-5">
          <Col md={4} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Total Rides</Card.Title>
                <Card.Text className="display-4">{stats.totalRides}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="text-center h-100">
              <Card.Body>
                <Card.Title>Active Rides</Card.Title>
                <Card.Text className="display-4">{stats.activeRides}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
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
                    to="/driver/rides/new" 
                    variant="primary"
                    size="lg"
                  >
                    ➕ Post New Ride
                  </Button>
                  <Button 
                    as={Link} 
                    to="/driver/vehicles/new" 
                    variant="secondary"
                    size="lg"
                  >
                    🚗 Add Vehicle
                  </Button>
                  <Button 
                    as={Link} 
                    to="/driver/rides" 
                    variant="info"
                    size="lg"
                  >
                    📋 Manage Rides
                  </Button>
                  <Button 
                    as={Link} 
                    to="/profile" 
                    variant="outline-warning"
                    size="lg"
                  >
                    ⭐ View My Rating
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Vehicles Section */}
        <h2 className="section-header vehicles-header">
          🚗 My Vehicle Fleet
        </h2>
        {vehicles.length === 0 ? (
          <div className="empty-state-card mb-5">
            <Card>
              <Card.Body>
                <Card.Text className="vehicles-empty">
                  You don't have any vehicles yet. Add a vehicle to start posting rides and earning money!
                </Card.Text>
                <Button 
                  as={Link} 
                  to="/driver/vehicles/new" 
                  variant="primary"
                  size="lg"
                >
                  🚗 Add Your First Vehicle
                </Button>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Row className="mb-5">
            {vehicles.map((vehicle, index) => (
              <Col md={4} key={vehicle.id} className="mb-3">
                <Card className="vehicle-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>
                      {vehicle.make} {vehicle.model}
                    </Card.Title>
                    <Card.Text className="flex-grow-1">
                      <div className="mb-2">
                        <strong>🔢 License Plate:</strong> {vehicle.licensePlate}
                      </div>
                      <div className="mb-2">
                        <strong>🪑 Capacity:</strong> {vehicle.capacity} seats
                      </div>
                      <div className="mb-2">
                        <strong>🎨 Color:</strong> {vehicle.color || 'Not specified'}
                      </div>
                      <div className="mb-3">
                        <strong>📅 Year:</strong> {vehicle.year || 'Not specified'}
                      </div>
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        as={Link} 
                        to={`/driver/vehicles/edit/${vehicle.id}`}
                        variant="outline-primary"
                        size="sm"
                        className="w-100"
                      >
                        ✏️ Edit Vehicle
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        {/* Upcoming Rides Section */}
        <h2 className="section-header rides-header">
          🗺️ Upcoming Rides
        </h2>
        {rides.filter(ride => ride.status === 'SCHEDULED').length === 0 ? (
          <div className="empty-state-card mb-4">
            <Card>
              <Card.Body>
                <Card.Text className="rides-empty">
                  You don't have any upcoming rides scheduled. Post a ride to start connecting with passengers!
                </Card.Text>
                <Button 
                  as={Link} 
                  to="/driver/rides/new" 
                  variant="primary"
                  size="lg"
                >
                  🗺️ Post Your First Ride
                </Button>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <>
            <Row className="mb-4">
              {rides
                .filter(ride => ride.status === 'SCHEDULED')
                .slice(0, 3) // Show only the first 3
                .map((ride, index) => (
                  <Col md={4} key={ride.id} className="mb-3">
                    <Card className="ride-card h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>
                          {ride.originLocation} → {ride.destinationLocation}
                        </Card.Title>
                        <Card.Text className="flex-grow-1">
                          <div className="mb-2">
                            <strong>📅 Date:</strong> {formatDate(ride.departureTime)}
                          </div>
                          <div className="mb-2">
                            <strong>🪑 Available Seats:</strong> {ride.availableSeats}
                          </div>
                          <div className="mb-2">
                            <strong>💰 Fare:</strong> ${ride.fareAmount}
                          </div>
                          <div className="mb-3">
                            <strong>🚗 Vehicle:</strong> {ride.vehicle?.make} {ride.vehicle?.model}
                          </div>
                        </Card.Text>
                        <div className="mt-auto">
                          <Button 
                            as={Link} 
                            to={`/driver/rides`}
                            variant="outline-success"
                            size="sm"
                            className="w-100"
                          >
                            📊 View Details
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
            
            {rides.filter(ride => ride.status === 'SCHEDULED').length > 3 && (
              <div className="text-center view-all-section">
                <Button 
                  as={Link} 
                  to="/driver/rides" 
                  variant="outline-secondary"
                  size="lg"
                >
                  📋 View All {rides.filter(ride => ride.status === 'SCHEDULED').length} Rides
                </Button>
              </div>
            )}
          </>
        )}

        {/* Recent Activity Section */}
        {stats.completedRides > 0 && (
          <div className="recent-activity-section mt-5">
            <h2 className="section-header">
              📈 Recent Completed Rides
            </h2>
            
            <Row>
              {rides
                .filter(ride => ride.status === 'COMPLETED')
                .slice(0, 3)
                .map((ride, index) => (
                  <Col md={4} key={ride.id} className="mb-4">
                    <Card className="ride-card h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>
                          ✅ {ride.originLocation} → {ride.destinationLocation}
                        </Card.Title>
                        <Card.Text className="flex-grow-1">
                          <div className="mb-2">
                            <strong>📅 Date:</strong> {formatDate(ride.departureTime)}
                          </div>
                          <div className="mb-2">
                            <strong>📊 Status:</strong>{' '}
                            <span className="fw-bold text-success">✅ Completed</span>
                          </div>
                          <div className="mb-3">
                            <strong>💰 Earned:</strong>{' '}
                            <span className="fw-bold text-success">${ride.fareAmount}</span>
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        )}

        {/* Performance Summary */}
        {(stats.totalRides > 0 || vehicles.length > 0) && (
          <div className="performance-summary mt-5">
            <Card className="border-0" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
              <Card.Body className="p-4">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="mb-2">
                      <span style={{ fontSize: '2rem' }}>🚗</span>
                    </div>
                    <h5 className="mb-1">{vehicles.length}</h5>
                    <small className="text-muted">Vehicles Registered</small>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <span style={{ fontSize: '2rem' }}>🗺️</span>
                    </div>
                    <h5 className="mb-1">{stats.totalRides}</h5>
                    <small className="text-muted">Total Rides Posted</small>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <span style={{ fontSize: '2rem' }}>✅</span>
                    </div>
                    <h5 className="mb-1">{stats.completedRides}</h5>
                    <small className="text-muted">Successful Trips</small>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <span style={{ fontSize: '2rem' }}>⭐</span>
                    </div>
                    <h5 className="mb-1">
                      {ratingData.totalRatings > 0 ? ratingData.averageRating.toFixed(1) : 'N/A'}
                    </h5>
                    <small className="text-muted">
                      <Link to="/profile" className="text-decoration-none">
                        Average Rating →
                      </Link>
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
};

export default DriverDashboard;