import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import '../Assets/TechMangeService.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const MySwal = withReactContent(Swal);

export default function ManageServicePage() {
  const location = useLocation();
  const TechnicianID = location.state?.TechnicianID; // ✅ Get Technician ID

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'ServiceType'));
        const fetchedServices = querySnapshot.docs
          .map((doc) => ({
            ServiceTypeID: doc.id,
            ...doc.data()
          }))
          .filter(service => service.TechnicianID === TechnicianID); // ✅ Filter by Technician ID
        setServices(fetchedServices);
      } catch (error) {
        setError("Failed to load services: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (TechnicianID) {
      fetchData();
    }
  }, [TechnicianID]);

  const handleUpdate = async (id) => {
    const service = services.find(s => s.ServiceTypeID === id);

    const { value: formValues } = await MySwal.fire({
      title: 'Update Service',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Service Name" value="${service.ServiceName}" />` +
        `<input id="swal-input2" class="swal2-input" placeholder="Amount (LKR)" type="number" value="${service.Amount}" />`,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const amount = document.getElementById('swal-input2').value;
        if (!name || !amount) {
          Swal.showValidationMessage("Please enter both fields");
          return false;
        }
        return [name, amount];
      }
    });

    if (formValues) {
      const [newName, newAmount] = formValues;
      try {
        await updateDoc(doc(db, 'ServiceType', id), {
          ServiceName: newName,
          Amount: newAmount
        });
        setServices(services.map(s =>
          s.ServiceTypeID === id
            ? { ...s, ServiceName: newName, Amount: newAmount }
            : s
        ));
        Swal.fire('Updated!', 'Service details have been updated.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Update failed: ' + error.message, 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the service permanently!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'ServiceType', id));
        setServices(services.filter(s => s.ServiceTypeID !== id));
        Swal.fire('Deleted!', 'The service has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Delete failed: ' + error.message, 'error');
      }
    }
  };

  if (loading) return (
    <div className="manage-container">
      <div className="loading">Loading services...</div>
    </div>
  );

  if (error) return (
    <div className="manage-container">
      <div className="error">{error}</div>
    </div>
  );

  return (
    <div className="manage-container">
      <header className="navbar">
        <img src="/mech connect/logo.png" alt="MechConnect Logo" className="logo" />
      </header>

      <main>
        <table className="service-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Amount (LKR)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.ServiceTypeID}>
                <td>{service.ServiceName}</td>
                <td>{service.Amount}</td>
                <td>
                  <button
                    className="update-btn"
                    onClick={() => handleUpdate(service.ServiceTypeID)}
                  >
                    Update
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(service.ServiceTypeID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <footer className="footer">Copyright © 2025 Mech Connect. All rights reserved</footer>
    </div>
  );
}
