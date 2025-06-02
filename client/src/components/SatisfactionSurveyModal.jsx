import React, { useState } from 'react';
import '../styles/SatisfactionSurveyModal.css';

const SatisfactionSurveyModal = ({ isOpen, onClose, onSubmit, ticketId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ticketId,
      rating,
      feedback
    });
  };

  return (
    <div className="survey-modal-overlay">
      <div className="survey-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>How was your experience?</h2>
        <p>Please rate your satisfaction with the support you received</p>

        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Would you like to add any comments? (Optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />

        <div className="button-group">
          <button className="skip-btn" onClick={onClose}>Skip</button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionSurveyModal;