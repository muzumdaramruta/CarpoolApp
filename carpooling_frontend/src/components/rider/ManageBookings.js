import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Badge, Row, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { RatingModal, DriverRatingDisplay } from '../common/RatingComponents'; // Import the rating components
import * as bookingService from '../../services/bookingService';
import { formatDate, formatCurrency } from '../../utils/helpers';
import axiosInstance from '../../utils/axiosConfig';

const ManageBookings = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookingsData = await bookingService.getBookingsByRider(currentUser.id);
        const newBookings = Array.isArray(bookingsData) ? bookingsData : [];
        
        // Check for ride status changes and show notifications
        if (bookings.length > 0) {
          checkForRideStatusChanges(bookings, newBookings);
        }
        
        setBookings(newBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchBookings();
    
    // Set up polling for real-time updates every 15 seconds
    const interval = setInterval(() => {
      console.log('Checking for ride status updates...');
      fetchBookings();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [currentUser.id]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);
  
  const checkForRideStatusChanges = (oldBookings, newBookings) => {
    newBookings.forEach(newBooking => {
      const oldBooking = oldBookings.find(b => b.id === newBooking.id);
      
      if (oldBooking && oldBooking.ride && newBooking.ride) {
        const oldStatus = oldBooking.ride.status;
        const newStatus = newBooking.ride.status;
        
        if (oldStatus !== newStatus) {
          console.log(`Ride status changed from ${oldStatus} to ${newStatus} for booking ${newBooking.id}`);
          showRideStatusNotification(newBooking.ride, newStatus);
        }
      }
    });
  };
  
  const showRideStatusNotification = (ride, newStatus) => {
    let message = '';
    let type = 'info';
    let icon = 'ℹ️';
    
    switch (newStatus) {
      case 'IN_PROGRESS':
        message = `🚗 Your ride from ${ride.originLocation} to ${ride.destinationLocation} has started! Driver: ${ride.driver.fullName}`;
        type = 'success';
        icon = '🚗';
        break;
      case 'COMPLETED':
        message = `✅ Your ride from ${ride.originLocation} to ${ride.destinationLocation} has been completed successfully!`;
        type = 'success';
        icon = '✅';
        break;
      case 'CANCELLED':
        message = `❌ Your ride from ${ride.originLocation} to ${ride.destinationLocation} has been cancelled. You will receive a refund.`;
        type = 'warning';
        icon = '❌';
        break;
      default:
        message = `Your ride status has been updated to: ${newStatus}`;
        type = 'info';
        icon = 'ℹ️';
    }
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      const notification = new Notification('Ride Update', {
        body: message,
        icon: '/favicon.ico',
        tag: `ride-${ride.id}-${newStatus}` // Prevent duplicate notifications
      });
      
      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
    
    // Add in-app notification
    const newNotification = {
      id: Date.now(),
      message,
      type,
      icon,
      timestamp: new Date(),
      rideId: ride.id
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 most recent
    
    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  };
  
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? Any payment will be refunded.')) {
      try {
        const response = await bookingService.cancelBooking(bookingId);
        
        // Check if refund was processed
        if (response.refund) {
          alert(`Booking cancelled successfully! Refund of ${formatCurrency(response.refund.amount)} has been processed.`);
        } else {
          alert('Booking cancelled successfully!');
        }
        
        // Refresh bookings list
        const bookingsData = await bookingService.getBookingsByRider(currentUser.id);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleCompletePayment = async (bookingId) => {
    try {
      console.log('Checking payment status for booking:', bookingId);
      
      const bookingData = await bookingService.getBookingById(bookingId);
      console.log('Current booking data:', bookingData);
      
      if (bookingData.payment && 
          bookingData.payment.status === 'COMPLETED' && 
          bookingData.status === 'PENDING') {
        
        console.log('Payment completed but booking still pending - attempting to fix');
        
        try {
          const response = await axiosInstance.post(`/bookings/${bookingId}/confirm-payment`);
          
          if (response.status === 200) {
            console.log('Booking status fixed successfully');
            
            const updatedBookingsData = await bookingService.getBookingsByRider(currentUser.id);
            setBookings(Array.isArray(updatedBookingsData) ? updatedBookingsData : []);
            
            alert('Booking confirmed successfully! Your payment was already completed.');
            return;
          }
        } catch (apiError) {
          console.error('API call to fix booking failed:', apiError);
          
          console.log('Navigating to success page since payment is completed');
          navigate('/payment-success', { 
            state: { 
              bookingId: bookingId,
              message: 'Payment was already completed. Booking status has been updated.' 
            } 
          });
          return;
        }
      }
      
      if (bookingData.status === 'ACCEPTED') {
        alert('This booking is already paid and confirmed!');
        return;
      }
      
      console.log('Navigating to payment form');
      navigate(`/payment/${bookingId}`);
      
    } catch (error) {
      console.error('Error checking booking/payment status:', error);
      
      console.log('Error occurred, falling back to payment form');
      navigate(`/payment/${bookingId}`);
    }
  };

  // NEW: Handle rating submission
  const handleRateDriver = (booking) => {
    setSelectedBookingForRating(booking);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    // Refresh bookings to update any rating-related data
    const fetchBookings = async () => {
      try {
        const bookingsData = await bookingService.getBookingsByRider(currentUser.id);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (error) {
        console.error('Error refreshing bookings:', error);
      }
    };
    fetchBookings();
  };

  // Check if booking can be rated
  const canRateBooking = (booking) => {
    return booking.status === 'COMPLETED' || 
           (booking.status === 'ACCEPTED' && booking.ride?.status === 'COMPLETED');
  };
  
  const getStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'PENDING':
        variant = 'warning';
        break;
      case 'ACCEPTED':
        variant = 'success';
        break;
      case 'REJECTED':
        variant = 'danger';
        break;
      case 'CANCELLED':
        variant = 'secondary';
        break;
      case 'COMPLETED':
        variant = 'info';
        break;
      default:
        variant = 'primary';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  const needsPayment = (booking) => {
    return booking.status === 'PENDING';
  };

  const getPaymentStatusInfo = (booking) => {
    if (booking.status === 'ACCEPTED') {
      return { badge: 'success', text: 'Paid & Confirmed' };
    } else if (booking.status === 'COMPLETED') {
      return { badge: 'info', text: 'Ride Completed' };
    } else if (booking.status === 'PENDING') {
      if (booking.payment) {
        if (booking.payment.status === 'COMPLETED') {
          return { badge: 'warning', text: 'Payment Done - Confirming...' };
        } else if (booking.payment.status === 'PENDING') {
          return { badge: 'warning', text: 'Payment Pending' };
        } else {
          return { badge: 'secondary', text: 'Payment Failed' };
        }
      } else {
        return { badge: 'secondary', text: 'Payment Required' };
      }
    } else if (booking.status === 'CANCELLED') {
      return { badge: 'secondary', text: 'Cancelled' };
    } else {
      return { badge: 'secondary', text: 'Unknown Status' };
    }
  };

  // Enhanced ride status display
  const getRideStatusInfo = (ride) => {
    if (!ride) return { badge: 'secondary', text: 'No Ride Info' };
    
    switch (ride.status) {
      case 'SCHEDULED':
        return { badge: 'primary', text: 'Scheduled' };
      case 'IN_PROGRESS':
        return { badge: 'success', text: '🚗 In Progress' };
      case 'COMPLETED':
        return { badge: 'info', text: '✅ Completed' };
      case 'CANCELLED':
        return { badge: 'danger', text: '❌ Cancelled' };
      default:
        return { badge: 'secondary', text: ride.status };
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // UPDATED: Filter bookings into different categories
  const upcomingBookings = bookings.filter(b => 
    (b.status === 'ACCEPTED' || b.status === 'PENDING') && 
    b.ride?.status === 'SCHEDULED' &&
    new Date(b.ride?.departureTime) > new Date()
  );
  
  // NEW: In-progress bookings
  const inProgressBookings = bookings.filter(b => 
    b.status === 'ACCEPTED' && 
    b.ride?.status === 'IN_PROGRESS'
  );
  
  const completedBookings = bookings.filter(b => 
    b.status === 'COMPLETED' || 
    (b.status === 'ACCEPTED' && b.ride?.status === 'COMPLETED')
  );
  
  const cancelledBookings = bookings.filter(b => 
    b.status === 'CANCELLED' || b.status === 'REJECTED'
  );
  
  const renderBookingCard = (booking) => {
    const paymentPending = needsPayment(booking);
    const paymentInfo = getPaymentStatusInfo(booking);
    const rideInfo = getRideStatusInfo(booking.ride);
    const canRate = canRateBooking(booking);
    
    return (
      <Col md={6} lg={4} key={booking.id}>
        <Card className="mb-3 card-hover">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <Card.Title className="mb-0">
                {booking.ride?.originLocation} → {booking.ride?.destinationLocation}
              </Card.Title>
              {getStatusBadge(booking.status)}
            </div>
            
            {/* Ride status display */}
            <div className="mb-2">
              <small className="text-muted">Ride Status: </small>
              <Badge bg={rideInfo.badge} className="me-2">{rideInfo.text}</Badge>
            </div>
            
            <Card.Text>
              <strong>Date:</strong> {formatDate(booking.ride?.departureTime)}<br />
              <strong>Driver:</strong> {booking.ride?.driver?.fullName}<br />
              {booking.ride?.driver?.phoneNumber && (
                <>
                  <strong>Driver Phone:</strong> {booking.ride.driver.phoneNumber}<br />
                </>
              )}
              <strong>Vehicle:</strong> {booking.ride?.vehicle?.make} {booking.ride?.vehicle?.model}<br />
              <strong>Seats:</strong> {booking.numberOfSeats}<br />
              <strong>Total Fare:</strong> {formatCurrency(booking.numberOfSeats * (booking.ride?.fareAmount || 0))}
            </Card.Text>

            {/* Driver Rating Display */}
            {booking.ride?.driver && (
              <div className="mb-2">
                <strong>Driver Rating: </strong>
                <DriverRatingDisplay driverId={booking.ride.driver.id} />
              </div>
            )}
            
            <div className="mb-2">
              <Badge bg={paymentInfo.badge}>{paymentInfo.text}</Badge>
            </div>
            
            {/* Show special message for in-progress rides */}
            {booking.ride?.status === 'IN_PROGRESS' && (
              <Alert variant="success" className="mb-2">
                🚗 <strong>Your ride is currently in progress!</strong><br />
                <small>Contact your driver if needed: {booking.ride.driver.phoneNumber}</small>
              </Alert>
            )}
            
            {/* Show rating prompt for completed rides */}
            {canRate && (
              <Alert variant="info" className="mb-2">
                ⭐ <strong>Rate your experience!</strong><br />
                <small>Help other riders by rating this driver</small>
              </Alert>
            )}
            
            <div className="d-flex gap-2 flex-wrap">
              {paymentPending && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleCompletePayment(booking.id)}
                >
                  {booking.payment && booking.payment.status === 'COMPLETED' ? 'Confirm Booking' : 'Complete Payment'}
                </Button>
              )}

              {/* Only show cancel option for upcoming rides (not in-progress) */}
              {booking.status === 'ACCEPTED' && 
               booking.ride?.status === 'SCHEDULED' && 
               new Date(booking.ride?.departureTime) > new Date() && (
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Cancel Booking
                </Button>
              )}
              
              {paymentPending && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Cancel
                </Button>
              )}

              {/* Contact driver button for in-progress rides */}
              {booking.ride?.status === 'IN_PROGRESS' && booking.ride?.driver?.phoneNumber && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => window.open(`tel:${booking.ride.driver.phoneNumber}`)}
                >
                  📱 Call Driver
                </Button>
              )}

              {/* NEW: Rate Driver button for completed rides */}
              {canRate && (
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => handleRateDriver(booking)}
                >
                  ⭐ Rate Driver
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };
  
  return (
    <Container>
      {/* Notification Display */}
      <div className="notification-container" style={{position: 'fixed', top: '20px', right: '20px', zIndex: 1000}}>
        {notifications.map(notification => (
          <Alert 
            key={notification.id} 
            variant={notification.type} 
            className="notification-alert mb-2"
            style={{minWidth: '300px', maxWidth: '400px'}}
            dismissible
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          >
            <strong>{notification.icon} Ride Update</strong>
            <div>{notification.message}</div>
            <small className="text-muted">{notification.timestamp.toLocaleTimeString()}</small>
          </Alert>
        ))}
      </div>
      
      <h1 className="mb-4">My Bookings</h1>
      
      {/* Status indicator */}
      <div className="mb-3">
        <small className="text-muted">
          Browser notifications: {Notification.permission === 'granted' ? '✅ Enabled' : '❌ Disabled'}
        </small>
      </div>
      
      {/* UPDATED: Added In-Progress tab */}
      <Tabs defaultActiveKey="upcoming" className="mb-4">
        <Tab eventKey="upcoming" title={`Upcoming (${upcomingBookings.length})`}>
          {upcomingBookings.length === 0 ? (
            <Card>
              <Card.Body>
                <Card.Text>You don't have any upcoming bookings.</Card.Text>
                <Button as={Link} to="/rider/search" variant="primary">
                  Find a Ride
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {upcomingBookings.map(renderBookingCard)}
            </Row>
          )}
        </Tab>
        
        {/* NEW: In-Progress Tab */}
        <Tab eventKey="inProgress" title={`🚗 In Progress (${inProgressBookings.length})`}>
          {inProgressBookings.length === 0 ? (
            <Card>
              <Card.Body>
                <Card.Text>You don't have any rides currently in progress.</Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Alert variant="info" className="mb-3">
                <strong>🚗 Active Rides</strong><br />
                Your rides that are currently in progress. Contact your driver if you need assistance.
              </Alert>
              <Row>
                {inProgressBookings.map(renderBookingCard)}
              </Row>
            </>
          )}
        </Tab>
        
        <Tab eventKey="completed" title={`Completed (${completedBookings.length})`}>
          {completedBookings.length === 0 ? (
            <Card>
              <Card.Body>
                <Card.Text>You don't have any completed rides.</Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {completedBookings.map(renderBookingCard)}
            </Row>
          )}
        </Tab>
        
        <Tab eventKey="cancelled" title={`Cancelled (${cancelledBookings.length})`}>
          {cancelledBookings.length === 0 ? (
            <Card>
              <Card.Body>
                <Card.Text>You don't have any cancelled bookings.</Card.Text>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {cancelledBookings.map(renderBookingCard)}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* Rating Modal */}
      <RatingModal
        show={showRatingModal}
        onHide={() => setShowRatingModal(false)}
        booking={selectedBookingForRating}
        currentUser={currentUser}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </Container>
  );
};

export default ManageBookings;