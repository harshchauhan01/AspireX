import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

API.interceptors.request.use((config) => {
  // Check for both student and mentor tokens
  const studentToken = localStorage.getItem('token');
  const mentorToken = localStorage.getItem('Mentortoken');
  const token = mentorToken || studentToken;
  
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default API;
