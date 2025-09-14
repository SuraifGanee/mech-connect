import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import '../Assets/Cus_Service_Req.css';
import Swal from 'sweetalert2';

const RequestForm = () => {
  const [requestTime, setRequestTime] = useState("");
  const [requestLocation, setRequestLocation] = useState("");

  // These should ideally come from user session or selection
  const adminRef = "/Admin/Admin_ID";
  const customerRef = "/Customer/Customer_ID";
  const technicianRef = "/Technician/TechnicianID";

  useEffect(() => {
    const now = new Date();
    const options = {  hour12: false };
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newRequest = {
      Admin: adminRef,
      Customer: customerRef,
      Technician: technicianRef,
      Location: requestLocation,
      RequestTime: requestTime,
    };

    try {
      const docRef = doc(db, "ServiceRequest", `SR_${Date.now()}`);
      await setDoc(docRef, newRequest);
      
    Swal.fire({
        icon: 'success',
        title: 'Request Submitted',
        text: 'Your service request has been successfully sent!',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error("Error adding document:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong while submitting your request.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="request-container">
      <form className="request-form" onSubmit={handleSubmit}>
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
          />
        </label>
        <button className="request-button" type="submit">
          Request
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
