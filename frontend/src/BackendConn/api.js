import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '541565981208-1hjfu01g6pdlqagd3rrn3k04ka1diolb.apps.googleusercontent.com';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
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

export const postMeetingAttendance = async (data, tokenOverride) => {
  const { meeting_id, role, attendance_key } = data;
  if (!meeting_id || !role || !attendance_key) throw new Error('Missing required fields');
  const mentorToken = localStorage.getItem('Mentortoken');
  const studentToken = localStorage.getItem('token');
  const token = tokenOverride || mentorToken || studentToken;
  if (!token) throw new Error('No auth token found');
  

  
  const response = await fetch(`${API_BASE_URL}/mentor/meeting/attendance/`, {
  // const response = await fetch('https://aspirexbackend.onrender.com/api/mentor/meeting/attendance/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({ meeting_id, role, attendance_key })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to record attendance');
  return result;
};

export const fetchMeetingAttendance = async (meeting_id) => {
  if (!meeting_id) return { attended_roles: [] };
  const mentorToken = localStorage.getItem('Mentortoken');
  const studentToken = localStorage.getItem('token');
  const token = mentorToken || studentToken;
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`${API_BASE_URL}/mentor/meeting/attendance/?meeting_id=${meeting_id}`, {
  // const response = await fetch(`https://aspirexbackend.onrender.com/api/mentor/meeting/attendance/?meeting_id=${meeting_id}`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch attendance');
  return response.json();
};

export async function fetchPlatformStats() {
  const response = await fetch(`${API_BASE_URL}/platform-stats/`);
  // const response = await fetch('https://aspirexbackend.onrender.com/api/platform-stats/');
  if (!response.ok) throw new Error('Failed to fetch platform stats');
  return response.json();
}

export async function subscribeNewsletter(email) {
  const response = await fetch(`${API_BASE_URL}/newsletter/`, {
  // const response = await fetch('https://aspirexbackend.onrender.com/api/newsletter/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
}

export async function fetchSiteStatus() {
  const response = await fetch(`${API_BASE_URL}/site-status/`);
  // const response = await fetch('https://aspirexbackend.onrender.com/api/site-status/');
  if (!response.ok) throw new Error('Failed to fetch site status');
  return response.json();
}

export default API;
