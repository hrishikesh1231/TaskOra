import React from "react";
import { FaSearch, FaComments, FaHandshake } from "react-icons/fa";
import "./HowItWorks.css";

const steps = [
  {
    icon: <FaSearch />,
    number: "01",
    title: "Find or Post Tasks",
    description: "Browse available tasks in your area or post your own service offering.",
  },
  {
    icon: <FaComments />,
    number: "02",
    title: "Connect & Discuss",
    description: "Chat with potential taskers or clients to discuss details and requirements.",
  },
  {
    icon: <FaHandshake />,
    number: "03",
    title: "Get Things Done",
    description: "Complete the task, get rated, and build your reputation in the community.",
  },
];

const StepCard = ({ icon, number, title, description }) => (
  <div className="step-card">
    <div className="step-icon">{icon}</div>
    <span className="step-number">{number}</span>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="howitworks-container">
      <div className="howitworks-inner">
        <h2>How TaskOra Works</h2>
        <p className="subtitle">Simple steps to connect with your local community</p>

        <div className="steps">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
