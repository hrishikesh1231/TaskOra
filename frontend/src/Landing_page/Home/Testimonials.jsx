import React from "react";
import "./Testimonials.css";
import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Freelance Designer",
    text: "TaskOra has been a game-changer for my freelance business. I've connected with so many local clients and built lasting relationships.",
    initials: "SJ",
    color: "#4a90e2",
  },
  {
    name: "Mike Chen",
    role: "Handyman",
    text: "The platform makes it so easy to find people who need help with home repairs. Great community and reliable payments.",
    initials: "MC",
    color: "#2ecc71",
  },
  {
    name: "Emma Davis",
    role: "Event Planner",
    text: "I love how I can offer my event planning services to my immediate neighborhood. The trust and rating system works perfectly.",
    initials: "ED",
    color: "#f5a623",
  },
];

const Testimonials = () => {
  return (
    <div className="testimonials-container">
      <h2>What Our Community Says</h2>
      <p className="subtitle">
        Real stories from real people in our TaskOra community
      </p>

      <div className="testimonial-cards">
        {testimonials.map((t, index) => (
          <div className="testimonial-card" key={index}>
            <div className="stars">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <FaStar key={i} className="star" />
                ))}
            </div>
            <p className="testimonial-text">"{t.text}"</p>
            <div className="user-info">
              <div className="avatar" style={{ backgroundColor: t.color }}>
                {t.initials}
              </div>
              <div>
                <h4>{t.name}</h4>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
