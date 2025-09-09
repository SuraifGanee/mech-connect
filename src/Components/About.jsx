import React from 'react';
import '../Assets/About.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';



const AboutPage = () => {
    const navigate = useNavigate();

    const handleJoinClick = () => {
        Swal.fire({
          title: 'Join as?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Customer',
          denyButtonText: 'Technician',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/register-customer');
          } else if (result.isDenied) {
            navigate('/register-technician');
          }
        });
      };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
        <img src="/mech connect/logo.png" alt="Logo" className="logo" />
        </div>
        <div className="navbar-center">
          <ul className="nav-links">
          <a onClick={() => navigate("/Home")}>Home</a>
            <li><a href="/about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#blog">Blog</a></li>

          </ul>
        </div>
        <div className="navbar-right">
        <button className="btn join-btn" onClick={(handleJoinClick)}>Join with Us</button>
        <button className="btn login-btn" onClick={() => navigate("/Login")}>Login</button>
        </div>
      </nav>

      {/* --- ABOUT SECTION --- */}
      <div className="about-page">
        <div className="about-container">
          <h1 className="about-title">About Us</h1>
          <p className="about-text">
            Welcome to Mech Connect – your trusted platform connecting customers with certified technicians for all mechanical needs. Our mission is to simplify service requests and make mechanical solutions more accessible, reliable, and efficient.
          </p>

          <h2 className="about-subtitle">Why Choose Us?</h2>
          <ul className="about-list">
            <li>🔧 Easy service request process</li>
            <li>🛠️ Verified and experienced technicians</li>
            <li>📍 Real-time tracking & status updates</li>
            <li>⚡ Fast and reliable support</li>
          </ul>

          <h2 className="about-subtitle">Our Vision</h2>
          <p className="about-text">
            We aim to become the leading platform for mechanical service management, ensuring seamless connections between users and professionals at the tap of a button.
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
