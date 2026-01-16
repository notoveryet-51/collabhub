import React, { useEffect, useState } from "react";
import "./Home.css";

function Home() {
  // 1. STATE: To store the data from MongoDB
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. EFFECT: Fetch data when page loads
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch from your Backend API
        const response = await fetch('http://localhost:5000/api/posts'); 
        const data = await response.json();
        
        setPosts(data); // Save the real data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Helper to format date (e.g., "2 hours ago" or "Jan 15")
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      {/* NAVBAR (Kept exactly as yours) */}
      <div className="navbar">
        <div className="logo">Collab-Hub</div>

        <div className="nav-links">
          <a className="nav-item active" href="/Home"> Home</a>
          <a className="nav-item" href="/Dashboard"> Dashboard</a>
          <a className="nav-item" href="/profile"> Profile</a>
          <a className="nav-item" href="/create"> Create Request</a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container">
        <h1>Available Study Requests</h1>
        <p className="subtitle">
          Browse and join study sessions posted by fellow students
        </p>

        <input
          className="search-box"
          type="text"
          placeholder="Search by subject or topic..."
        />

        {/* LOGIC: Show Loading or The Real Cards */}
        {loading ? (
          <p style={{textAlign: 'center', color: '#666'}}>Loading requests...</p>
        ) : (
          <div className="cards">
            
            {/* 3. MAP: Loop through the real posts from MongoDB */}
            {posts.length > 0 ? (
              posts.map((post) => (
                <div className="card" key={post._id}>
                  {/* Since we haven't added 'Tags' to backend yet, we default to 'General' or 'Study' */}
                  <span className="tag">Study Request</span>
                  
                  <h3>{post.title}</h3>
                  
                  <p>
                    {post.description}
                  </p>
                  
                  <div className="card-footer">
                    {/* Display Real Time */}
                    <span>⏰ {formatDate(post.createdAt)}</span>
                    
                    {/* Display Real Author Name from populated User data */}
                    <span>👤 {post.user ? post.user.name : "Anonymous"}</span>
                  </div>
                  
                  <button className="btn">Join Study Session</button>
                </div>
              ))
            ) : (
              // Fallback if database is empty
              <div style={{gridColumn: "1 / -1", textAlign: "center", color: "#666"}}>
                <p>No active study requests found. Be the first to create one!</p>
              </div>
            )}

            {/* OPTIONAL: If you want to keep your hardcoded cards as examples 
               below the real ones, you can paste them here. 
               Otherwise, the code above replaces them dynamically.
            */}
            
          </div>
        )}
      </div>
    </>
  );
}

export default Home;