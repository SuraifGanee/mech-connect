// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail", // Use any email service
  auth: {
    user: "your-email@gmail.com", // Replace with your email
    pass: "your-email-password", // Replace with your email password or app password
  },
});

exports.sendOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;
  const otp = uuidv4().slice(0, 6); // Generate a 6-character OTP

  // Store OTP in Firestore for validation later
  const otpRef = admin.firestore().collection("passwordResetRequests").doc(email);
  await otpRef.set({
    otp,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const mailOptions = {
    from: "your-email@gmail.com", // Replace with your email
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new functions.https.HttpsError("internal", "Error sending OTP email");
  }
});
