import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/PageStyles.css';


const MenteesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate();


  const mentorCategories = {
    all: 'All Mentors',
    tech: 'Technology',
    design: 'Design',
    business: 'Business',
    science: 'Science'
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/mentor/public/')
      .then(res => res.json())
      .then(data => {
        const mappedMentors = data
          .filter(m => m.details && m.details.is_approved) // ensure approved and has details
          .map((m, index) => ({
            id: m.mentor_id || index,
            name: m.name || 'Unknown',
            profession: m.details?.professions?.[0]?.title || 'N/A',
            category: 'tech', // TODO: You can update backend to include a category field
            rating: m.details?.average_rating || 0,
            experience: `${m.details?.years_of_experience || 0} years`,
            image: m.details?.profile_photo || 'https://via.placeholder.com/150',
            skills: m.details?.skills?.map(s => s.name) || [],
            bio: m.details?.about || 'No bio provided.',
            availability: m.details?.availability_timings?.split(',') || ['Not specified'],
            sessions: m.details?.total_sessions || 0,
            price: `$${parseFloat(m.details?.fees || 0).toFixed(2)}/hr`
          }));
        setMentors(mappedMentors);
      })
      .catch(err => {
        console.error("Error fetching mentors:", err);
      });
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeTab === 'all' || mentor.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  const toggleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Find Your Mentor</h1>
        <div className="page-actions">
          <button className="primary-button">Become a Mentor</button>
        </div>
      </header>

      <div className="page-content">
        <div className="search-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search mentors by name, skills or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div className="category-tabs">
          {Object.entries(mentorCategories).map(([key, label]) => (
            <button
              key={key}
              className={`category-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mentors-grid">
          {filteredMentors.length > 0 ? (
            filteredMentors.map(mentor => (
              <div
                key={mentor.id}
                className={`mentor-card ${expandedCard === mentor.id ? 'expanded' : ''}`}
                onClick={() => toggleCardExpand(mentor.id)}
              >
                <div className="card-front">
                  <div className="mentor-image-container">
                    <img src={mentor.image} alt={mentor.name} className="mentor-image" />
                    <div className="mentor-category">{mentor.category}</div>
                  </div>
                  <div className="mentor-info">
                    <h3>{mentor.name}</h3>
                    <p className="profession">{mentor.profession}</p>
                    <div className="mentor-stats">
                      <span className="rating">
                        <i className="fas fa-star"></i> {mentor.rating}
                      </span>
                      <span className="experience">
                        <i className="fas fa-briefcase"></i> {mentor.experience}
                      </span>
                    </div>
                    <div className="skills-container">
                      {mentor.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-back">
                  <div className="mentor-bio">{mentor.bio}</div>
                  <div className="mentor-details">
                    <div className="detail-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{mentor.availability.join(', ')}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-chalkboard-teacher"></i>
                      <span>{mentor.sessions} sessions</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-dollar-sign"></i>
                      <span>{mentor.price}</span>
                    </div>
                  </div>
                  <button
                    className="book-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/dashboard/mentor/${mentor.id}`);
                    }}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-user-slash"></i>
              <p>No mentors found matching your criteria.</p>
              <button onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteesPage;
