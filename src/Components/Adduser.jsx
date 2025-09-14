import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import bcrypt from 'bcryptjs';

function AddUser() {
  const [formData, setFormData] = useState({
    Email: '',
    Name: '',
    Password: '',
    PhoneNO: '',
    UserName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hashedPassword = await bcrypt.hash(formData.Password, 10);
      const userToAdd = {
        ...formData,
        Password: hashedPassword
      };

      await addDoc(collection(db, 'Admin'), userToAdd);
      alert('✅ Admin user added successfully!');
      setFormData({
        Email: '',
        Name: '',
        Password: '',
        PhoneNO: '',
        UserName: ''
      });
    } catch (error) {
      console.error('❌ Error adding admin user:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Add Admin User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="Email"
          placeholder="Email"
          value={formData.Email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="Name"
          placeholder="Name"
          value={formData.Name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={formData.Password}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="PhoneNO"
          placeholder="Phone Number"
          value={formData.PhoneNO}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="text"
          name="UserName"
          placeholder="Username"
          value={formData.UserName}
          onChange={handleChange}
          required
        />
        <br /><br />
        <button type="submit">Add Admin User</button>
      </form>
    </div>
  );
}

export default AddUser;
