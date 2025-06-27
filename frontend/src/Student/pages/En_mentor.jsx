import React from "react";
import "./En_mentor.css";

const mentors = [
  {
    name: "Alex Johnson",
    domain: "Product Management",
    rating: 4.8,
    sessions: 24,
  },
  {
    name: "Maria Garcia",
    domain: "UX Design",
    rating: 4.9,
    sessions: 18,
  },
  {
    name: "David Kim",
    domain: "Frontend Development",
    rating: 4.7,
    sessions: 32,
  },
  {
    name: "Sarah Chen",
    domain: "Data Science",
    rating: 4.6,
    sessions: 15,
  },
];

const En_mentor = () => {
  return (
    <div className="mentor-dashboard">
      <h2 className="section-title">🎓 Enrolled Mentors</h2>
      <div className="mentor-cards">
        {mentors.slice(0, 2).map((mentor, index) => (
          <div className="mentor-card" key={index}>
            <div className="mentor-avatar">
              {mentor.name.charAt(0)}
            </div>
            <h3>{mentor.name}</h3>
            <p>{mentor.domain}</p>
            <div className="mentor-stats">
              <span>⭐ {mentor.rating}</span>
              <span>🎯 {mentor.sessions} sessions</span>
            </div>
            <button className="session-btn">Book Session</button>
          </div>
        ))}
      </div>

      <h2 className="section-title">✨ Explore More Mentors</h2>
      <div className="mentor-cards">
        {mentors.slice(2).map((mentor, index) => (
          <div className="mentor-card" key={index}>
            <div className="mentor-avatar">
              {mentor.name.charAt(0)}
            </div>
            <h3>{mentor.name}</h3>
            <p>{mentor.domain}</p>
            <div className="mentor-stats">
              <span>⭐ {mentor.rating}</span>
              <span>🎯 {mentor.sessions} sessions</span>
            </div>
            <button className="session-btn">Book Session</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default En_mentor;
