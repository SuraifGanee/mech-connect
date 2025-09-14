import React, { useState } from 'react';
import axios from 'axios';
import '../Assets/Customer_Reg.css';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';

const CustomerRegistration = () => {
  const [step, setStep] = useState(1);
  const [vehiclePreview, setVehiclePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    mobile: '',
    nic: '',
    address: '',
    vehicleNo: '',
    vehicleColor: '',
    vehicleImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, vehicleImage: file });
      setVehiclePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      let imageFilename = '';

      // 1. Upload vehicle image to Node.js server
      if (formData.vehicleImage) {
        const imageForm = new FormData();
        imageForm.append('vehicleImage', formData.vehicleImage);

        const res = await axios.post('http://localhost:5000/upload-vehicle', imageForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imageFilename = res.data.filename;

        if (!imageFilename) {
          throw new Error('Image upload failed: No filename returned');
        }
      }

      // 🔐 2. Hash the password
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      // 3. Store customer data in Firestore
      const customerRef = collection(db, 'customers');
      await addDoc(customerRef, {
        Customer_Name: formData.name,
        User_Name: formData.username,
        Password: hashedPassword, // Use hashed password here
        Email: formData.email,
        MOBILE: formData.mobile,
        NIC_NO: formData.nic,
        Address: formData.address,
        Vehicle_No: formData.vehicleNo,
        Vehicle_Color: formData.vehicleColor,
        Vehicle_Image: imageFilename,
      });

      // 4. Success alert
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        showConfirmButton: false,
        timer: 2000,
      });

      // 5. Reset form
      setFormData({
        name: '',
        username: '',
        password: '',
        email: '',
        mobile: '',
        nic: '',
        address: '',
        vehicleNo: '',
        vehicleColor: '',
        vehicleImage: null,
      });
      setVehiclePreview(null);
      setStep(1);
    } catch (err) {
      console.error('Error during registration:', err.response || err.message || err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Registration failed! Please check console for details.',
      });
    }
  };

  return (
    <div className="registration-container">
      {step === 1 ? (
        <div className="form-section">
          <h2>Personal Details</h2>
          <form onSubmit={handleNext}>
            {['name', 'username', 'password', 'email', 'mobile', 'nic', 'address'].map((field) => (
              <React.Fragment key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input
                  name={field}
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  required
                  value={formData[field]}
                  onChange={handleChange}
                />
              </React.Fragment>
            ))}
            <button type="submit" className="next-btn">Next</button>
          </form>
        </div>
      ) : (
        <div className="form-section">
          <h2>Vehicle Details</h2>
          <form onSubmit={handleRegister}>
            <label>Vehicle No:</label>
            <input name="vehicleNo" type="text" required value={formData.vehicleNo} onChange={handleChange} />

            <label>Vehicle Color:</label>
            <input name="vehicleColor" type="text" required value={formData.vehicleColor} onChange={handleChange} />

            <div className="upload-container">
              <label htmlFor="vehicleImage" className="upload-box">
                {vehiclePreview ? (
                  <img
                    src={vehiclePreview}
                    alt="Vehicle Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                  />
                ) : (
                  <>
                    <i className="upload-icon">⬆</i><br />
                    Upload Vehicle Image
                  </>
                )}
              </label>
              <input
                type="file"
                id="vehicleImage"
                name="vehicleImage"
                hidden
                accept="image/*"
                onChange={handleChange}
              />
            </div>

            <div className="button-group">
              <button onClick={handleBack} className="register-btn" style={{ backgroundColor: '#6c757d' }}>Back</button>
              <button type="submit" className="register-btn">Register</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerRegistration;
