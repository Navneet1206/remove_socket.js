import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = ({ type, email, mobileNumber, userType }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { email: locationEmail, mobileNumber: locationMobileNumber } = location.state || {};

  const finalEmail = email || locationEmail;
  const finalMobileNumber = mobileNumber || locationMobileNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = type === "email" ? "verify-email-otp" : "verify-mobile-otp";
      const baseUrl = userType === "captain" ? "/captains" : "/users";
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}${baseUrl}/${endpoint}`, {
        email: finalEmail,
        mobileNumber: finalMobileNumber,
        otp,
      });

      if (response.status === 200) {
        if (type === "email") {
          navigate("/verify-mobile-otp", { state: { email: finalEmail, mobileNumber: finalMobileNumber, userType } });
        } else {
          navigate(userType === "captain" ? "/captain-home" : "/home");
        }
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Verify OTP</h2>
        <p className="text-sm text-gray-600 mb-4">
          {type === "email"
            ? `Please enter the OTP sent to your email (${finalEmail}).`
            : `Please enter the OTP sent to your mobile number (${finalMobileNumber}).`}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input
              required
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
