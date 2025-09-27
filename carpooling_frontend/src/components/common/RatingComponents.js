import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axiosInstance from '../../utils/axiosConfig';

const RatingModal = ({ show, onHide, booking, currentUser, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      setRating(0);
      setComment('');
      setHoveredRating(0);
      setError(null);
      setSuccess(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ratingData = {
        driverId: booking.ride.driver.id,
        riderId: currentUser.id,
        rideId: booking.ride.id,
        rating: rating,
        comment: comment.trim()
      };

      const response = await axiosInstance.post('/ratings', ratingData);
      
      setSuccess(true);
      setTimeout(() => {
        onHide();
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
      }, 1500);

    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${(hoveredRating || rating) >= i ? 'filled' : ''}`}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(i)}
          style={{
            fontSize: '2rem',
            cursor: 'pointer',
            color: (hoveredRating || rating) >= i ? '#ffc107' : '#e9ecef',
            marginRight: '0.25rem',
            transition: 'color 0.2s ease'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (!booking || !booking.ride || !booking.ride.driver) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          ⭐ Rate Your Driver
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {success ? (
          <Alert variant="success" className="text-center">
            <h5>✅ Thank you for your feedback!</h5>
            <p>Your rating has been submitted successfully.</p>
          </Alert>
        ) : (
          <>
            <div className="text-center mb-4">
              <h6>How was your ride with {booking.ride.driver.fullName}?</h6>
              <small className="text-muted">
                📍 {booking.ride.originLocation} → {booking.ride.destinationLocation}
              </small>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Rating *</Form.Label>
                <div className="text-center py-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  {renderStars()}
                  <div className="mt-2">
                    <small className="text-muted">
                      {rating === 0 && 'Click to rate'}
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </small>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  Comment (Optional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this driver..."
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {comment.length}/500 characters
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || rating === 0}
                  className="flex-grow-1"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Submitting...
                    </>
                  ) : (
                    '⭐ Submit Rating'
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onHide}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

// Driver Rating Display Component
const DriverRatingDisplay = ({ driverId, showDetails = false }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatingData();
  }, [driverId]);

  const fetchRatingData = async () => {
    try {
      const response = await axiosInstance.get(`/ratings/driver/${driverId}/summary`);
      setRatingData(response.data);
    } catch (error) {
      console.error('Error fetching rating data:', error);
      setRatingData({ averageRating: 0, totalRatings: 0, recentRatings: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span className="text-muted">Loading rating...</span>;
  }

  if (!ratingData) {
    return <span className="text-muted">No rating available</span>;
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? '#ffc107' : '#e9ecef',
            fontSize: '1rem'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="driver-rating-display">
      <div className="d-flex align-items-center gap-2">
        <div>{renderStars(Math.round(ratingData.averageRating))}</div>
        <span className="fw-bold">{ratingData.averageRating.toFixed(1)}</span>
        <span className="text-muted">({ratingData.totalRatings} reviews)</span>
      </div>
      
      {showDetails && ratingData.recentRatings && ratingData.recentRatings.length > 0 && (
        <div className="mt-2">
          <small className="text-muted d-block mb-1">Recent Reviews:</small>
          {ratingData.recentRatings.slice(0, 3).map((review, index) => (
            <div key={index} className="mb-1" style={{ fontSize: '0.875rem' }}>
              <div className="d-flex align-items-center gap-1">
                {renderStars(review.rating)}
                <span className="text-muted ms-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  "{review.comment.length > 50 ? review.comment.substring(0, 50) + '...' : review.comment}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { RatingModal, DriverRatingDisplay };