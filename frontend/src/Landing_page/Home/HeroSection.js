import React, { useState, useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CityContext } from "../../context/CityContext";
import "./HeroSection.css";

// ✅ Import your local image
import heroImage from "./task.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const { setCity } = useContext(CityContext);

  const handleSearch = () => {
    const city = input.trim();
    if (!city) return;
    setCity(city);
    setInput("");
    navigate(`/gigs/${city}`);
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="left">
          <h1 className="hero-title">
            Discover <span className="blue-text">Daily</span> <span className="green-text">Tasks</span>
          </h1>
          <h5 className="hero-subtitle">Hyperlocal task seeker at your service 🚀</h5>

          <div className="search-wrapper">
            <div className="search-box">
              <FaSearch className="icon" />
              <input
                type="text"
                placeholder="Enter Location"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={handleSearch} className="search-btn">
                Search
              </button>
            </div>
          </div>

          <div className="post-container">
            <button
              className="post-btn gig-btn"
              onClick={() => navigate("/postGig")}
            >
              Post Gig
            </button>
            <button
              className="post-btn service-btn"
              onClick={() => navigate("/postService")}
            >
              Post Service
            </button>
          </div>
        </div>

        <div className="right">
          <img src={heroImage} alt="Hero Illustration" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
