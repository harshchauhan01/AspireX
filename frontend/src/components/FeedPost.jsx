import React, { useState, useEffect } from 'react';
import { FiUser, FiMessageCircle, FiTrash } from 'react-icons/fi';
import { FaRegHeart, FaHeart, FaRegComment, FaRegEye } from 'react-icons/fa';
import { communityApi } from '../BackendConn/communityApi';
import './CSS/FeedPost.css';
import CommentBox from './CommentBox';
import CommentList from './CommentList';
import { formatTime } from './CommunityFeed';
import logo from '../assets/logoD.jpeg';
import { FaCheckCircle } from 'react-icons/fa';

const FeedPost = ({ post, onUpdate, isOwnPost = false }) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [liked, setLiked] = useState(false); // TODO: fetch like status for user
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [refreshComments, setRefreshComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewCount, setViewCount] = useState(post.views ?? 0);
  const [expanded, setExpanded] = useState(false); // <-- add this line

  // Only increment view once per user per post
  useEffect(() => {
    if (!post.id) return;
    const viewedKey = 'community_viewed_posts';
    let viewed = [];
    try {
      viewed = JSON.parse(localStorage.getItem(viewedKey)) || [];
    } catch {}
    if (!viewed.includes(post.id)) {
      communityApi.incrementView(post.id).then(newViews => {
        setViewCount(newViews ?? viewCount + 1);
      });
      localStorage.setItem(viewedKey, JSON.stringify([...viewed, post.id]));
    }
  }, [post.id]);

  // Check if post is trending (20+ likes)
  const isTrending = likeCount >= 20;

  const handleLike = async () => {
    if (likeLoading) return;
    
    setLikeLoading(true);
    try {
      const result = await communityApi.toggleLike(post.id);
      setLiked(result.liked);
      setLikeCount(result.like_count);
    } catch (err) {
      if (err.message.includes('No authentication token found')) {
        alert('Please log in to like posts.');
      } else {
        console.error('Like error:', err);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = () => {
    setRefreshComments(r => !r);
    setCommentCount(c => c + 1);
    setShowComments(true);
  };

  const handleDelete = async () => {
    if (deleteLoading) return;
    
    setDeleteLoading(true);
    try {
      await communityApi.deletePost(post.id);
      if (onUpdate) {
        onUpdate(); // Trigger refresh of the feed
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getInitials = (username) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`feed-post${isTrending ? ' trending' : ''}${post.is_admin_post ? ' admin-post' : ''}`}>
      <div className="feed-post-header">
        <div className="feed-post-user">
          <div className="feed-post-avatar">
            {post.is_admin_post ? (
              <img src={logo} alt="AspireX Logo" style={{borderRadius: '50%'}} />
            ) : post.profile_photo ? (
              <img src={post.profile_photo} alt="Profile" />
            ) : (
              getInitials(post.username)
            )}
          </div>
          <div className="feed-post-user-info">
            <span className="feed-post-username">
              {post.is_admin_post ? 'AspireX' : post.username}
              {post.is_admin_post && <FaCheckCircle style={{color: '#2196f3', marginLeft: 6}} title="Verified" />}
            </span>
            <span className={`feed-post-role ${post.role}`}>{post.is_admin_post ? 'Official Update' : (post.role === 'mentor' ? <><FiUser /> Mentor</> : <><FiUser /> Student</>)}</span>
          </div>
        </div>
        <div className="feed-post-header-actions">
          <span className="feed-post-time">{formatTime(post.createdAt || post.created_at || post.timestamp)}</span>
          {isOwnPost && !post.is_admin_post && (
            <button 
              className="feed-post-delete" 
              onClick={() => handleDelete(post.id)}
              title="Delete post"
            >
              <FiTrash />
            </button>
          )}
        </div>
      </div>
      
      <div className="feed-post-text">
        {post.text.length > 200 ? (
          expanded ? (
            <span>
              {post.text} <span className="feed-post-readmore" style={{cursor: 'pointer', color: '#2196f3'}} onClick={() => setExpanded(false)}>show less</span>
            </span>
          ) : (
            <span>
              {post.text.slice(0, 200)}... <span className="feed-post-readmore" style={{cursor: 'pointer', color: '#2196f3'}} onClick={() => setExpanded(true)}>read more</span>
            </span>
          )
        ) : post.text}
      </div>
      
      <div className="feed-post-actions">
        <button 
          className={`feed-post-like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
          title={liked ? 'Unlike' : 'Like'}
        >
          {likeLoading ? <FaRegHeart /> : (liked ? <FaHeart /> : <FaRegHeart />)} {likeCount}
        </button>
        <button 
          className="feed-post-comment" 
          onClick={() => setShowComments(s => !s)}
          title="Comment"
        >
          <FaRegComment /> {commentCount}
        </button>
        <span className="feed-post-action"><FaRegEye /> {viewCount}</span>
      </div>
      
      {showComments && (
        <div className="feed-post-comments">
          <CommentList postId={post.id} refresh={refreshComments} />
          <CommentBox postId={post.id} onComment={handleComment} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button 
                className="delete-confirm-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-delete"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPost; 