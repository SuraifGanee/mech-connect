// TechnicianRegister.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';
import '../Assets/RegisterTechnician.css';

function TechnicianRegister() {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    TechnicianName: '',
    UserName: '',
    Email: '',
    TechnicanNIC: '',
    PhoneNumber: '',
    Password: '',
    TechnicanRegNO: '',
    Location: '',
    certificate: null,
    certificateUrl: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, certificate: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const fetchCoordinates = async (location) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
    throw new Error('Invalid location');
  };

  const handleSubmit = async () => {
    try {
      let uploadedFileName = '';
      if (formData.certificate) {
        const uploadData = new FormData();
        uploadData.append('certificate', formData.certificate);

        const response = await fetch('http://localhost:5000/upload-certificate', {
          method: 'POST',
          body: uploadData,
        });

        const result = await response.json();
        uploadedFileName = result.filename;
      }

      const hashedPassword = await bcrypt.hash(formData.Password, 10);
      const coords = await fetchCoordinates(formData.Location);

      await addDoc(collection(db, 'TechnicianRequests'), {
        TechnicianName: formData.TechnicianName,
        UserName: formData.UserName,
        Email: formData.Email,
        TechnicanNIC: formData.TechnicanNIC,
        PhoneNumber: formData.PhoneNumber,
        Password: hashedPassword,
        TechnicanRegNO: formData.TechnicanRegNO,
        Location: formData.Location,
        GeoPoint: coords,
        certificateUrl: `/mech connect/certificate/${uploadedFileName}`,
        Admin: '/Admin/Admin_ID',
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      Swal.fire({
        icon: 'info',
        title: 'Waiting for verification',
        text: 'Your details have been submitted and are awaiting admin approval.',
        showConfirmButton: false,
        timer: 2500
      });

      resetForm();

    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Registration failed', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      TechnicianName: '',
      UserName: '',
      Email: '',
      TechnicanNIC: '',
      PhoneNumber: '',
      Password: '',
      TechnicanRegNO: '',
      Location: '',
      certificate: null,
      certificateUrl: ''
    });
    setPreview(null);
    setStep(1);
  };

  return (
    <div className="register-container">
      <img src="/mech connect/logo.png" alt="Logo" className="logo" />

      <div className="form-sections">
        {step === 1 && (
          <form className="personal-info-box">
            <label>Name:</label>
            <input name="TechnicianName" value={formData.TechnicianName} onChange={handleChange} />
            <label>Username:</label>
            <input name="UserName" value={formData.UserName} onChange={handleChange} />
            <label>Email:</label>
            <input name="Email" type="email" value={formData.Email} onChange={handleChange} />
            <label>NIC:</label>
            <input name="TechnicanNIC" value={formData.TechnicanNIC} onChange={handleChange} />
            <label>Phone:</label>
            <input name="PhoneNumber" type="tel" value={formData.PhoneNumber} onChange={handleChange} />
            <label>Password:</label>
            <input name="Password" type="password" value={formData.Password} onChange={handleChange} />
            <button type="button" onClick={() => setStep(2)} className="next-btn">Next</button>
          </form>
        )}

        {step === 2 && (
          <div className="business-info-box">
            <label>Business Reg No:</label>
            <input name="TechnicanRegNO" value={formData.TechnicanRegNO} onChange={handleChange} />
            <label>Location:</label>
            <input name="Location" value={formData.Location} onChange={handleChange} />
            <div className="file-upload">
              <label htmlFor="upload" className="upload-box">
                {preview ? (
                  <div className="preview-wrapper">
                    <img src={preview} alt="Preview" className="preview-image" />
                    <button type="button" onClick={() => {
                      setPreview(null);
                      setFormData(prev => ({ ...prev, certificate: null }));
                    }}>X</button>
                  </div>
                ) : (
                  <>
                    <span className="upload-icon">⬆</span>
                    <p>Upload Certificate</p>
                  </>
                )}
              </label>
              <input type="file" id="upload" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="button-group">
              <button onClick={() => setStep(1)} className="back-btn">Back</button>
              <button onClick={handleSubmit} className="register-btn">Register</button>
            </div>
          </div>
        )}
      </div>

      <footer>© 2025 Mech Connect. All rights reserved.</footer>
    </div>
  );
}

export default TechnicianRegister;
