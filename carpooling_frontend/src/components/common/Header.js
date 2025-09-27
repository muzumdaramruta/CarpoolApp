import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { currentUser, isAuthenticated, isDriver, isRider, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // This will call the backend logout endpoint
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout fails
      navigate('/login');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">🚗 Bla Bla Car</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                {isDriver && (
                  <>
                    <Nav.Link as={Link} to="/driver/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/driver/rides">My Rides</Nav.Link>
                    <Nav.Link as={Link} to="/driver/rides/new">Post a Ride</Nav.Link>
                  </>
                )}
                {isRider && (
                  <>
                    <Nav.Link as={Link} to="/rider/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/rider/search">Find a Ride</Nav.Link>
                    <Nav.Link as={Link} to="/rider/bookings">My Bookings</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Item className="d-flex align-items-center text-light me-3">
                  Welcome, {currentUser?.fullName}
                </Nav.Item>
                <Link to="/profile" className="ms-2 text-light">
                  <FaUserCircle size={24} />
                </Link>
                <Button variant="outline-light" onClick={handleLogout} className="ms-2">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;