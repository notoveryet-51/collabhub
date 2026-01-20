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
import EditProfileModal from "./EditProfileModal";
import "./Profile.css";
import "./Home.css";

const Profile = () => {
  const navigate = useNavigate();

  // ---------- Local Profile Data ----------
  const [user, setUser] = useState({
    name: "User",
    email: "",
    photo: null,
    location: { city: "", college: "" },
    interests: []
  });

  const [firebaseUser, setFirebaseUser] = useState(null);

  // ---------- Phone Verification States ----------
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- Edit Modal ----------
  const [isEditing, setIsEditing] = useState(false);

  // ---------- Load Local Profile ----------
  useEffect(() => {
    const savedData = localStorage.getItem("userLoggedIn");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUser({
        name: parsed.name || "User",
        email: parsed.email || "",
        photo: parsed.photo || null,
        location: parsed.location || {},
        interests: parsed.interests || []
      });
    }
  }, []);

  // ---------- Firebase Auth Listener ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/");
      setFirebaseUser(u);
    });
    return () => unsub();
  }, [navigate]);

  // ---------- Setup reCAPTCHA ----------
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" },
      auth
    );
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // ---------- Save Profile ----------
  const handleSaveProfile = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem("userLoggedIn", JSON.stringify(updated));
  };

  // ---------- Send OTP ----------
  const sendOtp = async () => {
    setPhoneError("");

    if (!phone.startsWith("+") || phone.length < 10) {
      setPhoneError("Enter valid phone with country code (e.g. +91...)");
      return;
    }

    try {
      setLoading(true);

      // ---------- TEST NUMBER SUPPORT ----------
      if (phone === "+919874826944") {
        setVerificationId("TEST_VERIFICATION_ID");
        setOtpSent(true);
        alert("✅ Test OTP sent! Use 123456 for verification.");
        return;
      }

      setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setVerificationId(confirmationResult.verificationId);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setPhoneError(
        "Failed to send OTP. Make sure phone auth is enabled and use test numbers on localhost."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- Verify OTP ----------
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setPhoneError("Enter valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      // ---------- TEST NUMBER VERIFICATION ----------
      if (phone === "+919874826944" && otp === "123456") {
        alert("✅ Phone number verified successfully (test number)!");
        setOtpSent(false);
        setOtp("");
        setPhone("");
        return;
      }

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await linkWithCredential(auth.currentUser, credential);
      alert("✅ Phone number verified successfully!");
      setOtpSent(false);
      setOtp("");
      setPhone("");
    } catch (err) {
      console.error(err);
      setPhoneError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPhoneVerified = !!firebaseUser?.phoneNumber;

  return (
    <>
      {/* Invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your personal information</p>

        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar-section">
            {user.photo ? (
              <img src={user.photo} alt="profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar">{user.name.charAt(0)}</div>
            )}
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          {/* Info */}
          <div className="profile-info-grid">
            <div className="info-box">
              <span className="label">College</span>
              <span>{user.location?.college || "Not set"}</span>
            </div>
            <div className="info-box">
              <span className="label">City</span>
              <span>{user.location?.city || "Not set"}</span>
            </div>
            <div className="info-box">
              <span className="label">Interests</span>
              <span>
                {user.interests.length > 0
                  ? user.interests.join(", ")
                  : "Add Interests"}
              </span>
            </div>
          </div>

          {/* Phone Verification */}
          <div className="phone-verification">
            <h3>Phone Verification</h3>

            {isPhoneVerified ? (
              <p style={{ color: "green" }}>✅ Verified: {firebaseUser.phoneNumber}</p>
            ) : (
              <>
                {!otpSent ? (
                  <>
                    <input
                      type="text"
                      placeholder="+91XXXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <button onClick={sendOtp} disabled={loading}>
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={verifyOtp} disabled={loading}>
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </>
                )}
                {phoneError && <p style={{ color: "red" }}>{phoneError}</p>}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default Profile;
