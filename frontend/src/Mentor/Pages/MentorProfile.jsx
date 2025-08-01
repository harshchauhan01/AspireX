import React, { useState } from 'react';
import styles from './MentorProfile.module.css';

const MentorProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [selectedService, setSelectedService] = useState(null);

  const mentorData = {
    name: "Dr. Sarah Johnson",
    title: "Senior Software Engineer & Tech Mentor",
    company: "Google",
    location: "San Francisco, CA",
    experience: "8+ years",
    rating: 4.9,
    reviewCount: 127,
    sessionsCompleted: 450,
    responseTime: "Within 2 hours",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
    languages: ["English", "Spanish", "French"],
    timeZone: "PST (UTC-8)",
    about: "I'm a passionate software engineer with over 8 years of experience at top tech companies including Google, Meta, and Amazon. I've helped 450+ students break into tech, land their dream jobs, and advance their careers. My expertise spans full-stack development, system design, and technical leadership. I believe in practical, hands-on mentorship that delivers real results.",
    expertise: [
      "React & Frontend",
      "Node.js & Backend",
      "System Design",
      "Interview Prep",
      "Career Guidance",
      "Leadership",
      "Data Structures",
      "Algorithms"
    ],
    services: [
      {
        id: 1,
        title: "1-on-1 Career Guidance",
        duration: "60 min",
        price: 80,
        description: "Comprehensive career planning session covering resume review, career roadmap, and strategic advice for your next move.",
        features: ["Resume Review", "Career Roadmap", "Industry Insights", "Goal Setting"],
        popularity: 95,
        sessionCount: 150
      },
      {
        id: 2,
        title: "Technical Interview Prep",
        duration: "45 min",
        price: 60,
        description: "Intensive mock interview sessions with real-time feedback covering coding, system design, and behavioral questions.",
        features: ["Mock Interviews", "Coding Practice", "System Design", "Feedback Report"],
        popularity: 92,
        sessionCount: 200
      },
      {
        id: 3,
        title: "Code Review & Architecture",
        duration: "30 min",
        price: 45,
        description: "In-depth code review with architectural recommendations and best practices for scalable applications.",
        features: ["Code Analysis", "Architecture Review", "Best Practices", "Performance Tips"],
        popularity: 88,
        sessionCount: 100
      }
    ],
    availability: [
      {
        day: "Monday",
        date: "Feb 5",
        slots: [
          { time: "9:00 AM", available: true },
          { time: "2:00 PM", available: true },
          { time: "6:00 PM", available: false }
        ]
      },
      {
        day: "Wednesday",
        date: "Feb 7",
        slots: [
          { time: "10:00 AM", available: true },
          { time: "4:00 PM", available: true },
          { time: "7:00 PM", available: true }
        ]
      },
      {
        day: "Friday",
        date: "Feb 9",
        slots: [
          { time: "1:00 PM", available: true },
          { time: "5:00 PM", available: false },
          { time: "8:00 PM", available: true }
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        name: "Alex Chen",
        role: "Software Engineer at Meta",
        rating: 5,
        comment: "Sarah's interview prep was incredible! She helped me identify my weak points and gave me a structured plan. Landed my dream job at Meta within 2 months!",
        date: "2 weeks ago",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
        helpful: 12
      },
      {
        id: 2,
        name: "Maya Patel",
        role: "Full Stack Developer",
        rating: 5,
        comment: "Amazing mentor! Sarah's career guidance session completely changed my perspective. Her practical advice and industry insights are invaluable.",
        date: "1 month ago",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
        helpful: 8
      },
      {
        id: 3,
        name: "Jordan Smith",
        role: "Senior Developer at Amazon",
        rating: 5,
        comment: "The code review session was fantastic. Sarah provided detailed feedback and architectural improvements that made our application 40% faster!",
        date: "2 months ago",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
        helpful: 15
      }
    ]
  };

  return (
    <div className={styles.mentorProfileContainer}>
      {/* Header Section */}
      <div className={styles.profileHeader}>
        <div className={styles.coverImage}>
          <img src={mentorData.coverImage} alt="Cover" />
          <div className={styles.coverOverlay}></div>
        </div>
        
        <div className={styles.profileMain}>
          <div className={styles.profileInfo}>
            <div className={styles.profileImageSection}>
              <img src={mentorData.profileImage} alt={mentorData.name} className={styles.profileImage} />
              <div className={styles.onlineStatus}>
                <div className={styles.statusIndicator}></div>
                <span>Online now</span>
              </div>
            </div>
            
            <div className={styles.profileDetails}>
              <h1 className={styles.mentorName}>{mentorData.name}</h1>
              <h2 className={styles.mentorTitle}>{mentorData.title}</h2>
              <div className={styles.mentorLocation}>
                <span className={styles.icon}>📍</span>
                {mentorData.company} • {mentorData.location}
              </div>
              
              <div className={styles.mentorStats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>⭐ {mentorData.rating}</div>
                  <div className={styles.statLabel}>{mentorData.reviewCount} reviews</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{mentorData.sessionsCompleted}+</div>
                  <div className={styles.statLabel}>sessions completed</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statValue}>⚡ {mentorData.responseTime}</div>
                  <div className={styles.statLabel}>response time</div>
                </div>
              </div>
            </div>
            
            <div className={styles.profileActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`}>
                <span className={styles.btnIcon}>🚀</span>
                Book Session
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`}>
                <span className={styles.btnIcon}>💬</span>
                Message
              </button>
              <button className={`${styles.btn} ${styles.btnOutline}`}>
                <span className={styles.btnIcon}>❤️</span>
                Follow
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.expertiseSection}>
          <div className={styles.expertiseContainer}>
            <h3>Expertise</h3>
            <div className={styles.expertiseTags}>
              {mentorData.expertise.map((skill, index) => (
                <span key={index} className={styles.expertiseTag} style={{ animationDelay: `${index * 0.1}s` }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                  <p className={styles.aboutText}>{mentorData.about}</p>
                  
                  <div className={styles.achievements}>
                    <h4>Key Achievements</h4>
                    <ul>
                      <li>🏆 Helped 450+ students land jobs at top tech companies</li>
                      <li>🚀 Led engineering teams of 15+ developers at Google</li>
                      <li>📚 Published 25+ technical articles with 100K+ views</li>
                      <li>🎯 95% success rate in interview preparation sessions</li>
                    </ul>
                  </div>
                </div>
                
                <div className={styles.aboutSidebar}>
                  <div className={styles.infoCard}>
                    <h4>💼 Experience</h4>
                    <p>{mentorData.experience} in tech</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>🌍 Languages</h4>
                    <p>{mentorData.languages.join(', ')}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>🕐 Time Zone</h4>
                    <p>{mentorData.timeZone}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>⚡ Response Time</h4>
                    <p>{mentorData.responseTime}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className={styles.servicesSection}>
              <div className={styles.servicesHeader}>
                <h3>My Services</h3>
                <p>Choose the perfect mentorship package for your goals</p>
              </div>
              
              <div className={styles.servicesGrid}>
                {mentorData.services.map((service) => (
                  <div 
                    key={service.id} 
                    className={`${styles.serviceCard} ${selectedService === service.id ? styles.selected : ''}`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className={styles.serviceHeader}>
                      <h4>{service.title}</h4>
                      <div className={styles.servicePrice}>${service.price}</div>
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
                <p>All times shown in {mentorData.timeZone}</p>
              </div>
              
              <div className={styles.calendarContainer}>
                {mentorData.availability.map((day, index) => (
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
                
                <div className={styles.ratingSummary}>
                  <div className={styles.bigRating}>{mentorData.rating}</div>
                  <div className={styles.ratingDetails}>
                    <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                    <p>Based on {mentorData.reviewCount} reviews</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.reviewsList}>
                {mentorData.reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <img src={review.avatar} alt={review.name} className={styles.reviewerAvatar} />
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
