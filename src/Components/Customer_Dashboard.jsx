import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../Assets/Customer_Dashboard.css";

const services = [
  { title: "Vehicle Repairing", image: "/mech connect/vechile Repair.png" },
  { title: "Vehicle Towing", image: "/mech connect/50-towing-service-near-me.jpg" },
  { title: "Fuel Deliver Support", image: "/mech connect/Fuel Delivery.jpg" },
  { title: "Flat Tire Support", image: "/mech connect/Flat-Tire-Repair-Near-Me-scaled.jpg" },
  { title: "Battery Kick Start Support", image: "/mech connect/Jump Start.jpg" },
  { title: "Lock Out Services", image: "/mech connect/lockout.jpg" },
];

const ServiceDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get CustomerID from route state or session
  const CustomerID = location.state?.CustomerID || sessionStorage.getItem("CustomerID");

  

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log me out",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        navigate("/", { replace: true }); // 👈 prevents back navigation
        Swal.fire("Logged Out!", "You have been successfully logged out.", "success");
      }
    });
  };
  

  const handleJoinClick = () => {
    Swal.fire({
      title: "Join as?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Customer",
      denyButtonText: "Technician",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/register-customer");
      } else if (result.isDenied) {
        navigate("/register-technician");
      }
    });
  };

  return (
    <div>
      {/* Navbar */}
      <header className="dashboard-header">
        <div className="nav-container">
          <div className="nav-left">
            <img src="/mech connect/logo.png" alt="MechConnect Logo" className="logo" />
          </div>
          <nav className="nav-right">
            <a onClick={() => navigate("/Home")}>Home</a>
            <a onClick={() => navigate("/About")}>About</a>
            <a onClick={() => navigate("/Home")}>Services</a>
            <a onClick={() => navigate("/Home")}>Blog</a>
            <button className="btn join-btn" onClick={handleJoinClick}>Join with Us</button>
            <button className="login-btn" onClick={handleLogout}>Logout</button>
          </nav>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <h2>Customer Dashboard</h2>
          <ul>
            <li><Link to="/customer-service-request" state={{ CustomerID }}>Request Service</Link></li>
            <li><Link to="/customer-manage-profile" state={{ CustomerID }}>Manage Profile</Link></li>
            <li><Link to="/History" state={{ CustomerID }}>History</Link></li>
            <li><Link to="/cus_ManagePayments" state={{ CustomerID }}>Manage Payments</Link></li>
          </ul>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </aside>

        {/* Service Boxes */}
        <div className="content">
          <div className="services-grid">
            {services.map((service, idx) => (
              <Link
                to="/select-services"
                state={{ CustomerID, selectedService: service.title }}
                key={idx}
                className="service-link"
              >
                <div className="service-box">
                  <img src={service.image} alt={service.title} />
                  <p>{service.title}</p>
                </div>
              </Link>
            ))}
          </div>
          <footer className="footer">
            &copy; 2025 Mech Connect. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
