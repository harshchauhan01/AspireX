import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './css/MentorProfile.module.css';
import API from '../../BackendConn/api';
import upiQr from '../../assets/qrcode.jpeg';
import coverImg from '../../assets/mentoring.webp';

const MentorProfile = ({ mentorId, onBack }) => {
  const { id } = useParams();
  const actualMentorId = mentorId || id;
  // console.log('Looking for mentor ID:', actualMentorId);
  
  // State for dynamic data
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedService, setSelectedService] = useState(null);

  // Booking and payment states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    timeSlot: '',
    subject: '',
    selectedService: '',
    termsAgreed: false,
    privacyAgreed: false
  });

  // Message states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Debug modal state
  useEffect(() => {
    // console.log('Modal state changed:', { showBookingForm, showPaymentForm, showMessageModal });
  }, [showBookingForm, showPaymentForm, showMessageModal]);

  // Fetch mentor data and online status
  useEffect(() => {
    const fetchMentorData = async () => {
      // Prevent re-fetching if data is already loaded
      if (isDataFetched && mentor) {
        return;
      }

      try {
        setLoading(true);
        // console.log('Fetching mentor data for ID:', actualMentorId);

        // Fetch mentor data (includes online status)
        const mentorResponse = await API.get(`/mentor/public/${actualMentorId}/`);

        // Fetch existing bookings for this mentor
        const bookingsResponse = await API.get(`/student/bookings/?mentor_id=${actualMentorId}`);

        if (mentorResponse.data) {
          const foundMentor = mentorResponse.data;

          // Extract booked slots from bookings (handle case where API might fail)
          let bookedTimeSlots = [];
          try {
            bookedTimeSlots = bookingsResponse.data.map(booking => {
              return {
                day: booking.day || 'Unknown',
                time: booking.time_slot ? booking.time_slot.split(' - ')[1] || booking.time_slot : 'Unknown',
                date: booking.date || new Date().toISOString().split('T')[0]
              };
            });
          } catch (error) {
            // console.log('Could not fetch bookings, using empty array:', error);
            bookedTimeSlots = [];
          }
          setBookedSlots(bookedTimeSlots);

          const mappedMentor = {
            mentor_id: foundMentor.mentor_id,
            name: foundMentor.name,
            title: foundMentor.details?.professions?.[0]?.title || 'Professional Mentor',
            company: foundMentor.details?.college || 'University',
            location: foundMentor.details?.location || 'Remote',
            rating: foundMentor.details?.average_rating || 4.8,
            reviewCount: foundMentor.feedback_count || 0,
            sessionsCompleted: foundMentor.details?.total_sessions || 150,
            responseTime: foundMentor.details?.response_time || '2 hours',
            profileImage: foundMentor.details?.profile_photo || 'https://via.placeholder.com/150',
            expertise: foundMentor.details?.skills?.map(skill => skill.name) || ['Leadership', 'Communication', 'Strategy'],
            about: foundMentor.details?.about || 'Experienced mentor with a passion for helping students succeed.',
            languages: foundMentor.details?.languages || ["English", "Spanish", "French"],
            services: foundMentor.details?.services || [
              {
                title: "Career Guidance",
                duration: "60 min",
                price: 80,
                description: "Comprehensive career planning and guidance session",
                features: ["Resume Review", "Interview Prep", "Career Path Planning"],
                popularity: 95,
                sessionCount: 150
              }
            ],
            availability: convertBackendAvailability(foundMentor.details?.availability_day_wise),
            keyAchievements: foundMentor.details?.key_achievements || [
              "Led 50+ successful career transitions",
              "Mentored 200+ students to job placements",
              "Industry expert with 10+ years experience"
            ],
            reviews: foundMentor.reviews || [],
            details: foundMentor.details
          };

          setMentor(mappedMentor);
          setIsDataFetched(true);
        }
      } catch (error) {
        console.error('Error fetching mentor data:', error);
        setError('Failed to load mentor profile');
      } finally {
        setLoading(false);
      }
    };

    if (actualMentorId) {
      fetchMentorData();
    }
  }, [actualMentorId, isDataFetched, mentor]);

  // Reset data fetched flag when mentor ID changes
  useEffect(() => {
    setIsDataFetched(false);
  }, [actualMentorId]);

  // Refresh booked slots when mentor data changes
  useEffect(() => {
    if (mentor && actualMentorId) {
      const refreshBookedSlots = async () => {
        try {
          const bookingsResponse = await API.get(`/student/bookings/?mentor_id=${actualMentorId}`);
          let bookedTimeSlots = [];
          try {
            bookedTimeSlots = bookingsResponse.data.map(booking => {
              return {
                day: booking.day || 'Unknown',
                time: booking.time_slot ? booking.time_slot.split(' - ')[1] || booking.time_slot : 'Unknown',
                date: booking.date || new Date().toISOString().split('T')[0]
              };
            });
          } catch (error) {
            // console.log('Could not fetch bookings, using empty array:', error);
            bookedTimeSlots = [];
          }
          setBookedSlots(bookedTimeSlots);
        } catch (error) {
          console.error('Error refreshing booked slots:', error);
        }
      };
      
      refreshBookedSlots();
    }
  }, [mentor, actualMentorId]);

  // Periodically check online status (reduced frequency)
  useEffect(() => {
    if (!mentor || !isDataFetched) return;
    
    const checkOnlineStatus = async () => {
      try {
        const response = await API.get(`/mentor/public/${mentorId}/`);
        if (response.data && response.data.details) {
          setMentor(prevMentor => ({
            ...prevMentor,
            details: {
              ...prevMentor.details,
              is_online: response.data.details.is_online
            }
          }));
        }
      } catch (error) {
        console.error('Error checking online status:', error);
      }
    };

    // Check every 2 minutes instead of 30 seconds
    const interval = setInterval(checkOnlineStatus, 120000);
    
    return () => clearInterval(interval);
  }, [mentorId, isDataFetched]);

  // Check if a slot is booked
  const isSlotBooked = (day, time) => {
    return bookedSlots.some(slot => 
      slot.day.toLowerCase() === day.toLowerCase() && 
      slot.time === time
    );
  };

  // Update availability to mark booked slots as unavailable
  const getUpdatedAvailability = () => {
    if (!mentor) return [];
    
    return mentor.availability.map(daySchedule => ({
      ...daySchedule,
      slots: daySchedule.slots.map(slot => ({
        ...slot,
        available: slot.available && !isSlotBooked(daySchedule.day, slot.time)
      }))
    }));
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const today = new Date();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const slots = [];

    days.forEach((day, index) => {
      // Calculate the date for this day of the current week
      const dayIndex = (index + 1) % 7; // Monday = 1, Tuesday = 2, etc.
      const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate days to add to get to this day of the week
      let daysToAdd;
      if (dayIndex === 0) { // Sunday
        daysToAdd = (7 - currentDayOfWeek) % 7;
      } else {
        daysToAdd = (dayIndex - currentDayOfWeek + 7) % 7;
      }
      
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + daysToAdd);
      
      // Format date as "Mon 12" or "Tue 13" etc.
      const dateStr = dayDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric' 
      });

      slots.push({
        day: day,
        date: dateStr,
        slots: [
          { time: "9:00 AM", available: true },
          { time: "2:00 PM", available: true },
          { time: "6:00 PM", available: true }
        ]
      });
    });

    return slots;
  };

  // Convert backend availability data to frontend format
  const convertBackendAvailability = (backendAvailability) => {
    if (!backendAvailability || typeof backendAvailability !== 'object') {
      return generateTimeSlots();
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const converted = [];

    days.forEach((day, index) => {
      const dayData = backendAvailability[day.toLowerCase()] || backendAvailability[day] || backendAvailability[index + 1];
      
      if (dayData && dayData.slots && dayData.slots.length > 0) {
        // Calculate the date for this day of the current week
        const dayIndex = (index + 1) % 7; // Monday = 1, Tuesday = 2, etc.
        const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate days to add to get to this day of the week
        let daysToAdd;
        if (dayIndex === 0) { // Sunday
          daysToAdd = (7 - currentDayOfWeek) % 7;
        } else {
          daysToAdd = (dayIndex - currentDayOfWeek + 7) % 7;
        }
        
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + daysToAdd);
        
        // Format date as "Mon 12" or "Tue 13" etc.
        const dateStr = dayDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: 'numeric' 
        });

        converted.push({
          day: day,
          date: dateStr,
          slots: dayData.slots.map(slot => ({
            time: slot.time || slot.start_time || "9:00 AM",
            available: slot.available !== false
          }))
        });
      }
    });

    return converted.length > 0 ? converted : generateTimeSlots();
  };

  // Booking handlers
  const handleBookMeeting = () => {
    // console.log('Book meeting clicked!');
    setShowBookingForm(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };
  
  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
    if (e.target.value >= 100) handlePayment();
  };
  
  const handlePayment = () => {
    const selectedTime = formData.timeSlot;
    const selectedService = formData.selectedService;

    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }
    
    if (!selectedService) {
      alert('Please select a service');
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
    const selectedTime = formData.timeSlot;

    // Validate that a time slot is selected
    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    // Parse the selected time slot to extract day and time
    let day = 'Unknown';
    let time = selectedTime;
    let bookingDate = new Date().toISOString().split('T')[0]; // Default to today
    
    if (selectedTime && selectedTime.includes(', ')) {
      const timeSlotParts = selectedTime.split(', ');
      if (timeSlotParts.length >= 2) {
        day = timeSlotParts[0]; // "Monday"
        const dateTimePart = timeSlotParts[1]; // "Mon 12 - 9:00 AM"
        if (dateTimePart && dateTimePart.includes(' - ')) {
          time = dateTimePart.split(' - ')[1]; // "9:00 AM"
          
          // Parse the date from the dateTimePart
          const datePart = dateTimePart.split(' - ')[0]; // "Mon 12"
          const dateWords = datePart ? datePart.split(' ') : [];
          if (dateWords.length >= 2) {
            const dayNumber = parseInt(dateWords[1]);
            if (!isNaN(dayNumber)) {
              const today = new Date();
              const currentYear = today.getFullYear();
              const currentMonth = today.getMonth();
              
              // Create the actual date
              let bookingDateObj = new Date(currentYear, currentMonth, dayNumber);
              
              // If the date is in the past, move to next month
              if (bookingDateObj < today) {
                if (currentMonth === 11) { // December
                  bookingDateObj = new Date(currentYear + 1, 0, dayNumber);
                } else {
                  bookingDateObj = new Date(currentYear, currentMonth + 1, dayNumber);
                }
              }
              
              bookingDate = bookingDateObj.toISOString().split('T')[0];
            }
          }
        }
      }
    }

    const selectedService = mentor.services.find(s => s.title === formData.selectedService);
    
    const bookingData = {
      mentor_id: actualMentorId,
      subject: formData.subject,
      service: formData.selectedService,
      service_price: selectedService?.price || 80,
      service_duration: selectedService?.duration || '60 min',
      time_slot: selectedTime,
      day: day,
      date: bookingDate,
      transaction_id: transactionId,
      is_paid: false
    };

    try {
      const response = await API.post('student/booking/', bookingData);

      if (response.status === 201) {
        // Add the newly booked slot to the bookedSlots state (temporarily simplified)
        setBookedSlots(prev => [...prev, { 
          day: day, 
          time: time, 
          date: bookingDate 
        }]);
        
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setShowPaymentForm(false);
                  setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 5000);
        }, 2000);
      }
    } catch (err) {
      if (err.response) {
        alert("Error: " + JSON.stringify(err.response.data));
      } else if (err.request) {
        alert("Server did not respond. Please try again.");
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };
  
  const closeModal = () => {
    setShowBookingForm(false);
    setShowPaymentForm(false);
    setShowMessageModal(false);
    setSliderValue(0);
    setMessageText('');
    setFormData({
      timeSlot: '',
      subject: '',
      selectedService: '',
      termsAgreed: false,
      privacyAgreed: false
    });
  };

  const handleTimeSlotChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      timeSlot: value
    }));
  };

  const handleServiceChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedService: value
    }));
  };

  // Message handlers
  const handleMessageClick = () => {
    setShowMessageModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSendingMessage(true);
    try {
      // Here you would typically send the message to your backend
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Message sent successfully!');
      setShowMessageModal(false);
      setMessageText('');
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading mentor profile...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className={styles.errorContainer}>
        <h2>Mentor not found</h2>
        <p>The mentor you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className={styles.mentorProfileContainer}>
      {/* Back Button */}
      {onBack && (
        <div className={styles.backButtonContainer}>
          <button 
            onClick={onBack} 
            className={styles.backButton}
            style={{
              background: 'white',
              border: '2px solid #667eea',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#667eea',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              outline: 'none',
              position: 'relative',
              zIndex: 100
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ← Back to Mentors
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className={styles.profileHeader}>
        <div className={styles.coverImage}>
          <img src={coverImg} alt="Cover" />
          <div className={styles.coverOverlay}></div>
        </div>
        
        <div className={styles.profileMain}>
          <div className={styles.profileInfo}>
            <div className={styles.profileImageSection}>
              <img src={mentor.profileImage} alt={mentor.name} className={styles.profileImage} />
              <div className={`${styles.onlineStatus} ${!mentor.details?.is_online ? styles.offline : ''}`}>
                <div className={`${styles.statusIndicator} ${!mentor.details?.is_online ? styles.offline : ''}`}></div>
                <span>{mentor.details?.is_online ? 'Online now' : 'Offline'}</span>
              </div>
            </div>
            
            <div className={styles.profileDetails}>
              <h1 className={styles.mentorName}>{mentor.name}</h1>
              <h2 className={styles.mentorTitle}>{mentor.title}</h2>
              <div className={styles.mentorLocation}>
                <span className={styles.icon}>📍</span>
                {mentor.company} • {mentor.location}
              </div>
              
              <div className={styles.mentorStats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>⭐ {mentor.rating}</div>
                  <div className={styles.statLabel}>
                    {mentor.reviewCount > 0 ? `${mentor.reviewCount} reviews` : 'No reviews yet'}
                  </div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{mentor.sessionsCompleted}+</div>
                  <div className={styles.statLabel}>sessions completed</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>⚡ {mentor.responseTime}</div>
                  <div className={styles.statLabel}>response time</div>
                </div>
              </div>
            </div>
            
            <div className={styles.profileActions}>
              <button 
                className={`${styles.btn} ${styles.btnPrimary} ${isBooking ? styles.loading : ''}`}
                onClick={handleBookMeeting}
                disabled={isBooking}
                style={{ 
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <span className={styles.btnIcon}>🚀</span>
                {isBooking ? 'Processing...' : 'Book Session'}
              </button>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleMessageClick}
                style={{ 
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  background: '#f1f5f9',
                  color: '#374151',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span className={styles.btnIcon}>💬</span>
                Message
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.expertiseSection}>
          <div className={styles.expertiseContainer}>
            <h3>Expertise</h3>
            <div className={styles.expertiseTags}>
              {mentor.expertise.map((skill, index) => (
                <span key={index} className={styles.expertiseTag} style={{ animationDelay: `${index * 0.1}s` }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {bookingSuccess && (
        <div className={styles.successMessage}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ color: '#059669', marginBottom: '15px' }}>✅ Booking Confirmed!</h3>
            {formData.selectedService && (
              <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f9ff', borderRadius: '8px' }}>
                <strong>Service:</strong> {formData.selectedService}<br/>
                <strong>Duration:</strong> {mentor.services.find(s => s.title === formData.selectedService)?.duration || '60 min'}<br/>
                <strong>Amount Paid:</strong> ₹{mentor.services.find(s => s.title === formData.selectedService)?.price || 80}
              </div>
            )}
            <p>The mentor will contact you shortly with meeting details.</p>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className={styles.contentSection}>
        <div className={styles.contentNavigation}>
          {[
            { id: 'about', label: 'About', icon: '👤' },
            { id: 'services', label: 'Services', icon: '💎' },
            { id: 'availability', label: 'Availability', icon: '📅' },
            { id: 'reviews', label: 'Reviews', icon: '⭐' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navTab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'about' && (
            <div className={styles.aboutSection}>
              <div className={styles.aboutGrid}>
                <div className={styles.aboutMain}>
                  <h3>About Me</h3>
                  <p className={styles.aboutText}>{mentor.about}</p>
                  
                  <div className={styles.achievements}>
                    <h4>Key Achievements</h4>
                    <ul className={styles.achievementsList}>
                      {mentor.keyAchievements.map((achievement, index) => (
                        <li key={index} className={styles.achievementItem}>
                          <span className={styles.diamondBullet}>◆</span>
                          <span className={styles.achievementText}>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className={styles.aboutSidebar}>
                  <div className={styles.infoCard}>
                    <h4>💼 Experience</h4>
                    <p>{mentor.experience} in tech</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>🌍 Languages</h4>
                    <p>{mentor.languages.join(', ')}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>🕐 Time Zone</h4>
                    <p>{mentor.timeZone}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>⚡ Response Time</h4>
                    <p>{mentor.responseTime}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className={styles.servicesSection}>
              <div className={styles.servicesHeader}>
                <h3>Services</h3>
                <p>Choose the perfect mentorship package for your goals</p>
              </div>
              
              <div className={styles.servicesGrid}>
                {mentor.services.map((service) => (
                  <div 
                    key={service.id} 
                    className={`${styles.serviceCard} ${selectedService === service.id ? styles.selected : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className={styles.serviceHeader}>
                      <h4>{service.title}</h4>
                      <div className={styles.servicePrice}>₹{service.price}</div>
                    </div>
                    
                    <div className={styles.serviceMeta}>
                      <span className={styles.duration}>⏱️ {service.duration}</span>
                      <span className={styles.sessions}>{service.sessionCount} sessions completed</span>
                    </div>
                    
                    <p className={styles.serviceDescription}>{service.description}</p>
                    
                    <div className={styles.serviceFeatures}>
                      <h5>What's included:</h5>
                      <ul>
                        {service.features.map((feature, index) => (
                          <li key={index}>✅ {feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className={styles.servicePopularity}>
                      <div className={styles.popularityBar}>
                        <div 
                          className={styles.popularityFill} 
                          style={{ width: `${service.popularity}%` }}
                        ></div>
                      </div>
                      <span className={styles.popularityText}>{service.popularity}% student satisfaction</span>
                    </div>
                    
                    <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}>
                      <span className={styles.btnIcon}>📅</span>
                      Book This Service
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className={styles.availabilitySection}>
              <div className={styles.availabilityHeader}>
                <h3>Available Time Slots</h3>
                <p>All times shown in {mentor.timeZone}</p>
              </div>
              
              <div className={styles.calendarContainer}>
                {getUpdatedAvailability().map((day, index) => (
                  <div key={index} className={styles.daySchedule}>
                    <div className={styles.dayHeader}>
                      <h4>{day.day}</h4>
                      <span className={styles.dayDate}>{day.date}</span>
                    </div>
                    
                    <div className={styles.timeSlots}>
                      {day.slots.map((slot, slotIndex) => (
                        <button 
                          key={slotIndex} 
                          className={`${styles.timeSlot} ${!slot.available ? styles.unavailable : ''}`}
                          disabled={!slot.available}
                        >
                          <span className={styles.slotTime}>{slot.time}</span>
                          <span className={styles.slotStatus}>
                            {slot.available ? '✅ Available' : '❌ Booked'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <div className={styles.reviewsTitle}>
                  <h3>Student Reviews</h3>
                  <p>What my mentees say about their experience</p>
                </div>
                
                {mentor.reviews.length > 0 ? (
                  <div className={styles.ratingSummary}>
                    <div className={styles.bigRating}>{mentor.rating}</div>
                    <div className={styles.ratingDetails}>
                      <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                      <p>Based on {mentor.reviewCount > 0 ? `${mentor.reviewCount} reviews` : 'no reviews yet'}</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noReviews}>
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
              
              {mentor.reviews.length > 0 ? (
                <div className={styles.reviewsList}>
                  {mentor.reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          {review.avatar ? (
                            <img src={review.avatar} alt={review.name} className={styles.reviewerAvatar} />
                          ) : (
                            <div className={styles.reviewerInitials}>
                              {review.name ? review.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className={styles.reviewerDetails}>
                            <h5>{review.name}</h5>
                            <span className={styles.reviewerRole}>{review.role}</span>
                            <div className={styles.reviewRating}>
                              {'⭐'.repeat(review.rating)}
                            </div>
                          </div>
                        </div>
                        <div className={styles.reviewMeta}>
                          <span className={styles.reviewDate}>{review.date}</span>
                          <span className={styles.helpfulCount}>👍 {review.helpful} helpful</span>
                        </div>
                      </div>
                      
                      <p className={styles.reviewText}>{review.comment}</p>
                      
                      <div className={styles.reviewActions}>
                        <button className={styles.helpfulBtn}>👍 Helpful</button>
                        <button className={styles.replyBtn}>💬 Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noReviewsMessage}>
                  <p>Be the first to leave a review after your session!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div 
          className={styles.modalOverlay}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}
        >
          <div 
            className={styles.bookingModal}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <button 
              className={styles.closeModal} 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ×
            </button>
            <h2 style={{ 
              marginBottom: '30px', 
              color: '#1e293b', 
              fontSize: '24px', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Book a Session with {mentor.name}
            </h2>
            
            <form className={styles.bookingForm}>
              <div className={styles.formGroup}>
                <label>Select Time Slot</label>
                <select 
                  name="timeSlot" 
                  value={formData.timeSlot}
                  onChange={handleTimeSlotChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#374151',
                    background: '#f9fafb',
                    marginBottom: '20px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a time slot</option>
                  {getUpdatedAvailability().flatMap(day => 
                    day.slots.filter(slot => slot.available).map(slot => ({
                      label: `${day.day}, ${day.date} - ${slot.time}`,
                      value: `${day.day}, ${day.date} - ${slot.time}`
                    }))
                  ).map((slot, index) => (
                    <option key={index} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Select Service</label>
                <select 
                  name="selectedService" 
                  value={formData.selectedService}
                  onChange={handleServiceChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#374151',
                    background: '#f9fafb',
                    marginBottom: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a service</option>
                  {mentor.services?.map((service, index) => (
                    <option key={index} value={service.title}>
                      {service.title} - ₹{service.price} ({service.duration})
                    </option>
                  ))}
                </select>
                {formData.selectedService && (
                  <div style={{
                    padding: '10px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    color: '#0369a1'
                  }}>
                    <strong>Service Description:</strong> {mentor.services.find(s => s.title === formData.selectedService)?.description || 'No description available'}
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Meeting Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="What would you like to discuss?"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#374151',
                    background: '#f9fafb',
                    marginBottom: '20px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <div className={styles.formGroup}>
                <input 
                  type="checkbox" 
                  id="termsAgreed"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleInputChange}
                  required
                  style={{
                    marginRight: '10px',
                    transform: 'scale(1.2)',
                    accentColor: '#667eea'
                  }}
                />
                <label htmlFor="termsAgreed" style={{ fontSize: '16px', color: '#374151' }}>I agree to the terms and conditions</label>
              </div>
              
              <div className={styles.formGroup}>
                <input 
                  type="checkbox" 
                  id="privacyAgreed"
                  name="privacyAgreed"
                  checked={formData.privacyAgreed}
                  onChange={handleInputChange}
                  required
                  style={{
                    marginRight: '10px',
                    transform: 'scale(1.2)',
                    accentColor: '#667eea'
                  }}
                />
                <label htmlFor="privacyAgreed" style={{ fontSize: '16px', color: '#374151' }}>I agree to the privacy policy</label>
              </div>
              
              <div className={styles.paymentSection}>
                <h3 style={{ 
                  marginBottom: '20px', 
                  color: '#1e293b', 
                  fontSize: '18px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {formData.selectedService ? (
                    <>
                      <div style={{ marginBottom: '10px' }}>
                        Selected Service: {formData.selectedService}
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        Duration: {mentor.services.find(s => s.title === formData.selectedService)?.duration || '60 min'}
                      </div>
                      <div>
                        Complete Payment: ₹{mentor.services.find(s => s.title === formData.selectedService)?.price || 80}
                      </div>
                    </>
                  ) : (
                    `Complete Payment: ₹${mentor.services[0]?.price || 80}`
                  )}
                </h3>
                <div className={styles.sliderContainer}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '60px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '30px',
                    padding: '8px',
                    border: '2px solid #e5e7eb',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      right: '8px',
                      height: '44px',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '22px',
                      transform: `scaleX(${sliderValue / 100})`,
                      transformOrigin: 'left',
                      transition: 'transform 0.3s ease',
                      zIndex: 1
                    }}></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className={styles.paymentSlider}
                      disabled={!formData.timeSlot || !formData.subject || !formData.selectedService || !formData.termsAgreed || !formData.privacyAgreed}
                      style={{
                        width: '100%',
                        height: '44px',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        background: 'transparent',
                        outline: 'none',
                        cursor: (!formData.timeSlot || !formData.subject || !formData.selectedService || !formData.termsAgreed || !formData.privacyAgreed) ? 'not-allowed' : 'pointer',
                        position: 'absolute',
                        top: '8px',
                        left: '0',
                        zIndex: 2,
                        margin: 0,
                        padding: 0,
                        opacity: (!formData.timeSlot || !formData.subject || !formData.selectedService || !formData.termsAgreed || !formData.privacyAgreed) ? 0.5 : 1
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${8 + (sliderValue / 100) * (100 - 16)}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '36px',
                      height: '36px',
                      background: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '3px solid #667eea',
                      zIndex: 3,
                      transition: 'all 0.3s ease',
                      pointerEvents: 'none'
                    }}></div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Slide to pay</span>
                    <span style={{ fontSize: '16px', color: '#667eea', fontWeight: '600' }}>→</span>
                  </div>
                  {sliderValue >= 100 && (
                    <div style={{
                      textAlign: 'center',
                      color: '#10b981',
                      fontWeight: '600',
                      fontSize: '16px',
                      padding: '10px',
                      background: '#ecfdf5',
                      borderRadius: '8px',
                      border: '1px solid #d1fae5',
                      animation: 'pulse 1s infinite'
                    }}>
                      Processing payment...
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div 
          className={styles.modalOverlay}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}
        >
          <div 
            className={styles.paymentModal}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'slideInUp 0.4s ease'
            }}
          >
            <button 
              className={styles.closeModal} 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ×
            </button>
            <h2 style={{ 
              marginBottom: '30px', 
              color: '#1e293b', 
              fontSize: '24px', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Complete Your Payment
            </h2>
            
            <form className={styles.paymentForm} onSubmit={handleTransactionSubmit}>
              <div className={styles.qrCodeContainer}>
                <img 
                  src={upiQr}
                  alt="Payment QR Code" 
                  className={styles.qrCode}
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    marginBottom: '16px',
                    display: 'block',
                    margin: '0 auto 16px auto'
                  }}
                />
                <p className={styles.paymentAmount} style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  Amount: ₹{mentor.services[0]?.price || 80}
                </p>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="transactionId" style={{
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Transaction ID
                </label>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#374151',
                    background: '#f9fafb',
                    marginBottom: '20px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.submitPayment}
                disabled={paymentSuccess}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!paymentSuccess) {
                    e.target.style.background = '#5a67d8';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!paymentSuccess) {
                    e.target.style.background = '#667eea';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {paymentSuccess ? 'Processing...' : 'Submit Payment'}
              </button>
              
              {paymentSuccess && (
                <div style={{
                  textAlign: 'center',
                  color: '#10b981',
                  fontWeight: '500',
                  marginTop: '16px',
                  padding: '12px',
                  background: '#ecfdf5',
                  borderRadius: '8px',
                  border: '1px solid #d1fae5'
                }}>
                  Payment successful! Waiting for confirmation.
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div 
          className={styles.modalOverlay}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}
        >
          <div 
            className={styles.messageModal}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <button 
              className={styles.closeModal} 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ×
            </button>
            <h2 style={{ 
              marginBottom: '30px', 
              color: '#1e293b', 
              fontSize: '24px', 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Send Message to {mentor.name}
            </h2>
            
            <form className={styles.messageForm} onSubmit={handleSendMessage}>
              <div className={styles.formGroup}>
                <label htmlFor="messageText" style={{ 
                  fontWeight: '600', 
                  color: '#374151', 
                  fontSize: '14px',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Your Message
                </label>
                <textarea
                  id="messageText"
                  name="messageText"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write your message here..."
                  rows={6}
                  required
                  className={styles.messageTextarea}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#374151',
                    background: '#f9fafb',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    resize: 'vertical',
                    minHeight: '120px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.submitMessage}
                disabled={isSendingMessage}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#5a67d8';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfile;