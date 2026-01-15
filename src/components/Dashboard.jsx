import React from "react";
import "./Dashboard.css";

function Dashboard() {
  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">Collab-Hub</div>

        <div className="nav-links">
          <a className="nav-item" href="/Home">🏠 Home</a>
          <a className="nav-item active" href="/dashboard">📊 Dashboard</a>
          <a className="nav-item" href="/profile">👤 Profile</a>
          <a className="nav-item" href="/create">➕ Create Request</a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container">
        <h1>Dashboard</h1>
        <p className="subtitle">Overview of your study activity</p>

        {/* STATS */}
        <div className="stats">
          <div className="stat-card">
            <h2>5</h2>
            <p>Study Sessions Joined</p>
          </div>

          <div className="stat-card">
            <h2>2</h2>
            <p>Requests Created</p>
          </div>

          <div className="stat-card">
            <h2>1</h2>
            <p>Pending Requests</p>
          </div>

          <div className="stat-card">
            <h2>3</h2>
            <p>Completed Sessions</p>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="recent">
          <h2>Recent Activity</h2>

          <div className="recent-item">
            ✔ Joined “Binary Trees Study Session”
          </div>

          <div className="recent-item">
            ✔ Created request “Calculus Integration Practice”
          </div>

          <div className="recent-item">
            ✔ Completed “Quantum Mechanics Group Study”
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
