import { useEffect, useState } from "react";
import api from "../api/api";

const SearchBar = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/search?q=${query}`);
        setResults(res.data.users || []);
      } catch (err) {
        console.error("Search failed", err);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchUsers, 400);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search students, interests, college..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      {loading && <p>Searching...</p>}

      {results.length > 0 && (
        <div className="search-dropdown">
          {results.map((user) => (
            <div
              key={user._id}
              onClick={() => onSelectUser(user._id)}
              style={{ cursor: "pointer", padding: "8px" }}
            >
              <img
                src={user.photo || "/avatar.png"}
                alt=""
                width={32}
                height={32}
                style={{ borderRadius: "50%", marginRight: "8px" }}
              />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
