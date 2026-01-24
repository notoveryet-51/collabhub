import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

const ProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <img
        src={user.photo || "/avatar.png"}
        alt=""
        width={100}
        height={100}
        style={{ borderRadius: "50%" }}
      />

      <h2>{user.name}</h2>
      <p><strong>Email:</strong> {user.email}</p>

      {user.location?.college && (
        <p><strong>College:</strong> {user.location.college}</p>
      )}

      {user.interests?.length > 0 && (
        <>
          <h4>Interests</h4>
          <ul>
            {user.interests.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </>
      )}

      {user.badges?.length > 0 && (
        <>
          <h4>Badges</h4>
          <ul>
            {user.badges.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
