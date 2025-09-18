import React from "react";
import "./PopularCategories.css";
import { FaCog, FaBook, FaBroom, FaCalendarAlt, FaChalkboardTeacher, FaEllipsisH } from "react-icons/fa";

const categories = [
  { icon: <FaCog className="cat-icon blue" />, title: "Technical" },
  { icon: <FaBook className="cat-icon purple" />, title: "Education" },
  { icon: <FaBroom className="cat-icon black" />, title: "Cleaning" },
  { icon: <FaCalendarAlt className="cat-icon black" />, title: "Event Management" },
  { icon: <FaChalkboardTeacher className="cat-icon black" />, title: "Teaching" },
  { icon: <FaEllipsisH className="cat-icon black" />, title: "Others" },
];

const PopularCategories = () => {
  return (
    <section className="categories-section">
      <div className="categories-container">
        <h2 className="categories-title">Popular Categories</h2>

        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div className="category-card" key={index}>
              {cat.icon}
              <h3>{cat.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
