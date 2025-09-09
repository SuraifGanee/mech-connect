import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  addDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../Assets/ManagePayments.css';

const PaymentForm = () => {
  const location = useLocation();
  const CustomerID = location.state?.CustomerID;

  const [amount, setAmount] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [latestRequestDoc, setLatestRequestDoc] = useState(null);

  useEffect(() => {
    const fetchAmount = async () => {
      try {
        const requestQuery = query(
          collection(db, 'ServiceRequest'),
          orderBy('RequestTime', 'desc'),
          limit(1)
        );

        const requestSnapshot = await getDocs(requestQuery);

        if (requestSnapshot.empty) {
          console.log('No service requests found.');
          return;
        }

        const latestDoc = requestSnapshot.docs[0];
        const latestRequest = latestDoc.data();
        const requestedService = latestRequest.Service;

        setLatestRequestDoc(latestDoc);
        setServiceName(requestedService);

        const serviceTypeQuery = query(
          collection(db, 'ServiceType'),
          where('ServiceName', '==', requestedService)
        );

        const serviceTypeSnapshot = await getDocs(serviceTypeQuery);

        if (!serviceTypeSnapshot.empty) {
          const serviceTypeData = serviceTypeSnapshot.docs[0].data();
          setAmount(serviceTypeData.Amount);
        } else {
          console.log('No matching service type found.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAmount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Confirm Payment',
      text: `Pay Rs.${amount} for ${serviceName} via ${paymentMethod}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        if (!latestRequestDoc) {
          throw new Error('No service request to reference.');
        }

        const serviceRequestRef = doc(db, 'ServiceRequest', latestRequestDoc.id);
        const adminRef = doc(db, 'Admin', 'AdminID'); // Replace 'AdminID' if needed
        const customerRef = doc(db, 'customers', CustomerID); // ✅ Defined correctly

        await addDoc(collection(db, 'Payment'), {
          Admin: adminRef,
          Customer: customerRef,
          Amount: amount,
          Date: new Date(),
          PaymentMethod: paymentMethod,
          ServiceRequest: serviceRequestRef,
        });

        Swal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          text: 'Your payment has been processed.',
          confirmButtonColor: '#3085d6',
        });

      } catch (error) {
        console.error('Error saving payment:', error);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: 'There was an error saving the payment.',
        });
      }
    }
  };

  return (
    <div className="payment-container">
      <form className="payment-form" onSubmit={handleSubmit}>
        <label>
          Service:
          <input type="text" value={serviceName} readOnly />
        </label>

        <label>
          Amount:
          <input type="text" value={amount} readOnly />
        </label>

        <label>
          Date:
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </label>

        <label>
          Payment Method:
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Select Method</option>
            <option value="Cash">Cash</option>
            {/* Add more methods if needed */}
          </select>
        </label>

        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
};

export default PaymentForm;
