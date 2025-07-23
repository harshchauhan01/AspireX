import React, { useState,useEffect,useRef } from 'react';
import axios from 'axios';
import './CSS/PageStyles.css';
import './CSS/Profile.css';
import Loader from '../../components/ui/loader';
import API from '../../BackendConn/api';
import { API_BASE_URL } from '../../BackendConn/api';

const ProfilePage = ({ mentorProfile }) => {
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
  });

  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(mentorProfile?.details?.profile_photo || null);

  const fileInputRef = React.useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (mentorProfile?.details?.profile_photo) {
      setPhotoPreview(mentorProfile.details.profile_photo);
    }
  }, [mentorProfile]);
  




  const getAuthToken = () => {
    return localStorage.getItem('Mentortoken');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const payload = {
        name: profileData.name,
        details: {
          dob: profileData.dob,
          age: profileData.age,
          gender: profileData.gender,
          phone_number: profileData.phone,
          college: profileData.college,
          cgpa: profileData.cgpa,
          batch: profileData.batch,
          professions: [{ title: profileData.expertise }],
          skills: profileData.skills.split(',').map(skill => ({ name: skill.trim() })),  // ✅ fixed here
          fees: profileData.hourlyRate,
          about: profileData.bio,
          availability_timings: profileData.availability,
          years_of_experience: profileData.yearsOfExperience,
          linkedin_url: profileData.linkedin,
          github_url: profileData.github,
          portfolio_url: profileData.portfolio,
        }
      };

      const response = await API.put(
        'mentor/profile/update/', // Update this URL to match your Django endpoint
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
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to update profile");
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
        'mentor/profile/cv/', // Update this URL
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
    } catch (error) {
      setSaveError(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await API.delete(
        'mentor/profile/cv/', // Update this URL
        {
          data: { type: 'profile_photo' },
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
      
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar-container">
            {photoPreview ? (
              <img 
                src={`http://127.0.0.1:8000${photoPreview}`} 
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
                  ✏️
                </label>
                {photoPreview && (
                  <button 
                    className="avatar-remove-button"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    disabled={photoUploading}
                  >
                    🗑️
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
              <span>⭐ {mentorProfile?.details?.average_rating || 0} Rating</span>
              <span>🎯 {mentorProfile?.details?.total_sessions || 0} Sessions</span>
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
      </div>
      {isSaving && <Loader />}
    </div>
  );
};

export default ProfilePage;