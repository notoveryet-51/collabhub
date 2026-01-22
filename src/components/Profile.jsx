// src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signOut,
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInWithPhoneNumber
} from "firebase/auth";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // ---------- Profile State ----------
  const [user, setUser] = useState({
    name: "User",
    email: "",
    photo: null,
    location: { city: "", college: "" },
    interests: []
  });

  const [firebaseUser, setFirebaseUser] = useState(null);
  
  // Input fields state
  const [editFields, setEditFields] = useState({
    college: "",
    city: "",
    interests: ""
  });

  // ---------- Phone Verification States ----------
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- 1. SYNC DATA FROM DATABASE ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/");
        return;
      }
      setFirebaseUser(u);

      try {
        // FETCH FROM MONGODB API
        const response = await fetch(`http://localhost:5000/api/user/${u.uid}`);
        
        if (response.ok) {
          const dbUser = await response.json();
          
          // Update State with DB Data
          setUser({
            name: dbUser.displayName || u.displayName || "User",
            email: dbUser.email,
            photo: dbUser.photoURL,
            location: dbUser.location || { city: "", college: "" },
            interests: dbUser.interests || []
          });

          // Pre-fill the input boxes
          setEditFields({
            college: dbUser.location?.college || "",
            city: dbUser.location?.city || "",
            interests: dbUser.interests ? dbUser.interests.join(", ") : ""
          });
        }
      } catch (err) {
        console.error("Failed to load profile from DB:", err);
      }
    });
    return () => unsub();
  }, [navigate]);

  // ---------- Handlers ----------
  const handleInputChange = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  // ---------- 2. SAVE TO DATABASE ----------
  const handleSaveProfile = async () => {
    if (!firebaseUser) return;

    // Convert comma-separated string back to array
    const interestArray = editFields.interests.split(",").map(i => i.trim()).filter(i => i !== "");

    // Prepare the payload for MongoDB
    const updatedData = {
      uid: firebaseUser.uid,
      displayName: user.name,
      photoURL: user.photo,
      location: { 
        city: editFields.city, 
        college: editFields.college 
      },
      interests: interestArray
    };

    try {
      // SEND PUT REQUEST TO BACKEND
      const response = await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const savedUser = await response.json();
        
        // Update local UI immediately
        setUser({
            ...user,
            location: savedUser.location,
            interests: savedUser.interests
        });
        
        // Also update LocalStorage as a backup
        localStorage.setItem("userLoggedIn", JSON.stringify(savedUser));
        
        alert("✅ Profile updated successfully in Database!");
      } else {
        alert("❌ Failed to update profile in database.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("❌ Server Error: Check if backend is running.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // ---------- Firebase Phone Logic (Kept Same) ----------
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", { size: "invisible" }, auth);
  };

  const sendOtp = async () => {
    setPhoneError("");
    if (!phone.startsWith("+") || phone.length < 10) {
      setPhoneError("Use format +91XXXXXXXXXX");
      return;
    }
    try {
      setLoading(true);
      if (phone === "+919874826944") {
        setVerificationId("TEST_ID");
        setOtpSent(true);
        return;
      }
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setVerificationId(result.verificationId);
      setOtpSent(true);
    } catch (err) { setPhoneError("Failed to send OTP."); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential);
      alert("✅ Phone Verified!");
      setOtpSent(false);
    } catch (err) { setPhoneError("Invalid OTP."); }
    finally { setLoading(false); }
  };

  const isPhoneVerified = !!firebaseUser?.phoneNumber;

  return (
    <div className="profile-page">
      <div id="recaptcha-container"></div>
      
      <h1 className="profile-title">Account Settings</h1>
      <p className="profile-subtitle">Update your profile and security settings</p>

      <div className="profile-card">
        {/* Header Section */}
        <div className="profile-avatar-section">
          <div className="avatar-box">
          {user.photo ? (
            <img src={user.photo} alt="profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{user.name.charAt(0)}</div>
          )}
          </div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>

        {/* Details Section */}
        <div className="profile-info-grid">
          <div className="info-box">
            <span className="label">College Name</span>
            <input 
              type="text" 
              name="college"
              value={editFields.college}
              onChange={handleInputChange}
              placeholder="e.g. IIT Delhi"
              className="profile-input"
            />
          </div>
          <div className="info-box">
            <span className="label">City</span>
            <input 
              type="text" 
              name="city"
              value={editFields.city}
              onChange={handleInputChange}
              placeholder="e.g. Mumbai"
              className="profile-input"
            />
          </div>
          <div className="info-box full-width">
            <span className="label">Interests (Separated by commas)</span>
            <input 
              type="text" 
              name="interests"
              value={editFields.interests}
              onChange={handleInputChange}
              placeholder="Coding, Design, Marketing"
              className="profile-input"
            />
          </div>
        </div>

        {/* Verification Section */}
        <div className="phone-verification">
          <span className="label">Phone Security</span>
          {isPhoneVerified ? (
            <p className="verified-status">✅ Verified: {firebaseUser.phoneNumber}</p>
          ) : (
            <div className="otp-container">
              {!otpSent ? (
                <>
                  <input type="text" placeholder="+91..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <button onClick={sendOtp} disabled={loading} className="verify-btn">Send OTP</button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button onClick={verifyOtp} disabled={loading} className="verify-btn">Verify</button>
                </>
              )}
            </div>
          )}
          {phoneError && <p className="error-text">{phoneError}</p>}
        </div>

        {/* Footer Actions */}
        <div className="profile-actions">
          <button onClick={handleSaveProfile} className="save-btn">Update Profile</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;