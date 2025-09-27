// src/components/common/ProfileRouter.js
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DriverProfile from '../driver/DriverProfile';
import RiderProfile from '../rider/RiderProfile';
import { Container, Alert } from 'react-bootstrap';

const ProfileRouter = () => {
  const { currentUser } = useContext(AuthContext);

  // If user is not logged in
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container>
          <Alert variant="warning" className="text-center">
            Please log in to view your profile.
          </Alert>
        </Container>
      </div>
    );
  }

  // Route to appropriate profile based on user role
  switch (currentUser.role?.toLowerCase()) {
    case 'driver':
      return <DriverProfile />;
    case 'rider':
      return <RiderProfile />;
    default:
      return (
        <div style={{
          minHeight: '100vh',
          background: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Container>
            <Alert variant="danger" className="text-center">
              <h4>Unknown User Role</h4>
              <p>Your account role is not recognized. Please contact support.</p>
              <small>Current role: {currentUser.role || 'undefined'}</small>
            </Alert>
          </Container>
        </div>
      );
  }
};

export default ProfileRouter;