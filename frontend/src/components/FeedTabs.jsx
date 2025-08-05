import React from 'react';
import './CSS/FeedTabs.css';

const FeedTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="feed-tabs">
      <button 
        className={`feed-tab ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => setActiveTab('all')}
      >
        <span>
          <span className="feed-tab-icon">🌐</span>
          All Posts
        </span>
      </button>
      <button 
        className={`feed-tab ${activeTab === 'my' ? 'active' : ''}`}
        onClick={() => setActiveTab('my')}
      >
        <span>
          <span className="feed-tab-icon">👤</span>
          My Posts
        </span>
      </button>
    </div>
  );
};

export default FeedTabs; 