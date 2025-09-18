import React, { useState, useContext } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    toast.info("Logging in...", { autoClose: 1500 });

    try {
      const res = await axios.post("http://localhost:3002/login", formData, {
        withCredentials: true,
      });

      // ✅ Update AuthContext & localStorage
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(`Welcome ${res.data.user.username} 🎉`, {
        autoClose: 2000,
        onClose: () => navigate("/"), // ✅ Navigate after toast closes
      });

      setFormData({ username: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid username or password ❌", {
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
        <a href="/signUp">Sign Up</a>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default SignIn;
