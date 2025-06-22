import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay"; // Optional: For future-proofing

const SuccessStories = ({ stories }) => {
  return (
    <div className="success-section">
      <h2 className="success-title">✨ Success Stories</h2>
      <p className="success-subtitle">Real journeys, real impact</p>

      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2000, // adjust delay here
          disableOnInteraction: false,
        }}
        spaceBetween={30}
        loop={true}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        style={{ padding: "1rem", minHeight: "240px" }}
      >
        {stories.map((story, index) => (
          <SwiperSlide key={index}>
            <div className="story-card" style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "10px", background: "#fff" }}>
              <div className="story-content">
                <p className="story-text">"{story.story}"</p>
                <div className="story-author">
                  <p className="author-name">{story.name}</p>
                  <p className="author-role">{story.title}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SuccessStories;
