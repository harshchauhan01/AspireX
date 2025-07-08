import React, { useState, useEffect } from "react";
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiAward, FiUsers, FiClock } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import "./CSS/Home.css";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counts, setCounts] = useState({
    students: 0,
    sessions: 0,
    mentors: 0
  });

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };
  const navigate = useNavigate();


  // Animated counting effect
  useEffect(() => {
    const targetCounts = {
      students: 12500,
      sessions: 8560,
      mentors: 980
    };
    
    const duration = 3000; // 3 seconds
    const increment = 50; // ms
    
    const steps = duration / increment;
    const increments = {
      students: targetCounts.students / steps,
      sessions: targetCounts.sessions / steps,
      mentors: targetCounts.mentors / steps
    };
    
    let current = { students: 0, sessions: 0, mentors: 0 };
    
    const counter = setInterval(() => {
      current.students = Math.min(
        current.students + increments.students,
        targetCounts.students
      );
      current.sessions = Math.min(
        current.sessions + increments.sessions,
        targetCounts.sessions
      );
      current.mentors = Math.min(
        current.mentors + increments.mentors,
        targetCounts.mentors
      );
      
      setCounts({
        students: Math.floor(current.students),
        sessions: Math.floor(current.sessions),
        mentors: Math.floor(current.mentors)
      });
      
      if (
        current.students >= targetCounts.students &&
        current.sessions >= targetCounts.sessions &&
        current.mentors >= targetCounts.mentors
      ) {
        clearInterval(counter);
      }
    }, increment);
    
    return () => clearInterval(counter);
  }, []);

  // Auto slide for mentors
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mentors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mentors.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mentors.length) % mentors.length);
  };

  const mentors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      expertise: "Career Development",
      experience: "15 years in HR & Career Coaching",
      image: "/mentor1.jpg",
      quote: "Helping individuals find their true potential is my passion."
    },
    {
      id: 2,
      name: "Mark Williams",
      expertise: "Tech Industry",
      experience: "Ex-Google, 10 years in Tech",
      image: "/mentor2.jpg",
      quote: "Technology changes fast, but fundamentals remain the same."
    },
    {
      id: 3,
      name: "Lisa Chen",
      expertise: "Entrepreneurship",
      experience: "Founder of 3 successful startups",
      image: "/mentor3.jpg",
      quote: "Every failure is a stepping stone to success."
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Computer Science Student",
      text: "My mentor helped me land my dream internship at a top tech company. The guidance was invaluable!",
      rating: 5
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Aspiring Entrepreneur",
      text: "The business insights I gained from my mentor saved me from making costly mistakes in my startup.",
      rating: 5
    },
    {
      id: 3,
      name: "Amit Kumar",
      role: "Career Changer",
      text: "Switching careers was daunting, but my mentor made the transition smooth and gave me confidence.",
      rating: 4
    }
  ];

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo">AspireX</div>
        
        <ul className={`nav-links ${isOpen ? "mobile-open" : ""}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#mentors">Mentors</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        
        <div className="nav-buttons">
          <button className="btn-login" onClick={() => navigate("/student/login")}>Login</button>
          <button className="btn-signup" onClick={() => navigate("/student/signup")}>Sign Up</button>
        </div>
        
        <div className="hamburger" onClick={toggleNav}>
          {isOpen ? <IoMdClose /> : <GiHamburgerMenu />}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h4>Hi, there!</h4>
            <h1>
              Your Journey, Our Guidance! <br />
              <span>AspireX</span> for More!
            </h1>
            <p>
              An adaptive mentorship platform designed to connect aspiring
              individuals with expert mentors, fostering growth through
              personalized guidance and meaningful connections.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/student/login")}>Find a Mentor</button>
              <button className="btn-secondary" onClick={() => navigate("/mentor/login")}>Become a Mentor</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <div className="background-square"></div>
              <div className="image-wrapper">
                <img src="/smiling.png" alt="Smiling person" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-number">{counts.students}+</div>
            <div className="stat-label">Students Enrolled</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-number">{counts.sessions}+</div>
            <div className="stat-label">Sessions Completed</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FiAward />
            </div>
            <div className="stat-number">{counts.mentors}+</div>
            <div className="stat-label">Expert Mentors</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-container">
          <div className="about-image">
            <img src="https://randomuser.me/api/portraits/women/19.jpg" alt="People discussing" />
          </div>
          <div className="about-content">
            <h2>About AspireX</h2>
            <p>
              AspireX was founded with a simple mission: to bridge the gap
              between ambition and achievement. We believe everyone deserves
              access to quality mentorship regardless of their background or
              circumstances.
            </p>
            <p>
              Our platform uses intelligent matching algorithms to connect
              mentees with mentors who are not just experts in their field, but
              also the right personality fit for optimal learning and growth.
            </p>
            <div className="about-features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Personalized Matching</div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Flexible Scheduling</div>
              </div>
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Progress Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="mentors-section" id="mentors">
        <h2>Meet Our Top Mentors</h2>
        <p className="section-subtitle">
          Learn from the best in various industries and domains
        </p>
        
        <div className="mentors-slider">
          <button className="slider-arrow left" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          
          <div className="mentors-container">
            {mentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className={`mentor-card ${index === currentSlide ? "active" : ""}`}
              >
                <div className="mentor-image">
                  <img src="https://randomuser.me/api/portraits/men/75.jpg" alt={mentor.name} />
                </div>
                <div className="mentor-info">
                  <h3>{mentor.name}</h3>
                  <div className="mentor-expertise">{mentor.expertise}</div>
                  <div className="mentor-experience">{mentor.experience}</div>
                  <div className="mentor-quote">
                    <FaQuoteLeft /> {mentor.quote}
                  </div>
                  <button className="btn-outline">View Profile</button>
                </div>
              </div>
            ))}
          </div>
          
          <button className="slider-arrow right" onClick={nextSlide}>
            <FaChevronRight />
          </button>
        </div>
        
        <div className="slider-dots">
          {mentors.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <h2>What Our Students Say</h2>
        <p className="section-subtitle">
          Success stories from our mentees
        </p>
        
        <div className="testimonials-container">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-rating">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <div className="testimonial-text">
                <FaQuoteLeft /> {testimonial.text}
              </div>
              <div className="testimonial-author">
                <div className="author-name">{testimonial.name}</div>
                <div className="author-role">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Transform Your Journey?</h2>
          <p>
            Whether you're looking for guidance or eager to share your expertise,
            AspireX is the platform for meaningful mentorship connections.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary" onClick={() => navigate("/student/login")}>Find Your Mentor</button>
            <button className="btn-secondary" onClick={() => navigate("/mentor/login")}>Become a Mentor</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">AspireX</div>
            <p>
              Bridging the gap between ambition and achievement through
              meaningful mentorship.
            </p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-linkedin"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#mentors">Mentors</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-contact" id="contact">
            <h4>Contact Us</h4>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> 123 Mentor St, Knowledge City</li>
              <li><i className="fas fa-phone"></i> +1 (234) 567-8900</li>
              <li><i className="fas fa-envelope"></i> hello@aspirex.com</li>
            </ul>
          </div>
          
          <div className="footer-newsletter">
            <h4>Subscribe to Newsletter</h4>
            <p>Get updates on new mentors and resources</p>
            <form>
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AspireX Platform. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;