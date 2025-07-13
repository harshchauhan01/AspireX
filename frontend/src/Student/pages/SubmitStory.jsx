
import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

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
    <StyledWrapper>
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
    </StyledWrapper>
  );
};

export default SubmitStory;



const StyledWrapper = styled.div`
  .submit-story-section {
  background: #f4faff;
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.submit-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #222;
}

.submit-subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 40px;
}

.story-form {
  max-width: 600px;
  width: 100%;               /* ✅ Prevents shrinking */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;           /* ✅ Padding for small screens */
  box-sizing: border-box;
}

.story-form input,
.story-form textarea {
  width: 100%;               /* ✅ Input fills form width */
  padding: 14px 18px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.story-form input:focus,
.story-form textarea:focus {
  border-color: #0077cc;
}

.story-form button {
  background-color: #0077cc;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.story-form button:hover {
  background-color: #005fa3;
}

.success-message {
  margin-top: 10px;
  color: #28a745;
  font-weight: 600;
}
  }

  .resource-card a:hover {
    background-color: #ffb84d;
    color: black;
  }
`;