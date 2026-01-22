import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import shape from './images/shape.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [streak, setStreak] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("userLoggedIn") === "true");
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem("userLoggedIn", "true");
        // Firebase se photo fetch kar rahe hain, agar nahi hai toh default initial dikhayega
        setUserPhoto(user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("userLoggedIn");
        setUserPhoto(null);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo-placeholder" style={{ textDecoration: 'none' }}>
          <img className="shape" src={shape} alt="CollabHub" height="40" width="43" />
          <div className="block">COLLABHUB</div>
        </Link>
      </div>

      <div className="nav-right">
        <button 
          className={`cta-button ${isActive("/") ? "active-cta" : ""}`} 
          onClick={() => navigate("/")}
        >
          Home
        </button>
        
        {isLoggedIn ? (
          <>
            <button 
              className={`cta-button ${isActive("/Dashboard") ? "active-cta" : ""}`} 
              onClick={() => navigate("/Dashboard")}
            >
              Dashboard
            </button>

            <button 
              className={`cta-button ${isActive("/CreateRequest") ? "active-cta" : ""}`} 
              onClick={() => navigate("/CreateRequest")}
            >
              Create Request
            </button>

            {/* Profile Image - Sabse right mein aur click karne par Profile par le jayega */}
            <div className="nav-profile-wrapper" onClick={() => navigate("/Profile")}>
               <img 
                 src={userPhoto} 
                 alt="User Profile" 
                 className={`nav-profile-img ${isActive("/Profile") ? "active-img" : ""}`} 
               />
            </div>
          </>
        ) : (
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