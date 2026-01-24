import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const UserSuggestions = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get("/users/suggestions");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to load suggestions", err);
      }
    };

    fetchSuggestions();
  }, []);

  if (users.length === 0) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Suggested Collaborators</h3>

      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => navigate(`/profile/${user._id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          <img
            src={user.photo || "/avatar.png"}
            alt=""
            width={40}
            height={40}
            style={{ borderRadius: "50%", marginRight: "10px" }}
          />
          <div>
            <strong>{user.name}</strong>
            {user.location?.college && (
              <p style={{ fontSize: "12px" }}>{user.location.college}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSuggestions;
