import React, { useState, useEffect } from 'react';
import API from '../../BackendConn/api';
import './CSS/PageStyles.css';
import './CSS/FeedbackPage.css';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('Mentortoken');
      const response = await API.get('mentor/feedback/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setFeedbacks(response.data);
    } catch (err) {
      setError('Failed to fetch feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('Mentortoken');
      const response = await API.get('mentor/feedback/stats/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745';
    if (rating >= 3) return '#ffc107';
    return '#dc3545';
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
            style={{ color: star <= rating ? '#ffc107' : '#e4e5e9' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container feedback-page">
        <div className="loading">Loading feedback...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container feedback-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container feedback-page">
      <header className="page-header">
        <h1>Student Feedback</h1>
        <p>See what your students are saying about your sessions</p>
      </header>

      {/* Stats Section */}
      <section className="feedback-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Feedback</h3>
            <p className="stat-number">{stats.total_feedback || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Average Rating</h3>
            <p className="stat-number" style={{ color: getRatingColor(stats.average_rating || 0) }}>
              {(stats.average_rating || 0).toFixed(1)}/5
            </p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number">{stats.approved_feedback || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending_feedback || 0}</p>
          </div>
        </div>
      </section>

      {/* Rating Distribution */}
      {stats.rating_distribution && (
        <section className="rating-distribution">
          <h2>Rating Distribution</h2>
          <div className="rating-bars">
            {stats.rating_distribution.map((item) => (
              <div key={item.rating} className="rating-bar">
                <span className="rating-label">{item.rating} ★</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(item.count / stats.total_feedback) * 100}%`,
                      backgroundColor: getRatingColor(item.rating)
                    }}
                  ></div>
                </div>
                <span className="rating-count">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feedback List */}
      <section className="feedback-list">
        <h2>Recent Feedback</h2>
        {feedbacks.length > 0 ? (
          <div className="feedback-cards">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-header">
                  <div className="student-info">
                    <h3>{feedback.student_name}</h3>
                    <p className="student-id">{feedback.student_id}</p>
                  </div>
                  <div className="feedback-meta">
                    <div className="rating-display">
                      {renderStars(feedback.rating)}
                      <span className="rating-text">{feedback.rating_display}</span>
                    </div>
                    <span className="feedback-date">{formatDate(feedback.created_at)}</span>
                  </div>
                </div>
                
                <div className="meeting-info">
                  <p><strong>Meeting:</strong> {feedback.meeting_title}</p>
                  <p><strong>Meeting ID:</strong> {feedback.meeting_id}</p>
                </div>
                
                <div className="feedback-content">
                  <p>{feedback.feedback_text}</p>
                </div>
                
                <div className="feedback-status">
                  <span className={`status-badge ${feedback.is_approved ? 'approved' : 'pending'}`}>
                    {feedback.is_approved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-feedback">
            <p>No feedback received yet. Keep up the great work!</p>
          </div>
        )}
      </section>

      {/* Feedback Detail Modal */}
      {showFeedbackModal && selectedFeedback && (
        <div className="feedback-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h2>Feedback Details</h2>
              <button className="close-button" onClick={() => setShowFeedbackModal(false)}>×</button>
            </div>
            <div className="feedback-modal-content">
              <div className="student-info">
                <h3>{selectedFeedback.student_name}</h3>
                <p>{selectedFeedback.student_id}</p>
              </div>
              <div className="meeting-info">
                <p><strong>Meeting:</strong> {selectedFeedback.meeting_title}</p>
                <p><strong>Date:</strong> {formatDate(selectedFeedback.created_at)}</p>
              </div>
              <div className="rating-section">
                <h4>Rating</h4>
                {renderStars(selectedFeedback.rating)}
                <p>{selectedFeedback.rating_display}</p>
              </div>
              <div className="feedback-text">
                <h4>Feedback</h4>
                <p>{selectedFeedback.feedback_text}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage; 