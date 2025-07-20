import './CSS/CustomerServicePage.css';
import React, { useState, useEffect } from 'react';
import API from '../../BackendConn/api';

const CustomerServicePage = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expanded, setExpanded] = useState({});

  const fetchQueries = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('Mentortoken');
      const res = await API.get('chat/customer-service/', {
        headers: { Authorization: `Token ${token}` }
      });
      setQueries(res.data);
    } catch (err) {
      setError('Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('Mentortoken');
      await API.post('chat/customer-service/', { subject, message }, {
        headers: { Authorization: `Token ${token}` }
      });
      setSuccess('Query submitted successfully!');
      setSubject('');
      setMessage('');
      fetchQueries();
    } catch (err) {
      setError('Failed to submit query');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="customer-service-container">
      <h1 className="customer-service-title" style={{fontSize: '1.4rem'}} >Customer Service</h1>
      <form onSubmit={handleSubmit} className="customer-service-form">
        <div className="form-group">
          <label>Subject</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="form-input" />
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required className="form-textarea" />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <h2 className="queries-title" style={{fontSize: '1.08rem'}}>Your Queries</h2>
      {loading ? <div className="loading">Loading...</div> : (
        <div className="queries-table-wrapper">
          <table className="queries-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Replies</th>
              </tr>
            </thead>
            <tbody>
              {queries.map(q => (
                <React.Fragment key={q.id}>
                  <tr className="query-row">
                    <td>{q.subject}</td>
                    <td className="query-message-cell">{q.message.length > 40 ? q.message.slice(0, 40) + '...' : q.message}</td>
                    <td><span className={`status-badge ${q.is_resolved ? 'resolved' : 'pending'}`}>{q.is_resolved ? 'Resolved' : 'Pending'}</span></td>
                    <td>{new Date(q.created_at).toLocaleString()}</td>
                    <td>
                      {q.replies && q.replies.length > 0 ? (
                        <button className="expand-btn" onClick={() => toggleExpand(q.id)}>
                          {expanded[q.id] ? 'Hide' : 'Show'} ({q.replies.length})
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                  {q.replies && q.replies.length > 0 && expanded[q.id] && (
                    <tr className="replies-row">
                      <td colSpan={5}>
                        <div className="replies-section-table">
                          <strong>Replies:</strong>
                          <ul className="replies-list">
                            {q.replies.map(r => (
                              <li key={r.id} className="reply-item"><em>{r.reply}</em> <span className="reply-date">({new Date(r.created_at).toLocaleString()})</span></li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerServicePage; 