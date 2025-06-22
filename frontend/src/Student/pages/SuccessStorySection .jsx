import React, { useEffect, useState } from "react";
import axios from "axios";
import SuccessStories from "./SuccessStories";
import SubmitStory from "./SubmitStory";

const SuccessStorySection = () => {
  const [stories, setStories] = useState([]);

const fetchStories = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:8000/api/student/stories/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    setStories(res.data);
  } catch (error) {
    console.error("❌ Error fetching stories:", error.response?.data || error.message);
  }
};
const addStory = async (storyData) => {
  try {
    const token = localStorage.getItem("token"); // or sessionStorage if you're using that

    const res = await axios.post(
      "http://localhost:8000/api/student/stories/",
      storyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    setStories([res.data, ...stories]);
  } catch (error) {
    console.error("❌ Error adding story:", error.response?.data || error.message);
    alert("Failed to submit story. Please check your input.");
  }
};


  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div>
      <SuccessStories stories={stories} />
      <SubmitStory onSubmitStory={addStory} />
    </div>
  );
};

export default SuccessStorySection;
