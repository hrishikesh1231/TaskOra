import React, { useContext, useState } from "react";
import "./PostServiceForm.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CityContext } from "../../context/CityContext";

const PostServiceForm = () => {
  const { setCity } = useContext(CityContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
    postedBy: "",
    contact: "",
    date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Show submitting popup
    const submittingToast = toast.loading("Submitting service...");

    try {
      const res = await axios.post("http://localhost:3002/addService", formData, {
        withCredentials: true,
      });

      // ✅ Update toast on success
      toast.update(submittingToast, {
        render: res.data.message || "Service posted successfully! 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2500,
        onClose: () => {
          setCity(formData.location); // Save city in context
          navigate(`/services/${formData.location}`); // Navigate after close
        },
      });

      // ✅ Reset form
      setFormData({
        title: "",
        description: "",
        salary: "",
        location: "",
        postedBy: "",
        contact: "",
        date: "",
      });

    } catch (error) {
      // ✅ Extract proper error message
      let errMsg = "Failed to post service!";
      if (error.response?.status === 401) {
        errMsg = error.response.data.error || "You must be logged in first!";
      } else if (error.response?.data?.error) {
        errMsg = error.response.data.error; // AI error (gibberish, harmful, etc.)
      }

      // ✅ Update toast on failure
      toast.update(submittingToast, {
        render: errMsg,
        type: "error",
        isLoading: false,
        autoClose: 3000,
        onClose: () => {
          if (error.response?.status === 401) {
            navigate("/login"); // Redirect if not logged in
          }
        },
      });
    }
  };

  return (
    <div className="form-container">
      <h2>Post a Service</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Service Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Service Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="salary"
          placeholder="Salary / Pay (e.g., ₹10,000/month)"
          value={formData.salary}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Location (City)"
          value={formData.location}
          onChange={handleChange}
          required
        />

        {/* <input
          type="text"
          name="postedBy"
          placeholder="Posted By (Company / Person)"
          value={formData.postedBy}
          onChange={handleChange}
        /> */}

        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          pattern="^[0-9]{10}$"
          title="Enter a 10-digit phone number"
          required
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          required
        />

        <button type="submit">Post Service</button>
      </form>
    </div>
  );
};

export default PostServiceForm;
