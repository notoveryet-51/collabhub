import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import shape from './images/shape.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [streak, setStreak] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("userLoggedIn") === "true");

  // Firebase Auth Listener: Ye check karega ki user waqai logged in hai ya nahi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem("userLoggedIn", "true");
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("userLoggedIn");
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Streak Listener (Sirf tab chalega jab user logged in ho)
  useEffect(() => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setStreak(doc.data().streak || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userLoggedIn");
      setIsLoggedIn(false);
      navigate("/"); // Logout ke baad Home page par bhej dega
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo-placeholder" style={{ textDecoration: 'none' }}>
          <img className="shape" src={shape} alt="CollabHub" height="40" width="40" />
          <div className="block">COLLABHUB</div>
        </Link>
      </div>

      <div className="nav-right">
        {/* Home Link hamesha dikhega */}
        <button 
          className={`cta-button ${isActive("/") ? "active-cta" : ""}`} 
          onClick={() => navigate("/")}
        >
          Home
        </button>
        
        {/* Protected Links: Sirf Login ke baad dikhenge */}
        {isLoggedIn ? (
          <>
            <button 
              className={`cta-button ${isActive("/Dashboard") ? "active-cta" : ""}`} 
              onClick={() => navigate("/Dashboard")}
            >
              Dashboard
            </button>
            
            <button 
              className={`cta-button ${isActive("/Profile") ? "active-cta" : ""}`} 
              onClick={() => navigate("/Profile")}
            >
              Profile
            </button>

            <button 
              className={`cta-button ${isActive("/CreateRequest") ? "active-cta" : ""}`} 
              onClick={() => navigate("/CreateRequest")}
            >
              Create Request
            </button>

            {/* Logout Button */}
            <button className="cta-button logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          /* Login Button: Agar user logged in nahi hai tab dikhao */
          <button 
            className={`cta-button ${isActive("/login") ? "active-cta" : ""}`} 
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;