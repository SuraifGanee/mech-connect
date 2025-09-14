import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useLocation } from 'react-router-dom';
import '../Assets/History.css';

const PaymentHistory = () => {
  const location = useLocation();
  const CustomerID = location.state?.CustomerID;
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [serviceNames, setServiceNames] = useState({});

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const customerRef = doc(db, 'customers', CustomerID);
        const paymentQuery = query(
          collection(db, 'Payment'),
          where('Customer', '==', customerRef)
        );
        const paymentSnapshot = await getDocs(paymentQuery);

        const payments = paymentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Fetch Service Names
        const serviceRequests = payments.map(payment => payment.ServiceRequest.id);
        const serviceDocs = await Promise.all(
          serviceRequests.map(async (srId) => {
            const serviceDoc = await getDocs(query(collection(db, 'ServiceRequest'), where('__name__', '==', srId)));
            return serviceDoc.empty ? null : serviceDoc.docs[0].data();
          })
        );

        const serviceNamesMap = {};
        serviceDocs.forEach((serviceDoc, index) => {
          if (serviceDoc) {
            serviceNamesMap[serviceRequests[index]] = serviceDoc.Service;
          }
        });

        setPaymentHistory(payments);
        setServiceNames(serviceNamesMap);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      }
    };

    if (CustomerID) fetchPaymentHistory();
  }, [CustomerID]);

  return (
    <div className="payment-history-container">
      <h2>Payment History</h2>
      <table className="payment-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Service</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((payment) => (
            <tr key={payment.id}>
              <td>{new Date(payment.Date.seconds * 1000).toLocaleDateString()}</td>
              <td>₹{payment.Amount}</td>
              <td>{payment.PaymentMethod}</td>
              <td>{serviceNames[payment.ServiceRequest.id] || 'Unknown Service'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
