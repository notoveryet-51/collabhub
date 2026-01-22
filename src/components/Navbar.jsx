import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import shape from "./images/shape.png";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [streak, setStreak] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("userLoggedIn") === "true"
  );
  const [userPhoto, setUserPhoto] = useState(null);

  // 🔐 Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem("userLoggedIn", "true");
        setUserPhoto(
          user.photoURL ||
            `https://ui-avatars.com/api/?name=${user.email}&background=random`
        );
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("userLoggedIn");
        setUserPhoto(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔥 Streak listener
  useEffect(() => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setStreak(snap.data().streak || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="logo-placeholder" style={{ textDecoration: "none" }}>
          <img src={shape} alt="CollabHub" height="40" width="40" />
          <div className="block">COLLABHUB</div>
        </Link>
      </div>

      {/* RIGHT */}
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
              className={`cta-button ${
                isActive("/CreateRequest") ? "active-cta" : ""
              }`}
              onClick={() => navigate("/CreateRequest")}
            >
              Create Request
            </button>

            {/* 🌗 Theme Toggle */}
            <ThemeToggle />

            {/* 👤 Profile */}
            <div
              className="nav-profile-wrapper"
              onClick={() => navigate("/Profile")}
            >
              <img
                src={userPhoto}
                alt="User Profile"
                className={`nav-profile-img ${
                  isActive("/Profile") ? "active-img" : ""
                }`}
              />
            </div>
          </>
        ) : (
          <>
            <ThemeToggle />
            <button
              className={`cta-button ${isActive("/login") ? "active-cta" : ""}`}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
