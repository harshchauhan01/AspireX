import React, { useState } from 'react';
import API from '../../BackendConn/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ mentor_id: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/api/mentor/login/', form);
      // console.log(res.data);
      
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      navigate('/mentor/dashboard');
      // redirect or update state
    } catch (err) {
        console.log(err);
        
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Mentor Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2"
          name="mentor_id"
          type="text"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="border p-2"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
