import React, { useState } from 'react';
import './CSS/PageStyles.css';
import './CSS/Messages.css';

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  // Mock data
  const conversations = [
    {
      id: 1,
      mentee: 'Alex Chen',
      avatar: 'AC',
      lastMessage: 'Thanks for the resources!',
      time: '2 hours ago',
      unread: true,
      messages: [
        { id: 1, sender: 'mentee', text: 'Hi Dr. Johnson, I had a question about the career assessment', time: '10:30 AM' },
        { id: 2, sender: 'mentor', text: 'Of course Alex, what would you like to know?', time: '10:45 AM' },
        { id: 3, sender: 'mentee', text: 'Thanks for the resources!', time: '2 hours ago' }
      ]
    },
    {
      id: 2,
      mentee: 'Maria Rodriguez',
      avatar: 'MR',
      lastMessage: 'When can we schedule our next session?',
      time: '1 day ago',
      unread: false,
      messages: [
        { id: 1, sender: 'mentee', text: 'Hello Dr. Johnson, I wanted to follow up on our last discussion', time: 'Yesterday' },
        { id: 2, sender: 'mentor', text: 'Hi Maria, yes let me check my calendar', time: 'Yesterday' },
        { id: 3, sender: 'mentee', text: 'When can we schedule our next session?', time: '1 day ago' }
      ]
    }
  ];

  const handleSendMessage = () => {
    if (messageInput.trim() && activeConversation) {
      const newMessage = {
        id: Date.now(),
        sender: 'mentor',
        text: messageInput,
        time: 'Just now'
      };
      
      // In a real app, you would update the state or send to an API here
      console.log("Message sent:", newMessage);
      setMessageInput('');
    }
  };

  return (
    <div className="page-container messages-page">
      <header className="page-header">
        <h1>Messages</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search conversations..." />
          <button>🔍</button>
        </div>
      </header>
      
      <div className="messages-container">
        <div className="conversation-list">
          {conversations.map(conversation => (
            <div 
              key={conversation.id}
              className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
              onClick={() => setActiveConversation(conversation)}
            >
              <div className="conversation-avatar">
                {conversation.avatar}
                {conversation.unread && <span className="unread-badge"></span>}
              </div>
              <div className="conversation-details">
                <h3>{conversation.mentee}</h3>
                <p>{conversation.lastMessage}</p>
                <span className="conversation-time">{conversation.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="message-view">
          {activeConversation ? (
            <>
              <div className="message-header">
                <h2>{activeConversation.mentee}</h2>
                <button className="secondary-button">View Profile</button>
              </div>
              
              <div className="messages-list">
                {activeConversation.messages.map(message => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{message.time}</span>
                    </div>
                  </div>
                ))}
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