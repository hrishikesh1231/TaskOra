import React from "react";
import "./Features.css";
import { FaTasks, FaUsers, FaStar } from "react-icons/fa";

const Features = () => {
  return (
    <div className="features-container">
      <div className="feature-card">
        <FaTasks className="feature-icon blue" />
        <h3>Easy Task Posting</h3>
        <p>Post your gig or service in seconds and reach local users instantly.</p>
      </div>

      <div className="feature-card">
        <FaUsers className="feature-icon green" />
        <h3>Connect with Locals</h3>
        <p>Build connections with nearby people who are ready to help or work.</p>
      </div>

      <div className="feature-card">
        <FaStar className="feature-icon yellow" />
        <h3>Trusted Ratings</h3>
        <p>Find reliable people through ratings and reviews from other users.</p>
      </div>
    </div>
  );
};

export default Features;
