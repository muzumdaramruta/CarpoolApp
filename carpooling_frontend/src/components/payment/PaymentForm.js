import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import * as bookingService from '../../services/bookingService';
import * as paymentService from '../../services/paymentService';
import { formatDate, formatCurrency } from '../../utils/helpers';

const PaymentForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'credit_card',
  });
  
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would have an endpoint to get a single booking
        const bookingsData = await bookingService.getBookingById(bookingId);
        setBooking(bookingsData);
        
        // Check if payment already exists
        try {
          const paymentData = await paymentService.getPaymentByBooking(bookingId);
          
          if (paymentData && paymentData.status === 'COMPLETED') {
            // Payment already completed, redirect to success page
            navigate('/payment/success', { state: { bookingId } });
          }
        } catch (err) {
          // No payment yet, continue with form
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value,
    });
  };
  
  const validateForm = () => {
    // Simple validation for demonstration
    if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 16) {
      setError('Please enter a valid card number');
      return false;
    }
    
    if (!paymentDetails.cardholderName) {
      setError('Please enter the cardholder name');
      return false;
    }
    
    if (!paymentDetails.expiryDate || !paymentDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      
      // In a real app, this would integrate with Stripe or another payment processor
      await paymentService.processPayment(bookingId, { 
        paymentMethod: paymentDetails.paymentMethod 
      });
      
      // For demo purposes, simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigate('/payment/success', { state: { bookingId } });
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!booking) {
    return (
      <Container>
        <Alert variant="danger">
          Booking not found or has been cancelled.
        </Alert>
      </Container>
    );
  }
  
  const totalAmount = booking.numberOfSeats * booking.ride.fareAmount;
  
  return (
    <Container className="form-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Payment</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="mb-4">
            <h5>Booking Summary</h5>
            <Row>
              <Col md={6}>
                <p><strong>From:</strong> {booking.ride.originLocation}</p>
                <p><strong>To:</strong> {booking.ride.destinationLocation}</p>
                <p><strong>Date/Time:</strong> {formatDate(booking.ride.departureTime)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Driver:</strong> {booking.ride.driver.fullName}</p>
                <p><strong>Seats:</strong> {booking.numberOfSeats}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(totalAmount)}</p>
              </Col>
            </Row>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group id="paymentMethod" className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Credit Card"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentDetails.paymentMethod === 'credit_card'}
                  onChange={handleChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Debit Card"
                  name="paymentMethod"
                  value="debit_card"
                  checked={paymentDetails.paymentMethod === 'debit_card'}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
            
            <Form.Group id="cardNumber" className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength="16"
                required
              />
            </Form.Group>
            
            <Form.Group id="cardholderName" className="mb-3">
              <Form.Label>Cardholder Name</Form.Label>
              <Form.Control
                type="text"
                name="cardholderName"
                value={paymentDetails.cardholderName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group id="expiryDate" className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="text"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group id="cvv" className="mb-3">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    type="text"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/rider/bookings')}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={processing}
                className="ms-auto"
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
              </Button>
            </div>
          </Form>
          
          <div className="mt-3 text-center text-muted">
            <small>This is a demo payment form. No actual payment will be processed.</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentForm;