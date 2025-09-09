import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';
import '../Assets/ForgotPassword.css';
import { v4 as uuidv4 } from 'uuid'; // For unique OTP doc ID

function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verify OTP
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [otpDocId, setOtpDocId] = useState('');

  const sendOtp = async () => {
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60000)); // 5 min expiry
      const docId = uuidv4();

      // Store OTP in Firestore
      await setDoc(doc(db, 'otp_verifications', docId), {
        username,
        otp: generatedOtp,
        expiresAt,
      });

      setOtpDocId(docId);
      setServerOtp(generatedOtp); // For demo only; don't expose in production!

      // Simulate email send (Replace with actual email service)
      alert(`OTP Sent: ${generatedOtp}`); // Replace with email/SMS

      setStep(2);
    } catch (error) {
      console.error('Error sending OTP:', error);
      Swal.fire('Error', 'Could not send OTP. Try again.', 'error');
    }
  };

  const verifyOtpAndReset = async () => {
    try {
      const otpRef = doc(db, 'otp_verifications', otpDocId);
      const otpSnap = await getDocs(query(collection(db, 'otp_verifications'), where('username', '==', username)));

      if (!otpSnap.empty) {
        const data = otpSnap.docs[0].data();
        if (otp !== data.otp) {
          return Swal.fire('Error', 'Invalid OTP', 'error');
        }

        if (Timestamp.now().toMillis() > data.expiresAt.toMillis()) {
          return Swal.fire('Error', 'OTP expired', 'error');
        }

        const userSources = [
          { collection: 'Admin', field: 'UserName' },
          { collection: 'Technician', field: 'UserName' },
          { collection: 'customers', field: 'User_Name' },
        ];

        let userFound = false;

        for (const source of userSources) {
          const q = query(collection(db, source.collection), where(source.field, '==', username));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = doc(db, source.collection, querySnapshot.docs[0].id);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await updateDoc(docRef, { Password: hashedPassword });

            Swal.fire('Success', 'Password reset successfully!', 'success');
            userFound = true;
            break;
          }
        }

        if (!userFound) {
          Swal.fire('Error', 'User not found.', 'error');
        }
      } else {
        Swal.fire('Error', 'OTP record not found.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Something went wrong.', 'error');
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      <input
        type="text"
        placeholder="Enter your Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {step === 1 && (
        <button onClick={sendOtp}>Send OTP</button>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={verifyOtpAndReset}>Verify & Reset</button>
        </>
      )}
    </div>
  );
}

export default ForgotPassword;
