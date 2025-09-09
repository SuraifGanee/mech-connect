import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../Assets/TechDashboard.css';
import Swal from "sweetalert2";


const TechDashboard = () => {
  const location = useLocation();
  const TechnicianID = location.state?.TechnicianID;
  const navigate = useNavigate();

  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

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
        navigate("/", { replace: true }); // 🧠 prevent going back
        Swal.fire("Logged Out!", "You have been successfully logged out.", "success");
      }
    });
  };
  
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
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("technicianLoggedIn");
    const idFromSession = sessionStorage.getItem("TechnicianID");
  
    if (!isLoggedIn || !idFromSession) {
      Swal.fire({
        title: "Unauthorized",
        text: "Please log in first.",
        icon: "warning",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/", { replace: true });
      });
    }
  }, [navigate]);
  

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const q = query(collection(db, 'ServiceRequest'), where('Technician', '==', `/Technician/${TechnicianID}`));
        const snapshot = await getDocs(q);
        let accepted = 0, rejected = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.Approved === true) accepted++;
          else if (data.Approved === false) rejected++;
        });

        setAcceptedCount(accepted);
        setRejectedCount(rejected);
      } catch (err) {
        console.error('Error fetching service counts:', err);
      }
    };

    if (TechnicianID) fetchCounts();
  }, [TechnicianID]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <img src="/mech connect/logo.png" alt="MechConnect Logo" className="logo" />
        <nav className="dashboard-nav">
        <a onClick={() => navigate("/Home")}>Home</a>
        <a onClick={() => navigate("/About")}>About</a>
        <a onClick={() => navigate("/Home")}>Services</a>
        <a onClick={() => navigate("/Home")}>Blog</a>
          <button className="btn join-btn" onClick={(handleJoinClick)}>Join with Us</button>
          <button className="login-btn">Login</button>
        </nav>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <h2>Technician Dashboard</h2>
          <ul>
            <li><Link to="/add-service" state={{ TechnicianID }}>Add Services</Link></li>
            <li><Link to="/manage-service" state={{ TechnicianID }}>Manage Services</Link></li>
            <li><Link to="/History" state={{ TechnicianID }}>History</Link></li>
            <li><Link to="/cus_ManagePayments" state={{ TechnicianID }}>Manage Payments</Link></li>
            <li><Link to="/requested-service" state={{ TechnicianID, ServiceRequestID: 'SR_1745844208225' }}>Requested Service</Link></li>
            <li><Link to="/manage-profile" state={{ TechnicianID }}>Manage Profile</Link></li>
          </ul>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </aside>

        <main className="dashboard-main">
          <div className="card accepted-card">
            <div className="percentage-circle">
              {acceptedCount + rejectedCount > 0
                ? `${Math.round((acceptedCount / (acceptedCount + rejectedCount)) * 100)}%`
                : '0%'}
            </div>
            <div className="service-stats">
              <div><p>ACCEPTED SERVICE</p><strong>{acceptedCount}</strong></div>
              <div><p>REJECTED SERVICE</p><strong>{rejectedCount}</strong></div>
            </div>
          </div>

          <div className="card income-card">
            <h3>INCOME</h3>
            <div className="donut-chart-container">
              <div className="donut-chart"><div className="donut-hole"></div></div>
              <div className="donut-legend">
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#40518A" }}></span>Battery Jump Start 47%</div>
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#7fbfff" }}></span>Vehicle Towing 26%</div>
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#ff6666" }}></span>Puncture 15%</div>
                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: "#ffcc33" }}></span>Fueling 20%</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer">Copyright © 2025 Mech Connect. All rights reserved</footer>
    </div>
  );
};

export default TechDashboard;
