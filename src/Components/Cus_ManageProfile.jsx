import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';
import '../Assets/Cus_ManageProfile.css';

const Customer_ManageProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const CustomerID = location.state?.CustomerID;

  const [profile, setProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    User_Name: '',
    Password: '',
    Email: '',
    mobile: '',
    NIC_NO: '',
    Address: '',
    Vehicle_No: '',
    Vehicle_Color: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!CustomerID) return;
      try {
        const docRef = doc(db, 'customers', CustomerID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFormData({
            Name: data.Name || '',
            User_Name: data.username || '',
            Password: '', // keep empty to avoid displaying hashed password
            Email: data.Email || '',
            mobile: data.mobile || '',
            NIC_NO: data.nic || '',
            Address: data.address || '',
            Vehicle_No: data.vehicleNo || '',
            Vehicle_Color: data.vehicleColor || '',
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [CustomerID]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleUpdate = async () => {
    try {
      let updatedData = { ...formData };

      // Hash password if entered
      if (formData.Password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formData.Password, salt);
        updatedData.Password = hashedPassword;
      } else {
        delete updatedData.Password; // don't overwrite with empty password
      }

      // Upload image if selected
      if (selectedImage) {
        const formDataImg = new FormData();
        formDataImg.append('vehicleImage', selectedImage);

        const response = await fetch('http://localhost:5000/upload/vehicle', {
          method: 'POST',
          body: formDataImg
        });

        const result = await response.json();
        updatedData.VehicleImage = result.filename;
      }

      const docRef = doc(db, 'customers', CustomerID);
      await updateDoc(docRef, updatedData);

      Swal.fire('Updated!', 'Profile updated successfully.', 'success');

      setProfile(updatedData);
      setFormData({ ...updatedData, Password: '' }); // clear password field
      setSelectedImage(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire('Error', 'Could not update profile.', 'error');
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete your profile!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'customers', CustomerID));
        Swal.fire('Deleted!', 'Your profile has been deleted.', 'success');
        navigate('/');
      } catch (error) {
        console.error("Error deleting profile:", error);
        Swal.fire('Error', 'Could not delete profile.', 'error');
      }
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Manage Profile</h2>

      <form className="form-grid">
        {Object.entries(formData).map(([field, value]) => {
          if (field === 'VehicleImage') return null;
          return (
            <div className="form-group" key={field}>
              <label>{field}</label>
              <input
                type={field === 'Password' ? 'password' : 'text'}
                name={field}
                value={value}
                onChange={handleChange}
              />
            </div>
          );
        })}

        

        <div className="button-group">
          <button type="button" className="btn save" onClick={handleUpdate}>Save Changes</button>
          <button type="button" className="btn delete" onClick={handleDelete}>Delete</button>
        </div>
      </form>
    </div>
  );
};

export default Customer_ManageProfile;
