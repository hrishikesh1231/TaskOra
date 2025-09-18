import React, { useState, useContext } from "react";
import "./SearchBox.css";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CityContext } from "../../context/CityContext";

const SearchBox = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const { setCity } = useContext(CityContext);

  const handleSearch = () => {
    const city = input.trim();
    if (!city) return;
    setCity(city);
    setInput('');
    navigate(`/gigs/${city}`);
  };

  return (
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
  );
};

export default SearchBox;
