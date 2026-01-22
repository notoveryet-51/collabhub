import React, { useState, useEffect } from 'react';
import { auth } from "../firebase"; 
import './Dashboard.css';

// --- Feed Item Component (With Heart Logic) ---
const FeedCard = ({ id, title, detail, date, isLiked, onToggleLike }) => {
  const iconEmpty = "https://cdn.jsdelivr.net/npm/remixicon@4.8.0/icons/Health & Medical/heart-3-line.svg";
  const iconFilled = "https://cdn.jsdelivr.net/npm/remixicon@4.8.0/icons/Health & Medical/heart-3-fill.svg";

  return (
    <div className="card feed-card">
      <div className="card-content">
        <h4>{title}</h4>
        <p>{detail}</p>
        <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
            {new Date(date).toDateString()}
        </small>
      </div>
      
      {/* Wishlist Toggle Icon */}
      <img 
        src={isLiked ? iconFilled : iconEmpty} 
        alt="like" 
        className="wishlist-icon"
        onClick={() => onToggleLike(id)} 
      />
    </div>
  );
};

const Dashboard = () => {
  // --- 1. State for Real Data ---
  const [user, setUser] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState([]); // <--- MERGED: Stores incoming requests
  const [stats, setStats] = useState({ streak: 0, hackathonsParticipated: 0, eventsParticipated: 0 });
  const [favorites, setFavorites] = useState([]); 

  // --- 2. Filter & Search State ---
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [searchTerm, setSearchTerm] = useState("");

  // --- 3. Load Data on Startup ---
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      setUser(currentUser);

      try {
        // A. Get User (Favorites & Friend Requests)
        const userRes = await fetch(`http://localhost:5000/api/user/${currentUser.uid}`);
        const userData = await userRes.json();
        setFavorites(userData.favorites || []);
        setRequests(userData.friendRequests || []); // <--- MERGED: Load Requests

        // B. Get Stats
        const statsRes = await fetch(`http://localhost:5000/api/dashboard/stats/${currentUser.uid}`);
        if(statsRes.ok) setStats((await statsRes.json()).stats);

        // C. Get Hackathons & Events
        const hackRes = await fetch('http://localhost:5000/api/dashboard/hackathons');
        if(hackRes.ok) setHackathons(await hackRes.json());

        const eventRes = await fetch('http://localhost:5000/api/dashboard/events');
        if(eventRes.ok) setEvents(await eventRes.json());

        // D. Get Suggestions
        const suggRes = await fetch(`http://localhost:5000/api/dashboard/suggestions/${currentUser.uid}`);
        if(suggRes.ok) setSuggestions(await suggRes.json());

      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };
    fetchData();
  }, []);

  // --- 4. ACTIONS ---

  // Handle Search
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      const res = await fetch(`http://localhost:5000/api/dashboard/search?q=${term}`);
      const data = await res.json();
      setHackathons(data.hackathons);
    } else if (term.length === 0) {
      // Reload original list
      const res = await fetch('http://localhost:5000/api/dashboard/hackathons');
      setHackathons(await res.json());
    }
  };

  // Handle Like/Heart
  const toggleLike = async (itemId) => {
    // Optimistic UI update
    const isLiked = favorites.includes(itemId);
    let newFavs = isLiked ? favorites.filter(id => id !== itemId) : [...favorites, itemId];
    setFavorites(newFavs);

    // Save to Backend
    await fetch("http://localhost:5000/api/user/favorite", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, itemId })
    });
  };

  // Send Request (Connect)
  const handleConnect = async (targetUid, name) => {
    const note = prompt(`Send request to ${name}? Add a note:`);
    if(!note) return;

    const res = await fetch('http://localhost:5000/api/user/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderUid: user.uid, receiverUid: targetUid, note })
    });
    alert((await res.json()).message);
  };

  // Accept Request (MERGED)
  const handleAccept = async (senderId) => {
    const res = await fetch('http://localhost:5000/api/user/friend-request/respond', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUid: user.uid, senderId, action: 'accept' })
    });
    const data = await res.json();
    setRequests(data.friendRequests); // Update UI: Remove request
    alert("You are now connected! 🤝");
  };

  return (
    <>
      <div className="dashboard-container">
        
        {/* --- Left Sidebar (Fixed 25%) --- */}
        <aside className="sidebar-left">
          <div className="card">
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ marginBottom: '5px' }}>Welcome, {user?.displayName || "Student"}!</h3>
              <p style={{ color: '#666' }}>{user?.email}</p>
            </div>
          </div>

          <div className="card">
            <h4>Find Connections</h4>
            <div className="filter-group">
              <span className="filter-label">Region</span>
              {/* Dynamic Filter */}
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px' }}
              >
                <option>All Regions</option>
                <option>Online</option>
                <option>Offline</option>
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
              <span className="stat-number">{stats.streak}</span>
              <span className="stat-label">Interactions</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats.hackathonsParticipated}</span>
              <span className="stat-label">Hackathons</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{favorites.length}</span>
              <span className="stat-label">Wishlist</span>
            </div>
          </div>

          {/* Search Bar */}
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search Hackathons, Events, or Topics..." 
            value={searchTerm}
            onChange={handleSearch}
          />

          {/* Hackathons Feed */}
          <h3 className="section-header">Upcoming Hackathons</h3>
          <div className="feed-list">
            {hackathons.length > 0 ? (
                hackathons
                .filter(h => regionFilter === "All Regions" || h.mode === regionFilter)
                .map((hack) => (
                <FeedCard 
                    key={hack._id} 
                    id={hack._id}
                    title={hack.title} 
                    detail={hack.description} 
                    date={hack.createdAt} 
                    isLiked={favorites.includes(hack._id)}
                    onToggleLike={toggleLike}
                />
                ))
            ) : (
                <p style={{textAlign: 'center', color: '#888'}}>No hackathons found.</p>
            )}
          </div>

          {/* Events Feed */}
          <h3 className="section-header">Events Near You</h3>
          <div className="feed-list">
            {events.length > 0 ? (
                events.map((evt) => (
                <FeedCard 
                    key={evt._id} 
                    id={evt._id}
                    title={evt.name} 
                    detail={evt.description} 
                    date={evt.date}
                    isLiked={favorites.includes(evt._id)}
                    onToggleLike={toggleLike}
                />
                ))
            ) : (
                <p style={{textAlign: 'center', color: '#888'}}>No events found.</p>
            )}
          </div>
          
          <div style={{ height: '50px', textAlign: 'center', color: '#ccc', paddingTop: '20px' }}>
            -- End of Feed --
          </div>
        </main>

        {/* --- Right Sidebar (Fixed 25%) --- */}
        <aside className="sidebar-right">
          
          {/* --- MERGED: CONNECTION REQUESTS BOX --- */}
          {requests.length > 0 && (
             <div className="card" style={{border: "1px solid #ff9800"}}>
                 <h4>🔔 Pending Requests</h4>
                 <div className="suggestion-list">
                     {requests.map((req) => (
                         <div key={req._id} className="suggestion-item">
                             <div className="suggestion-info">
                                 <div className="suggestion-name">{req.senderName}</div>
                                 <div style={{fontSize:"0.8rem", color:"#666"}}>"{req.note}"</div>
                             </div>
                             <button className="connect-btn" onClick={() => handleAccept(req.senderId)}>
                                 Accept
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
          )}

          <div className="card">
            <h4>Trending Now 📈</h4>
            <ul style={{ listStyle: 'none', marginTop: '10px', paddingLeft: '5px' }}>
              <li style={{ marginBottom: '8px', fontSize: '0.9rem' }}>#MNNIT_Hackathon</li>
              <li style={{ marginBottom: '8px', fontSize: '0.9rem' }}>#React19Updates</li>
            </ul>
          </div>

          {/* Suggestions Section */}
          <div className="card">
            <h4>Suggestions For You</h4>
            <div className="suggestion-list" style={{ marginTop: '15px' }}>
              {suggestions.length > 0 ? suggestions.map((user) => (
                <div key={user._id} className="suggestion-item">
                  <div className="suggestion-avatar">{user.displayName.charAt(0)}</div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{user.displayName}</div>
                    <div className="suggestion-role">{user.location?.city || "Student"}</div>
                  </div>
                  <button 
                    className="connect-btn"
                    onClick={() => handleConnect(user.uid, user.displayName)}
                  >
                    Connect
                  </button>
                </div>
              )) : <p>No suggestions available.</p>}
            </div>
          </div>

        </aside>
      </div>
    </>
  );
};

export default Dashboard;