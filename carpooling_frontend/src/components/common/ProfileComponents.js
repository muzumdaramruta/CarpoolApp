// src/components/common/ProfileComponents.js
import React, { useState, useRef } from 'react';
import { Button, Form, Card, Alert, Spinner } from 'react-bootstrap';

// Shared Profile Information Component
export const ProfileInformationCard = ({ 
  profile, 
  formData, 
  editing, 
  saveLoading, 
  profileImage, 
  imagePreview, 
  uploadingImage,
  handleChange, 
  handleSave, 
  handleCancel, 
  setEditing,
  handleImageUpload,
  handleRemoveImage,
  getDisplayImage
}) => {
  const fileInputRef = useRef(null);

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
          Profile Information
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        {/* User Avatar and Image Upload */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              position: 'relative'
            }}>
              {getDisplayImage() ? (
                <img 
                  src={getDisplayImage()} 
                  alt="Profile" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <span style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: 'white' 
                }}>
                  {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
              {uploadingImage && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Spinner animation="border" variant="light" size="sm" />
                </div>
              )}
            </div>
            
            {/* Image Upload Controls */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.75rem' 
            }}>
              <Button
                size="sm"
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {profileImage || imagePreview ? 'Change' : 'Upload'}
              </Button>
              
              {(profileImage || imagePreview) && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                >
                  Remove
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              margin: 0 
            }}>
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>

          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            margin: '0 0 0.5rem 0', 
            color: '#111827' 
          }}>
            {profile?.fullName || 'User'}
          </h3>
          <span style={{
            display: 'inline-flex',
            padding: '0.25rem 0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '9999px',
            backgroundColor: profile?.role === 'DRIVER' ? '#dbeafe' : '#d1fae5',
            color: profile?.role === 'DRIVER' ? '#1d4ed8' : '#065f46'
          }}>
            {profile?.role || 'USER'}
          </span>
        </div>

        {!profile ? (
          <Alert variant="warning">No profile found</Alert>
        ) : (
          <div>
            {/* Profile Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#374151' }}>
                  Username:
                </strong>
                <div style={{ color: '#111827', marginTop: '0.25rem' }}>
                  {profile.username}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#374151' }}>
                  Email:
                </strong>
                {editing ? (
                  <Form.Control
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    type="email"
                    style={{ marginTop: '0.25rem' }}
                  />
                ) : (
                  <div style={{ color: '#111827', marginTop: '0.25rem' }}>
                    {profile.email}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#374151' }}>
                  Phone:
                </strong>
                {editing ? (
                  <Form.Control
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleChange}
                    style={{ marginTop: '0.25rem' }}
                  />
                ) : (
                  <div style={{ color: '#111827', marginTop: '0.25rem' }}>
                    {profile.phoneNumber}
                  </div>
                )}
              </div>

              {editing && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Full Name:
                  </strong>
                  <Form.Control
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    style={{ marginTop: '0.25rem' }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {editing ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button 
                  variant="success" 
                  onClick={handleSave}
                  disabled={saveLoading}
                  style={{ flex: 1 }}
                >
                  {saveLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleCancel}
                  disabled={saveLoading}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => setEditing(true)}
                style={{ width: '100%' }}
              >
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Shared Security Component
export const SecurityCard = ({ 
  changingPassword, 
  passwordData, 
  saveLoading, 
  setChangingPassword, 
  handlePasswordChange, 
  handlePasswordSubmit 
}) => {
  return (
    <Card style={{
      gridColumn: '1 / -1',
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
          Security
        </h2>
      </Card.Header>
      
      <Card.Body style={{ padding: '1.5rem' }}>
        {!changingPassword ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '500', 
                margin: '0 0 0.25rem 0', 
                color: '#111827' 
              }}>
                Password
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                margin: 0 
              }}>
                Last changed 3 months ago
              </p>
            </div>
            <Button
              variant="outline-primary"
              onClick={() => setChangingPassword(true)}
            >
              Change Password
            </Button>
          </div>
        ) : (
          <div style={{ maxWidth: '400px' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '500', 
              margin: '0 0 1rem 0', 
              color: '#111827' 
            }}>
              Change Password
            </h3>
            
            <Form.Group style={{ marginBottom: '1rem' }}>
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </Form.Group>
            
            <Form.Group style={{ marginBottom: '1rem' }}>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </Form.Group>
            
            <Form.Group style={{ marginBottom: '1rem' }}>
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </Form.Group>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <Button
                variant="primary"
                onClick={handlePasswordSubmit}
                disabled={saveLoading}
              >
                {saveLoading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setChangingPassword(false)}
              >
                Cancel
              </Button>
            </div>
            
            {/* Security Tips */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                margin: '0 0 0.5rem 0', 
                color: '#1e40af' 
              }}>
                🛡️ Password Security Tips
              </h4>
              <ul style={{ 
                fontSize: '0.875rem', 
                color: '#1e40af', 
                margin: 0, 
                paddingLeft: '1.25rem' 
              }}>
                <li>Use at least 8 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Add numbers and special characters</li>
                <li>Avoid common words or personal information</li>
              </ul>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Custom hook for shared profile logic
export const useProfileLogic = (currentUser) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Profile form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordRef] = useState({ value: "" });

  // All the handler functions from your original component
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Image upload handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}/profile-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.imageUrl);
        setSuccess('Profile image updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}/profile-image`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProfileImage(null);
        setImagePreview(null);
        setSuccess('Profile image removed successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to remove image');
      }
    } catch (err) {
      setError('Failed to remove image');
    }
  };

  const getDisplayImage = () => {
    if (imagePreview) return imagePreview;
    
    if (profileImage) {
      if (profileImage.startsWith('http')) {
        return profileImage;
      }
      return `http://localhost:8080${profileImage}`;
    }
    
    return null;
  };

  const handleSave = async () => {
    // Your existing handleSave logic here
    // ... (copy from original component)
  };

  const handlePasswordSubmit = async () => {
    // Your existing handlePasswordSubmit logic here
    // ... (copy from original component)
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
    });
    setEditing(false);
    setChangingPassword(false);
    setError(null);
  };

  return {
    // State
    profile, setProfile,
    loading, setLoading,
    saveLoading, setSaveLoading,
    error, setError,
    success, setSuccess,
    editing, setEditing,
    changingPassword, setChangingPassword,
    uploadingImage, setUploadingImage,
    profileImage, setProfileImage,
    imagePreview, setImagePreview,
    formData, setFormData,
    passwordData, setPasswordData,
    passwordRef,
    
    // Handlers
    handleChange,
    handlePasswordChange,
    handleImageUpload,
    handleRemoveImage,
    getDisplayImage,
    handleSave,
    handlePasswordSubmit,
    handleCancel
  };
};