import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CSS/MentorProfile.css';

const MentorProfile = () => {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    timeSlot: '',
    customTimeSlot: '',
    subject: '',
    termsAgreed: false,
    privacyAgreed: false
  });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/mentor/public/')
      .then(res => res.json())
      .then(data => {
        const foundMentor = data.find(m => m.mentor_id === id && m.details);
        if (foundMentor) {
          const mapped = {
            name: foundMentor.name,
            profession: foundMentor.details?.professions?.[0]?.title || "N/A",
            bio: foundMentor.details.about || "No bio provided",
            skills: foundMentor.details.skills?.map(s => s.name) || [],
            price: foundMentor.details.fees || 0,
            rating: foundMentor.details.average_rating || 0,
            reviews: 0, // ← No review count in API; update if needed
            experience: `${foundMentor.details.years_of_experience || 0} years`,
            qualification: foundMentor.details.qualification || 'N/A',
            availability: foundMentor.details.availability_timings || 'N/A',
            photo: foundMentor.details.profile_photo || 'https://via.placeholder.com/150',
            timeSlots: generateTimeSlots()
          };
          setMentor(mapped);
        }
        setLoading(false);
      });
  }, [id]);

  const handleBookMeeting = () => setShowBookingForm(true);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };
  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
    if (e.target.value >= 100) handlePayment();
  };
  const handlePayment = () => {
    const selectedTime = formData.timeSlot === 'custom' 
      ? formData.customTimeSlot 
      : formData.timeSlot;

    if (!selectedTime) {
      alert('Please select or specify a time slot');
      return;
    }
    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      setShowBookingForm(false);
      setShowPaymentForm(true);
    }, 1500);
  };
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    // setPaymentSuccess(true);
    // setTimeout(() => {
    //   setPaymentSuccess(false);
    //   setShowPaymentForm(false);
    //   setBookingSuccess(true);
    //   setTimeout(() => setBookingSuccess(false), 3000);
    // }, 2000);
    const selectedTime = formData.timeSlot === 'custom' 
      ? formData.customTimeSlot 
      : formData.timeSlot;

    const bookingData = {
      mentor_id: id, // ✅ You already get this from useParams
      subject: formData.subject,
      time_slot: selectedTime,
      transaction_id: transactionId,
      is_paid: false
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/student/booking/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ✅ Send authentication token for request.user
          Authorization: `Token ${localStorage.getItem('token')}` // adjust if you store token differently
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setShowPaymentForm(false);
          setBookingSuccess(true);
          setTimeout(() => setBookingSuccess(false), 3000);
        }, 2000);
      } else {
        const data = await response.json();
        alert("Error: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };
  const closeModal = () => {
    setShowBookingForm(false);
    setShowPaymentForm(false);
    setSliderValue(0);
  };

  const generateTimeSlots = () => {
    const timeConfigs = [
      { day: 1, hour: 10, label: "Monday, 10:00 AM - 11:00 AM" },
      { day: 2, hour: 14, label: "Tuesday, 2:00 PM - 3:00 PM" },
      { day: 3, hour: 16, label: "Wednesday, 4:00 PM - 5:00 PM" }
    ];

    const today = new Date();
    const slots = timeConfigs.map(({ day, hour, label }) => {
      const slotDate = new Date(today);
      const diff = (day + 7 - today.getDay()) % 7 || 7; // Days until next desired weekday
      slotDate.setDate(today.getDate() + diff);
      slotDate.setHours(hour, 0, 0, 0); // Set to the specific hour
      return {
        label,
        value: slotDate.toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
      };
    });

    return slots;
  };

  const handleTimeSlotChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      timeSlot: value,
      // Reset custom time when selecting a predefined slot
      customTimeSlot: value !== 'custom' ? '' : prev.customTimeSlot
    }));
  };

  // New handler for custom time input
  const handleCustomTimeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      customTimeSlot: e.target.value
    }));
  };


  if (loading) return <div>Loading mentor profile...</div>;
  if (!mentor) return <div>Mentor not found.</div>;

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
                  onChange={handleTimeSlotChange}
                >
                  <option value="">Choose from upcoming slots</option>
                  {mentor.timeSlots.map((slot, index) => (
                    <option key={index} value={slot.value}>{slot.label}</option>
                  ))}
                  <option value="custom">Custom Date & Time</option>
                </select>
              </div>

              {formData.timeSlot === "custom" && (
                <div className="form-group">
                  <label>Choose Custom Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="customTimeSlot" 
                    value={formData.customTimeSlot}
                    onChange={handleCustomTimeChange} 
                    required 
                    min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                  />
                </div>
              )}

              
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