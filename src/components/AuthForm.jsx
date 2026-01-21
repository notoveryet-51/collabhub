import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";
import name from './images/logo.png';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  // ---------------- HELPER: SAVE USER & SYNC ----------------
  const saveAndSyncUser = async (user) => {
    // 1. LocalStorage update karein
    localStorage.setItem("userLoggedIn", "true");
    
    // 2. MongoDB sync logic
    try {
      await fetch("http://localhost:5000/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0]
        }),
      });
    } catch (error) {
      console.error("Backend Sync Failed:", error);
      // Backend fail ho bhi jaye to hum user ko website use karne denge
    }
  };

  // ---------------- ERROR MAPPING ----------------
  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/wrong-password": return "Incorrect password.";
      case "auth/email-already-in-use": return "Email already registered.";
      case "auth/weak-password": return "Password should be at least 6 characters.";
      case "auth/invalid-email": return "Invalid email address.";
      case "auth/popup-closed-by-user": return "Login cancelled by user."; // Added this
      case "auth/cancelled-popup-request": return "One login request is already pending."; // Added this
      default: return "Something went wrong. Try again.";
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      await saveAndSyncUser(result.user);
      navigate("/"); 
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await updateProfile(userCredential.user, { displayName: signupName });
      await saveAndSyncUser(userCredential.user);
      navigate("/"); 
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- OAUTH (GOOGLE & GITHUB) ----------------
  const handleOAuthLogin = async (provider) => {
    if (loading) return; // Pending promise fix: Don't start another if one is running
    
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await saveAndSyncUser(result.user);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err.code));
      console.error("OAuth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) { setError("Enter email to reset password."); return; }
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setError("Password reset email sent.");
    } catch (err) { setError(getErrorMessage(err.code)); }
  };

  return ( 
    <div className="margin">
      <img className="logo" src={name} alt="CollabHub" height="230" width="500" />
      <div className="container">
        <ul class="circles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
            </ul>
        <div className="tab-header">
          <div className={`tab ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>Login</div>
          <div className={`tab ${activeTab === "signup" ? "active" : ""}`} onClick={() => setActiveTab("signup")}>Sign Up</div>
        </div>

        {activeTab === "login" && (
          <form className="form-container" onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit" disabled={loading}>
              <i className="fa-solid fa-envelope"></i>&nbsp;
              {loading ? "Logging in..." : "Login with Email"}
            </button>
            <p className="forgot" onClick={handleForgotPassword}>Forgot password?</p>
            <div className="oauth-buttons">
              <button type="button" disabled={loading} onClick={() => handleOAuthLogin(googleProvider)}><i className="fa-brands fa-google"></i> Google</button>
              <button type="button" disabled={loading} onClick={() => handleOAuthLogin(githubProvider)}><i className="fa-brands fa-github"></i> GitHub</button>
            </div>
          </form>
        )}

        {activeTab === "signup" && (
          <form className="form-container" onSubmit={handleSignup}>
            <input type="text" placeholder="Full Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
            <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
            <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
            <button type="submit" disabled={loading}>
              <i className="fa-solid fa-user-plus"></i>&nbsp;
              {loading ? "Creating..." : "Sign Up"}
            </button>
            <div className="oauth-buttons">
              <button type="button" disabled={loading} onClick={() => handleOAuthLogin(googleProvider)}><i className="fa-brands fa-google"></i> Google</button>
              <button type="button" disabled={loading} onClick={() => handleOAuthLogin(githubProvider)}><i className="fa-brands fa-github"></i> GitHub</button>
            </div>
          </form>
        )}

        {error && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{error}</p>}
      </div>
    </div>
  );
};

export default AuthForm;