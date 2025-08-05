import React, { useState } from 'react';
import { communityApi } from '../BackendConn/communityApi';
import './CSS/CommentBox.css';

const CommentBox = ({ postId, onComment }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const maxLen = 250;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    if (text.length > maxLen) {
      setError('Comment exceeds 250 characters.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await communityApi.addComment(postId, text);
      setText('');
      onComment && onComment();
    } catch (err) {
      if (err.message.includes('No authentication token found')) {
        setError('Please log in to comment.');
      } else {
        setError(err.message || 'Failed to add comment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="commentbox" onSubmit={handleSubmit}>
      <input
        className="commentbox-input"
        maxLength={maxLen}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a comment... (max 250 chars)"
        disabled={loading}
      />
      <button 
        className="commentbox-submit" 
        type="submit" 
        disabled={loading || !text.trim() || text.length > maxLen}
      >
        {loading ? 'Posting...' : 'Comment'}
      </button>
      {error && <div className="commentbox-error">{error}</div>}
    </form>
  );
};

export default CommentBox; 