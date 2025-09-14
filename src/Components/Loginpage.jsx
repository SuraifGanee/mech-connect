import React, { useState } from 'react';
import '../Assets/LoginPage.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const userSources = [
      { collection: 'Admin', field: 'UserName', role: 'Admin' },
      { collection: 'Technician', field: 'UserName', role: 'Technician' },
      { collection: 'customers', field: 'User_Name', role: 'Customer' },
    ];

    let userFound = false;

    try {
      for (const source of userSources) {
        const q = query(collection(db, source.collection), where(source.field, '==', username));
        const querySnapshot = await getDocs(q);

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const isPasswordCorrect = await bcrypt.compare(password, data.Password);

          if (isPasswordCorrect) {
            userFound = true;
            const userId = doc.id;
            sessionStorage.setItem(`${source.role}ID`, userId);
            sessionStorage.setItem("adminLoggedIn", "true");
            sessionStorage.setItem("technicianLoggedIn", "true");
            




            Swal.fire({
              title: 'Login Successful!',
              text: `Welcome, ${source.role}`,
              icon: 'success',
              confirmButtonText: 'Proceed',
            }).then(() => {
              if (source.role === 'Admin') {
                navigate('/admin-dashboard');
              } else if (source.role === 'Technician') {
                navigate('/technician-dashboard', { state: { TechnicianID: userId } });
              } else if (source.role === 'Customer') {
                navigate('/customer-dashboard', { state: { CustomerID: userId } });
              }
            });

            break;
          }
        }

        if (userFound) break;
      }

      if (!userFound) {
        Swal.fire({
          title: 'Error!',
          text: 'Invalid username or password',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      }
    } catch (err) {
      console.error('Login Error:', err);
      Swal.fire({
        title: 'Something Went Wrong!',
        text: 'Please try again later.',
        icon: 'error',
        confirmButtonText: 'Close',
      });
    }
  };

  const handleRegisterClick = () => {
    Swal.fire({
      title: 'Register As',
      showCancelButton: true,
      confirmButtonText: 'Technician',
      cancelButtonText: 'Customer',
      icon: 'question',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/register-technician');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        navigate('/register-customer');
      }
    });
  };

  return (
    <div className="login-page">
      <img src="/mech connect/logo.png" alt="Mech Connect Logo" className="logo" />
      <div className="login-box">
        <h2>LOGIN</h2>
        <input type="text" placeholder="Enter your Email or User" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type={showPassword ? 'text' : 'password'} placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="options">
          <label>
            <input type="checkbox" onChange={() => setShowPassword(!showPassword)} /> Show Password
          </label>
          <a onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer' }}>Forgot Password?</a>
        </div>
        <p>New to Mech Connect? <a onClick={handleRegisterClick} style={{ cursor: 'pointer' }}>Register Here</a></p>
        <button className="login" onClick={handleLogin}>Login</button>
      </div>
      <footer>Copyright © 2025 Mech Connect. All rights reserved</footer>
    </div>
  );
}

export default LoginPage;
