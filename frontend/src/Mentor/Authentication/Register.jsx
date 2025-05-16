import React, { useState } from 'react';
import API from '../../BackendConn/api';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(null)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/api/mentor/register/', form);
      localStorage.setItem('token', res.data.token);
      alert('Registration successful! \nYour Mentor ID : ' + res.data.mentor.mentor_id);
      console.log(res.data);
      
      
    } catch (err) {
      setError('Error during registration');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Mentor Registration</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2"
          name="name"
          type="text"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          className="border p-2"
          name="email"
          type="email"
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
          required
        />
        <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
