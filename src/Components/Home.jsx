import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import "../Assets/Home.css";

const HomePage = () => {
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
    <div className="homepage">
      <nav className="navbar">
        <div className="navbar-left">
        <img src="/mech connect/logo.png" alt="Logo" className="logo" />
        </div>
        <div className="navbar-center">
          <ul className="nav-links">
          <a className="active">Home</a>
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

      <main className="main-content">
        <Section title="Why Choose Us" items={[
          { title: "Immediate Assistance on Road", text: "Get expert help instantly wherever you are." },
          { title: "Unlimited Service Requests", text: "Request assistance any number of times, anytime." },
          { title: "24x7 Roadside Service", text: "Day or night, we are just a call away." },
        ]} />

        <Section title="Our Services" items={[
          { title: "On-Site Assistance", text: "We provide quick fixes at your location." },
          { title: "Car Towing", text: "Safe and secure towing services." },
          { title: "Fuel Delivery", text: "Ran out of fuel? We'll get you moving again." },
        ]} />

        <Section title="Our Latest News" items={[
          { title: "Choosing Quality Service", text: "Tips for selecting reliable roadside assistance." },
          { title: "Waiting for a Wrecker?", text: "Things to do while waiting for help." },
          { title: "Towing Capacity Basics", text: "Learn the important factors about towing safely." },
        ]} />
      </main>
    </div>
  );
};

const Section = ({ title, items }) => (
  <div className="section">
    <h2>{title}</h2>
    <div className="cards">
      {items.map((item, idx) => (
        <Card key={idx} title={item.title} text={item.text} />
      ))}
    </div>
  </div>
);

const Card = ({ title, text }) => (
  <div className="card">
    <div className="card-overlay">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  </div>
);

export default HomePage;
