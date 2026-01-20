import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Yeh check karne ke liye ki user logged in hai ya nahi
  // Abhi ke liye hum 'localStorage' use kar rahe hain, baad mein ise Firebase se connect karenge
  const isAuthenticated = localStorage.getItem("userToken"); 

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;