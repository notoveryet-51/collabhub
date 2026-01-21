import React, { useState } from 'react';
import './Dashboard.css';

// --- Sub-Component: Feed Item (Hackathon/Event Card) ---
// We separate this so each card can manage its own "Liked" state independently
const FeedCard = ({ title, detail, date }) => {
  const [isLiked, setIsLiked] = useState(false);

  // Icon URLs from your prompt
  const iconEmpty = "https://cdn.jsdelivr.net/npm/remixicon@4.8.0/icons/Health & Medical/heart-3-line.svg";
  const iconFilled = "https://cdn.jsdelivr.net/npm/remixicon@4.8.0/icons/Health & Medical/heart-3-fill.svg";

  return (
    <div className="card feed-card">
      <div className="card-content">
        <h4>{title}</h4>
        <p>{detail}</p>
        <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>{date}</small>
      </div>
      
      {/* Wishlist Toggle Icon */}
      <img 
        src={isLiked ? iconFilled : iconEmpty} 
        alt="wishlist" 
        className="wishlist-icon"
        onClick={() => setIsLiked(!isLiked)} 
      />
    </div>
  );
};

const Dashboard = () => {
  // --- Mock Data ---
  const hackathons = [
    { id: 1, title: "CodeForIndia 2026", detail: "National level open innovation challenge.", date: "Feb 20, 2026" },
    { id: 2, title: "AI Gen Hack", detail: "Build the future of Generative AI.", date: "March 05, 2026" },
    { id: 3, title: "Web3 Summit", detail: "Decentralized apps marathon.", date: "April 10, 2026" },
  ];

  const events = [
    { id: 1, title: "React Dev Meetup", detail: "Networking with senior developers.", date: "Tomorrow, 5 PM" },
    { id: 2, title: "CyberSec Workshop", detail: "Hands-on ethical hacking session.", date: "This Weekend" },
  ];

  const suggestions = [
    { id: 1, name: "Rahul Verma", role: "Frontend Developer" },
    { id: 2, name: "Priya Singh", role: "UI/UX Designer" },
    { id: 3, name: "Amit Kumar", role: "Data Scientist" },
  ];

  return (
    <>
      

      {/* --- 2. Main Layout (3 Columns) --- */}
      <div className="dashboard-container">
        
        {/* --- Left Sidebar (Fixed 25%) --- */}
        <aside className="sidebar-left">
          {/* User Intro Card */}
          <div className="card">
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ marginBottom: '5px' }}>Welcome, Alex!</h3>
              <p style={{ color: '#666' }}>MNNIT Allahabad</p>
            </div>
          </div>

          {/* Filter/Connection UI */}
          <div className="card">
            <h4>Find Connections</h4>
            <div className="filter-group">
              <span className="filter-label">Region</span>
              <select style={{ padding: '5px', borderRadius: '4px' }}>
                <option>All Regions</option>
                <option>North India</option>
                <option>South India</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Interest</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <label><input type="checkbox" /> React</label>
                <label><input type="checkbox" /> AI/ML</label>
                <label><input type="checkbox" /> Design</label>
              </div>
            </div>
          </div>
        </aside>

        {/* --- Middle Section (Scrollable 50%) --- */}
        <main className="feed-middle">
          
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-number">142</span>
              <span className="stat-label">Interactions</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">5</span>
              <span className="stat-label">Hackathons</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">8</span>
              <span className="stat-label">Events</span>
            </div>
          </div>

          {/* Search Bar */}
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search Hackathons, Events, or Topics..." 
          />

          {/* Hackathons Feed */}
          <h3 className="section-header">Upcoming Hackathons</h3>
          <div className="feed-list">
            {hackathons.map((hack) => (
              <FeedCard 
                key={hack.id} 
                title={hack.title} 
                detail={hack.detail} 
                date={hack.date} 
              />
            ))}
          </div>

          {/* Events Feed */}
          <h3 className="section-header">Events Near You</h3>
          <div className="feed-list">
            {events.map((evt) => (
              <FeedCard 
                key={evt.id} 
                title={evt.title} 
                detail={evt.detail} 
                date={evt.date} 
              />
            ))}
          </div>
          
          {/* Extra spacer to demonstrate scrolling */}
          <div style={{ height: '50px', textAlign: 'center', color: '#ccc', paddingTop: '20px' }}>
            -- End of Feed --
          </div>

        </main>

        {/* --- Right Sidebar (Fixed 25%) --- */}
        <aside className="sidebar-right">
          
          {/* Trending Section */}
          <div className="card">
            <h4>Trending Now 📈</h4>
            <ul style={{ listStyle: 'none', marginTop: '10px', paddingLeft: '5px' }}>
              <li style={{ marginBottom: '8px', fontSize: '0.9rem' }}>#MNNIT_Hackathon</li>
              <li style={{ marginBottom: '8px', fontSize: '0.9rem' }}>#React19Updates</li>
              <li style={{ marginBottom: '8px', fontSize: '0.9rem' }}>#SummerInternships</li>
            </ul>
          </div>

          {/* Suggestions Section */}
          <div className="card">
            <h4>Suggestions For You</h4>
            <div className="suggestion-list" style={{ marginTop: '15px' }}>
              {suggestions.map((user) => (
                <div key={user.id} className="suggestion-item">
                  <div className="suggestion-avatar"></div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{user.name}</div>
                    <div className="suggestion-role">{user.role}</div>
                  </div>
                  <button className="connect-btn">Collaborate</button>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </>
  );
};

export default Dashboard;