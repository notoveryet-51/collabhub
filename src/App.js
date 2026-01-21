import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateRequest from "./components/CreateRequest";
import Chatbot from "./components/chatbot";

import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="App">
      {/* Navbar hidden only on login page */}
      {location.pathname !== "/login" && <Navbar />}

      {/* Chatbot visible on all pages */}
      <Chatbot />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthForm />} />

        {/* Protected Routes */}
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
