import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { communityApi } from '../BackendConn/communityApi';
import './CSS/PostBox.css';

const PostBox = ({ onPost }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await communityApi.getCurrentUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      await communityApi.createPost(text.trim());
      setText('');
      if (onPost) onPost();
    } catch (error) {
      console.error('Post creation error:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const isNearLimit = charCount > 400;
  const isAtLimit = charCount >= 500;

  return (
    <div className="post-box">
      <div className="post-box-header">
        <div className="post-box-avatar">
          {userProfile?.profile_photo ? (
            <img src={userProfile.profile_photo} alt="Profile" />
          ) : (
            getInitials(userProfile?.name || 'User')
          )}
        </div>
        <div className="post-box-user-info">
          <div className="post-box-username">
            {userProfile?.name || 'Your Name'}
          </div>
          <div className="post-box-role">
            {userProfile?.role === 'mentor' ? <FiUser /> : <FiUser />} {userProfile?.role === 'mentor' ? 'Mentor' : 'Student'}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          className="post-box-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts, insights, or learning experiences with the community..."
          maxLength={500}
          disabled={loading}
        />
        
        <div className="post-box-footer">
          <div className={`post-box-char-count ${isNearLimit ? 'near-limit' : ''} ${isAtLimit ? 'at-limit' : ''}`}>
            {charCount}/500 characters
          </div>
          <button
            type="submit"
            className={`post-box-submit ${loading ? 'loading' : ''}`}
            disabled={!text.trim() || loading || isAtLimit}
          >
            {loading ? 'Posting...' : 'Share Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostBox; 