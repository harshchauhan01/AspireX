import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/PageStyles.css';
import './CSS/Messages.css';


const Messages = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserType, setCurrentUserType] = useState(null);



  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/chat/',
    headers: {
      'Authorization': `Token ${localStorage.getItem('Mentortoken')}`
    }
  });


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('Mentortoken');
        console.log(token);
        
        const res = await axios.get('http://127.0.0.1:8000/api/chat/get-user-info/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setCurrentUserId(res.data.id);
        setCurrentUserType(res.data.user_type);  // 'student' or 'mentor'
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
      const token = localStorage.getItem('Mentortoken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('conversations/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      console.log("📩 Response from conversation POST:", response.data); // <-- Add this

      
      setConversations(
        (response.data || []).sort((a, b) =>
          new Date(b.last_message_time) - new Date(a.last_message_time)
        )
      );
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.response?.data?.detail || error.message);
      setIsLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) {
      console.warn("⚠️ Tried to fetch messages for undefined conversationId");
      return;
    }

    try {
      const token = localStorage.getItem('Mentortoken');
      const response = await api.get(`conversations/${conversationId}/messages/`, {
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
        return minutes === 0 ? 'Just now' : `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      }
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!activeConversation || !activeConversation.id) {
      console.error("No active conversation selected.");
      return;
    }

    const conversationId = activeConversation.id;

    try {
      await axios.post(`http://127.0.0.1:8000/api/chat/conversations/${conversationId}/send/`, {
        content: messageInput,
        sender_type: currentUserType 
      }, {
        headers: {
          Authorization: `Token ${localStorage.getItem('Mentortoken')}`
        }
      });

      setMessageInput('');
      await fetchMessages(conversationId);  // Refresh message list
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };



  // Set up polling for new messages
  useEffect(() => {
    if (activeConversation && activeConversation.id) {
      if (pollingInterval) clearInterval(pollingInterval);

      const interval = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 5000);

      setPollingInterval(interval);

      return () => clearInterval(interval);
    }
  }, [activeConversation]);


  // Initial data fetch
  useEffect(() => {
    if (currentUserType) {
      fetchConversations();
    }
  }, [currentUserType]);

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);



  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setActiveConversation({
      id: conversation.id,
      otherPersonName: conversation.other_person_name,
      avatar: getInitials(conversation.other_person_name),
      messages: [] // Will be populated by fetchMessages
    });
    fetchMessages(conversation.id);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return <div className="page-container messages-page">Loading conversations...</div>;
  }

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
      const token = localStorage.getItem('Mentortoken');

      const [mentorRes, studentRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/mentor/public/?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Token ${token}` }
        }),
        axios.get(`http://127.0.0.1:8000/api/student/public/?search=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Token ${token}` }
        })
      ]);

      // 🔧 Adjust here to handle plain array
      const mentorsRaw = Array.isArray(mentorRes.data) ? mentorRes.data : mentorRes.data.results || [];
      const studentsRaw = Array.isArray(studentRes.data) ? studentRes.data : studentRes.data.results || [];

      const mentors = mentorsRaw.map(m => ({
        id: m.id || m.mentor_id,  // fallback to mentor_id if no plain id
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
  const startNewConversation = async (userId, isMentor) => {
    try {
      console.log('➡️ Starting new conversation with:', userId, 'isMentor:', isMentor);

      let payload = {};
      
      if (currentUserType === 'student' && isMentor) {
        payload = {
          student_id: currentUserId,  // ✅ FIXED
          mentor_id: userId
        };
      } else if (currentUserType === 'mentor' && !isMentor) {
        payload = {
          mentor_id: currentUserId,  // ✅ FIXED
          student_id: userId
        };
      } else {
        console.error("❌ Invalid user role or payload mismatch");
        return;
      }

      console.log('📤 Payload being sent:', payload);

      const response = await api.post('conversations/', payload);
      console.log("🧾 Full conversation creation response:", response.data);


      const newConversation = {
        ...response.data,
        other_person_name: response.data.other_person_name || 'New User',
        lastMessage: null,
        time: 'Just now',
        unread: false
      };

      // ✅ This was missing actual message fetching:
      setActiveConversation({
        id: newConversation.id,
        otherPersonName: newConversation.other_person_name,
        avatar: getInitials(newConversation.other_person_name),
        messages: []
      });

      if (!newConversation.id) {
        console.error("❌ Failed to get conversation ID from response");
        return;
      }

      await fetchMessages(newConversation.id);  // ✅ Ensure messages are fetched immediately

      setConversations(prev => [newConversation, ...prev]);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      console.error('❌ Error starting conversation:', error.response?.data || error.message);
    }
  };





  const searchBar = (
    <form className="search-bar" onSubmit={handleSearch}>
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users to start chat..."
      />
      <button type="submit">🔍</button>
    </form>
  );

  // Add search results dropdown
  const searchResultsDropdown = showSearchResults && (
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
  );


  return (
    <div className="page-container messages-page">
      {/* <header className="page-header">
        <h1>Messages</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search conversations..." />
          <button>🔍</button>
        </div>
        {searchBar}
      </header>
      {searchResultsDropdown} */}


      <header className="page-header">
        <h1>Messages</h1>
        <div style={{ position: 'relative', width: '100%' }}>
          {searchBar}
          {searchResultsDropdown}
        </div>
      </header>

      
      <div className="messages-container">
        <div className="conversation-list">
          {conversations.length > 0 ? (
            conversations.map(conversation => (
              <div 
                key={conversation.id}
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {getInitials(conversation.other_person_name)}
                  {conversation.unread && <span className="unread-badge"></span>}
                </div>
                <div className="conversation-details">
                  <h3>{conversation.other_person_name || 'Unknown User'}</h3>
                  <p>{conversation.lastMessage || 'No messages yet'}</p>
                  <span className="conversation-time">{conversation.time || ''}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations">
              <p>No conversations found</p>
            </div>
          )}
        </div>

        <div className="message-view">
          {activeConversation ? (
            <>
              <div className="message-header">
                <h2>{activeConversation.otherPersonName}</h2>
                <button className="secondary-button">View Profile</button>
              </div>
              
              <div className="messages-list">
                {activeConversation.messages?.length > 0 ? (
                  activeConversation.messages.map(message => (
                    <div key={message.id || `${message.sender_type}-${message.timestamp}`} className={`message ${message.sender_type}`}>
                      <div className="message-content">
                        <p>{message.content}</p>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <p>No messages in this conversation yet</p>
                  </div>
                )}
              </div>
              
              <div className="message-input">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="primary-button"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;