import React, { useState, useEffect } from 'react';
import './CSS/CommunityFeed.css';
import PostBox from './PostBox';
import FeedTabs from './FeedTabs';
import FeedList from './FeedList';
import { FiMessageCircle, FiFileText } from 'react-icons/fi';
import { FaRegHeart } from 'react-icons/fa';
import ServicesNavbar from './ServicesNavbar';
import { communityApi } from '../BackendConn/communityApi';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

// Utility to format time
export function formatTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const CommunityFeed = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [refresh, setRefresh] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileStats, setProfileStats] = useState({
    name: '',
    posts: 0,
    likes: 0,
    comments: 0,
    role: '',
    profile_photo: null,
  });

  // For triggering feed refresh after post/like/comment
  const triggerRefresh = () => setRefresh(r => !r);

  // Fetch profile stats and photo when in profile tab
  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!(activeTab === 'my' || showProfile || activeTab === 'profile')) return;
      try {
        // Fetch user's posts
        const posts = await communityApi.getMyPosts();
        let name = '', role = '', profile_photo = null;
        let likes = 0, comments = 0;
        if (Array.isArray(posts) && posts.length > 0) {
          name = posts[0].username;
          role = posts[0].role;
          likes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
          comments = posts.reduce((sum, p) => sum + (p.comment_count || 0), 0);
        } else {
          name = 'Your Name';
          role = '';
        }
        // Fetch user profile for photo
        try {
          const userProfile = await communityApi.getCurrentUserProfile();
          if (userProfile) {
            name = userProfile.name || name;
            role = userProfile.role || role;
            profile_photo = userProfile.profile_photo || null;
          }
        } catch {}
        setProfileStats({
          name,
          posts: posts.length,
          likes,
          comments,
          role,
          profile_photo,
        });
      } catch {
        setProfileStats({ name: 'Your Name', posts: 0, likes: 0, comments: 0, role: '', profile_photo: null });
      }
    };
    fetchProfileStats();
  }, [activeTab, showProfile, refresh]);

  let content;
  let showPostBox = false;
  let showProfileSummary = false;
  if (activeTab === 'all') {
    content = <FeedList activeTab="all" refresh={refresh} />;
  } else if (activeTab === 'my' || showProfile || activeTab === 'profile') {
    content = <FeedList activeTab="my" refresh={refresh} />;
    showPostBox = true;
    showProfileSummary = true;
  }

  return (
    <>
      <ServicesNavbar />
      <div className="community-feed-container">
        <div className="community-feed-header">
          <h2><span className="feed-icon"><FiMessageCircle /></span> Community Feed</h2>
          <p className="community-feed-subtitle">Share your thoughts. Inspire others. Learn together — one post at a time.</p>
        </div>
        {showProfileSummary && (
          <div className="profile-summary-card">
            {profileStats.profile_photo ? (
              <img className="profile-summary-avatar" src={profileStats.profile_photo} alt="Profile" />
            ) : (
              <div className="profile-summary-avatar">{getInitials(profileStats.name)}</div>
            )}
            <div className="profile-summary-info">
              <div className="profile-summary-name">{profileStats.name}</div>
              <div className="profile-summary-stats">
                <span><FiFileText /> {profileStats.posts} posts</span>
                <span><FaRegHeart /> {profileStats.likes} likes</span>
                <span><FiMessageCircle /> {profileStats.comments} comments</span>
              </div>
            </div>
          </div>
        )}
        {(showPostBox) && <PostBox onPost={triggerRefresh} />}
        {(activeTab === 'all' || activeTab === 'my' || activeTab === 'profile' || showProfile) ? (
          <FeedTabs activeTab={activeTab === 'profile' || showProfile ? 'my' : activeTab} setActiveTab={setActiveTab} />
        ) : null}
        {content}
      </div>
    </>
  );
};

export default CommunityFeed; 