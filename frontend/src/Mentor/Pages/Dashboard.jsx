// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import API from "../../BackendConn/api";

const Dashboard = () => {
  const [mentor, setMentor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(token);
        
        const response = await API.get('/api/mentor/profile/',{
          headers: {
            Authorization: `Token ${token}`,
          }
        });
        console.log(response.data);
        
        setMentor(response.data);
      } catch (err) {
        setError('Failed to fetch mentor profile');
        console.error(err);
      }
    };

    fetchMentorProfile();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
    }
    }, []);


  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-8 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mentor Dashboard</h1>
      {mentor ? (
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <p><strong>Mentor ID:</strong> {mentor.mentor_id}</p>
          <p><strong>Name:</strong> {mentor.name}</p>
        </div>
      ) : (
        <p>Loading mentor data...</p>
      )}
    </div>
  );
};

export default Dashboard;
