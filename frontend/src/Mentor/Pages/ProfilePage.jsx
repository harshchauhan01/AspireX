import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CSS/PageStyles.css';
import './CSS/Profile.css';
import Loader from '../../components/ui/loader';
import API from '../../BackendConn/api';
import { API_BASE_URL } from '../../BackendConn/api';
import { FiTarget, FiStar, FiEdit, FiTrash } from 'react-icons/fi';

// Date validation and formatting functions
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  
  // Try to parse various date formats
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null; // Invalid date
  }
  
  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validateDateInput = (dateString) => {
  if (!dateString) return true; // Empty is OK
  const formatted = formatDateForBackend(dateString);
  return formatted !== null;
};

const ProfilePage = ({ mentorProfile, onProfileUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: mentorProfile.name,
    email: mentorProfile.email,
    expertise: mentorProfile?.details?.professions?.[0]?.title || '',
    bio: mentorProfile?.details?.about || '',
    location: mentorProfile?.details?.location || '',
    hourlyRate: mentorProfile?.details?.fees || 0,
    availability: mentorProfile?.details?.availability_timings || '',
    phone: mentorProfile?.details?.phone_number || '',
    college: mentorProfile?.details?.college || '',
    cgpa: mentorProfile?.details?.cgpa || '',
    batch: mentorProfile?.details?.batch || '',
    gender: mentorProfile?.details?.gender || '',
    age: mentorProfile?.details?.age || '',
    dob:mentorProfile?.details?.dob || '',
    yearsOfExperience: mentorProfile?.details?.years_of_experience || 0,
    linkedin: mentorProfile?.details?.linkedin_url || '',
    github: mentorProfile?.details?.github_url || '',
    portfolio: mentorProfile?.details?.portfolio_url || '',
    skills: mentorProfile?.details?.skills?.map(skill => skill.name).join(', ') || '',
    cv: mentorProfile?.details?.cv || null,
    // New fields - simple arrays and objects
    keyAchievements: mentorProfile?.details?.key_achievements || [],
    services: mentorProfile?.details?.services || [],
    availabilityDayWise: mentorProfile?.details?.availability_day_wise || {},
    languages: mentorProfile?.details?.languages || [],
  });

  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(mentorProfile?.details?.profile_photo || null);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fileInputRef = React.useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (mentorProfile?.details?.profile_photo) {
      setPhotoPreview(mentorProfile.details.profile_photo);
    }
  }, [mentorProfile]);

  // Load online status from backend
  useEffect(() => {
    const loadOnlineStatus = async () => {
      try {
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/mentor/profile/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.details) {
          setOnlineStatus(response.data.details.is_online);
        }
      } catch (error) {
        console.error('Error loading online status:', error);
      }
    };

    if (mentorProfile) {
      loadOnlineStatus();
    }
  }, [mentorProfile]);

  // Update online status when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOnlineStatus();
      }
    };

    const handleFocus = () => {
      updateOnlineStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Periodic online status updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateOnlineStatus();
    }, 60000); // Update every 1 minute instead of 2 minutes

    return () => clearInterval(interval);
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('Mentortoken');
  };

  const updateOnlineStatus = async () => {
    setUpdatingStatus(true);
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/mentor/online-status/`, {}, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setOnlineStatus(response.data.is_online);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      setSaveError('Failed to update online status');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const setOfflineStatus = async () => {
    setUpdatingStatus(true);
    try {
      const token = getAuthToken();
      // Set last activity to 10 minutes ago to make mentor offline
      const response = await axios.post(`${API_BASE_URL}/mentor/online-status/`, {
        set_offline: true
      }, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setOnlineStatus(response.data.is_online);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error setting offline status:', error);
      setSaveError('Failed to set offline status');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // New handlers for user-friendly inputs
  const handleAchievementAdd = () => {
    setProfileData(prev => ({
      ...prev,
      keyAchievements: [...prev.keyAchievements, '']
    }));
  };

  const handleAchievementChange = (index, value) => {
    setProfileData(prev => ({
      ...prev,
      keyAchievements: prev.keyAchievements.map((achievement, i) => 
        i === index ? value : achievement
      )
    }));
  };

  const handleAchievementRemove = (index) => {
    setProfileData(prev => ({
      ...prev,
      keyAchievements: prev.keyAchievements.filter((_, i) => i !== index)
    }));
  };

  const handleServiceAdd = () => {
    setProfileData(prev => ({
      ...prev,
      services: [...prev.services, {
        title: '',
        duration: '60 min',
        price: 80,
        description: '',
        features: [''],
        popularity: 90,
        sessionCount: 100
      }]
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const handleServiceRemove = (index) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleServiceFeatureAdd = (serviceIndex) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === serviceIndex 
          ? { ...service, features: [...service.features, ''] }
          : service
      )
    }));
  };

  const handleServiceFeatureChange = (serviceIndex, featureIndex, value) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === serviceIndex 
          ? { 
              ...service, 
              features: service.features.map((feature, j) => 
                j === featureIndex ? value : feature
              )
            }
          : service
      )
    }));
  };

  const handleServiceFeatureRemove = (serviceIndex, featureIndex) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === serviceIndex 
          ? { 
              ...service, 
              features: service.features.filter((_, j) => j !== featureIndex)
            }
          : service
      )
    }));
  };

  const handleLanguageAdd = () => {
    setProfileData(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const handleLanguageChange = (index, value) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.map((language, i) => 
        i === index ? value : language
      )
    }));
  };

  const handleLanguageRemove = (index) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityDayAdd = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const existingDays = Object.keys(profileData.availabilityDayWise);
    const availableDays = days.filter(day => !existingDays.includes(day));
    
    if (availableDays.length > 0) {
      setProfileData(prev => ({
        ...prev,
        availabilityDayWise: {
          ...prev.availabilityDayWise,
          [availableDays[0]]: {
            slots: [{ time: '', available: true }]
          }
        }
      }));
    }
  };

  const handleAvailabilityDayChange = (dayKey, field, value) => {
    setProfileData(prev => ({
      ...prev,
      availabilityDayWise: {
        ...prev.availabilityDayWise,
        [dayKey]: {
          ...prev.availabilityDayWise[dayKey],
          [field]: value
        }
      }
    }));
  };

  const handleAvailabilitySlotAdd = (dayKey) => {
    setProfileData(prev => ({
      ...prev,
      availabilityDayWise: {
        ...prev.availabilityDayWise,
        [dayKey]: {
          ...prev.availabilityDayWise[dayKey],
          slots: [...prev.availabilityDayWise[dayKey].slots, { time: '', available: true }]
        }
      }
    }));
  };

  const handleAvailabilitySlotChange = (dayKey, slotIndex, field, value) => {
    setProfileData(prev => ({
      ...prev,
      availabilityDayWise: {
        ...prev.availabilityDayWise,
        [dayKey]: {
          ...prev.availabilityDayWise[dayKey],
          slots: prev.availabilityDayWise[dayKey].slots.map((slot, i) => 
            i === slotIndex ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const handleAvailabilitySlotRemove = (dayKey, slotIndex) => {
    setProfileData(prev => ({
      ...prev,
      availabilityDayWise: {
        ...prev.availabilityDayWise,
        [dayKey]: {
          ...prev.availabilityDayWise[dayKey],
          slots: prev.availabilityDayWise[dayKey].slots.filter((_, i) => i !== slotIndex)
        }
      }
    }));
  };

  const handleAvailabilityDayRemove = (dayKey) => {
    setProfileData(prev => {
      const newAvailability = { ...prev.availabilityDayWise };
      delete newAvailability[dayKey];
      return {
        ...prev,
        availabilityDayWise: newAvailability
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const payload = {
        name: profileData.name,
        details: {
          dob: formatDateForBackend(profileData.dob),
          age: profileData.age !== '' && profileData.age !== null && profileData.age !== undefined ? Number(profileData.age) : 0,
          gender: profileData.gender || '',
          phone_number: profileData.phone || '',
          college: profileData.college || '',
          cgpa: profileData.cgpa !== '' && profileData.cgpa !== null && profileData.cgpa !== undefined ? Number(profileData.cgpa) : 0,
          batch: profileData.batch || null,
          professions: profileData.expertise ? [{ title: profileData.expertise }] : [],
          skills: profileData.skills ? profileData.skills.split(',').map(skill => ({ name: skill.trim() })).filter(s => s.name) : [],
          fees: profileData.hourlyRate || 0,
          about: profileData.bio || '',
          availability_timings: profileData.availability || '',
          years_of_experience: profileData.yearsOfExperience || 0,
          linkedin_url: profileData.linkedin || '',
          github_url: profileData.github || '',
          portfolio_url: profileData.portfolio || '',
          profile_photo: profilePhoto || mentorProfile?.details?.profile_photo || null,
          cv: profileData.cv || null,
          is_approved: mentorProfile?.details?.is_approved ?? false,
          total_sessions: mentorProfile?.details?.total_sessions ?? 0,
          // New fields - simple objects and arrays
          key_achievements: profileData.keyAchievements,
          services: profileData.services,
          availability_day_wise: profileData.availabilityDayWise,
          languages: profileData.languages,
        }
      };

      const response = await API.put(
        'mentor/profile/update/',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${getAuthToken()}`
          }
        }
      );

      setSaveSuccess(true);
      setEditMode(false);
      
      // Also update online status when saving profile
      await updateOnlineStatus();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      // Try to extract detailed error messages from the backend
      let errorMsg = "Failed to update profile";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          // Collect all error messages from nested fields
          errorMsg = Object.entries(data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              } else if (typeof messages === 'object') {
                // For nested objects like 'details'
                return Object.entries(messages)
                  .map(([subField, subMessages]) => `${subField}: ${Array.isArray(subMessages) ? subMessages.join(', ') : subMessages}`)
                  .join('; ');
              } else {
                return `${field}: ${messages}`;
              }
            })
            .join('; ');
        }
      }
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCV = async () => {
    try {
      await API.delete(
        'mentor/profile/cv/', // Update this URL
        {
          headers: {
            'Authorization': `Token ${getAuthToken()}`
          }
        }
      );

      setProfileData(prev => ({ ...prev, cv: null }));
      setCvFile(null);
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to remove CV");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleUploadCV = async () => {
    if (!cvFile) return;
    
    setCvUploading(true);
    setSaveError(null);
    try {
      // In a real app, you would upload the file to your server here
      // This is a mock implementation
      const formData = new FormData();
      formData.append('cv', cvFile);

      const response = await API.put(
        'mentor/profile/cv/', // Update this URL
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${getAuthToken()}`
          }
        }
      );
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the profile data with the new CV URL
      setProfileData(prev => ({
        ...prev,
        cv: response.data.cv_url // In real app, use the URL from your server
      }));

      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;  // Reset file input so same file can be reselected
      }
      
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to upload CV");
    } finally {
      setCvUploading(false);
    }
  };


  const calculateProfileCompletion = () => {
    const requiredFields = [
      profileData.name,
      profileData.email,
      profileData.expertise,
      profileData.bio,
      profileData.skills,
      profileData.location,
      profileData.phone,
      profileData.college,
      profileData.cgpa,
      profileData.batch,
      profileData.gender,
      profileData.age,
      profileData.dob,
      profileData.yearsOfExperience,
      profileData.linkedin,
      profileData.github,
      profileData.portfolio,
      profileData.cv
    ];

    const filledFields = requiredFields.filter(value => {
      if (typeof value === 'string') {
        const trimmed = value.trim().toLowerCase();
        return trimmed !== '' && trimmed !== '#na' && trimmed !== 'n/a' && trimmed !== 'na' && trimmed !== '#NA';
      }
      return value !== null && value !== undefined;
    });

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
    return percentage;
  };


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) return;
    
    setPhotoUploading(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append('profile_photo', profilePhoto);

      const response = await API.put(
        'mentor/profile/cv/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${getAuthToken()}`
          }
        }
      );

      // Update the photo preview with the new URL from the server
      setPhotoPreview(response.data.profile_photo_url);
      setProfilePhoto(null);
      
      // Reset file input
      if (photoInputRef.current) {
        photoInputRef.current.value = null;
      }
      
      // Refresh mentor data to update the profile
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      // Try to extract detailed error messages from the backend
      let errorMsg = "Failed to upload photo";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          // Collect all error messages from nested fields
          errorMsg = Object.entries(data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              } else if (typeof messages === 'object') {
                // For nested objects
                return Object.entries(messages)
                  .map(([subField, subMessages]) => `${subField}: ${Array.isArray(subMessages) ? subMessages.join(', ') : subMessages}`)
                  .join('; ');
              } else {
                return `${field}: ${messages}`;
              }
            })
            .join('; ');
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      }
      setSaveError(errorMsg);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await API.delete(
        'mentor/profile/cv/?type=profile_photo', // Send type as query param
        {
          headers: {
            'Authorization': `Token ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setPhotoPreview(null);
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to remove photo");
    }
  };

  // Helper to get full CV URL
  const getCVUrl = (cv) => {
    if (!cv) return '';
    if (cv.startsWith('http')) return cv;
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}${cv}`;
  };


  return (
    <div className="page-container profile-page">
      {saveSuccess && (
        <div className="alert alert-success">
          Profile updated successfully!
        </div>
      )}
      {saveError && (
        <div className="alert alert-error">
          {saveError}
        </div>
      )}

      <header className="page-header">
        <h1>Profile</h1>
        <div className="profile-completion-bar">
          <label>Profile Completion: {calculateProfileCompletion()}%</label>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${calculateProfileCompletion()}%` }}
            ></div>
          </div>
        </div>

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
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
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
      
      {/* Online Status Section */}
      <div className="online-status-section">
        <div className="online-status-info">
          <div className={`status-indicator ${onlineStatus ? 'online' : 'offline'}`}>
            <div className="status-dot"></div>
            <span>{onlineStatus ? 'Online' : 'Offline'}</span>
          </div>
          <div className="status-buttons">
            <button 
              className="update-status-button"
              onClick={updateOnlineStatus}
              disabled={updatingStatus}
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
            {/* <button 
              className="test-offline-button"
              onClick={setOfflineStatus}
              disabled={updatingStatus}
            >
              Test Offline
            </button> */}
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-container">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Profile" 
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            {editMode && (
              <div className="avatar-edit-actions">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  ref={photoInputRef}
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor="photo-upload" 
                  className="avatar-edit-button"
                  title="Change photo"
                >
                  <FiEdit />
                </label>
                {photoPreview && (
                  <button 
                    className="avatar-remove-button"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    disabled={photoUploading}
                  >
                    <FiTrash />
                  </button>
                )}
                {profilePhoto && (
                  <button 
                    className="avatar-upload-button"
                    onClick={handlePhotoUpload}
                    disabled={photoUploading}
                  >
                    {photoUploading ? 'Uploading...' : 'Save Photo'}
                  </button>
                )}
              </div>
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
              <span><FiStar /> {mentorProfile?.details?.average_rating || 0} Rating</span>
              <span><FiTarget /> {mentorProfile?.details?.total_sessions || 0} Sessions</span>
              <span>⏳ {profileData.yearsOfExperience} years experience</span>
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

          <div className="detail-section">
            <h3>Skills</h3>
            {editMode ? (
              <input
                type="text"
                name="skills"
                value={profileData.skills}
                onChange={handleInputChange}
                className="profile-input"
                placeholder="Comma separated skills"
              />
            ) : (
              <p>{profileData.skills}</p>
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
                  <span>₹</span>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={profileData.hourlyRate}
                    onChange={handleInputChange}
                    className="profile-input"
                  />
                </div>
              ) : (
                <p>₹{profileData.hourlyRate}/hr</p>
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

            <div className="detail-item">
              <h3>Phone</h3>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.phone}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>College</h3>
              {editMode ? (
                <input
                  type="text"
                  name="college"
                  value={profileData.college}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.college}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>CGPA</h3>
              {editMode ? (
                <input
                  type="text"
                  name="cgpa"
                  value={profileData.cgpa}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.cgpa}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>Batch</h3>
              {editMode ? (
                <input
                  type="text"
                  name="batch"
                  value={profileData.batch}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.batch}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>Gender</h3>
              {editMode ? (
                <select
                  name="gender"
                  value={profileData.gender}
                  onChange={handleInputChange}
                  className="profile-input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p>{profileData.gender}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>Age</h3>
              {editMode ? (
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleInputChange}
                  className="profile-input"
                />
              ) : (
                <p>{profileData.age}</p>
              )}
            </div>

            <div className="detail-item">
              <h3>Date Of Birth</h3>
              {editMode ? (
                <input
                  type="text"
                  name="dob"
                  value={profileData.dob}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                />
              ) : (
                <p>{profileData.dob}</p>
              )}
            </div>

          </div>

          <div className="detail-section">
            <h3>Curriculum Vitae (CV)</h3>
            {editMode ? (
              <div className="cv-upload-section">
                {profileData.cv ? (
                  <>
                    <div className="cv-preview">
                      <span>Current CV: </span>
                      <a 
                        href={profileData.cv} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cv-link"
                      >
                        View Current CV
                      </a>
                      <button 
                        onClick={handleRemoveCV}
                        className="secondary-button small-button"
                        disabled={cvUploading}
                      >
                        Remove CV
                      </button>
                    </div>

                    {/* Update CV input */}
                    <div className="file-upload-container">
                      <input
                        type="file"
                        id="cv-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="file-input"
                        // style={{ display: 'none' }}
                      />
                      <label htmlFor="cv-upload" className="file-upload-label primary-button small-button">
                        Update CV
                      </label>
                      {cvFile && (
                        <button
                          onClick={handleUploadCV}
                          className="primary-button small-button"
                          disabled={cvUploading}
                        >
                          {cvUploading ? 'Uploading...' : 'Upload CV'}
                        </button>
                      )}
                    </div>
                    <p className="file-upload-hint">Accepted formats: PDF, DOC, DOCX</p>
                  </>
                ) : (
                  <>
                    <p>No CV uploaded</p>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        id="cv-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="file-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="cv-upload" className="file-upload-label primary-button small-button">
                        Choose CV file
                      </label>
                      {cvFile && (
                        <button
                          onClick={handleUploadCV}
                          className="primary-button small-button"
                          disabled={cvUploading}
                        >
                          {cvUploading ? 'Uploading...' : 'Upload CV'}
                        </button>
                      )}
                    </div>
                    <p className="file-upload-hint">Accepted formats: PDF, DOC, DOCX</p>
                  </>
                )}
              </div>
            ) : profileData.cv ? (
              <a 
                href={getCVUrl(profileData.cv)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="cv-link"
              >
                View My CV
              </a>
            ) : (
              <p>No CV uploaded</p>
            )}
          </div>


          <div className="detail-section">
            <h3>Social Links</h3>
            <div className="social-links">
              <div className="social-link">
                <h4>LinkedIn</h4>
                {editMode ? (
                  <input
                    type="url"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleInputChange}
                    className="profile-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                ) : (
                  <p>{profileData.linkedin || 'Not provided'}</p>
                )}
              </div>
              <div className="social-link">
                <h4>GitHub</h4>
                {editMode ? (
                  <input
                    type="url"
                    name="github"
                    value={profileData.github}
                    onChange={handleInputChange}
                    className="profile-input"
                    placeholder="https://github.com/username"
                  />
                ) : (
                  <p>{profileData.github || 'Not provided'}</p>
                )}
              </div>
              <div className="social-link">
                <h4>Portfolio</h4>
                {editMode ? (
                  <input
                    type="url"
                    name="portfolio"
                    value={profileData.portfolio}
                    onChange={handleInputChange}
                    className="profile-input"
                    placeholder="https://yourportfolio.com"
                  />
                ) : (
                  <p>{profileData.portfolio || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Sections */}
        <div className="detail-section">
          <h3>Key Achievements</h3>
          {editMode ? (
            <div className="achievements-edit">
              {profileData.keyAchievements.map((achievement, index) => (
                <div key={index} className="achievement-input-row">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => handleAchievementChange(index, e.target.value)}
                    className="profile-input"
                    placeholder="Enter your achievement"
                  />
                  <button
                    type="button"
                    onClick={() => handleAchievementRemove(index)}
                    className="remove-button"
                    title="Remove achievement"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAchievementAdd}
                className="add-button"
              >
                ➕ Add Achievement
              </button>
            </div>
          ) : (
            <div className="achievements-display">
              {profileData.keyAchievements.length > 0 ? (
                profileData.keyAchievements.map((achievement, index) => (
                  <div key={index} className="achievement-item">
                    <span className="achievement-bullet">🏆</span>
                    <span>{achievement}</span>
                  </div>
                ))
              ) : (
                <p>No achievements added yet</p>
              )}
            </div>
          )}
        </div>

        <div className="detail-section">
          <h3>Services Offered</h3>
          {editMode ? (
            <div className="services-edit">
              {profileData.services.map((service, index) => (
                <div key={index} className="service-edit-card">
                  <div className="service-edit-header">
                    <h4>Service {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleServiceRemove(index)}
                      className="remove-button"
                      title="Remove service"
                    >
                      ❌
                    </button>
                  </div>
                  <div className="service-edit-fields">
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                      className="profile-input"
                      placeholder="Service title"
                    />
                    <div className="service-edit-row">
                      <input
                        type="text"
                        value={service.duration}
                        onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                        className="profile-input"
                        placeholder="Duration (e.g., 60 min)"
                      />
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', Number(e.target.value))}
                        className="profile-input"
                        placeholder="Price"
                      />
                    </div>
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      className="profile-textarea"
                      rows="3"
                      placeholder="Service description"
                    />
                    <div className="service-features-edit">
                      <label>Features:</label>
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="feature-input-row">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleServiceFeatureChange(index, featureIndex, e.target.value)}
                            className="profile-input"
                            placeholder="Feature"
                          />
                          <button
                            type="button"
                            onClick={() => handleServiceFeatureRemove(index, featureIndex)}
                            className="remove-button small"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleServiceFeatureAdd(index)}
                        className="add-button small"
                      >
                        ➕ Add Feature
                      </button>
                    </div>
                    <div className="service-edit-row">
                      <input
                        type="number"
                        value={service.popularity}
                        onChange={(e) => handleServiceChange(index, 'popularity', Number(e.target.value))}
                        className="profile-input"
                        placeholder="Popularity %"
                        min="0"
                        max="100"
                      />
                      <input
                        type="number"
                        value={service.sessionCount}
                        onChange={(e) => handleServiceChange(index, 'sessionCount', Number(e.target.value))}
                        className="profile-input"
                        placeholder="Sessions completed"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleServiceAdd}
                className="add-button"
              >
                ➕ Add Service
              </button>
            </div>
          ) : (
            <div className="services-display">
              {profileData.services.length > 0 ? (
                profileData.services.map((service, index) => (
                  <div key={index} className="service-item">
                    <h4>{service.title}</h4>
                    <p className="service-price">₹{service.price} • {service.duration}</p>
                    <p className="service-description">{service.description}</p>
                    <div className="service-features">
                      {service.features?.map((feature, fIndex) => (
                        <span key={fIndex} className="feature-tag">✅ {feature}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No services added yet</p>
              )}
            </div>
          )}
        </div>

        <div className="detail-section">
          <h3>Availability Schedule</h3>
          {editMode ? (
            <div className="availability-edit">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const dayData = profileData.availabilityDayWise[day];
                const isAvailable = dayData && dayData.slots && dayData.slots.length > 0;
                
                return (
                  <div key={day} className="availability-day-edit">
                    <div className="availability-day-header">
                      <h4 className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                      <div className="day-availability-toggle">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Add the day with a default slot
                                setProfileData(prev => ({
                                  ...prev,
                                  availabilityDayWise: {
                                    ...prev.availabilityDayWise,
                                    [day]: {
                                      slots: [{ time: '', available: true }]
                                    }
                                  }
                                }));
                              } else {
                                // Remove the day
                                handleAvailabilityDayRemove(day);
                              }
                            }}
                          />
                          Available
                        </label>
                      </div>
                    </div>
                    {isAvailable && (
                      <div className="availability-slots-edit">
                        <label>Time Slots:</label>
                        {dayData.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="slot-input-row">
                            <input
                              type="text"
                              value={slot.time}
                              onChange={(e) => handleAvailabilitySlotChange(day, slotIndex, 'time', e.target.value)}
                              className="profile-input"
                              placeholder="Time (e.g., 9:00 AM)"
                            />
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={slot.available}
                                onChange={(e) => handleAvailabilitySlotChange(day, slotIndex, 'available', e.target.checked)}
                              />
                              Available
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAvailabilitySlotRemove(day, slotIndex)}
                              className="remove-button small"
                            >
                              ❌
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAvailabilitySlotAdd(day)}
                          className="add-button small"
                        >
                          ➕ Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="availability-display">
              {Object.keys(profileData.availabilityDayWise).length > 0 ? (
                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayData = profileData.availabilityDayWise[day];
                  const isAvailable = dayData && dayData.slots && dayData.slots.length > 0;
                  
                  return (
                    <div key={day} className="day-schedule">
                      <h4 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                      {isAvailable ? (
                        <div className="time-slots">
                          {dayData.slots.map((slot, sIndex) => (
                            <span key={sIndex} className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}>
                              {slot.time} {slot.available ? '✅' : '❌'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="not-available">Not available</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No availability schedule added yet</p>
              )}
            </div>
          )}
        </div>

        <div className="detail-section">
          <h3>Languages Spoken</h3>
          {editMode ? (
            <div className="languages-edit">
              {profileData.languages.map((language, index) => (
                <div key={index} className="language-input-row">
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => handleLanguageChange(index, e.target.value)}
                    className="profile-input"
                    placeholder="Enter language"
                  />
                  <button
                    type="button"
                    onClick={() => handleLanguageRemove(index)}
                    className="remove-button"
                    title="Remove language"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleLanguageAdd}
                className="add-button"
              >
                ➕ Add Language
              </button>
            </div>
          ) : (
            <div className="languages-display">
              {profileData.languages.length > 0 ? (
                profileData.languages.map((language, index) => (
                  <span key={index} className="language-tag">🌍 {language}</span>
                ))
              ) : (
                <p>No languages added yet</p>
              )}
            </div>
          )}
        </div>
      </div>
      {isSaving && <Loader />}
    </div>
  );
};

export default ProfilePage;