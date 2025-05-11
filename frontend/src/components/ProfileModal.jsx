import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfileModal.css';
import authService from '../services/authService';

const ProfileModal = ({ isOpen, onClose, userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formattedRole = userData?.role 
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) 
    : 'User';

  const handleEdit = () => {
    setEditData({
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      phone: userData?.phone || '',
      address: userData?.address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      profilePicture: userData?.profilePicture || null
    });
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setEditData(prev => ({
        ...prev,
        profilePicture: data.profilePicture
      }));
      
    } catch (error) {
      setError('Failed to upload image: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setSuccess(true);
      setLoading(false);
      
      // Wait for 1.5 seconds to show success message before closing edit form
      setTimeout(() => {
        setIsEditing(false);
        // Refresh user data by reloading the page
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to home even if logout fails on backend
      navigate('/');
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="profile-modal-content">
          <button className="profile-modal-close" onClick={onClose}>×</button>
          <div className="profile-modal-header">
            <h2>{isEditing ? 'Edit Profile' : 'Profile Information'}</h2>
          </div>
          
          {isEditing ? (
            <div className="profile-edit-form">
              {error && <div className="profile-edit-error">{error}</div>}
              {success && <div className="profile-edit-success">Profile updated successfully!</div>}
              
              <div className="profile-picture-upload">
                <div className="current-profile-picture">
                  <img 
                    src={editData.profilePicture?.url || '/default-avatar.png'} 
                    alt="Profile" 
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingImage}
                  className="upload-picture-btn"
                >
                  {uploadingImage ? 'Uploading...' : 'Change Profile Picture'}
                </button>
              </div>

              <div className="edit-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={editData.firstName} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="edit-group">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={editData.lastName} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="edit-group">
                <label htmlFor="phone">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={editData.phone} 
                  onChange={handleChange}
                />
              </div>
              
              <div className="address-section">
                <h3>Address Information</h3>
                
                <div className="edit-group">
                  <label htmlFor="street">Street Address</label>
                  <input 
                    type="text" 
                    id="street" 
                    name="street" 
                    value={editData.address?.street || ''} 
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="edit-group">
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    name="city" 
                    value={editData.address?.city || ''} 
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="edit-row">
                  <div className="edit-group">
                    <label htmlFor="state">State/Province</label>
                    <input 
                      type="text" 
                      id="state" 
                      name="state" 
                      value={editData.address?.state || ''} 
                      onChange={handleAddressChange}
                    />
                  </div>
                  
                  <div className="edit-group">
                    <label htmlFor="zip">Zip/Postal Code</label>
                    <input 
                      type="text" 
                      id="zip" 
                      name="zip" 
                      value={editData.address?.zip || ''} 
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
                
                <div className="edit-group">
                  <label htmlFor="country">Country</label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country" 
                    value={editData.address?.country || ''} 
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
              
              <div className="profile-edit-buttons">
                <button 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-modal-body">
                <div className="profile-picture">
                  <img 
                    src={userData?.profilePicture?.url || '/default-avatar.png'} 
                    alt="Profile" 
                  />
                </div>
                <div className="profile-info-row">
                  <span className="profile-label">Name</span>
                  <span className="profile-value">{userData?.firstName} {userData?.lastName}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-label">Email</span>
                  <span className="profile-value">{userData?.email}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-label">Phone</span>
                  <span className="profile-value">{userData?.phone || 'Not provided'}</span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-label">Role</span>
                  <span className="profile-value">{formattedRole}</span>
                </div>
                
                {userData?.address && (
                  <div className="profile-info-row address-row">
                    <span className="profile-label">Address</span>
                    <span className="profile-value address-value">
                      {userData.address.street && <div>{userData.address.street}</div>}
                      {userData.address.city && userData.address.state && (
                        <div>{userData.address.city}, {userData.address.state} {userData.address.zip}</div>
                      )}
                      {userData.address.country && <div>{userData.address.country}</div>}
                      {!userData.address.street && !userData.address.city && <span>Not provided</span>}
                    </span>
                  </div>
                )}
              </div>
              <div className="profile-modal-actions">
                <button className="edit-profile-btn" onClick={handleEdit}>
                  Edit Profile
                </button>
              </div>
              <div className="profile-modal-footer">
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;