// src/components/rider/RiderProfile.js
import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Alert, Spinner, Card, Button, Badge } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  ProfileInformationCard, 
  SecurityCard, 
  useProfileLogic 
} from '../common/ProfileComponents';

// Rider-specific Account Overview Component
const RiderAccountOverview = ({ profile }) => {
  return (
    <Card style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Card.Header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 1.5rem 1rem'
      }}>
        <h2 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '500', 
          margin: 0, 
          color: '#111827' 
        }}>
          Rider Dashboard
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '500', 
          margin: '0 0 0.75rem 0', 
          color: '#111827' 
        }}>
          Your Riding Activity
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Current Bookings:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              2
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Pending Requests:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              1
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Completed Trips:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              28
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Favorite Routes:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              3
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '1rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Rider Rating:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              4.9 ⭐ (28 reviews)
            </span>
          </div>
          
          {/* Rider Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button 
              variant="primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🔍 Find a Ride
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📋 My Bookings
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🗺️ Saved Routes
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              ⭐ Rate Past Rides
            </Button>
          </div>
        </div>

        {/* Rider Status */}
        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            margin: '0 0 0.5rem 0', 
            color: '#166534' 
          }}>
            Rider Status
          </h4>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '0.25rem' 
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              marginRight: '0.5rem'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#166534' }}>
              Active Rider since 2024
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              marginRight: '0.5rem'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#166534' }}>
              Identity Verified
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              marginRight: '0.5rem'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#166534' }}>
              Trusted Passenger
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Rider Preferences Component
const RiderPreferences = () => {
  return (
    <Card style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Card.Header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 1.5rem 1rem'
      }}>
        <h2 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '500', 
          margin: 0, 
          color: '#111827' 
        }}>
          Ride Preferences
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            margin: '0 0 0.5rem 0', 
            color: '#111827' 
          }}>
            Preferred Ride Settings
          </h4>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <Badge bg="secondary">🚗 Any Vehicle Type</Badge>
            <Badge bg="secondary">🎵 Music OK</Badge>
            <Badge bg="secondary">💬 Chatty</Badge>
            <Badge bg="secondary">🌡️ AC Preferred</Badge>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '0.875rem', color: '#374151' }}>
              Pickup Locations:
            </strong>
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                🏠 Home: 123 Main St, Burlington, MA
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                🏢 Work: Downtown Office Complex
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                🎓 School: University Campus
              </div>
            </div>
          </div>
          
          <Button variant="outline-primary" size="sm">
            Edit Preferences
          </Button>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            margin: '0 0 0.5rem 0', 
            color: '#92400e' 
          }}>
            Recent Activity
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.25rem' }}>
            📅 Last ride: 2 days ago to Downtown
          </div>
          <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.25rem' }}>
            ⭐ Rated driver: 5 stars
          </div>
          <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
            💰 Saved $15 compared to rideshare
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Payment Methods Component
const PaymentMethods = () => {
  return (
    <Card style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Card.Header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem 1.5rem 1rem'
      }}>
        <h2 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '500', 
          margin: 0, 
          color: '#111827' 
        }}>
          Payment Methods
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          {/* Payment Methods List */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>💳</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  Visa •••• 4242
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Expires 12/25
                </div>
              </div>
            </div>
            <Badge bg="success">Default</Badge>
          </div>
          
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>💰</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  Cash
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Pay driver directly
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary" size="sm">
              Add Payment Method
            </Button>
            <Button variant="outline-secondary" size="sm">
              Manage Cards
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            margin: '0 0 0.5rem 0', 
            color: '#374151' 
          }}>
            Recent Transactions
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Jan 15 - Ride to Downtown - $12.50
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Jan 12 - Ride to Airport - $25.00
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Jan 10 - Ride to Mall - $8.75
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const RiderProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const profileLogic = useProfileLogic(currentUser);

  const {
    profile, setProfile,
    loading, setLoading,
    error, setError,
    success,
    // ... all other states and handlers from useProfileLogic
  } = profileLogic;

  useEffect(() => {
    setError(null);
    
    if (!currentUser || !currentUser.id) {
      setError("Please log in to view your profile");
      setLoading(false);
      return;
    }
    
    const apiClient = axios.create({
      baseURL: 'http://localhost:8080',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Load rider-specific profile data
    apiClient.get(`/api/users/${currentUser.id}`)
      .then(userResponse => {
        console.log("Rider profile data received:", userResponse.data);
        
        if (userResponse.data && userResponse.data.password) {
          profileLogic.passwordRef.value = userResponse.data.password;
        }
        
        if (userResponse.data && userResponse.data.profileImageUrl) {
          profileLogic.setProfileImage(userResponse.data.profileImageUrl);
        }
        
        return apiClient.get(`/api/users/${currentUser.id}/profile`);
      })
      .then(response => {
        setProfile(response.data);
        profileLogic.setFormData({
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
        });
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load rider profile:', error);
        setError(`Failed to load profile: ${error.message}`);
        setLoading(false);
      });
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280' }}>Loading rider profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !currentUser.id) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Alert variant="warning">Please log in to view your rider profile.</Alert>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 0' }}>
      <Container style={{ maxWidth: '1200px' }}>
        
        {/* Success/Error Messages */}
        {(success || error) && (
          <div style={{ marginBottom: '1.5rem' }}>
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '1.5rem' 
        }}>
          
          {/* Profile Information Card */}
          <ProfileInformationCard {...profileLogic} />

          {/* Rider Account Overview */}
          <RiderAccountOverview profile={profile} />

          {/* Rider Preferences */}
          <RiderPreferences />

          {/* Payment Methods */}
          <PaymentMethods />

          {/* Security Card - Full Width */}
          <SecurityCard {...profileLogic} />
        </div>
      </Container>
    </div>
  );
};

export default RiderProfile;