import React, { useEffect, useState,useRef } from 'react';
import "./StuHomepage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMagnifyingGlass, faBell } from "@fortawesome/free-solid-svg-icons"; 
import { faCircleUser } from "@fortawesome/free-solid-svg-icons"; 
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import Navtwo from "./Navtwo";
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Navigation, Pagination } from 'swiper/modules';
import SuccessStories from './SuccessStories';




const categories = [
    "Data Science",
    "Full Stack",
    "Machine Learning",
    "AI",
    "Cyber Security",
    "Cloud",
    "Blockchain",
  ];

  



const StuHomepage = () => {
  const [mentors, setMentors] = useState([]);
  const swiperRef = useRef(null);
  const [category, setCategory] = useState('Data Science');
  const [mentorsCate, setMentorsCate] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

const fetchMentors = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/mentor/filter/?category=${encodeURIComponent(category)}`);
    const data = await response.json();
    setMentorsCate(data);
    console.log("Mentors by category:", data);
  } catch (error) {
    console.error("Error fetching mentors by category:", error);
  }
};


useEffect(() => {
    fetchMentors();
  }, [category, searchTerm]);
  


  useEffect(() => {
    axios.get('http://localhost:8000/api/mentor/feature/')
      .then(res => {
        setMentors(res.data);
      })
      .catch(err => console.error(err));
  }, []);
  
  const handleMouseEnter = () => {
    swiperRef.current?.autoplay?.stop();  // pause swiping
  };

  const handleMouseLeave = () => {
    swiperRef.current?.autoplay?.start(); // resume swiping
  };

  return (
    <>
        <div id="main-content">

        <div id="feature-mentor">
          <h2>Featured Mentors</h2>
        </div>

        <div id="Outer-card-box">
        <Swiper
      modules={[Autoplay]}
      spaceBetween={20}
      slidesPerView={3}
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
             <SwiperSlide  key={index}>
            <div className="flip-card"  onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
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
                      <svg viewBox="0 0 122.88 122.88" className="pfp">
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
                    <p className="description">{mentor.about}</p>
                    <div className="socialbar">
                      <a id="github" href={mentor.github_link || "#"}>
                        <svg viewBox="0 0 16 16" className="bi bi-github" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
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
        
        <section className="category-section">
      <h2 className="category-heading">Search by Category</h2>
      <div className="category-buttons">
       {categories.map((cat) => (
  <button
    key={cat}
    className={`category-btn ${category === cat ? "active" : ""}`}
    onClick={() => setCategory(cat)} // ✅ This triggers useEffect
  >
    {cat}
  </button>
))}
      </div>

      <div className="mentor-cards">
        {mentorsCate.length > 0 ? (
          mentorsCate.map((mentor, idx) => (
            <div className="mentor-card" key={idx}>
              <img src={mentor.profile_photo} alt={mentor.name} className="mentor-img" />
              <div className="mentor-info">
                <h3>{mentor.name}</h3>
                <p>{mentor.professions?.[0]?.title || "Mentor"}</p>
                  {/* {console.log(mentor.about)} */}
                <p>{mentor.about?.slice(0, 100)}...</p>
              </div>
            </div>
          ))
        ) : (
          <p>No mentors found for this category.</p>
        )}
      </div>
    </section>
      </div>
        <SuccessStories/>
    </>
  );
};

export default StuHomepage;
