import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateRequest from "./components/CreateRequest";
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="App">
      {/* Navbar hamesha dikhao, bas Login page par chhupa sakte ho */}
      {location.pathname !== "/login" && <Navbar />}

      <Routes>
        {/* 1. Public Route: Jo har koi dekh sakta hai */}
        <Route path="/" element={<Home />} />
        
        {/* 2. Login Route */}
        <Route path="/login" element={<AuthForm />} />

        {/* 3. Protected Routes: In par click karte hi agar login nahi hai to redirect hoga */}
        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route 
          path="/Profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/CreateRequest" 
          element={
            <PrivateRoute>
              <CreateRequest />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;