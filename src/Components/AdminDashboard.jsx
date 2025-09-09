import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import '../Assets/AdminDashboard.css';

const data = [
  { month: "Jan", value: 70 },
  { month: "Feb", value: 140 },
  { month: "Mar", value: 145 },
  { month: "Apr", value: 35 },
  { month: "May", value: 105 },
  { month: "Jun", value: 145 },
  { month: "Jul", value: 175 },
  { month: "Aug", value: 40 },
  { month: "Sep", value: 65 },
  { month: "Oct", value: 55 },
  { month: "Nov", value: 115 },
  { month: "Dec", value: 145 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [pendingTechnicians, setPendingTechnicians] = useState([]);
  const [technicianCount, setTechnicianCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);

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
        sessionStorage.removeItem("adminLoggedIn");
        navigate("/", { replace: true }); // 👈 replaces browser history
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

  const fetchPendingTechnicians = async () => {
    const snapshot = await getDocs(collection(db, 'TechnicianRequests'));
    const pending = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPendingTechnicians(pending);
  };

  const fetchTechnicianCount = async () => {
    const snapshot = await getDocs(collection(db, 'Technician'));
    setTechnicianCount(snapshot.size);
  };
  
const fetchServiceCount = async () => {
  const snapshot = await getDocs(collection(db, 'ServiceRequest'));
  setServiceCount(snapshot.size);
};
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      Swal.fire({
        title: "Unauthorized",
        text: "You must log in first.",
        icon: "warning",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/", { replace: true });
      });
    }
  }, [navigate]);
  

  useEffect(() => {
    fetchPendingTechnicians();
    fetchTechnicianCount();
    fetchServiceCount();
  }, []);

  const verifyTechnician = async (tech) => {
    await addDoc(collection(db, 'Technician'), {
      ...tech,
      certificate: tech.certificateUrl,
      Admin: '/Admin/Admin_ID',
    });

    await deleteDoc(doc(db, 'TechnicianRequests', tech.id));
    Swal.fire('Verified!', 'Technician saved successfully.', 'success');
    fetchPendingTechnicians();
    fetchTechnicianCount();
  };

  const rejectTechnician = async (tech) => {
    await fetch('http://localhost:5000/delete-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: tech.certificateUrl.split('/').pop() }),
    });

    await deleteDoc(doc(db, 'TechnicianRequests', tech.id));
    Swal.fire('Rejected!', 'Technician request discarded.', 'info');
    fetchPendingTechnicians();
  };

  return (
    <div className="dashboard">
      <header className="header">
        <img src="/mech connect/logo.png" alt="Logo" className="logo" />
        <nav className="nav">
          <a onClick={() => navigate("/Home")}>Home</a>
          <a onClick={() => navigate("/About")}>About</a>
          <a onClick={() => navigate("/Home")}>Services</a>
          <a onClick={() => navigate("/Home")}>Blog</a>
          <button className="btn join-btn" onClick={(handleJoinClick)}>Join with Us</button>
          <button className="login-btn" onClick={handleLogout}>Login</button>
        </nav>
      </header>

      <section className="stats">
        <div className="stat-box" onClick={() => setShowVerification(!showVerification)}>
          <h3>Verification</h3>
          <p>{pendingTechnicians.length}</p>
        </div>
        <div className="stat-box">
          <h3>Technician Count</h3>
          <p>{technicianCount}</p>
        </div>
        <div className="stat-box">
  <h3>Service Count</h3>
  <p>{serviceCount}</p>
</div>
      </section>

      {!showVerification && (
        <section className="chart-section">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#d94d1a" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {showVerification && pendingTechnicians.map((tech) => (
        <div key={tech.id} className="confirmation-row">
          <h4>Confirm Technician Registration</h4>
          <p><strong>Name:</strong> {tech.TechnicianName}</p>
          <p><strong>Contact:</strong> {tech.PhoneNumber}</p>
          <p><strong>Reg No:</strong> {tech.TechnicanRegNO}</p>
          <img src={tech.certificateUrl} alt="Certificate" className="preview-image" />
          <div className="button-group">
            <button className="verify-btn" onClick={() => verifyTechnician(tech)}>✅ Verify</button>
            <button className="reject-btn" onClick={() => rejectTechnician(tech)}>❌ Reject</button>
          </div>
        </div>
      ))}

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
