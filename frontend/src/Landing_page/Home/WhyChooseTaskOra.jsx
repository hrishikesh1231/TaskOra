


import React from "react";
import "./WhyChooseTaskOra.css";
import { FaCheckCircle, FaUsers } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

const WhyChooseTaskOra = () => {
  return (
    <section className="why-section">
      <div className="why-container">
        <h2 className="why-title">Why Choose TaskOra?</h2>
        <p className="why-subtitle">
          Connect with your local community and get things done efficiently
        </p>

        <div className="why-cards">
          <div className="why-card">
            <FaCheckCircle className="why-icon blue" />
            <h3>Easy Task Posting</h3>
            <p>
              Post your gig or service in seconds and reach local users instantly.
            </p>
          </div>

          <div className="why-card">
            <FaUsers className="why-icon green" />
            <h3>Connect with Locals</h3>
            <p>
              Build connections with nearby people who are ready to help or work.
            </p>
          </div>

          <div className="why-card">
            <FaStar className="why-icon yellow" />
            <h3>Trusted Ratings</h3>
            <p>
              Find reliable people through ratings and reviews from other users.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseTaskOra;
