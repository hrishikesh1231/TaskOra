import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ to get /gigs/:city
import axios from "axios";
import "./GigSection.css";

const GigSection = () => {
  const [gigsData, setGigsData] = useState([]);
  const { city } = useParams(); // ✅ extract city from URL
  
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        let res = await axios.get(`http://localhost:3002/getGigs/${city}`); // ✅ send city to backend
        setGigsData(res.data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    };

    fetchGigs();
  }, [city]); // ✅ refetch if city changes

  return (
    <div className="gig-section">
      {gigsData.length > 0 ? (
        <>
          <h2>Gigs in {city}</h2>
          {gigsData.map((gig) => (
            <div key={gig._id} className="gig-card">
              <h3>{gig.title}</h3>
              <p>{gig.description}</p>
              {/* <p>
                <strong>Pay:</strong> {gig.payment}
              </p> */}
              {/* <p>
                <strong>Duration:</strong> {gig.workDays} day(s)
              </p> */}
              <p>
                {/* <strong>Posted By:</strong> {gig.postedBy} */}
              </p>
              <p>
                <strong>Contact:</strong> {gig.contact}
              </p>
              <p>
                <strong>Event Date:</strong>{" "}
                {new Date(gig.date).toLocaleString("en-IN", {
                  weekday: "long",   // Monday
                  year: "numeric",
                  month: "short",    // Sep
                  day: "2-digit",
                  // hour: "2-digit",
                  // minute: "2-digit",
                  // hour12: true
                })}
              </p>
              <p>
                <strong>Posted At:</strong>{" "}
                {new Date(gig.createdAt).toLocaleString("en-IN", {
                  weekday: "long",   // Monday
                  year: "numeric",
                  month: "short",    // Sep
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true       // 12-hour format
                })}
              </p>

              <button className="apply-button">Apply Now</button>
            </div>
          ))}
        </>
      ) : (
        <p className="no-gigs">No gigs found for {city}.</p>
      )}
    </div>
  );
};

export default GigSection;
