import React from 'react';
import "./Hero.css";

const Hero = () => {
  return (
    <div className="hero-container">
      <h1 className="fw-bold">
        Discover <span>Daily Tasks</span>
      </h1>
      <h5 className="text-muted">Hyperlocal task seeker at your service 🚀</h5>
    </div>
  );
};

export default Hero;
