import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import axios from "axios";
import SubmitStory  from "./SubmitStory";
function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mentors, setMentors] = useState([]);
  const swiperRef = useRef(null);
  const frequentSearches = [
    "AI Researcher",
    "Full Stack",
    "ML Engineer",
    "Google",
    "Amazon",
    "Data Science",
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios
        .get(`http://localhost:8000/api/mentor/filter/?search=${searchTerm}`)
        .then((res) => setMentors(res.data))
        .catch((err) => console.error(err));
    }, 300); // optional debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);
  const handleMouseEnter = () => {
    swiperRef.current?.autoplay?.stop();
  };

  const handleMouseLeave = () => {
    swiperRef.current?.autoplay?.start();
  };

  return (
    <>
      <StyledWrapper>
        {isFocused && (
          <div
            className="blur-overlay"
            onClick={() => setIsFocused(false)}
          ></div>
        )}

        <div id="Header">This is space for header</div>

        <div id="search-bar">
          <input
            type="text"
            placeholder="Search mentors by name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />

          {isFocused && (
            <div className="frequent-searches">
              <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                Frequent Searches:
              </strong>
              {frequentSearches.map((term, index) => (
                <button key={index} onClick={() => setSearchTerm(term)}>
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content that will be blurred when search bar is focused */}
        <div className={`main-content ${isFocused ? "blurred" : ""}`}>
          <div id="Explore-plans">
            <div id="Explore-plans-heading">
              <h2>
                Everything you need to crack your <span>dream job ✌🏼</span>
              </h2>

              <div id="Explore-plans-content">
                <div id="Explore-plans-content-heading-buttons">
                  <button>Top Mentors</button>
                  <button>Free Sessions</button>
                  <button>📞 Book a Session</button>
                  <button>🔥 Trending Skills</button>
                </div>

                <div id="Explore-plans-content-cards">
                  <div id="Explore-plans-content-card">
                    <div className="mentor-cards">
                      <Swiper
                        modules={[Autoplay]}
                        spaceBetween={20}
                        slidesPerView={Math.min(mentors.length, 3)}
                        loop={true}
                        autoplay={{
                          delay: 2500,
                          disableOnInteraction: false,
                        }}
                        onSwiper={(swiper) => {
                          swiperRef.current = swiper;
                        }}
                        breakpoints={{
                          320: { slidesPerView: 1 },
                          768: { slidesPerView: 2 },
                          1024: { slidesPerView: 3 },
                        }}
                      >
                        {mentors.map((mentor, index) => (
                          <SwiperSlide key={index}>
                            <div
                              className="flip-card"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div className="flip-card-inner">
                                <div className="flip-card-front">
                                  <div className="profile-image">
                                    {mentor.profile_photo ? (
                                      <img
                                        src={mentor.profile_photo}
                                        alt={`${mentor.name}'s profile`}
                                        className="pfp"
                                      />
                                    ) : (
                                      <svg
                                        viewBox="0 0 122.88 122.88"
                                        className="pfp"
                                      >
                                        <path d="M61.44,0c8.32,0,16.25,1.66,23.5,4.66l0.11,0.05c7.47,3.11,14.2,7.66,19.83,13.3l0,0c5.66,5.65,10.22,12.42,13.34,19.95 c3.01,7.24,4.66,15.18,4.66,23.49c0,8.32-1.66,16.25-4.66,23.5l-0.05,0.11c-3.12,7.47-7.66,14.2-13.3,19.83l0,0 c-5.65,5.66-12.42,10.22-19.95,13.34c-7.24,3.01-15.18,4.66-23.49,4.66c-8.31,0-16.25-1.66-23.5-4.66l-0.11-0.05 c-7.47-3.11-14.20-7.66-19.83-13.29L18,104.87C12.34,99.21,7.78,92.45,4.66,84.94C1.66,77.69,0,69.76,0,61.44s1.66-16.25,4.66-23.5 l0.05-0.11c3.11-7.47,7.66-14.2,13.29-19.83L18.01,18c5.66-5.66,12.42-10.22,19.94-13.34C45.19,1.66,53.12,0,61.44,0L61.44,0z M16.99,94.47l0.24-0.14c5.9-3.29,21.26-4.38,27.64-8.83c0.47-0.7,0.97-1.72,1.46-2.83c0.73-1.67,1.4-3.5,1.82-4.74 c-1.78-2.1-3.31-4.47-4.77-6.8l-4.83-7.69c-1.76-2.64-2.68-5.04-2.74-7.02c-0.03-0.93,0.13-1.77,0.48-2.52 c0.36-0.78,0.91-1.43,1.66-1.93c0.35-0.24,0.74-0.44,1.17-0.59c-0.32-4.17-0.43-9.42-0.23-13.82c0.1-1.04,0.31-2.09,0.59-3.13 c1.24-4.41,4.33-7.96,8.16-10.4c2.11-1.35,4.43-2.36,6.84-3.04c1.54-0.44-1.31-5.34,0.28-5.51c7.67-0.79,20.08,6.22,25.44,12.01 c2.68,2.90,4.37,6.75,4.73,11.84l-0.3,12.54l0,0c1.34,0.41,2.2,1.26,2.54,2.63c0.39,1.53-0.03,3.67-1.33,6.6l0,0 c-0.02,0.05-0.05,0.11-0.08,0.16l-5.51,9.07c-2.02,3.33-4.08,6.68-6.75,9.31C73.75,80,74,80.35,74.24,80.7 c1.09,1.60,2.19,3.20,3.60,4.63c0.05,0.05,0.09,0.10,0.12,0.15c6.34,4.48,21.77,5.57,27.69,8.87l0.24,0.14 c6.87-9.22,10.93-20.65,10.93-33.03c0-15.29-6.20-29.14-16.22-39.15c-10-10.03-23.85-16.23-39.14-16.23 c-15.29,0-29.14,6.20-39.15,16.22C12.27,32.3,6.07,46.15,6.07,61.44C6.07,73.82,10.13,85.25,16.99,94.47L16.99,94.47L16.99,94.47z"></path>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="name">{mentor.name}</div>
                                  <div className="profession">
                                    {mentor.professions?.[0]?.title || "Mentor"}
                                  </div>
                                </div>
                                <div className="flip-card-back">
                                  <div className="Description">
                                    <p className="description">
                                      {mentor.about}
                                    </p>
                                    <div className="socialbar">
                                      <a
                                        id="github"
                                        href={mentor.github_link || "#"}
                                      >
                                        <svg
                                          viewBox="0 0 16 16"
                                          className="bi bi-github"
                                          fill="currentColor"
                                          height="16"
                                          width="16"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SubmitStory />
        </div>
        <div className="resources">
          <h2>📚 Top Resources to Get Started</h2>
          <div className="resource-cards">
            <div className="resource-card">
              <h3>DSA Sheet by Striver</h3>
              <p>Curated roadmap for coding interviews with 190+ questions.</p>
              <a
                href="https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resource →
              </a>
            </div>
            <div className="resource-card">
              <h3>System Design Primer</h3>
              <p>Open-source repo to master scalable system design.</p>
              <a
                href="https://github.com/donnemartin/system-design-primer"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resource →
              </a>
            </div>
            <div className="resource-card">
              <h3>Machine Learning Crash Course</h3>
              <p>
                Google’s beginner-friendly ML training with real-world
                exercises.
              </p>
              <a
                href="https://developers.google.com/machine-learning/crash-course"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resource →
              </a>
            </div>
            <div className="resource-card">
              <h3>Frontend Developer Roadmap</h3>
              <p>Complete visual roadmap for becoming a frontend dev.</p>
              <a
                href="https://roadmap.sh/frontend"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Resource →
              </a>
            </div>
          </div>
        </div>
      </StyledWrapper>
    </>
  );
}

export default Explore;

const StyledWrapper = styled.div`
  /* Global Reset & Background */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #121212;
    color: white;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Header */
  #Header {
    background-color: #ffc107;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* Explore Section Container */
  #Explore-plans {
    background-color: #212121;
    padding: 2rem;
    height: 50rem;
  }

  /* Heading Box */
  #Explore-plans-heading {
    background-color: #212121;
    width: 100%;
    margin-top: 1rem;
    height: 45rem;
    box-shadow: 0 0 10px 2px orange;
    border-radius: 10px;
    padding: 1.5rem;
  }

  /* Heading Text */
  #Explore-plans-heading h2 {
    font-size: 2.5rem;
    color: #ffffff;
  }

  #Explore-plans-heading span {
    color: orange;
  }

  /* Content Container (for buttons and cards) */
  #Explore-plans-content {
    background-color: #26282a;
    width: 100%;
    margin-top: 2rem;
    padding: 2rem;
    border-radius: 10px;
    height: 35rem;
  }

  /* Buttons Row */
  #Explore-plans-content-heading-buttons {
    display: flex;
    flex-direction: row;
    gap: 1.2rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  /* Button Styling */
  #Explore-plans-content-heading-buttons button {
    height: 3rem;
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    border-radius: 8px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  #Explore-plans-content-heading-buttons button:hover {
    background-color: orange;
    transform: scale(1.05);
  }

  /* Optional: Card Area */
  #Explore-plans-content-card {
    margin-top: 2rem;
  }
  .mentor-cards {
    display: flex;

    gap: 2rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .mentor-card {
    background-color: #1e1e1e;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    width: 250px;
    margin-top: 3rem;
    height: 20rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .mentor-card:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px (255, 165, 0, 0.4);
  }

  .mentor-card img {
    width: 100px;
    height: 100px;
    border-radius: 50%;

    object-fit: cover;
    margin-bottom: 5rem;
  }

  .mentor-card h3 {
    color: #ffffff;
    margin: 2rem 0;
  }

  .mentor-card p {
    color: #cccccc;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }

  .mentor-card button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .mentor-card button:hover {
    background-color: orange;
  }

 
  /* Search Bar Section */
  #search-bar {
    position: relative;
    z-index: 10;
    padding: 2rem;
    background-color: #1a1a1a;
    text-align: center;
    border-radius: 12px;
    margin: 2rem auto;
    width: 80%;
  }

  #search-bar input[type="text"] {
    width: 60%;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    border-radius: 10px;
    border: 1px solid #ccc;
    outline: none;
    background-color: #2c2c2c;
    color: white;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  #search-bar input[type="text"]:focus {
    border-color: orange;
    box-shadow: 0 0 8px rgba(255, 165, 0, 0.5);
  }

  /* Frequent Search Tags */
  .frequent-searches {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    background-color: #1f1f1f;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(255, 165, 0, 0.2);
  }

  .frequent-searches button {
    padding: 0.5rem 1rem;
    background-color: #333;
    border: none;
    border-radius: 20px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .frequent-searches button:hover {
    background-color: orange;
    color: black;
  }

  .resources {
    padding: 4rem 2rem;
    background-color: #1a1a1a;
    color: white;
    text-align: center;
  }

  .resources h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .resource-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
  }

  .resource-card {
    background-color: #2a2a2a;
    padding: 1.5rem;
    border-radius: 12px;
    width: 280px;
    text-align: left;
    box-shadow: 0 4px 10px rgba(255, 165, 0, 0.2);
    transition: transform 0.3s ease;
  }

  .resource-card:hover {
    transform: translateY(-5px);
  }

  .resource-card h3 {
    color: orange;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .resource-card p {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    color: #ccc;
  }

  .resource-card a {
    color: white;
    background-color: orange;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
    transition: background-color 0.2s ease;
  }

  .resource-card a:hover {
    background-color: #ffb84d;
    color: black;
  }
`;