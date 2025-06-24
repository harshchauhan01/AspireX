import React, { useState } from 'react';
import './CSS/MentorProfile.css';

const MentorProfile = () => {
const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    timeSlot: '',
    subject: '',
    termsAgreed: false,
    privacyAgreed: false
  });

  // Mentor data
  const mentor = {
    name: "Dr. Sarah Johnson",
    profession: "Senior Software Engineer & Career Coach",
    bio: "With over 10 years of experience in the tech industry and 5 years mentoring junior developers, I specialize in helping professionals transition into tech careers and advance their skills.",
    skills: ["JavaScript", "React", "Career Coaching", "Technical Interviews", "System Design"],
    price: 85,
    rating: 4.9,
    reviews: 128,
    experience: "10+ years",
    qualification: "PhD in Computer Science, MIT",
    availability: "Mon-Fri, 9am-5pm EST",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
    timeSlots: [
      "Monday, 10:00 AM - 11:00 AM",
      "Tuesday, 2:00 PM - 3:00 PM",
      "Wednesday, 4:00 PM - 5:00 PM",
      "Thursday, 9:00 AM - 10:00 AM",
      "Friday, 1:00 PM - 2:00 PM"
    ]
  };

  const handleBookMeeting = () => {
    setShowBookingForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
    if (e.target.value >= 100) {
      handlePayment();
    }
  };

  const handlePayment = () => {
    setIsBooking(true);
    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      setShowBookingForm(false);
      setShowPaymentForm(true);
    }, 1500);
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setShowPaymentForm(false);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    }, 2000);
  };

  const closeModal = () => {
    setShowBookingForm(false);
    setShowPaymentForm(false);
    setSliderValue(0);
  };

  return (
    <div className="mentor-profile-container">
      <div className="mentor-header">
        <div className="mentor-photo-container">
          <img src={mentor.photo} alt={mentor.name} className="mentor-photo" />
          <div className="rating-badge">
            ⭐ {mentor.rating} ({mentor.reviews} reviews)
          </div>
        </div>
        
        <div className="mentor-basic-info">
          <h1>{mentor.name}</h1>
          <h2>{mentor.profession}</h2>
          <div className="price-tag">${mentor.price}/hour</div>
          
          <button 
        className={`book-button ${isBooking ? 'loading' : ''}`} 
        onClick={handleBookMeeting}
        disabled={isBooking}
      >
        {isBooking ? 'Processing...' : 'Book a Meeting'}
      </button>
      
      {bookingSuccess && (
        <div className="success-message">
          Booking confirmed! The mentor will contact you shortly.
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <button className="close-modal" onClick={closeModal}>×</button>
            <h2>Book a Session with {mentor.name}</h2>
            
            <form className="booking-form">
              <div className="form-group">
                <label>Select Time Slot</label>
                <select 
                  name="timeSlot" 
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose a time slot</option>
                  {mentor.timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Meeting Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="What would you like to discuss?"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="termsAgreed"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="termsAgreed">I agree to the terms and conditions</label>
              </div>
              
              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="privacyAgreed"
                  name="privacyAgreed"
                  checked={formData.privacyAgreed}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="privacyAgreed">I agree to the privacy policy</label>
              </div>
              
              <div className="payment-section">
                <h3>Complete Payment: ${mentor.price}</h3>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="payment-slider"
                    disabled={!formData.timeSlot || !formData.subject || !formData.termsAgreed || !formData.privacyAgreed}
                  />
                  <div className="slider-labels">
                    <span>Slide to pay</span>
                    <span>→</span>
                  </div>
                  <div className="slider-thumb-icon" style={{ left: `${sliderValue}%` }}>→</div>
                  {sliderValue >= 100 && (
                    <div className="slider-success">Processing payment...</div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <button className="close-modal" onClick={closeModal}>×</button>
            <h2>Complete Your Payment</h2>
            
            <form className="payment-form" onSubmit={handleTransactionSubmit}>
              <div className="qr-code-container">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PaymentForMentorSession" 
                  alt="Payment QR Code" 
                  className="qr-code"
                />
                <p className="payment-amount">Amount: ${mentor.price}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="transactionId">Transaction ID</label>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-payment"
                disabled={paymentSuccess}
              >
                {paymentSuccess ? 'Processing...' : 'Submit Payment'}
              </button>
              
              {paymentSuccess && (
                <div className="payment-success-message">
                  Payment successful! Waiting for confirmation.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
      
      <div className="mentor-details">
        <section className="mentor-section">
          <h3>About Me</h3>
          <p>{mentor.bio}</p>
        </section>
        
        <div className="details-grid">
          <section className="mentor-section">
            <h3>Skills & Expertise</h3>
            <div className="skills-container">
              {mentor.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </section>
          
          <section className="mentor-section">
            <h3>Experience</h3>
            <p>{mentor.experience} in the industry</p>
            <ul className="experience-list">
              <li>Senior Developer at TechCorp (2018-Present)</li>
              <li>Lead Developer at Startup Inc. (2015-2018)</li>
              <li>Software Engineer at DevSolutions (2012-2015)</li>
            </ul>
          </section>
          
          <section className="mentor-section">
            <h3>Qualifications</h3>
            <p>{mentor.qualification}</p>
            <p>Certified Career Coach (CCC)</p>
          </section>
          
          <section className="mentor-section">
            <h3>Availability</h3>
            <p>{mentor.availability}</p>
            <p>Flexible hours available upon request</p>
          </section>
        </div>
        
        <section className="mentor-section testimonials">
          <h3>What My Students Say</h3>
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <p>"Sarah helped me land my dream job at Google. Her interview preparation was spot on!"</p>
              <div className="testimonial-author">- Michael T.</div>
            </div>
            <div className="testimonial-card">
              <p>"The best mentor I've worked with. Practical advice and great coding techniques."</p>
              <div className="testimonial-author">- Priya K.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MentorProfile;