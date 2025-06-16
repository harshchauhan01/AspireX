import React, { useState } from 'react';
import './CSS/PageStyles.css';
import './CSS/Profile.css';

const ProfilePage = ({ mentorProfile }) => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: mentorProfile.name,
    email: mentorProfile.email,
    expertise: mentorProfile?.details?.professions?.[0]?.title || '',
    bio: 'Experienced career counselor with 10+ years helping professionals achieve their goals. Specialized in leadership development and career transitions.',
    location: 'San Francisco, CA',
    hourlyRate: mentorProfile?.details?.fees || 0,
    availability: mentorProfile?.details?.availability_timings || 'Mon-Fri, 9am-5pm PST'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app, you would save to an API here
    console.log("Profile saved:", profileData);
    setEditMode(false);
  };

  return (
    <div className="page-container profile-page">
      <header className="page-header">
        <h1>Profile</h1>
        <div className="page-actions">
          {editMode ? (
            <>
              <button 
                className="secondary-button"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
              <button 
                className="primary-button"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button 
              className="primary-button"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </header>
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData.name.split(' ').map(n => n[0]).join('')}
            {editMode && (
              <button className="avatar-edit-button">✏️</button>
            )}
          </div>
          <div className="profile-info">
            {editMode ? (
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="profile-input"
              />
            ) : (
              <h2>{profileData.name}</h2>
            )}
            <p className="profile-email">{profileData.email}</p>
            <div className="profile-stats">
              <span>⭐ {mentorProfile?.details?.average_rating || 0} Rating</span>
              <span>🎯 {mentorProfile?.details?.total_students || 0} Sessions</span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Expertise</h3>
            {editMode ? (
              <input
                type="text"
                name="expertise"
                value={profileData.expertise}
                onChange={handleInputChange}
                className="profile-input"
              />
            ) : (
              <p>{profileData.expertise}</p>
            )}
          </div>

          <div className="detail-section">
            <h3>Bio</h3>
            {editMode ? (
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="profile-textarea"
                rows="4"
              />
            ) : (
              <p>{profileData.bio}</p>
            )}
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <h3>Location</h3>
              {editMode ? (
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.location}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>Hourly Rate</h3>
              {editMode ? (
                <div className="rate-input">
                  <span>$</span>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={profileData.hourlyRate}
                    onChange={handleInputChange}
                    className="profile-input"
                  />
                </div>
              ) : (
                <p>${profileData.hourlyRate}/hr</p>
              )}
            </div>

            <div className="detail-item">
              <h3>Availability</h3>
              {editMode ? (
                <input
                  type="text"
                  name="availability"
                  value={profileData.availability}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.availability}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;