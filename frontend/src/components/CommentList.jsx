import React, { useEffect, useState } from 'react';
import { FiUser, FiMessageCircle } from 'react-icons/fi';
import { communityApi } from '../BackendConn/communityApi';
import './CSS/CommentList.css';

const CommentList = ({ postId, refresh }) => {
  const [comments, setComments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await communityApi.getComments(postId);
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.message.includes('No authentication token found')) {
          setError('Please log in to view comments.');
        } else {
          setError('Failed to load comments.');
        }
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, refresh]);

  const getInitials = (username) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="comment-list-loading">
        <div className="loading-spinner">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comment-list-error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!comments.length) {
    return (
      <div className="comment-list-empty">
        <div className="empty-icon"><FiMessageCircle /></div>
        <div className="empty-message">No comments yet. Be the first to comment!</div>
      </div>
    );
  }

  const visible = showAll ? comments : comments.slice(0, 3);

  return (
    <div className="comment-list">
      {visible.map(comment => (
        <div className="comment-list-item" key={comment.id}>
          <div className="comment-list-user">
            <div className="comment-list-avatar">
              {comment.profile_photo ? (
                <img src={comment.profile_photo} alt="Profile" />
              ) : (
                getInitials(comment.username)
              )}
            </div>
            <div className="comment-list-user-info">
              <span className="comment-list-username">{comment.username}</span>
              <span className={`comment-list-role ${comment.role}`}>
                {comment.role === 'mentor' ? <FiUser /> : <FiUser />}
              </span>
            </div>
          </div>
          <div className="comment-list-content">
            <span className="comment-list-text">{comment.text}</span>
            <span className="comment-list-time">{comment.time_since_posted}</span>
          </div>
        </div>
      ))}
      {comments.length > 3 && !showAll && (
        <button 
          className="comment-list-expand" 
          onClick={() => setShowAll(true)}
        >
          Show all {comments.length} comments
        </button>
      )}
    </div>
  );
};

export default CommentList; 