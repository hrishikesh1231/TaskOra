import React, { useState } from 'react'
import "./SignUp.css"
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import Home from './Home';
// import { Link, Route, useNavigate } from 'react-router-dom';
// import Login from './Login';


const SignUp = () => {
    const [formData,setFormData] = useState({
        name:"",
        email:"",
        password:"",
    });
    
    const handleChangeEvents=(e)=>{
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };
    // const navigate = useNavigate();

    const handleSubmit=(e)=>{
        e.preventDefault();
        axios.post('http://localhost:3002/signUp',{
            name:formData.name,
            email:formData.email,
            password:formData.password,
            
        },{ withCredentials: true}).then(()=>{
            toast.success('Signup successful! 🎉');
            // axios.get("http://localhost:3002/holdings");
            // setTimeout(() => {
              // navigate('/');
            // }, 2000); // 2 seconds
                      
        }).catch((err)=>{
          toast.error(err.response?.data?.msg || 'Signup failed');
        })
    }
  return (
    

     <div className="signup-container">
      <form className="signup-form" >
        <h2>Sign Up</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChangeEvents}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChangeEvents}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChangeEvents}
          required
        />

        <button type="submit" onClick={handleSubmit}>Create Account</button>
        <a href='/login'> login</a>
      </form>
        <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}

export default SignUp
