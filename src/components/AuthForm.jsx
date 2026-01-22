import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";
import name from './images/webName.png';
import hex from './images/shape.png';

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

  // ---------------- HELPER: SYNC WITH MONGODB ----------------
  const syncWithBackend = async (user) => {
    try {
      await fetch("http://localhost:5000/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || signupName || "Collab Student",
          photoURL: user.photoURL
        }),
      });
      console.log("✅ Synced user to MongoDB");
    } catch (error) {
      console.error("❌ Backend Sync Failed:", error);
    }
  };

  // ---------------- ERROR MAPPING ----------------
  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "Email already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Invalid email address.";
      default:
        return "Something went wrong. Try again.";
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      
      // 1. Sync with MongoDB immediately after login
      await syncWithBackend(userCredential.user);

      navigate("/Home");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );

      // 2. Set the Display Name in Firebase
      await updateProfile(userCredential.user, {
        displayName: signupName,
      });

      // 3. Sync with MongoDB
      await syncWithBackend(userCredential.user);

      navigate("/Home");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setError("Enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setError("Password reset email sent.");
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
  };

  // ---------------- GOOGLE ----------------
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // 4. Sync Google User
      await syncWithBackend(result.user);
      
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GITHUB ----------------
  const handleGithubLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      
      // 5. Sync Github User
      await syncWithBackend(result.user);
      
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="margin">

        <img className="shape1" src={hex} alt="CollabHub" height="72" width="78" />
       
        <img className="logo" src={name} alt="CollabHub" height="60" width="300" />   
      
      
      <div className="container1">
        <ul className="circles"> {/* Corrected: class -> className */}
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

          {/* LOGIN */}
          {activeTab === "login" && (
            <form className="form-container" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
              />

              <button type="submit" disabled={loading}>
                <i className="fa-solid fa-envelope"></i>&nbsp;
                {loading ? "Logging in..." : "Login with Email"}
              </button>

              <p className="forgot" onClick={handleForgotPassword}>
                Forgot password?
              </p>

              <div className="oauth-buttons">
                <button type="button" disabled={loading} onClick={handleGoogleLogin}>
                  <i className="fa-brands fa-google"></i> Continue with Google
                </button>
                <button type="button" disabled={loading} onClick={handleGithubLogin}>
                  <i className="fa-brands fa-github"></i> Continue with GitHub
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP */}
          {activeTab === "signup" && (
            <form className="form-container" onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required 
              />

              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required 
              />

              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required 
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                required 
              />

              <button type="submit" disabled={loading}>
                <i className="fa-solid fa-user-plus"></i>&nbsp;
                {loading ? "Creating account..." : "Sign Up with Email"}
              </button>

              <div className="oauth-buttons">
                <button type="button" disabled={loading} onClick={handleGoogleLogin}>
                  <i className="fa-brands fa-google"></i> Continue with Google
                </button>
                <button className="github" type="button" disabled={loading} onClick={handleGithubLogin}>
                  <i className="fa-brands fa-github"></i> Continue with GitHub
                </button>
              </div>
            </form>
          )}

          {/* Error */}
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      {/* Removed orphan </> tag here */}
    </div>
  );
};

export default AuthForm;