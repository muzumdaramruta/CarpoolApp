// src/components/driver/DriverProfile.js
import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Alert, Spinner, Card, Button } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  ProfileInformationCard, 
  SecurityCard, 
  useProfileLogic 
} from '../common/ProfileComponents';

// Driver-specific Account Overview Component
const DriverAccountOverview = ({ profile }) => {
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
          Driver Dashboard
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '500', 
          margin: '0 0 0.75rem 0', 
          color: '#111827' 
        }}>
          Your Driving Activity
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Vehicles Registered:
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
              Active Rides Posted:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              3
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Total Rides Completed:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              42
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Pending Ride Requests:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              5
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '1rem' 
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Driver Rating:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              4.8 ⭐ (124 reviews)
            </span>
          </div>
          
          {/* Driver Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button 
              variant="primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📝 Post a New Ride
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              🚗 Manage My Vehicles
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              📋 View My Posted Rides
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              style={{ justifyContent: 'flex-start' }}
            >
              💰 Earnings Summary
            </Button>
          </div>
        </div>

        {/* Driver Status */}
        <div style={{
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            margin: '0 0 0.5rem 0', 
            color: '#1e40af' 
          }}>
            Driver Status
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
            <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              Verified Driver since 2024
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
            <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              License Verified
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
            <span style={{ fontSize: '0.875rem', color: '#1e40af' }}>
              Insurance Active
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Driver Statistics Component
const DriverStatistics = () => {
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
          Performance Statistics
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>42</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Rides</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>4.8</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Average Rating</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>0</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cancellations</div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>$840</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Earnings</div>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Button variant="outline-primary" size="sm">
            View Detailed Analytics
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const DriverProfile = () => {
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

    // Load driver-specific profile data
    apiClient.get(`/api/users/${currentUser.id}`)
      .then(userResponse => {
        console.log("Driver profile data received:", userResponse.data);
        
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
        console.error('Failed to load driver profile:', error);
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
          <p style={{ color: '#6b7280' }}>Loading driver profile...</p>
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
        <Alert variant="warning">Please log in to view your driver profile.</Alert>
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

          {/* Driver Account Overview */}
          <DriverAccountOverview profile={profile} />

          {/* Driver Statistics - Full Width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <DriverStatistics />
          </div>

          {/* Security Card - Full Width */}
          <SecurityCard {...profileLogic} />
        </div>
      </Container>
    </div>
  );
};

export default DriverProfile;