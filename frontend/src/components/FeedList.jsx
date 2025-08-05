import React, { useEffect, useState } from 'react';
import { communityApi } from '../BackendConn/communityApi';
import FeedPost from './FeedPost';
import './CSS/FeedList.css';

const FeedList = ({ activeTab, refresh }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = activeTab === 'my' 
          ? await communityApi.getMyPosts()
          : await communityApi.getPosts();
        
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.message.includes('No authentication token found')) {
          setError('Please log in to view posts.');
        } else {
          setError('Failed to load posts. Please try again.');
        }
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab, refresh]);

  if (loading) {
    return (
      <div className="feed-list-loading">
        <div className="loading-spinner"></div>
        <div>Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-list-error">
        <div className="error-message">{error}</div>
        <button 
          className="retry-button" 
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!posts.length) {
    const emptyMessage = activeTab === 'my' 
      ? "You haven't posted anything yet"
      : "No posts yet";
    
    const emptySubtitle = activeTab === 'my'
      ? "Share your first thought and inspire others in the community!"
      : "Be the first to share your thoughts and start inspiring others!";
    
    return (
      <div className="feed-list-empty">
        <div className="empty-icon">💭</div>
        <div className="empty-message">{emptyMessage}</div>
        <div className="empty-subtitle">{emptySubtitle}</div>
      </div>
    );
  }

  return (
    <div className="feed-list">
      {posts.map(post => (
        <FeedPost 
          key={post.id} 
          post={post} 
          onUpdate={refresh} 
          isOwnPost={activeTab === 'my'}
        />
      ))}
    </div>
  );
};

export default FeedList; 