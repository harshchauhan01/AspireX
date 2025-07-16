import React, { useState } from 'react';
import API from '../../BackendConn/api';
import './CSS/FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose, session, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!feedbackText.trim()) {
      setError('Please provide feedback text');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await API.post('student/feedback/', {
        mentor_id: session.mentor_id,
        meeting_id: session.id,
        rating: rating,
        feedback_text: feedbackText
      });

      if (response.status === 201) {
        onSubmitSuccess && onSubmitSuccess(response.data);
        onClose();
        // Reset form
        setRating(0);
        setFeedbackText('');
      }
    } catch (err) {
      if (err.response?.data?.meeting_id) {
        setError(err.response.data.meeting_id[0]);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal">
        <div className="feedback-modal-header">
          <h2>Give Feedback</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="feedback-modal-content">
          <div className="session-info">
            <h3>{session?.topic}</h3>
            <p>With {session?.mentor}</p>
            <p className="session-date">{session?.date} at {session?.time}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Rate your experience:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>

            <div className="feedback-text-section">
              <label htmlFor="feedback-text">Share your experience:</label>
              <textarea
                id="feedback-text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us about your session experience, what went well, and any suggestions for improvement..."
                rows="4"
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="feedback-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal; 