import React, { useState, useEffect } from 'react';
import API from '../../BackendConn/api';
import './CSS/PageStyles.css';
import './CSS/Messages.css';
import Loader from '../../components/ui/loader';

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserType, setCurrentUserType] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  
  // Mobile-specific states
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showConversationList, setShowConversationList] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowConversationList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('chat/get-user-info/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setCurrentUserId(res.data.id);
        setCurrentUserType(res.data.user_type);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await API.get('chat/conversations/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      setConversations(
        (response.data || []).sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.last_message_time || b.created_at || 0) - new Date(a.last_message_time || a.created_at || 0);
        })
      );
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.response?.data?.detail || error.message);
      setIsLoading(false);
    }
  };

  // Pin/Unpin conversation
  const togglePinConversation = async (conversationId, isPinned, event) => {
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const endpoint = isPinned ? 'unpin' : 'pin';
      const response = await API.put(`chat/conversations/${conversationId}/${endpoint}/`, {}, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.status === 200) {
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) {
      console.warn("⚠️ Tried to fetch messages for undefined conversationId");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`chat/conversations/${conversationId}/messages/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      setActiveConversation(prev => ({
        ...prev,
        messages: response.data || []
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return minutes === 0 ? 'Just now' : `${minutes}m ago`;
      }
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!activeConversation || !activeConversation.id || !messageInput.trim()) {
      return;
    }

    const conversationId = activeConversation.id;

    try {
      await API.post(`chat/conversations/${conversationId}/send/`, {
        content: messageInput.trim(),
        sender_type: currentUserType 
      }, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      });

      setMessageInput('');
      await fetchMessages(conversationId);
      await fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (currentUserType) {
      fetchConversations();
    }
  }, [currentUserType]);

  const handleSelectConversation = (conversation) => {
    let otherUserId = conversation.other_user_id;
    let otherUserType = conversation.other_user_type;
    
    if (!otherUserId || !otherUserType) {
      if (currentUserType === 'mentor') {
        otherUserId = conversation.student;
        otherUserType = 'student';
      } else if (currentUserType === 'student') {
        otherUserId = conversation.mentor;
        otherUserType = 'mentor';
      }
    }
    
    setActiveConversation({
      id: conversation.id,
      otherPersonName: conversation.other_person_name,
      avatar: getInitials(conversation.other_person_name),
      messages: [],
      otherUserId: otherUserId,
      otherUserType: otherUserType
    });
    
    fetchMessages(conversation.id);
    
    // On mobile, hide conversation list when selecting a conversation
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // View profile functionality
  const handleViewProfile = async (userId, isMentor) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isMentor 
        ? `mentor/public/${userId}/`
        : `student/public/${userId}/`;
      
      const response = await API.get(endpoint, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setSelectedUserProfile(response.data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile');
    }
  };

  // Handle back navigation on mobile
  const handleBackToConversations = () => {
    if (isMobile) {
      setShowConversationList(true);
      setActiveConversation(null);
    }
  };

  // Profile Modal Component
  const ProfileModal = () => {
    if (!showProfileModal || !selectedUserProfile) return null;

    const profile = selectedUserProfile;
    const isMentorProfile = profile?.mentor_id;
    
    return (
      <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>👤 User Profile</h3>
            <button 
              className="modal-close"
              onClick={() => setShowProfileModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="profile-info">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile?.details?.profile_photo ? (
                    <img 
                      src={profile.details.profile_photo} 
                      alt="Profile" 
                      className="profile-avatar-image"
                    />
                  ) : (
                    <div className="profile-avatar-initials">
                      {getInitials(profile?.name || 'User')}
                    </div>
                  )}
                </div>
                <div className="profile-basic-info">
                  <h2>{profile?.name || 'Unknown User'}</h2>
                  <p className="profile-email">{profile?.email || 'No email available'}</p>
                  <p className="profile-type">
                    {isMentorProfile ? 'Mentor' : 'Student'}
                  </p>
                </div>
              </div>
              
              <div className="profile-stats">
                {isMentorProfile && profile?.details?.total_students && (
                  <div className="stat-item">
                    <div className="stat-value">{profile.details.total_students}</div>
                    <div className="stat-label">Students</div>
                  </div>
                )}
                {isMentorProfile && profile?.details?.total_sessions && (
                  <div className="stat-item">
                    <div className="stat-value">{profile.details.total_sessions}</div>
                    <div className="stat-label">Sessions</div>
                  </div>
                )}
                {isMentorProfile && profile?.details?.average_rating && (
                  <div className="stat-item">
                    <div className="stat-value">{profile.details.average_rating.toFixed(1)}</div>
                    <div className="stat-label">Rating</div>
                  </div>
                )}
                {!isMentorProfile && profile?.details?.total_sessions && (
                  <div className="stat-item">
                    <div className="stat-value">{profile.details.total_sessions}</div>
                    <div className="stat-label">Sessions</div>
                  </div>
                )}
                {profile?.details?.batch && (
                  <div className="stat-item">
                    <div className="stat-value">{profile.details.batch}</div>
                    <div className="stat-label">Batch</div>
                  </div>
                )}
                {profile?.details?.cgpa && (
                  <div className="stat-item">
                    <div className="stat-value">{profile.details.cgpa}</div>
                    <div className="stat-label">CGPA</div>
                  </div>
                )}
              </div>
              
              <div className="profile-details">
                {profile?.details?.about && (
                  <div className="detail-section">
                    <h4>About</h4>
                    <p>{profile.details.about}</p>
                  </div>
                )}
                
                {profile?.details?.professions?.[0]?.title && (
                  <div className="detail-section">
                    <h4>Expertise</h4>
                    <p>{profile.details.professions[0].title}</p>
                  </div>
                )}
                
                {profile?.details?.skills?.length > 0 && (
                  <div className="detail-section">
                    <h4>Skills</h4>
                    <div className="skills-list">
                      {profile.details.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {isMentorProfile && profile?.details?.fees && (
                  <div className="detail-section">
                    <h4>Hourly Rate</h4>
                    <p>${profile.details.fees}/hour</p>
                  </div>
                )}
                
                {isMentorProfile && profile?.details?.years_of_experience && (
                  <div className="detail-section">
                    <h4>Experience</h4>
                    <p>{profile.details.years_of_experience} years of professional experience</p>
                  </div>
                )}

                {profile?.details?.college && (
                  <div className="detail-section">
                    <h4>Education</h4>
                    <p>{profile.details.college}</p>
                  </div>
                )}

                {profile?.details?.phone_number && profile.details.phone_number !== "#NA" && (
                  <div className="detail-section">
                    <h4>Contact</h4>
                    <p>📞 {profile.details.phone_number}</p>
                  </div>
                )}
              </div>

              <div className="contact-section">
                <h4>🚀 Ready to Connect?</h4>
                <div className="contact-buttons">
                  <button className="contact-btn" onClick={() => {
                    setShowProfileModal(false);
                  }}>
                    💬 Start Chat
                  </button>
                  {isMentorProfile && (
                    <button className="contact-btn" onClick={() => {
                      setShowProfileModal(false);
                    }}>
                      📅 Book Session
                    </button>
                  )}
                  <button className="contact-btn" onClick={() => setShowProfileModal(false)}>
                    ✨ View More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loader />;

  if (error) {
    return <div className="page-container messages-page">{error}</div>;
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const [mentorRes, studentRes] = await Promise.all([
        API.get(`mentor/public/?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Token ${token}` }
        }),
        API.get(`student/public/?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      const mentorsRaw = Array.isArray(mentorRes.data) ? mentorRes.data : mentorRes.data.results || [];
      const studentsRaw = Array.isArray(studentRes.data) ? studentRes.data : studentRes.data.results || [];

      const mentors = mentorsRaw.map(m => ({
        id: m.id || m.mentor_id,
        full_name: m.name,
        is_mentor: true,
        is_student: false
      }));

      const students = studentsRaw.map(s => ({
        id: s.id || s.student_id,
        full_name: s.name,
        is_mentor: false,
        is_student: true
      }));

      const combined = [...mentors, ...students];
      setSearchResults(combined);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(true);
    }
  };

  // Start new conversation
  const startNewConversation = async (userId, isMentorUser) => {
    try {
      let payload = {};
      
      if (currentUserType === 'student' && isMentorUser) {
        payload = {
          student_id: currentUserId,
          mentor_id: userId
        };
      } else if (currentUserType === 'mentor' && !isMentorUser) {
        payload = {
          mentor_id: currentUserId,
          student_id: userId
        };
      } else {
        console.error("❌ Invalid user role or payload mismatch");
        return;
      }

      const response = await API.post('chat/conversations/', payload);

      const newConversation = {
        ...response.data,
        other_person_name: response.data.other_person_name || 'New User',
        lastMessage: null,
        time: 'Just now',
        unread: false
      };

      setActiveConversation({
        id: newConversation.id,
        otherPersonName: newConversation.other_person_name,
        avatar: getInitials(newConversation.other_person_name),
        messages: [],
        otherUserId: userId,
        otherUserType: isMentorUser ? 'mentor' : 'student'
      });

      if (!newConversation.id) {
        console.error("❌ Failed to get conversation ID from response");
        return;
      }

      await fetchMessages(newConversation.id);

      setConversations(prev => [newConversation, ...prev]);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
      setShowSearch(false);
      
      // On mobile, show the conversation
      if (isMobile) {
        setShowConversationList(false);
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error.response?.data || error.message);
    }
  };

  return (
    <div className="page-container messages-page">
      {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-header">
          {!showConversationList && activeConversation ? (
            // Message view header
            <div className="mobile-message-header">
              <button 
                className="back-button"
                onClick={handleBackToConversations}
              >
                ← 
              </button>
              <div className="mobile-contact-info">
                <div className="mobile-avatar">
                  {getInitials(activeConversation.otherPersonName)}
                </div>
                <div className="mobile-contact-details">
                  <h3>{activeConversation.otherPersonName}</h3>
                  
                </div>
              </div>
              <div className="mobile-header-actions">
                <button 
                  className="header-action-btn"
                  onClick={() => handleViewProfile(
                    activeConversation.otherUserId, 
                    activeConversation.otherUserType === 'mentor'
                  )}
                >
                  👤
                </button>
              </div>
            </div>
          ) : (
            // Conversation list header
            <div className="mobile-conversations-header">
              <h1>Messages</h1>
              <div className="mobile-header-actions">
                <button 
                  className={`header-action-btn ${showSearch ? 'active' : ''}`}
                  onClick={() => {
                    setShowSearch(!showSearch);
                    if (showSearch) {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearchResults(false);
                    }
                  }}
                >
                  🔍
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <header className="page-header">
          <h1>Messages</h1>
          <div className="search-container">
            <form className="search-bar" onSubmit={handleSearch}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to start chat..."
              />
              <button type="submit">🔍</button>
            </form>
            {showSearchResults && (
              <div className="search-results-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map(user => (
                    <div 
                      key={user.id} 
                      className="search-result-item"
                      onClick={() => startNewConversation(user.id, user.is_mentor)}
                    >
                      <div className="search-result-avatar">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="search-result-details">
                        <h4>{user.full_name}</h4>
                        <p>{user.is_mentor ? 'Mentor' : 'Student'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-search-results">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Mobile Search Bar */}
      {isMobile && showSearch && (
        <div className="mobile-search-container">
          <form className="mobile-search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users to start chat..."
              autoFocus
            />
            <button type="submit">🔍</button>
          </form>
          {showSearchResults && (
            <div className="mobile-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div 
                    key={user.id} 
                    className="search-result-item"
                    onClick={() => startNewConversation(user.id, user.is_mentor)}
                  >
                    <div className="search-result-avatar">
                      {getInitials(user.full_name)}
                    </div>
                    <div className="search-result-details">
                      <h4>{user.full_name}</h4>
                      <p>{user.is_mentor ? 'Mentor' : 'Student'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-search-results">
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="messages-container">
        {/* Conversation List */}
        <div className={`conversation-list ${isMobile ? (showConversationList ? 'show' : 'hide') : ''}`}>
          {conversations.length > 0 ? (
            conversations.map(conversation => (
              <div 
                key={conversation.id}
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''} ${conversation.pinned ? 'pinned' : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {getInitials(conversation.other_person_name)}
                  {conversation.unread && <span className="unread-badge"></span>}
                </div>
                <div className="conversation-details">
                  <div className="conversation-header">
                    <h3>
                      {conversation.other_person_name || 'Unknown User'}
                      {conversation.pinned && <span className="pin-indicator">📌</span>}
                    </h3>
                    <span className="conversation-time">{formatTime(conversation.last_message_time || conversation.created_at)}</span>
                  </div>
                  <p className="last-message">
                    {conversation.last_message_content 
                      ? conversation.last_message_content.length > 50 
                        ? conversation.last_message_content.substring(0, 50) + '...'
                        : conversation.last_message_content
                      : 'No messages yet'
                    }
                  </p>
                </div>
                <div className="conversation-actions">
                  <button 
                    onClick={(e) => togglePinConversation(conversation.id, conversation.pinned, e)}
                    className={`pin-button ${conversation.pinned ? 'pinned' : ''}`}
                    title={conversation.pinned ? 'Unpin conversation' : 'Pin conversation'}
                  >
                    📌
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No conversations yet</h3>
                <p>Search for users to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Message View */}
        <div className={`message-view ${isMobile ? (showConversationList ? 'hide' : 'show') : ''}`}>
          {activeConversation ? (
            <>
              {/* Desktop Message Header */}
              {!isMobile && (
                <div className="message-header">
                  <div className="contact-info">
                    <div className="contact-avatar">
                      {getInitials(activeConversation.otherPersonName)}
                    </div>
                    <div className="contact-details">
                      <h2>{activeConversation.otherPersonName}</h2>
                    </div>
                  </div>
                  <button 
                    className="profile-button"
                    onClick={() => handleViewProfile(
                      activeConversation.otherUserId, 
                      activeConversation.otherUserType === 'mentor'
                    )}
                  >
                    View Profile
                  </button>
                </div>
              )}
              
              <div className="messages-list">
                {activeConversation.messages?.length > 0 ? (
                  activeConversation.messages.map(message => (
                    <div 
                      key={message.id || `${message.sender_type}-${message.timestamp}`} 
                      className={`message ${message.sender_type === currentUserType ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{message.content}</p>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <div className="empty-state">
                      <div className="empty-icon">💭</div>
                      <h3>No messages yet</h3>
                      <p>Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="message-input">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <span className="send-icon">➤</span>
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Welcome to Messages</h3>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileModal />
    </div>
  );
};

export default Messages;
