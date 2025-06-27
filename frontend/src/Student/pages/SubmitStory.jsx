import React, { useState } from "react";
import axios from "axios";
import "./SubmitStory.css";

const SubmitStory = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    story: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:8000/api/student/stories/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log("✅ Story submitted:", res.data);
      setSubmitted(true);
      setFormData({ name: "", title: "", story: "" });

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("❌ Submission failed:", error.response?.data || error.message);
      alert("Failed to submit story. Please check your input.");
    }
  };

  return (
    <div className="submit-story-section">
      <h2 className="submit-title">📝 Share Your Success Story</h2>
      <p className="submit-subtitle">Your journey could inspire someone else</p>

      <form className="story-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="title"
          placeholder="Your Title (e.g., SDE at Amazon)"
          required
          value={formData.title}
          onChange={handleChange}
        />
        <textarea
          name="story"
          placeholder="Write your story here..."
          rows="5"
          required
          value={formData.story}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Submit Story</button>
        {submitted && <p className="success-message">🎉 Story submitted successfully!</p>}
      </form>
    </div>
  );
};

export default SubmitStory;
