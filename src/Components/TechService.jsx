import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import '../Assets/TechService.css';

export default function AddServicePage() {
  const location = useLocation();
  const TechnicianID = location.state?.TechnicianID; // Get TechnicianID from route state
  const [services, setServices] = useState([{ service: '', price: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const handleAddService = () => {
    setServices([...services, { service: '', price: '' }]);
  };

  const handleRemoveService = (index) => {
    if (services.length > 1) {
      const updated = [...services];
      updated.splice(index, 1);
      setServices(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validServices = services.filter(
        s => s.service.trim() !== '' && s.price.trim() !== ''
      );

      if (validServices.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please add at least one valid service',
        });
        setIsSubmitting(false);
        return;
      }

      const servicesRef = collection(db, 'ServiceType');
      const promises = validServices.map(service =>
        addDoc(servicesRef, {
          ServiceName: service.service,
          Amount: service.price,
          TechnicianID: TechnicianID || 'Unknown'  // Store TechnicianID
        })
      );

      await Promise.all(promises);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Services added successfully!',
      });

      setServices([{ service: '', price: '' }]); // Reset form
    } catch (error) {
      console.error('Error adding services:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Failed to add services. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="service-container">
      <header className="navbar">
        <img src="/mech connect/logo.png" alt="MechConnect Logo" className="logo" />
      </header>

      <main className="form-section">
        <form className="service-form" onSubmit={handleSubmit}>
          <h2>Add New Services</h2>

          <div className="service-grid">
            {services.map((service, index) => (
              <div key={index} className="service-box">
                <label>Service Name</label>
                <input
                  type="text"
                  placeholder="Enter service name"
                  value={service.service}
                  onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                  required
                />

                <label>Price (LKR)</label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                  required
                />

                {services.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveService(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="button-group">
            <button
              type="button"
              className="add-more-btn"
              onClick={handleAddService}
            >
              Add Another Service
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Services'}
            </button>
          </div>
        </form>
      </main>

      <footer className="footer">
        Copyright © 2025 Mech Connect. All rights reserved
      </footer>
    </div>
  );
}
