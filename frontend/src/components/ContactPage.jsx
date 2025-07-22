import React, { useState } from 'react';
import './ContactPage.css';
import API from '../BackendConn/api';
const initialForm = { name: '', email: '', countryCode: '+91', phone: '', query: '' };

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = 'Invalid email.';
  if (!form.phone.trim()) errors.phone = 'Phone is required.';
  else if (!/^\d{10}$/.test(form.phone)) errors.phone = 'Phone must be exactly 10 digits.';
  if (!form.countryCode.trim()) errors.countryCode = 'Country code required.';
  if (!form.query.trim()) errors.query = 'Please enter your query.';
  return errors;
};

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        phone: `${form.countryCode}${form.phone}`
      };
      const response = await API.post(
        'chat/contact/',
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          query: payload.query
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSuccess('Your message has been sent!');
      setForm(initialForm);
    } catch (err) {
      setError('There was an error sending your message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contactPage__container">
      <h2 className="contactPage__title">Contact Us</h2>
      <p className="contactPage__subtitle">We'd love to hear from you! Fill out the form and our team will get back to you soon.</p>
      <form className="contactPage__form contactPage__form--modern" onSubmit={handleSubmit} noValidate>
        <div className="contactPage__row">
          <div className={`contactPage__field contactPage__field--half${fieldErrors.name ? ' contactPage__field--error' : ''}`}>  
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="contactPage__input"
              required
              autoComplete="off"
            />
            <span className="contactPage__floatingLabel">Name</span>
            <span className="contactPage__underline"></span>
            {fieldErrors.name && <div className="contactPage__fieldError animated-shake">{fieldErrors.name}</div>}
          </div>
          <div className={`contactPage__field contactPage__field--half${fieldErrors.email ? ' contactPage__field--error' : ''}`}>  
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="contactPage__input"
              required
              autoComplete="off"
            />
            <span className="contactPage__floatingLabel">Email</span>
            <span className="contactPage__underline"></span>
            {fieldErrors.email && <div className="contactPage__fieldError animated-shake">{fieldErrors.email}</div>}
          </div>
        </div>
        <div className="contactPage__row">
          <div className={`contactPage__field contactPage__field--quarter${fieldErrors.countryCode ? ' contactPage__field--error' : ''}`}>  
            <input
              type="text"
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
              className="contactPage__input"
              required
              maxLength={4}
              autoComplete="off"
            />
            <span className="contactPage__floatingLabel">Code</span>
            <span className="contactPage__underline"></span>
            {fieldErrors.countryCode && <div className="contactPage__fieldError animated-shake">{fieldErrors.countryCode}</div>}
          </div>
          <div className={`contactPage__field contactPage__field--threequarter${fieldErrors.phone ? ' contactPage__field--error' : ''}`}>  
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="contactPage__input"
              required
              autoComplete="off"
              maxLength={10}
            />
            <span className="contactPage__floatingLabel">Phone</span>
            <span className="contactPage__underline"></span>
            {fieldErrors.phone && <div className="contactPage__fieldError animated-shake">{fieldErrors.phone}</div>}
          </div>
        </div>
        <div className={`contactPage__field contactPage__field--full${fieldErrors.query ? ' contactPage__field--error' : ''}`}>  
          <textarea
            name="query"
            value={form.query}
            onChange={handleChange}
            className="contactPage__textarea"
            required
            rows={3}
          />
          <span className="contactPage__floatingLabel">Your Query</span>
          <span className="contactPage__underline"></span>
          {fieldErrors.query && <div className="contactPage__fieldError animated-shake">{fieldErrors.query}</div>}
        </div>
        <div className="contactPage__actions">
          <button
            type="submit"
            className="contactPage__submitBtn contactPage__submitBtn--animated"
            disabled={loading}
          >
            {loading ? <span className="contactPage__spinner"></span> : 'Submit'}
          </button>
        </div>
        {success && <div className="contactPage__success">{success}</div>}
        {error && <div className="contactPage__error">{error}</div>}
      </form>
    </div>
  );
};

export default ContactPage; 