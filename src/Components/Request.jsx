import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, GeoPoint } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import '../Assets/Request.css';

const RequestForm = () => {
  const location = useLocation();
  const { CustomerID, selectedTechnician, selectedService } = location.state || {};

  const customerID = CustomerID;
  const technicianID = selectedTechnician?.id;

  const [requestTime, setRequestTime] = useState("");
  const [requestLocation, setRequestLocation] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapURL, setMapURL] = useState("");

  const adminRef = "/Admin/Admin_ID"; // Replace with actual Admin path or ID

  useEffect(() => {
    const now = new Date();
    const options = { hour12: false };
    const dateStr = now.toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      ...options
    });
    setRequestTime(dateStr);
  }, []);

  const getCoordinates = async (address) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (!data.length) throw new Error("Location not found");
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerID || !technicianID) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Info',
        text: 'Customer or Technician ID is missing. Please go back and try again.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    try {
      const coords = await getCoordinates(requestLocation);

      const newRequest = {
        Admin: adminRef,
        Customer: doc(db, "customers", customerID),
        Technician: doc(db, "Technician", technicianID),
        Service: selectedService,
        Location: requestLocation,
        RequestTime: requestTime,
        GeoPoint: new GeoPoint(coords.lat, coords.lon),
      };

      const docRef = doc(db, "ServiceRequest", `SR_${Date.now()}`);
      await setDoc(docRef, newRequest);

      Swal.fire({
        icon: 'success',
        title: 'Request Submitted',
        text: 'Your service request has been successfully sent!',
        confirmButtonColor: '#3085d6',
      });

      const encodedLocation = encodeURIComponent(requestLocation);
      const url = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;
      setMapURL(url);
      setShowMap(true);

    } catch (error) {
      console.error("Error adding document:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'Something went wrong while submitting your request.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Add Request Time:
            <input type="text" value={requestTime} readOnly />
          </label>
          <label>
            Add Request Location:
            <input
              type="text"
              value={requestLocation}
              onChange={(e) => setRequestLocation(e.target.value)}
              placeholder="e.g., Colombo"
              required
            />
          </label>
          <button className="done-btn" type="submit">
            Done
          </button>
        </form>

        {showMap && (
          <div className="map-container" style={{ marginTop: "20px", textAlign: "center" }}>
            <h3>Tracking Location on Map</h3>
            <iframe
              title="Location Map"
              width="100%"
              height="400"
              frameBorder="0"
              style={{ border: 0 }}
              src={mapURL}
              allowFullScreen
            />
          </div>
        )}
      </div>

     
    </div>
  );
};

export default RequestForm;
