import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { db } from '../firebaseConfig';
import '../Assets/TechServiceReq.css';

const API_KEY = 'AIzaSyAFALO1WdpwOILnUr1PJNP9fGj_BX7m9Gw';

const RequestForm = () => {
  const location = useLocation();
  const technicianId = location.state?.TechnicianID;
  const requestId = location.state?.ServiceRequestID;

  const [requestData, setRequestData] = useState(null);
  const [requestTime, setRequestTime] = useState('');
  const [mapURL, setMapURL] = useState('');
  const [approved, setApproved] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, 'ServiceRequest', requestId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) throw new Error('Request not found.');
        setRequestData(snap.data());

        const now = new Date();
        setRequestTime(now.toLocaleString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: false
        }));
      } catch (error) {
        console.error('Error fetching request:', error);
        Swal.fire({ icon: 'error', title: 'Load Error', text: error.message });
      }
    };

    if (requestId) fetchRequest();
  }, [requestId]);

  const getCoordinates = async (address) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (!data.length) throw new Error('Invalid address.');
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  };

  const handleApprove = async () => {
    try {
      const techSnap = await getDoc(doc(db, 'Technician', technicianId));
      if (!techSnap.exists()) throw new Error('Technician not found.');

      const techData = techSnap.data();
      const technicianCoords = await getCoordinates(techData.Location);
      const customerCoords = await getCoordinates(requestData.Location);

      const url = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${technicianCoords.lat},${technicianCoords.lon}&destination=${customerCoords.lat},${customerCoords.lon}&mode=driving`;

      await setDoc(doc(db, 'ServiceRequest', requestId), {
        ...requestData,
        Technician: `/Technician/${technicianId}`,
        Approved: true,
        ApprovedTime: requestTime
      });

      setMapURL(url);
      setApproved(true);
      setShowDetails(true);

      Swal.fire({
        icon: 'success',
        title: 'Request Approved',
        text: 'You have accepted this service request!',
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err.message,
      });
    }
  };

  const handleReject = async () => {
    await setDoc(doc(db, 'ServiceRequest', requestId), {
      ...requestData,
      Technician: `/Technician/${technicianId}`,
      Approved: false,
      ApprovedTime: requestTime
    });

    setApproved(false);
    setMapVisible(false);
    setShowDetails(false);

    Swal.fire({
      icon: 'warning',
      title: 'Request Rejected',
      text: 'You have rejected the service request.',
    });
  };

  const handleStart = () => {
    if (approved && mapURL) setMapVisible(true);
  };

  if (!requestData) return <div className="loading">Loading service request...</div>;

  return (
    <div className="main-content">
      <div className="left-box">
        <label>Requested Service: <input type="text" value={requestData.Service || ''} readOnly /></label>
        <label>Customer Name: <input type="text" value={requestData.CustomerName || 'Suraif'} readOnly /></label>
        <label>Vehicle NO: <input type="text" value={requestData.VehicleNo || 'BGZ-1235'} readOnly /></label>
        <label>Vehicle Color: <input type="text" value={requestData.VehicleColor || 'Red'} readOnly /></label>
        <label>Contact NO: <input type="text" value={requestData.ContactNo || '0711374659'} readOnly /></label>
        <label>Request Location: <input type="text" value={requestData.Location || ''} readOnly /></label>
        <div className="buttons">
          <button className="approve" onClick={handleApprove}>Accept</button>
          <button className="reject" onClick={handleReject}>Reject</button>
        </div>
      </div>

      {showDetails && (
        <div className="right-box">
          <label>Requested Time: <input type="text" value={requestTime} readOnly /></label>
          <label>Requested Location: <input type="text" value={requestData.Location || ''} readOnly /></label>
          {mapVisible && mapURL && (
            <div className="map-container">
              <iframe
                title="Route Map"
                width="100%" height="300" frameBorder="0"
                style={{ border: 0 }} src={mapURL} allowFullScreen
              />
            </div>
          )}
          {approved && <button className="start-button" onClick={handleStart}>Start</button>}
        </div>
      )}
    </div>
  );
};

export default RequestForm;
