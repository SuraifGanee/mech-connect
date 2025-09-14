import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';
import '../Assets/Tech_MangeProfile.css';

const ManageProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const TechnicianID = location.state?.TechnicianID;
  const [technician, setTechnician] = useState(null);

  useEffect(() => {
    const fetchTechnician = async () => {
      if (TechnicianID) {
        const docRef = doc(db, 'Technician', TechnicianID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTechnician({
            ...data,
            Password: '', // Do not show hashed password in the form
          });
        }
      }
    };
    fetchTechnician();
  }, [TechnicianID]);

  const handleChange = (e) => {
    setTechnician({ ...technician, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { Name, Email, PhoneNumber, UserName, Password } = technician;
    if (!Name || !Email || !PhoneNumber || !UserName || !Password) {
      Swal.fire('Missing Fields', 'Please fill in all fields.', 'warning');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (!emailRegex.test(Email)) {
      Swal.fire('Invalid Email', 'Please enter a valid email address.', 'warning');
      return false;
    }
    if (!phoneRegex.test(PhoneNumber)) {
      Swal.fire('Invalid Phone', 'Phone number should be 10 digits.', 'warning');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    Swal.fire({
      title: 'Saving...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const updatedData = { ...technician };

      // Hash password before saving
      if (technician.Password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(technician.Password, salt);
        updatedData.Password = hashedPassword;
      }

      const docRef = doc(db, 'Technician', TechnicianID);
      await updateDoc(docRef, updatedData);

      Swal.fire('Success!', 'Profile updated successfully.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Something went wrong while updating.', 'error');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete your profile permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const docRef = doc(db, 'Technician', TechnicianID);
        await deleteDoc(docRef);
        Swal.fire('Deleted!', 'Your profile has been deleted.', 'success');
        navigate('/login');
      } catch (error) {
        Swal.fire('Error', 'Could not delete profile.', 'error');
        console.error(error);
      }
    }
  };

  if (!technician) return <div>Loading profile...</div>;

  return (
    <div className="register-container">
      <h2>Manage Technician Profile</h2>
      <label>Name:
        <input type="text" name="Name" value={technician.Name} onChange={handleChange} />
      </label>
      <label>Email:
        <input type="email" name="Email" value={technician.Email} onChange={handleChange} />
      </label>
      <label>Phone:
        <input type="text" name="PhoneNumber" value={technician.PhoneNumber} onChange={handleChange} />
      </label>
      <label>Username:
        <input type="text" name="UserName" value={technician.UserName} onChange={handleChange} />
      </label>
      <label>Password:
        <input type="password" name="Password" value={technician.Password} onChange={handleChange} />
      </label>

      <div className="button-group">
        <button className="register-btn" onClick={handleSave}>Save Changes</button>
        <button className="delete-btn" onClick={handleDelete}>Delete Profile</button>
      </div>
    </div>
  );
};

export default ManageProfile;
