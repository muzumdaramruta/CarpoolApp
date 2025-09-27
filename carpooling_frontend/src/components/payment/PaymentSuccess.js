import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import * as bookingService from '../../services/bookingService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const PaymentSuccess = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const bookingId = location.state?.bookingId;
 
 const [booking, setBooking] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 
 useEffect(() => {
   if (!bookingId) {
     navigate('/rider/dashboard');
     return;
   }
   
   const fetchBooking = async () => {
     try {
       setLoading(true);
       
       // Get the booking details
       const bookingData = await bookingService.getBookingById(bookingId);
       console.log('Booking data received:', bookingData); // Debug log
       setBooking(bookingData);
     } catch (error) {
       console.error('Error fetching booking:', error);
       setError('Failed to load booking information');
     } finally {
       setLoading(false);
     }
   };
   
   fetchBooking();
 }, [bookingId, navigate]);
 
 if (loading) {
   return <LoadingSpinner />;
 }
 
 if (error) {
   return (
     <Container>
       <Alert variant="danger">{error}</Alert>
     </Container>
   );
 }
 
 if (!booking) {
   return (
     <Container>
       <Alert variant="danger">
         Booking information not found.
       </Alert>
     </Container>
   );
 }
 
 // Safety check for booking.ride before calculating totalAmount
 if (!booking.ride) {
   return (
     <Container>
       <Alert variant="warning">
         Incomplete booking information. The ride details are missing.
         <div className="mt-3">
           <Button as={Link} to="/rider/bookings" variant="primary">
             View My Bookings
           </Button>
         </div>
       </Alert>
     </Container>
   );
 }
 
 const totalAmount = booking.numberOfSeats * booking.ride.fareAmount;
 
 return (
   <Container className="form-container">
     <Card>
       <Card.Body className="text-center">
         <div className="mb-4">
           <div className="text-success mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
               <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
             </svg>
           </div>
           <h2 className="mt-3">Payment Successful!</h2>
           <p className="lead">Your ride has been booked successfully.</p>
         </div>
         
         <div className="mb-4">
           <h5>Booking Details</h5>
           <p><strong>From:</strong> {booking.ride.originLocation}</p>
           <p><strong>To:</strong> {booking.ride.destinationLocation}</p>
           <p><strong>Date/Time:</strong> {formatDate(booking.ride.departureTime)}</p>
           <p><strong>Seats:</strong> {booking.numberOfSeats}</p>
           <p><strong>Total Amount Paid:</strong> {formatCurrency(totalAmount)}</p>
         </div>
         
         <div className="d-flex gap-3 justify-content-center">
           <Button as={Link} to="/rider/bookings" variant="primary">
             View My Bookings
           </Button>
           <Button as={Link} to="/rider/dashboard" variant="outline-secondary">
             Go to Dashboard
           </Button>
         </div>
       </Card.Body>
     </Card>
   </Container>
 );
};

export default PaymentSuccess;