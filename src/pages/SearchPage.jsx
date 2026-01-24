import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const SearchPage = () => {
  const navigate = useNavigate();

  const handleUserSelect = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Find Collaborators</h2>
      <SearchBar onSelectUser={handleUserSelect} />
    </div>
  );
};

export default SearchPage;
