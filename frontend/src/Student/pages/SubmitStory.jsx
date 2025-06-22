// components/SubmitStory.jsx
import React, { useState } from "react";
import "./SubmitStory.css";

const SubmitStory = ({ onSubmitStory }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    story: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting story data:", formData);
    onSubmitStory(formData); // Call the parent
    setSubmitted(true);
    setFormData({ name: "", title: "", story: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="submit-story-section">
      <h2 className="submit-title">📝 Share Your Success Story</h2>
      <p className="submit-subtitle">Your journey could inspire someone else</p>

      <form className="story-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} />
        <input type="text" name="title" placeholder="Your Title (e.g., SDE at Amazon)" required value={formData.title} onChange={handleChange} />
        <textarea name="story" placeholder="Write your story here..." rows="5" required value={formData.story} onChange={handleChange}></textarea>
        <button type="submit">Submit Story</button>
        {submitted && <p className="success-message">🎉 Story submitted successfully!</p>}
      </form>
    </div>
  );
};

export default SubmitStory;
