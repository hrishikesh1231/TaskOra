import React from "react";
import "./Categories.css";
import {
  FaCog,
  FaBriefcase,
  FaBook,
  FaUsers,
  FaBroom,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaEllipsisH,
} from "react-icons/fa";

const Categories = () => {
  return (
    <div className="categories-section">
      <h2>Popular Categories</h2>
      <div className="categories-grid">
        <div className="category-card">
          <FaCog className="category-icon blue" />
          <p>Technical</p>
        </div>
        
        <div className="category-card">
          <FaBook className="category-icon purple" />
          <p>Education</p>
        </div>
        
        <div className="category-card">
          <FaBroom className="category-icon orange" />
          <p>Cleaning</p>
        </div>
        <div className="category-card">
          <FaCalendarAlt className="category-icon teal" />
          <p>Event Management</p>
        </div>
        <div className="category-card">
          <FaChalkboardTeacher className="category-icon indigo" />
          <p>Teaching</p>
        </div>
        <div className="category-card">
          <FaEllipsisH className="category-icon gray" />
          <p>Others</p>
        </div>
      </div>
    </div>
  );
};

export default Categories;
