import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import axios from 'axios';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProfileRouter from './components/common/ProfileRouter';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Driver Components
import DriverDashboard from './components/driver/DriverDashboard';
import VehicleForm from './components/driver/VehicleForm';
import PostRideForm from './components/driver/PostRideForm';
import ManageRides from './components/driver/ManageRides';

// Rider Components
import RiderDashboard from './components/rider/RiderDashboard';
import SearchRides from './components/rider/SearchRides';
import BookingForm from './components/rider/BookingForm';
import ManageBookings from './components/rider/ManageBookings';

// Payment Components
import PaymentForm from './components/payment/PaymentForm';
import PaymentSuccess from './components/payment/PaymentSuccess';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';




function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProfileRouter />} />
              
              {/* Driver Routes */}
              <Route 
                path="/driver/dashboard" 
                element={
                  <ProtectedRoute requiredRole="DRIVER">
                    <DriverDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/driver/vehicles/new" 
                element={
                  <ProtectedRoute requiredRole="DRIVER">
                    <VehicleForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/driver/vehicles/edit/:id" 
                element={
                  <ProtectedRoute requiredRole="DRIVER">
                    <VehicleForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/driver/rides/new" 
                element={
                  <ProtectedRoute requiredRole="DRIVER">
                    <PostRideForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/driver/rides" 
                element={
                  <ProtectedRoute requiredRole="DRIVER">
                    <ManageRides />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rider Routes */}
              <Route 
                path="/rider/dashboard" 
                element={
                  <ProtectedRoute requiredRole="RIDER">
                    <RiderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rider/search" 
                element={
                  <ProtectedRoute requiredRole="RIDER">
                    <SearchRides />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rider/book/:rideId" 
                element={
                  <ProtectedRoute requiredRole="RIDER">
                    <BookingForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rider/bookings" 
                element={
                  <ProtectedRoute requiredRole="RIDER">
                    <ManageBookings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Payment Routes */}
              <Route 
                path="/payment/:bookingId" 
                element={
                  <ProtectedRoute>
                    <PaymentForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/success" 
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } 
              />

              

              {/* Redirect root to appropriate dashboard based on role */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
