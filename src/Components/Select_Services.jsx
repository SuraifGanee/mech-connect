import React, { useState, useEffect } from 'react';
import '../Assets/Select_Services.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';

const serviceImageMap = {
  "Vehicle Repairing": "/mech connect/vechile Repair.png",
  "Vehicle Towing": "/mech connect/50-towing-service-near-me.jpg",
  "Fuel Deliver Support": "/mech connect/Fuel Delivery.jpg",
  "Flat Tire Support": "/mech connect/Flat-Tire-Repair-Near-Me-scaled.jpg",
  "Battery Kick Start Support": "/mech connect/Jump Start.jpg",
  "Lock Out Services": "/mech connect/lockout.jpg",
};

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CustomerID, selectedService } = location.state || {};

  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const serviceQuery = query(
          collection(db, 'ServiceType'),
          where('ServiceName', '==', selectedService)
        );
        const querySnapshot = await getDocs(serviceQuery);

        const technicianData = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const technicianRef = doc(db, 'Technician', data.TechnicianID);
          const technicianSnap = await getDoc(technicianRef);

          if (technicianSnap.exists()) {
            const techData = technicianSnap.data();
            technicianData.push({
              name: techData.TechnicianName,
              contact: techData.PhoneNumber,
              location: techData.Location,
              charge: data.Amount,
              id: data.TechnicianID,
            });
          }
        }

        setTechnicians(technicianData);
      } catch (error) {
        console.error('Error fetching technicians:', error);
      }
    };

    if (selectedService) {
      fetchTechnicians();
    }
  }, [selectedService]);

  const handleCheckboxChange = (techId) => {
    const newSelection = techId === selectedTechnician ? null : techId;
    setSelectedTechnician(newSelection);

    if (newSelection) {
      const tech = technicians.find((t) => t.id === newSelection);
      Swal.fire({
        icon: 'success',
        title: 'Technician Selected',
        text: `You have selected ${tech?.name}`,
        confirmButtonColor: '#3085d6',
      });
    }
  };

  const handleRequestClick = () => {
    if (selectedTechnician !== null) {
      const selectedTech = technicians.find((tech) => tech.id === selectedTechnician);

      Swal.fire({
        title: 'Are you sure?',
        text: `You are requesting ${selectedService} service from ${selectedTech.name}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Request!',
        cancelButtonText: 'No, Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate and pass selectedTech and charge (amount)
          navigate('/request', {
            state: {
              CustomerID,
              selectedTechnician: selectedTech,
              selectedService,
              amount: selectedTech.charge, // 💰 Pass amount here
            },
          });

          Swal.fire({
            icon: 'success',
            title: 'Request Sent!',
            text: 'Your service request has been successfully sent.',
            confirmButtonColor: '#3085d6',
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No Technician Selected',
        text: 'Please select a technician before proceeding.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const imageSrc = serviceImageMap[selectedService] || "";

  return (
    <div className="services-container">
      <div className="service-title">
        <img src={imageSrc} alt={selectedService} className="service-image" />
        <h2>{selectedService || 'Select a Service'}</h2>
      </div>

      <h3 className="nearby-title">Nearby Technicians</h3>

      <div className="technicians-container">
        {technicians.map((tech) => (
          <div className="technician-card" key={tech.id}>
            <div className="tech-info">
              <input
                type="checkbox"
                checked={selectedTechnician === tech.id}
                onChange={() => handleCheckboxChange(tech.id)}
              />
              <p><strong>Name:</strong> {tech.name}</p>
              <p><strong>Contact:</strong> {tech.contact}</p>
              <p><strong>Location:</strong> {tech.location}</p>
              <p><strong>Charge:</strong> Rs. {tech.charge}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="request-button-container">
        <button className="request-button" onClick={handleRequestClick}>
          Request
        </button>
      </div>
    </div>
  );
};

export default Services;
