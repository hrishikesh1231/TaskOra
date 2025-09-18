import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ to read /services/:city
import axios from "axios";
import "./Service.css";

const Service = () => {
  const [serviceData, setServiceData] = useState([]);
  const { city } = useParams(); // ✅ extract city from URL

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let res = await axios.get(`http://localhost:3002/getService/${city}`); // ✅ FIXED (no extra "s")
        setServiceData(res.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [city]); // ✅ refetch if city changes

  return (
    <div className="service-section">
      {serviceData.length > 0 ? (
        <>
          <h2 className="text-center">Services in {city}</h2>
          <div className="services-container">
            {serviceData.map((service) => (
              <div key={service._id} className="service-card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p><strong>Pay:</strong> {service.salary}</p>
                <p><strong>Posted By:</strong> {service.postedBy}</p>
                <p><strong>Contact:</strong> {service.contact}</p>
                <p><strong>Location:</strong> {service.location}</p>
                <p><strong>Date:</strong> {new Date(service.date).toDateString()}</p>
                <button className="apply-btn">Apply</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="no-gigs">No services found for {city}.</p>
      )}
    </div>
  );
};

export default Service;
